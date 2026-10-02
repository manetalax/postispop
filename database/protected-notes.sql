-- Reviewed migration candidate; apply only after a real Supabase backup and staging test.
-- Requires notes(id,board_id,revision,text,marks,doodle,image_url,updated_ms),
-- boards(id,owner_id). Apply after designs.sql to enable the style guard as well.
begin;
alter table public.notes add column if not exists protected_envelope jsonb;

create or replace function public.postispop_envelope_valid(e jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if e is null or jsonb_typeof(e)<>'object' then return false; end if;
 if (select count(*) from jsonb_object_keys(e))<>8 then return false; end if;
 return coalesce(e->'v'='1'::jsonb and e->>'alg'='AES-256-GCM' and e->>'kdf'='PBKDF2-SHA-256'
  and e->'iterations'='600000'::jsonb and e->>'salt' ~ '^[A-Za-z0-9_-]{22}$'
  and e->>'iv' ~ '^[A-Za-z0-9_-]{16}$' and e->>'id' ~ '^[A-Za-z0-9_-]{22}$'
  and length(e->>'ciphertext') between 22 and 4194326 and e->>'ciphertext' ~ '^[A-Za-z0-9_-]+$'
  and length(e->>'ciphertext')%4<>1 and octet_length(e::text)<=4200000,false);
end $$;
revoke all on function public.postispop_envelope_valid(jsonb) from public;
grant execute on function public.postispop_envelope_valid(jsonb) to authenticated,service_role;

create or replace function public.postispop_protected_note_guard() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and old.protected_envelope is not null and new.protected_envelope is null then
  raise exception 'PROTECTED_NOTE_REQUIRES_ENCRYPTION' using errcode='42501';
 end if;
 if current_user in ('authenticated','anon') and (tg_op='INSERT' and new.protected_envelope is not null or tg_op='UPDATE' and new.protected_envelope is distinct from old.protected_envelope) then
  raise exception 'PROTECTED_NOTE_USE_RPC' using errcode='42501';
 end if;
 if new.protected_envelope is not null then
  if not public.postispop_envelope_valid(new.protected_envelope) then raise exception 'INVALID_ENVELOPE' using errcode='22023'; end if;
  if coalesce(new.text,'')<>'Nota protegida' or coalesce(new.marks,'[]'::jsonb)<>'[]'::jsonb or coalesce(new.doodle,'')<>'' or new.image_url is not null then
   raise exception 'PROTECTED_NOTE_REQUIRES_ENCRYPTION' using errcode='42501';
  end if;
 end if;
 return new;
end $$;
drop trigger if exists postispop_protected_note_guard on public.notes;
create trigger postispop_protected_note_guard before insert or update on public.notes for each row execute function public.postispop_protected_note_guard();

drop function if exists public.postispop_protect_note(uuid,integer,jsonb);
create or replace function public.postispop_protect_note(p_note_id uuid,p_revision integer,p_envelope jsonb,p_style_revision integer default null) returns public.notes
language plpgsql security definer set search_path='' as $$
declare n public.notes; board_owner uuid; style_revision integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 if not public.postispop_envelope_valid(p_envelope) then raise exception 'INVALID_ENVELOPE' using errcode='22023'; end if;
 select * into n from public.notes where id=p_note_id for update;
 if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
 select b.owner_id into board_owner from public.boards b where b.id=n.board_id;
 if board_owner is distinct from auth.uid() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 if n.revision is distinct from p_revision then raise exception 'CONFLICT' using errcode='40001'; end if;
 -- Never pretend a referenced remote capture was encrypted or erased.
 if n.image_url is not null then raise exception 'REMOTE_IMAGE' using errcode='22023'; end if;
 if to_regclass('public.postispop_note_style') is not null then
  execute 'select revision from public.postispop_note_style where note_id=$1 and user_id=$2 for update' into style_revision using p_note_id,auth.uid();
  if p_style_revision is distinct from coalesce(style_revision,0) then raise exception 'STYLE_CONFLICT' using errcode='40001'; end if;
  execute 'delete from public.postispop_note_style where note_id=$1' using p_note_id;
 end if;
 if to_regclass('public.note_alarms') is not null then
  execute 'update public.note_alarms set label=''Nota protegida'' where note_id=$1' using p_note_id;
 end if;
 update public.notes set protected_envelope=p_envelope,text='Nota protegida',marks='[]'::jsonb,doodle='',image_url=null,
  revision=revision+1,updated_ms=(extract(epoch from clock_timestamp())*1000)::bigint where id=p_note_id returning * into n;
 return n;
end $$;
revoke all on function public.postispop_protect_note(uuid,integer,jsonb,integer) from public,anon;
grant execute on function public.postispop_protect_note(uuid,integer,jsonb,integer) to authenticated;

-- Parent-row lock serializes a style write against encryption; direct REST cannot
-- recreate an unciphered drawing alongside a protected note.
create or replace function public.postispop_protected_style_guard() returns trigger
language plpgsql security definer set search_path='' as $$
declare protected jsonb;
begin
 select n.protected_envelope into protected from public.notes n where n.id=new.note_id for update;
 if protected is not null then raise exception 'PROTECTED_NOTE_REQUIRES_ENCRYPTION' using errcode='42501'; end if;
 return new;
end $$;
do $$ begin
 if to_regclass('public.postispop_note_style') is not null then
  execute 'drop trigger if exists postispop_protected_style_guard on public.postispop_note_style';
  execute 'create trigger postispop_protected_style_guard before insert or update on public.postispop_note_style for each row execute function public.postispop_protected_style_guard()';
 end if;
end $$;

create table if not exists public.postispop_protected_shares (
 id uuid primary key default gen_random_uuid(),
 note_id uuid not null references public.notes(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(), expires_at timestamptz not null,
 revoked_at timestamptz,
 check(expires_at>created_at and expires_at<=created_at+interval '30 days')
);
alter table public.postispop_protected_shares enable row level security;
revoke all on public.postispop_protected_shares from public,anon,authenticated;
grant all on public.postispop_protected_shares to service_role;

create or replace function public.postispop_create_protected_share(p_note_id uuid,p_days integer default 7) returns jsonb
language plpgsql security definer set search_path='' as $$
declare n public.notes; owner uuid; token text; share public.postispop_protected_shares;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 if p_days is null or p_days<1 or p_days>30 then raise exception 'INVALID_EXPIRY' using errcode='22023'; end if;
 select * into n from public.notes where id=p_note_id for update;
 select b.owner_id into owner from public.boards b where b.id=n.board_id;
 if owner is distinct from auth.uid() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 if n.protected_envelope is null then raise exception 'NOTE_NOT_PROTECTED' using errcode='22023'; end if;
 if (select count(*) from public.postispop_protected_shares s where s.owner_id=auth.uid() and s.created_at>now()-interval '1 hour')>=30 then raise exception 'SHARE_LIMIT' using errcode='54000'; end if;
 -- Two random UUID v4 values provide 244 random bits without an extension dependency.
 token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into public.postispop_protected_shares(note_id,owner_id,token_hash,expires_at)
 values(p_note_id,auth.uid(),encode(sha256(convert_to(token,'UTF8')),'hex'),now()+make_interval(days=>p_days)) returning * into share;
 return jsonb_build_object('id',share.id,'token',token,'expiresAt',share.expires_at);
end $$;

create or replace function public.postispop_read_protected_share(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare envelope jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'LINK_UNAVAILABLE' using errcode='P0002'; end if;
 select n.protected_envelope into envelope from public.postispop_protected_shares s join public.notes n on n.id=s.note_id join public.boards b on b.id=n.board_id
 where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and s.revoked_at is null and s.expires_at>now() and b.owner_id=s.owner_id;
 if envelope is null then raise exception 'LINK_UNAVAILABLE' using errcode='P0002'; end if;
 return jsonb_build_object('envelope',envelope);
end $$;

create or replace function public.postispop_revoke_protected_share(p_share_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 update public.postispop_protected_shares set revoked_at=coalesce(revoked_at,now()) where id=p_share_id and owner_id=auth.uid();
 if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
 return jsonb_build_object('ok',true);
end $$;
create or replace function public.postispop_revoke_note_shares(p_note_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare owner uuid;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 select b.owner_id into owner from public.notes n join public.boards b on b.id=n.board_id where n.id=p_note_id;
 if owner is distinct from auth.uid() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 update public.postispop_protected_shares set revoked_at=coalesce(revoked_at,now()) where note_id=p_note_id and owner_id=auth.uid();
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.postispop_create_protected_share(uuid,integer),public.postispop_read_protected_share(text),public.postispop_revoke_protected_share(uuid),public.postispop_revoke_note_shares(uuid) from public,anon,authenticated;
grant execute on function public.postispop_read_protected_share(text) to anon,authenticated;
grant execute on function public.postispop_create_protected_share(uuid,integer),public.postispop_revoke_protected_share(uuid),public.postispop_revoke_note_shares(uuid) to authenticated;
commit;
