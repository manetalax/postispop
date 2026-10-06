-- STAGING CANDIDATE ONLY. Apply after simple-note-limits.sql.
-- Inspect the deployed board/signup seed triggers first: the RPC owns its seed.
-- Board, initial notes and retry receipt commit together or all roll back.
begin;
create table if not exists postispop_private.board_creation_requests(
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 board_id uuid not null references public.boards(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
revoke all on postispop_private.board_creation_requests from public,anon,authenticated;

create or replace function public.postispop_create_board(p_request_id uuid)returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();created public.boards;existing uuid;capacity integer;seed_count integer;
begin
 if actor is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 if p_request_id is null then raise exception 'INVALID_REQUEST' using errcode='22023';end if;
 -- Serializes retries and simultaneous creation for one account, including
 -- callers that have not received their preceding successful response yet.
 perform 1 from auth.users where id=actor for update;
 if not found then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 select board_id into existing from postispop_private.board_creation_requests where user_id=actor and request_id=p_request_id;
 if found then
  select * into created from public.boards where id=existing and owner_id=actor;
  if not found then raise exception 'BOARD_ACCESS_DENIED' using errcode='42501';end if;
  return to_jsonb(created);
 end if;
 capacity:=postispop_private.note_capacity(actor);
 if capacity=6 and exists(select 1 from public.boards where owner_id=actor)then
  raise exception 'BOARD_LIMIT_REACHED' using errcode='23514';
 end if;
 seed_count:=case when capacity>6 then 12 else 6 end;
 insert into public.boards(owner_id,title)values(actor,'Mi pizarra')returning * into created;
 insert into public.notes(board_id,author_id,position,paper,text,marks)
  select created.id,actor,slot,slot%6,'','[]'::jsonb from generate_series(0,seed_count-1)slot;
 insert into postispop_private.board_creation_requests(user_id,request_id,board_id)values(actor,p_request_id,created.id);
 return to_jsonb(created);
end $$;
revoke all on function public.postispop_create_board(uuid)from public,anon;
grant execute on function public.postispop_create_board(uuid)to authenticated;
commit;
