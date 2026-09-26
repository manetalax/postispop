-- Authenticated note lifecycle: persistent trash, restore and atomic reordering.
CREATE TABLE IF NOT EXISTS public.note_trash (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  note_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS note_trash_board_expiry_idx
  ON public.note_trash (board_id, expires_at DESC);

ALTER TABLE public.note_trash ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members read board trash" ON public.note_trash;
CREATE POLICY "members read board trash" ON public.note_trash
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = note_trash.board_id
      AND (b.owner_id = (SELECT auth.uid()) OR EXISTS (
        SELECT 1 FROM public.board_members m
        WHERE m.board_id = b.id AND m.user_id = (SELECT auth.uid())
      ))
  ));

CREATE OR REPLACE FUNCTION public.postispop_trash_note(
  p_note_id uuid,
  p_revision integer,
  p_lock text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_note public.notes%ROWTYPE;
  v_trash_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'SESSION_REQUIRED'; END IF;

  SELECT n.* INTO v_note
  FROM public.notes n
  JOIN public.boards b ON b.id = n.board_id
  WHERE n.id = p_note_id
    AND (b.owner_id = v_user OR EXISTS (
      SELECT 1 FROM public.board_members m
      WHERE m.board_id = b.id AND m.user_id = v_user
    ))
  FOR UPDATE OF n;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF v_note.revision <> p_revision THEN RAISE EXCEPTION 'CONFLICT'; END IF;
  IF v_note.locked_until > now()
     AND (v_note.editing IS DISTINCT FROM v_user OR p_lock <> v_user::text) THEN
    RAISE EXCEPTION 'NOTE_LOCKED';
  END IF;

  DELETE FROM public.note_trash
  WHERE board_id = v_note.board_id AND expires_at <= now();

  INSERT INTO public.note_trash (board_id, user_id, note_data)
  VALUES (v_note.board_id, v_user, to_jsonb(v_note))
  RETURNING id INTO v_trash_id;

  UPDATE public.notes
  SET text = '', marks = '[]'::jsonb, paper = 0, doodle = NULL,
      image_url = NULL, revision = revision + 1, editing = NULL,
      locked_until = NULL,
      updated_ms = floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint,
      updated_at = now()
  WHERE id = p_note_id;

  RETURN jsonb_build_object('trash_id', v_trash_id, 'board_id', v_note.board_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.postispop_restore_note(p_trash_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_trash public.note_trash%ROWTYPE;
  v_slot public.notes%ROWTYPE;
  v_source_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'SESSION_REQUIRED'; END IF;

  SELECT t.* INTO v_trash
  FROM public.note_trash t
  JOIN public.boards b ON b.id = t.board_id
  WHERE t.id = p_trash_id AND t.expires_at > now()
    AND (b.owner_id = v_user OR EXISTS (
      SELECT 1 FROM public.board_members m
      WHERE m.board_id = b.id AND m.user_id = v_user
    ))
  FOR UPDATE OF t;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  v_source_id := NULLIF(v_trash.note_data->>'id', '')::uuid;
  SELECT n.* INTO v_slot
  FROM public.notes n
  WHERE n.board_id = v_trash.board_id
    AND n.text = '' AND n.marks = '[]'::jsonb
    AND n.doodle IS NULL AND n.image_url IS NULL
  ORDER BY (n.id = v_source_id) DESC, n.position ASC
  LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOARD_FULL'; END IF;

  UPDATE public.notes
  SET text = COALESCE(v_trash.note_data->>'text', ''),
      marks = COALESCE(v_trash.note_data->'marks', '[]'::jsonb),
      paper = COALESCE((v_trash.note_data->>'paper')::integer, 0),
      doodle = NULLIF(v_trash.note_data->'doodle', 'null'::jsonb),
      image_url = NULLIF(v_trash.note_data->>'image_url', ''),
      author_id = NULLIF(v_trash.note_data->>'author_id', '')::uuid,
      created_at = COALESCE((v_trash.note_data->>'created_at')::timestamptz, created_at),
      created_ms = COALESCE((v_trash.note_data->>'created_ms')::bigint, created_ms),
      revision = revision + 1, editing = NULL, locked_until = NULL,
      updated_ms = floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint,
      updated_at = now()
  WHERE id = v_slot.id;

  IF v_source_id IS DISTINCT FROM v_slot.id THEN
    UPDATE public.note_alarms SET note_id = v_slot.id WHERE note_id = v_source_id;
  END IF;

  DELETE FROM public.note_trash WHERE id = v_trash.id;
  RETURN jsonb_build_object('board_id', v_trash.board_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.postispop_swap_notes(
  p_board_id uuid,
  p_from uuid,
  p_to uuid,
  p_revision integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_from_position integer;
  v_to_position integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'SESSION_REQUIRED'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = p_board_id AND (b.owner_id = v_user OR EXISTS (
      SELECT 1 FROM public.board_members m
      WHERE m.board_id = b.id AND m.user_id = v_user
    ))
  ) THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  PERFORM 1 FROM public.boards WHERE id = p_board_id AND revision = p_revision FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CONFLICT'; END IF;
  IF p_from = p_to THEN RETURN jsonb_build_object('board_id', p_board_id); END IF;

  SELECT position INTO v_from_position FROM public.notes
    WHERE id = p_from AND board_id = p_board_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  SELECT position INTO v_to_position FROM public.notes
    WHERE id = p_to AND board_id = p_board_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;

  UPDATE public.notes
  SET position = CASE id WHEN p_from THEN v_to_position ELSE v_from_position END
  WHERE board_id = p_board_id AND id IN (p_from, p_to);
  UPDATE public.boards SET revision = revision + 1, updated_at = now()
    WHERE id = p_board_id;

  RETURN jsonb_build_object('board_id', p_board_id);
END;
$$;

REVOKE ALL ON FUNCTION public.postispop_trash_note(uuid, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.postispop_restore_note(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.postispop_swap_notes(uuid, uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.postispop_trash_note(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.postispop_restore_note(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.postispop_swap_notes(uuid, uuid, uuid, integer) TO authenticated;
