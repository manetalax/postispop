-- Seed introductory examples only during creation, in the same transaction.
create or replace function public.postispop_create_intro_board(p_request_id uuid,p_notes jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();result jsonb;target_board uuid;existing uuid;first_note uuid;
begin
 if actor is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 if p_request_id is null or jsonb_typeof(p_notes) is distinct from 'array' or jsonb_array_length(p_notes)<>6 then raise exception 'INVALID_INTRO' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(p_notes) with ordinality as x(note,i)
  where jsonb_typeof(note->'text') is distinct from 'string' or length(note->>'text')>10000
    or note->>'paper' is distinct from (i-1)::text
    or note->>'doodle' is distinct from (array['check','heart','idea','cart','smile','ticket'])[i::integer]) then
  raise exception 'INVALID_INTRO' using errcode='22023';
 end if;
 perform 1 from auth.users where id=actor for update;
 select r.board_id into existing from postispop_private.board_creation_requests r where r.user_id=actor and r.request_id=p_request_id;
 result:=public.postispop_create_board(p_request_id);target_board:=(result->>'id')::uuid;
 if existing is null then
  update public.notes n set text=x.note->>'text',paper=(x.note->>'paper')::integer,doodle=to_jsonb(x.note->>'doodle')
   from jsonb_array_elements(p_notes) with ordinality as x(note,i)
   where n.board_id=target_board and n.position=x.i-1;
  update public.notes n set paper=0 where n.board_id=target_board and n.position>=6;
 end if;
 select n.id into first_note from public.notes n where n.board_id=target_board and n.position=0;
 return result||jsonb_build_object('introFirstNote',first_note);
end $$;
revoke all on function public.postispop_create_intro_board(uuid,jsonb) from public,anon;
grant execute on function public.postispop_create_intro_board(uuid,jsonb) to authenticated;

create or replace function postispop_private.add_board_note(p_board uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare state jsonb;slot integer;result public.notes;cap integer;
begin
 perform 1 from public.boards where id=p_board and owner_id=auth.uid() for update;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 state:=postispop_private.board_access(p_board);cap:=(state->>'max_notes')::integer;
 select min(i) into slot from generate_series(0,case when cap=2147483647 then coalesce((select max(position)+1 from public.notes where board_id=p_board and position>=0),5)+1 else cap-1 end)i
 where not exists(select 1 from public.notes where board_id=p_board and position=i);
 if slot is null then raise exception 'BOARD_FULL' using errcode='23514';end if;
 insert into public.notes(board_id,author_id,position,paper) values(p_board,auth.uid(),slot,0) returning * into result;
 update public.boards set revision=coalesce(revision,0)+1 where id=p_board;
 return to_jsonb(result);
end $$;
