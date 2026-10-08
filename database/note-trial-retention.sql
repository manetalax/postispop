-- PostisPop notes: 30-day unrestricted trial, then six readable free notes,
-- followed by a 30-day locked retention period before extra notes are erased.
-- Apply with the PostisPop commerce and notes schemas already installed.
begin;

create table if not exists postispop_private.note_retention_grace(
 user_id uuid primary key references auth.users(id) on delete cascade,
 grace_started_at timestamptz not null default now()
);
revoke all on postispop_private.note_retention_grace from public,anon,authenticated;
create table if not exists postispop_private.locked_note_archive(
 note_id uuid primary key references public.notes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 original_position integer not null,
 archived_at timestamptz not null default now()
);
revoke all on postispop_private.locked_note_archive from public,anon,authenticated;

create or replace function postispop_private.remember_locked_note_archive()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.position>=6 and new.position<0 and current_setting('postispop.archiving_note',true)=new.id::text then
  insert into postispop_private.locked_note_archive(note_id,user_id,original_position)
  select new.id,b.owner_id,old.position from public.boards b where b.id=new.board_id
  on conflict(note_id) do nothing;
 end if;
 return new;
end $$;
revoke all on function postispop_private.remember_locked_note_archive() from public,anon,authenticated;
drop trigger if exists postispop_remember_locked_note_archive on public.notes;
create trigger postispop_remember_locked_note_archive after update of position on public.notes
for each row execute function postispop_private.remember_locked_note_archive();
insert into postispop_private.locked_note_archive(note_id,user_id,original_position,archived_at)
select n.id,b.owner_id,(t.snapshot->>'position')::integer,t.created_at
from postispop_private.note_trash t join public.notes n on n.id=t.note_id join public.boards b on b.id=t.board_id
where (t.snapshot->>'position')~'^[0-9]+$' and (t.snapshot->>'position')::integer>=6
on conflict(note_id) do nothing;

-- Existing accounts receive a fresh 30-day launch trial. New accounts start it
-- at registration, so no existing note is unexpectedly locked on deployment.
insert into public.board_trials(user_id,started_at,expires_at)
select u.id,now(),now()+interval '30 days'
from auth.users u
on conflict(user_id) do nothing;

create or replace function postispop_private.start_board_note_trial()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.board_trials(user_id,started_at,expires_at)
 values(new.id,new.created_at,new.created_at+interval '30 days')
 on conflict(user_id) do nothing;
 return new;
end $$;
revoke all on function postispop_private.start_board_note_trial() from public,anon,authenticated;
drop trigger if exists postispop_note_trial_on_signup on auth.users;
create trigger postispop_note_trial_on_signup after insert on auth.users
for each row execute function postispop_private.start_board_note_trial();

-- Accounts that were already past their former trial get a full, visible
-- retention window from rollout. Premium accounts never enter deletion.
insert into postispop_private.note_retention_grace(user_id,grace_started_at)
select b.owner_id,now() from public.boards b
join public.board_trials t on t.user_id=b.owner_id
where t.expires_at<=now()
 and exists(select 1 from public.notes n where n.board_id=b.id and n.position>=6)
on conflict(user_id) do nothing;

create or replace function postispop_private.note_capacity(p_owner uuid)
returns integer language sql stable security definer set search_path='' as $$
 select case
  when (p_owner=auth.uid() and public.postispop_is_owner())
    or exists(select 1 from public.store_entitlements where user_id=p_owner and product_slug in('postispop-pro','premium-lifetime'))
    or exists(select 1 from public.postispop_licenses where user_id=p_owner and subject='premium' and revoked_at is null and (expires_at is null or expires_at>now())) then 100
  else 6 end
$$;
revoke all on function postispop_private.note_capacity(uuid) from public,anon,authenticated;

create or replace function postispop_private.can_access_note(p_board uuid,p_position integer)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and p_position>=0 and exists(
  select 1 from public.boards b where b.id=p_board
   and (b.owner_id=auth.uid() or exists(select 1 from public.board_members m where m.board_id=b.id and m.user_id=auth.uid()))
   and (p_position<6
    or (b.owner_id=auth.uid() and public.postispop_is_owner())
    or exists(select 1 from public.board_trials t where t.user_id=b.owner_id and t.expires_at>now())
    or exists(select 1 from public.store_entitlements e where e.user_id=b.owner_id and e.product_slug in('postispop-pro','premium-lifetime'))
    or exists(select 1 from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now())))
 )
$$;
revoke all on function postispop_private.can_access_note(uuid,integer) from public,anon;
grant execute on function postispop_private.can_access_note(uuid,integer) to authenticated;

create or replace function postispop_private.board_access(p_board uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare b public.boards;actor uuid:=auth.uid();trial_end timestamptz;premium boolean;trial_active boolean;grace timestamptz;access_end timestamptz;purge timestamptz;total integer;locked jsonb;cap integer;
begin
 if actor is null then raise exception 'SESSION_REQUIRED';end if;
 select * into b from public.boards where id=p_board;
 if b.id is null or not exists(select 1 from public.boards x where x.id=p_board and (x.owner_id=actor or exists(select 1 from public.board_members m where m.board_id=x.id and m.user_id=actor))) then raise exception 'BOARD_ACCESS_DENIED';end if;
 select t.expires_at into trial_end from public.board_trials t where t.user_id=b.owner_id;
 premium:=exists(select 1 from public.store_entitlements e where e.user_id=b.owner_id and e.product_slug in('postispop-pro','premium-lifetime'))
  or exists(select 1 from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()))
  or (b.owner_id=actor and public.postispop_is_owner());
 trial_active:=coalesce(trial_end>now(),false);
 select g.grace_started_at into grace from postispop_private.note_retention_grace g where g.user_id=b.owner_id;
 select greatest(coalesce(trial_end,now()),coalesce(max(coalesce(l.expires_at,l.revoked_at)),now()),coalesce(grace,'-infinity'::timestamptz)) into access_end
  from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium';
 purge:=access_end+interval '30 days';
 if premium or trial_active then locked:='[]'::jsonb;
 else select coalesce(jsonb_agg(n.position order by n.position),'[]'::jsonb) into locked from public.notes n where n.board_id=p_board and n.position>=6;
 end if;
 select count(*) into total from public.notes n where n.board_id=p_board and n.position>=0;
 cap:=case when premium then 100 when trial_active then 2147483647 else 6 end;
 return jsonb_build_object('premium',premium,'trial_active',trial_active,'trial_expires_at',trial_end,'purge_at',purge,'retention_enabled',true,
  'max_notes',cap,'note_count',total,'locked_positions',locked,'locked_count',jsonb_array_length(locked),'owner',b.owner_id=actor,'server_now',now());
end $$;
revoke all on function postispop_private.board_access(uuid) from public,anon,authenticated;
grant execute on function postispop_private.board_access(uuid) to authenticated;

create or replace function public.postispop_board_access(p_board uuid)
returns jsonb language sql security invoker set search_path='' as $$select postispop_private.board_access(p_board)$$;
revoke all on function public.postispop_board_access(uuid) from public,anon;
grant execute on function public.postispop_board_access(uuid) to authenticated;

create or replace function postispop_private.limit_notes()
returns trigger language plpgsql security definer set search_path='' as $$
declare board_owner uuid;cap integer;active_count integer;trial_active boolean;
begin
 select owner_id into board_owner from public.boards where id=new.board_id for update;
 if board_owner is null then raise exception 'BOARD_NOT_FOUND';end if;
 if tg_op='UPDATE' then
  if new.board_id<>old.board_id then raise exception 'NOTE_BOARD_IMMUTABLE';end if;
  if new.position<0 and old.position>=0 and current_setting('postispop.archiving_note',true)=new.id::text then return new;end if;
  if old.position>=0 and new.position>=0 then return new;end if;
  if old.position<0 and new.position<0 and new.position=old.position then return new;end if;
  if old.position<0 and new.position>=0 and current_setting('postispop.restoring_note',true)=new.id::text
   and exists(select 1 from postispop_private.grandfathered_notes where note_id=new.id and board_id=new.board_id) then return new;end if;
 end if;
 cap:=postispop_private.note_capacity(board_owner);
 trial_active:=exists(select 1 from public.board_trials where user_id=board_owner and expires_at>now());
 if trial_active and cap=6 then cap:=2147483647;end if;
 if new.position<0 or (cap=6 and new.position>=6) or new.position>=cap then raise exception 'NOTE_LIMIT_REACHED' using errcode='23514';end if;
 select count(*) into active_count from public.notes n where n.board_id=new.board_id and n.id<>new.id and n.position>=0 and (cap<>6 or n.position<6);
 if active_count>=cap then raise exception 'NOTE_LIMIT_REACHED' using errcode='23514';end if;
 return new;
end $$;

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
 insert into public.notes(board_id,author_id,position,paper) values(p_board,auth.uid(),slot,slot%6) returning * into result;
 update public.boards set revision=coalesce(revision,0)+1 where id=p_board;
 return to_jsonb(result);
end $$;
revoke all on function postispop_private.add_board_note(uuid) from public,anon,authenticated;

create or replace function postispop_private.purge_expired_extra_notes()
returns bigint language plpgsql security definer set search_path='' as $$
declare removed bigint;
begin
 delete from public.notes n using public.boards b
 where n.board_id=b.id and (n.position>=6 or exists(select 1 from postispop_private.locked_note_archive a where a.note_id=n.id and a.user_id=b.owner_id))
  and not exists(select 1 from public.board_trials t where t.user_id=b.owner_id and t.expires_at>now())
  and not exists(select 1 from public.store_entitlements e where e.user_id=b.owner_id and e.product_slug in('postispop-pro','premium-lifetime'))
  and not exists(select 1 from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()))
  and greatest(coalesce((select t.expires_at from public.board_trials t where t.user_id=b.owner_id),now()),
    coalesce((select max(coalesce(l.expires_at,l.revoked_at)) from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium'),now()),
    coalesce((select g.grace_started_at from postispop_private.note_retention_grace g where g.user_id=b.owner_id),'-infinity'::timestamptz)) + interval '30 days'<=now();
 get diagnostics removed=row_count;return removed;
end $$;
revoke all on function postispop_private.purge_expired_extra_notes() from public,anon,authenticated;

-- Expire an account's extra notes on the next authenticated board read. This
-- avoids depending on a client-side timer and keeps the purge scoped to the
-- board owner whose access is being refreshed.
create or replace function postispop_private.purge_expired_extra_notes_for_user(p_user uuid)
returns bigint language plpgsql security definer set search_path='' as $$
declare removed bigint;
begin
 if p_user is null then raise exception 'USER_REQUIRED' using errcode='22023';end if;
 delete from public.notes n using public.boards b
 where n.board_id=b.id and b.owner_id=p_user
  and (n.position>=6 or exists(select 1 from postispop_private.locked_note_archive a where a.note_id=n.id and a.user_id=b.owner_id))
  and not exists(select 1 from public.board_trials t where t.user_id=b.owner_id and t.expires_at>now())
  and not exists(select 1 from public.store_entitlements e where e.user_id=b.owner_id and e.product_slug in('postispop-pro','premium-lifetime'))
  and not exists(select 1 from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()))
  and greatest(coalesce((select t.expires_at from public.board_trials t where t.user_id=b.owner_id),now()),
    coalesce((select max(coalesce(l.expires_at,l.revoked_at)) from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium'),now()),
    coalesce((select g.grace_started_at from postispop_private.note_retention_grace g where g.user_id=b.owner_id),'-infinity'::timestamptz)) + interval '30 days'<=now();
 get diagnostics removed=row_count;return removed;
end $$;
revoke all on function postispop_private.purge_expired_extra_notes_for_user(uuid) from public,anon,authenticated;

-- Run the targeted purge as part of the existing authenticated access refresh.
create or replace function public.postispop_board_access(p_board uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare board_owner uuid;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 select b.owner_id into board_owner from public.boards b where b.id=p_board
  and (b.owner_id=auth.uid() or exists(select 1 from public.board_members m where m.board_id=b.id and m.user_id=auth.uid()));
 if board_owner is null then raise exception 'BOARD_ACCESS_DENIED' using errcode='42501';end if;
 if board_owner=auth.uid() then perform postispop_private.purge_expired_extra_notes_for_user(board_owner);end if;
 return postispop_private.board_access(p_board);
end $$;
revoke all on function public.postispop_board_access(uuid) from public,anon;
grant execute on function public.postispop_board_access(uuid) to authenticated;

-- Replace the former per-board refresh path too; it used the obsolete slot 12.
create or replace function postispop_private.refresh_board_status(p_board uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform postispop_private.purge_expired_extra_notes();
 return postispop_private.board_access(p_board);
end $$;
revoke all on function postispop_private.refresh_board_status(uuid) from public,anon,authenticated;

create or replace function public.postispop_protect_note(p_note_id uuid,p_revision integer,p_envelope jsonb,p_style_revision integer default null)
returns public.notes language plpgsql security definer set search_path='' as $$
declare n public.notes;board_owner uuid;style_revision integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 if not public.postispop_envelope_valid(p_envelope) then raise exception 'INVALID_ENVELOPE' using errcode='22023';end if;
 select * into n from public.notes where id=p_note_id for update;
 if not found then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 select b.owner_id into board_owner from public.boards b where b.id=n.board_id;
 if board_owner is distinct from auth.uid() then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if not postispop_private.can_access_note(n.board_id,n.position) then raise exception 'PREMIUM_REQUIRED' using errcode='42501';end if;
 if n.revision is distinct from p_revision then raise exception 'CONFLICT' using errcode='40001';end if;
 if n.image_url is not null then raise exception 'REMOTE_IMAGE' using errcode='22023';end if;
 if to_regclass('public.postispop_note_style') is not null then
  execute 'select revision from public.postispop_note_style where note_id=$1 and user_id=$2 for update' into style_revision using p_note_id,auth.uid();
  if p_style_revision is distinct from coalesce(style_revision,0) then raise exception 'STYLE_CONFLICT' using errcode='40001';end if;
  execute 'delete from public.postispop_note_style where note_id=$1' using p_note_id;
 end if;
 if to_regclass('public.note_alarms') is not null then execute 'update public.note_alarms set label=''Nota protegida'' where note_id=$1' using p_note_id;end if;
 update public.notes set protected_envelope=p_envelope,text='Nota protegida',marks='[]'::jsonb,doodle=null,image_url=null,
  revision=revision+1,updated_ms=(extract(epoch from clock_timestamp())*1000)::bigint where id=p_note_id returning * into n;
 return n;
end $$;
revoke all on function public.postispop_protect_note(uuid,integer,jsonb,integer) from public,anon;
grant execute on function public.postispop_protect_note(uuid,integer,jsonb,integer) to authenticated;

create or replace function public.postispop_create_protected_share(p_note_id uuid,p_days integer default 7)
returns jsonb language plpgsql security definer set search_path='' as $$
declare n public.notes;owner uuid;token text;share public.postispop_protected_shares;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 if p_days is null or p_days<1 or p_days>30 then raise exception 'INVALID_EXPIRY' using errcode='22023';end if;
 select * into n from public.notes where id=p_note_id for update;
 select b.owner_id into owner from public.boards b where b.id=n.board_id;
 if owner is distinct from auth.uid() then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if not postispop_private.can_access_note(n.board_id,n.position) then raise exception 'PREMIUM_REQUIRED' using errcode='42501';end if;
 if n.protected_envelope is null then raise exception 'NOTE_NOT_PROTECTED' using errcode='22023';end if;
 if (select count(*) from public.postispop_protected_shares s where s.owner_id=auth.uid() and s.created_at>now()-interval '1 hour')>=30 then raise exception 'SHARE_LIMIT' using errcode='54000';end if;
 token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into public.postispop_protected_shares(note_id,owner_id,token_hash,expires_at)
 values(p_note_id,auth.uid(),encode(sha256(convert_to(token,'UTF8')),'hex'),now()+make_interval(days=>p_days)) returning * into share;
 return jsonb_build_object('id',share.id,'token',token,'expiresAt',share.expires_at);
end $$;
revoke all on function public.postispop_create_protected_share(uuid,integer) from public,anon;
grant execute on function public.postispop_create_protected_share(uuid,integer) to authenticated;

create or replace function postispop_private.read_note_share(p_token text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare note public.notes;share postispop_private.note_shares;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 select * into share from postispop_private.note_shares where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and revoked_at is null and expires_at>now();
 if share.id is null then raise exception 'SHARE_UNAVAILABLE';end if;
 select * into note from public.notes where id=share.note_id;
 if note.id is null or note.position<0 or not postispop_private.can_access_note(note.board_id,note.position) then raise exception 'PREMIUM_REQUIRED';end if;
 return jsonb_build_object('text',note.text,'marks',note.marks,'paper',note.paper,'doodle',note.doodle,'image',case when note.image_url is null then null else jsonb_build_object('url',note.image_url)end);
end $$;

create or replace function public.postispop_read_protected_share(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare envelope jsonb;note_board uuid;note_position integer;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'LINK_UNAVAILABLE' using errcode='P0002';end if;
 select n.protected_envelope,n.board_id,n.position into envelope,note_board,note_position from public.postispop_protected_shares s join public.notes n on n.id=s.note_id join public.boards b on b.id=n.board_id
 where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and s.revoked_at is null and s.expires_at>now() and b.owner_id=s.owner_id and n.position>=0;
 if envelope is null or not (note_position<6
   or exists(select 1 from public.board_trials t join public.postispop_protected_shares s on s.owner_id=t.user_id where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and t.expires_at>now())
   or exists(select 1 from public.postispop_protected_shares s join public.store_entitlements e on e.user_id=s.owner_id where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and e.product_slug in('postispop-pro','premium-lifetime'))
   or exists(select 1 from public.postispop_protected_shares s join public.postispop_licenses l on l.user_id=s.owner_id where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()))) then raise exception 'LINK_UNAVAILABLE' using errcode='P0002';end if;
 return jsonb_build_object('envelope',envelope);
end $$;

create or replace function postispop_private.archived_board_note_trash(p_board uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare state jsonb;
begin
 state:=postispop_private.board_access(p_board);
 return jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'text',coalesce(t.snapshot->>'text',''),'doodle',t.snapshot->'doodle','image',case when t.snapshot->>'image_url' is null then null else jsonb_build_object('url',t.snapshot->>'image_url')end,'expires',(extract(epoch from t.expires_at)*1000)::bigint)order by t.expires_at desc)
  from postispop_private.note_trash t where t.board_id=p_board and t.expires_at>now()
   and ((coalesce((t.snapshot->>'position')::integer,-1)<6) or (state->>'premium')::boolean or (state->>'trial_active')::boolean)),'[]'::jsonb));
end $$;

create or replace function postispop_private.restore_archived_board_note(p_trash uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare t postispop_private.note_trash;n public.notes;b uuid;state jsonb;total integer;target integer;cap integer;legacy boolean;upper_slot integer;
begin
 select board_id into b from postispop_private.note_trash where id=p_trash and expires_at>now();
 if b is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 state:=postispop_private.board_access(b);cap:=(state->>'max_notes')::integer;
 perform 1 from public.boards where id=b for update;
 select * into t from postispop_private.note_trash where id=p_trash and expires_at>now() for update;
 if t.id is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 select * into n from public.notes where id=t.note_id for update;
 if n.id is null then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 if n.position>=0 then return postispop_private.restore_note(p_trash);end if;
 if coalesce((t.snapshot->>'position')::integer,-1)>=6 and not ((state->>'premium')::boolean or (state->>'trial_active')::boolean) then raise exception 'PREMIUM_REQUIRED' using errcode='42501';end if;
 if n.revision<>coalesce((t.snapshot->>'revision')::integer,0)+1 then raise exception 'CONFLICT' using errcode='40001';end if;
 select count(*) into total from public.notes where board_id=b and position>=0;
 legacy:=exists(select 1 from postispop_private.grandfathered_notes where note_id=n.id and board_id=b);
 if total>=cap and not legacy then raise exception 'BOARD_FULL' using errcode='23514';end if;
 upper_slot:=case when cap=2147483647 then coalesce((select max(position)+1 from public.notes where board_id=b and position>=0),5)+1 else greatest(total,cap-1) end;
 select min(i) into target from generate_series(0,upper_slot)i where not exists(select 1 from public.notes where board_id=b and position=i);
 perform set_config('postispop.restoring_note',n.id::text,true);
 update public.notes set position=target,revision=revision+1,updated_at=now(),updated_ms=(extract(epoch from now())*1000)::bigint where id=n.id;
 perform set_config('postispop.restoring_note','',true);
 delete from postispop_private.locked_note_archive where note_id=n.id;
 delete from postispop_private.note_trash where id=t.id;
 update public.boards set revision=coalesce(revision,0)+1 where id=b;
 return jsonb_build_object('board_id',b);
end $$;
revoke all on function postispop_private.archived_board_note_trash(uuid),postispop_private.restore_archived_board_note(uuid) from public,anon,authenticated;
grant execute on function postispop_private.add_board_note(uuid),postispop_private.archived_board_note_trash(uuid),postispop_private.restore_archived_board_note(uuid) to authenticated;
grant execute on function public.postispop_add_board_note(uuid),public.postispop_board_note_trash(uuid),public.postispop_restore_board_note(uuid) to authenticated;

commit;
