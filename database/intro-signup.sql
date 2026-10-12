-- Only future signup boards are marked pending; existing boards stay untouched.
alter table public.boards add column if not exists intro_pending boolean not null default false;
create or replace function public.bootstrap_postispop_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare new_board uuid;
begin
 insert into public.profiles(id,display_name,avatar_url)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.raw_user_meta_data->>'avatar_url') on conflict(id) do nothing;
 insert into public.board_trials(user_id,started_at,expires_at)
 values(new.id,new.created_at,new.created_at+interval '30 days') on conflict(user_id) do nothing;
 insert into public.boards(owner_id,title,intro_pending) values(new.id,'Mi pizarra',true) returning id into new_board;
 insert into public.notes(board_id,author_id,position,paper,marks,text)
 select new_board,new.id,position,0,'[]'::jsonb,'' from generate_series(0,11) as position;
 return new;
end $$;

create or replace function public.postispop_initialize_intro_board(p_board uuid,p_notes jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare pending boolean;first_note uuid;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 select b.intro_pending into pending from public.boards b where b.id=p_board and b.owner_id=auth.uid() for update;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if not pending then return '{}'::jsonb;end if;
 if jsonb_typeof(p_notes) is distinct from 'array' or jsonb_array_length(p_notes)<>6 then raise exception 'INVALID_INTRO' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(p_notes) with ordinality as x(note,i)
  where jsonb_typeof(note->'text') is distinct from 'string' or length(note->>'text')>10000
    or note->>'paper' is distinct from (i-1)::text
    or note->>'doodle' is distinct from (array['check','heart','idea','cart','smile','ticket'])[i::integer]) then
  raise exception 'INVALID_INTRO' using errcode='22023';
 end if;
 perform 1 from public.notes n where n.board_id=p_board for update;
 -- An older client may already have edited a new signup board: never replace it.
 if (select count(*) from public.notes n where n.board_id=p_board and n.position between 0 and 5)=6
  and not exists(select 1 from public.notes n where n.board_id=p_board and
    (coalesce(n.text,'')<>'' or n.paper<>0 or n.locked_until is not null or n.revision<>1 or n.protected_envelope is not null or n.image_url is not null or n.doodle is not null or n.marks<>'[]'::jsonb))
  and not exists(select 1 from public.postispop_note_style s join public.notes n on n.id=s.note_id where n.board_id=p_board) then
  update public.notes n set text=x.note->>'text',paper=(x.note->>'paper')::integer,doodle=to_jsonb(x.note->>'doodle')
   from jsonb_array_elements(p_notes) with ordinality as x(note,i)
   where n.board_id=p_board and n.position=x.i-1;
  select n.id into first_note from public.notes n where n.board_id=p_board and n.position=0;
 end if;
 update public.boards b set intro_pending=false where b.id=p_board;
 return jsonb_build_object('introFirstNote',first_note);
end $$;
revoke all on function public.postispop_initialize_intro_board(uuid,jsonb) from public,anon;
grant execute on function public.postispop_initialize_intro_board(uuid,jsonb) to authenticated;
