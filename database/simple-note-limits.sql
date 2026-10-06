-- STAGING CANDIDATE ONLY: do not apply blindly to production.
-- Requires commerce/designs/protected notes/board-note-lifecycle base migrations.
-- Inspect six-notes-preflight.sql first: signup/board seed triggers must already
-- create <=6 slots, and old expiry/purge jobs must be disabled. Unknown base
-- triggers are deliberately not replaced by guesses.
-- This migration never deletes notes or grants a paid license.
begin;
create table if not exists postispop_private.note_limit_migrations(version integer primary key,applied_at timestamptz not null default now());
create table if not exists postispop_private.grandfathered_notes(
 note_id uuid primary key references public.notes(id) on delete cascade,
 board_id uuid not null references public.boards(id) on delete cascade
);
revoke all on postispop_private.note_limit_migrations,postispop_private.grandfathered_notes from public,anon,authenticated;
do $$ begin
 if not exists(select 1 from postispop_private.note_limit_migrations where version=1)then
  insert into postispop_private.grandfathered_notes(note_id,board_id)select id,board_id from public.notes on conflict do nothing;
  insert into postispop_private.note_limit_migrations(version)values(1);
 end if;
end $$;

create or replace function postispop_private.note_capacity(p_owner uuid)returns integer
language sql stable security definer set search_path='' as $$
 select case when
  (p_owner=auth.uid() and public.postispop_is_owner())
  or exists(select 1 from public.store_entitlements where user_id=p_owner and product_slug='postispop-pro')
  or exists(select 1 from public.postispop_licenses where user_id=p_owner and subject='premium' and revoked_at is null and (expires_at is null or expires_at>now()))
 then 100 else 6 end
$$;
revoke all on function postispop_private.note_capacity(uuid)from public,anon,authenticated;

-- One owned board for new free accounts. Existing/shared boards stay intact.
create or replace function postispop_private.limit_owned_boards()returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.owner_id is distinct from old.owner_id then raise exception 'BOARD_OWNER_IMMUTABLE' using errcode='42501';end if;
  return new;
 end if;
 -- Serializes concurrent first-board creation for the same account.
 perform 1 from auth.users where id=new.owner_id for update;
 if postispop_private.note_capacity(new.owner_id)=6 and exists(select 1 from public.boards where owner_id=new.owner_id)then
  raise exception 'BOARD_LIMIT_REACHED' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function postispop_private.limit_owned_boards()from public,anon,authenticated;
drop trigger if exists postispop_limit_owned_boards on public.boards;
create trigger postispop_limit_owned_boards before insert or update of owner_id on public.boards for each row execute function postispop_private.limit_owned_boards();

-- Existing content remains available after a downgrade. Membership still gates
-- every note. The creation trigger, not SELECT filtering, enforces the allowance.
create or replace function postispop_private.can_access_note(uuid,integer)returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and $2>=0 and exists(
  select 1 from public.boards b where b.id=$1 and (b.owner_id=auth.uid() or exists(select 1 from public.board_members m where m.board_id=b.id and m.user_id=auth.uid()))
 )
$$;
revoke all on function postispop_private.can_access_note(uuid,integer)from public,anon;
grant execute on function postispop_private.can_access_note(uuid,integer)to authenticated;

create or replace function postispop_private.board_access(p_board uuid)returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare b public.boards;cap integer;total integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 select * into b from public.boards where id=p_board;
 if b.id is null or not postispop_private.can_access_note(p_board,0)then raise exception 'BOARD_ACCESS_DENIED';end if;
 cap:=postispop_private.note_capacity(b.owner_id);
 select count(*)into total from public.notes where board_id=p_board and position>=0;
 return jsonb_build_object('premium',cap=100,'trial_active',false,'trial_expires_at',null,'purge_at',null,'retention_enabled',false,
  'max_notes',cap,'note_count',total,'locked_positions','[]'::jsonb,'locked_count',0,'owner',b.owner_id=auth.uid(),'server_now',now());
end $$;

create or replace function postispop_private.limit_notes()returns trigger
language plpgsql security definer set search_path='' as $$
declare board_owner uuid;cap integer;active_count integer;
begin
 select owner_id into board_owner from public.boards where id=new.board_id for update;
 if board_owner is null then raise exception 'BOARD_NOT_FOUND';end if;
 if tg_op='UPDATE' then
  if new.board_id<>old.board_id then raise exception 'NOTE_BOARD_IMMUTABLE';end if;
  if new.position<0 and old.position>=0 and current_setting('postispop.archiving_note',true)=new.id::text then return new;end if;
  -- Editing or reordering an existing visible note never loses its contents.
  if old.position>=0 and new.position>=0 then return new;end if;
  if old.position<0 and new.position<0 and new.position=old.position then return new;end if;
  if old.position<0 and new.position>=0 and current_setting('postispop.restoring_note',true)=new.id::text
   and exists(select 1 from postispop_private.grandfathered_notes where note_id=new.id and board_id=new.board_id)then return new;end if;
 end if;
 cap:=postispop_private.note_capacity(board_owner);
 select count(*)into active_count from public.notes where board_id=new.board_id and id<>new.id and position>=0;
 if new.position<0 or new.position>=cap or active_count>=cap then raise exception 'NOTE_LIMIT_REACHED' using errcode='23514';end if;
 return new;
end $$;
-- Ensure enforcement even if a deployment used a differently named old trigger.
drop trigger if exists postispop_simple_note_limit on public.notes;
create trigger postispop_simple_note_limit before insert or update of position,board_id on public.notes for each row execute function postispop_private.limit_notes();

create or replace function postispop_private.add_board_note(p_board uuid)returns jsonb
language plpgsql security definer set search_path='' as $$
declare state jsonb;slot integer;result public.notes;
begin
 perform 1 from public.boards where id=p_board and owner_id=auth.uid()for update;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 state:=postispop_private.board_access(p_board);
 if (state->>'note_count')::integer>=(state->>'max_notes')::integer then raise exception 'BOARD_FULL' using errcode='23514';end if;
 select min(i)into slot from generate_series(0,(state->>'max_notes')::integer-1)i where not exists(select 1 from public.notes where board_id=p_board and position=i);
 if slot is null then raise exception 'BOARD_FULL' using errcode='23514';end if;
 insert into public.notes(board_id,author_id,position,paper)values(p_board,auth.uid(),slot,slot%6)returning * into result;
 update public.boards set revision=coalesce(revision,0)+1 where id=p_board;
 return to_jsonb(result);
end $$;

create or replace function postispop_private.restore_archived_board_note(p_trash uuid)returns jsonb
language plpgsql security definer set search_path='' as $$
declare t postispop_private.note_trash;n public.notes;b uuid;state jsonb;total integer;target integer;legacy boolean;
begin
 select board_id into b from postispop_private.note_trash where id=p_trash and expires_at>now();
 if b is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 state:=postispop_private.board_access(b);
 perform 1 from public.boards where id=b for update;
 select * into t from postispop_private.note_trash where id=p_trash and expires_at>now()for update;
 if t.id is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 select * into n from public.notes where id=t.note_id for update;
 if n.id is null then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 if n.position>=0 then return postispop_private.restore_note(p_trash);end if;
 if n.revision<>coalesce((t.snapshot->>'revision')::integer,0)+1 then raise exception 'CONFLICT' using errcode='40001';end if;
 select count(*)into total from public.notes where board_id=b and position>=0;
 legacy:=exists(select 1 from postispop_private.grandfathered_notes where note_id=n.id and board_id=b);
 if total>=(state->>'max_notes')::integer and not legacy then raise exception 'BOARD_FULL' using errcode='23514';end if;
 -- Append into the first free position; never shift or overwrite another note.
 select min(i)into target from generate_series(0,greatest(total,(state->>'max_notes')::integer))i where not exists(select 1 from public.notes where board_id=b and position=i);
 perform set_config('postispop.restoring_note',n.id::text,true);
 update public.notes set position=target,revision=revision+1,updated_at=now(),updated_ms=(extract(epoch from now())*1000)::bigint where id=n.id;
 perform set_config('postispop.restoring_note','',true);
 delete from postispop_private.note_trash where id=t.id;
 update public.boards set revision=coalesce(revision,0)+1 where id=b;
 return jsonb_build_object('board_id',b);
end $$;
-- Ordinary note shares preserve previous access to recoverable content.
create or replace function postispop_private.read_note_share(p_token text)returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare note public.notes;share postispop_private.note_shares;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 select * into share from postispop_private.note_shares where token_hash=encode(extensions.digest(p_token,'sha256'),'hex')and revoked_at is null and expires_at>now();
 if share.id is null then raise exception 'SHARE_UNAVAILABLE';end if;
 select * into note from public.notes where id=share.note_id;
 if note.id is null or note.position<0 then raise exception 'SHARE_UNAVAILABLE';end if;
 return jsonb_build_object('text',note.text,'marks',note.marks,'paper',note.paper,'doodle',note.doodle,'image',case when note.image_url is null then null else jsonb_build_object('url',note.image_url)end);
end $$;
commit;
