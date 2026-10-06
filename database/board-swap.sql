-- Staging candidate. Apply after simple-note-limits.sql.
-- Preserves note IDs/content, serializes the pair, and checks board revision.
begin;
create or replace function public.postispop_swap_board_notes(p_board uuid,p_from uuid,p_to uuid,p_revision integer)returns jsonb
language plpgsql security definer set search_path='' as $$
declare current_revision integer;a public.notes;b public.notes;temporary_position integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 select revision into current_revision from public.boards where id=p_board and owner_id=auth.uid()for update;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if p_revision is null or current_revision is distinct from p_revision then raise exception 'CONFLICT' using errcode='40001';end if;
 perform 1 from public.notes where board_id=p_board and id in(p_from,p_to)order by id for update;
 select * into a from public.notes where id=p_from and board_id=p_board and position>=0;
 select * into b from public.notes where id=p_to and board_id=p_board and position>=0;
 if a.id is null or b.id is null then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 if a.id=b.id then return jsonb_build_object('board_id',p_board);end if;
 select greatest(100,coalesce(max(position),0)+1)into temporary_position from public.notes where board_id=p_board;
 -- All three moves occur in one transaction, including on immediate uniqueness constraints.
 update public.notes set position=temporary_position where id=a.id;
 update public.notes set position=a.position where id=b.id;
 update public.notes set position=b.position where id=a.id;
 update public.boards set revision=coalesce(revision,0)+1 where id=p_board;
 return jsonb_build_object('board_id',p_board);
end $$;
revoke all on function public.postispop_swap_board_notes(uuid,uuid,uuid,integer)from public,anon;
grant execute on function public.postispop_swap_board_notes(uuid,uuid,uuid,integer)to authenticated;
commit;
