-- Additive migration. Inspected against the live schema on 2026-10-01.
-- Does not replace existing RLS, delete data or activate payments.
begin;
create schema if not exists postispop_private;
revoke all on schema postispop_private from public,anon,authenticated;
alter table public.notes add column if not exists metadata jsonb not null default '{"tags":[],"pinned":false,"archived":false}'::jsonb;

create or replace function public.pp_valid_note(n jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare m jsonb; t jsonb; text_units integer;
begin
 if jsonb_typeof(n) is distinct from 'object' or jsonb_typeof(n->'text') is distinct from 'string' or length(n->>'text')>10000 then return false; end if;
 select coalesce(sum(case when ascii(c)>65535 then 2 else 1 end),0) into text_units from regexp_split_to_table(n->>'text','') c;
 if not coalesce(n->>'paper','0') ~ '^[0-5]$' then return false; end if;
 if jsonb_typeof(coalesce(n->'marks','[]'))<>'array' or jsonb_array_length(coalesce(n->'marks','[]'))>10000 or length(coalesce(n->'doodle','""')::text)>100000 then return false;end if;
 for m in select value from jsonb_array_elements(coalesce(n->'marks','[]')) loop
  if not (coalesce(m->>'start','') ~ '^\d+$') or not (coalesce(m->>'end','') ~ '^\d+$') or (m->>'start')::numeric>(m->>'end')::numeric or (m->>'end')::numeric>text_units or coalesce(m->>'ink','') not in ('blue','red','marker-blue','marker-red') then return false;end if;
 end loop;
 if n ? 'image' and n->'image'<>'null'::jsonb and (jsonb_typeof(n->'image')<>'object' or not coalesce(n#>>'{image,url}','') ~ '^https?://') then return false;end if;
 if n ? 'metadata' then
  m:=n->'metadata';
  if jsonb_typeof(m)<>'object' or jsonb_typeof(coalesce(m->'tags','[]'))<>'array' or jsonb_array_length(coalesce(m->'tags','[]'))>10 then return false;end if;
  for t in select value from jsonb_array_elements(coalesce(m->'tags','[]')) loop if jsonb_typeof(t)<>'string' or length(t#>>'{}')>32 then return false;end if;end loop;
  if (m ? 'pinned' and jsonb_typeof(m->'pinned')<>'boolean') or (m ? 'archived' and jsonb_typeof(m->'archived')<>'boolean') then return false;end if;
 end if;
 return true;
end $$;
revoke all on function public.pp_valid_note(jsonb) from public,anon;
grant execute on function public.pp_valid_note(jsonb) to authenticated;

create or replace function public.pp_create_board(p_title text,p_notes jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare b uuid; n jsonb; i integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 if jsonb_typeof(p_notes) is distinct from 'array' or jsonb_array_length(p_notes)>12 or length(p_notes::text)>2000000 then raise exception 'INVALID_BACKUP';end if;
 for n in select value from jsonb_array_elements(p_notes) loop if not public.pp_valid_note(n) then raise exception 'INVALID_NOTE';end if;end loop;
 insert into public.boards(owner_id,title) values(auth.uid(),left(coalesce(p_title,'Mi pizarra'),120)) returning id into b;
 for i in 0..11 loop
  n:=coalesce(p_notes->i,'{"text":"","paper":0,"marks":[],"doodle":""}'::jsonb);
  insert into public.notes(board_id,author_id,position,text,paper,marks,doodle,image_url,metadata,revision,created_ms,updated_ms)
  values(b,auth.uid(),i,n->>'text',coalesce((n->>'paper')::integer,0),coalesce(n->'marks','[]'),coalesce(n->'doodle','""'),n#>>'{image,url}',coalesce(n->'metadata','{}'),1,(extract(epoch from now())*1000)::bigint,(extract(epoch from now())*1000)::bigint);
 end loop;
 return b;
end $$;
revoke all on function public.pp_create_board(text,jsonb) from public,anon;
grant execute on function public.pp_create_board(text,jsonb) to authenticated;

create or replace function public.pp_import_notes(p_board uuid,p_notes jsonb) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n jsonb; ids uuid[]; i integer:=1;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 if jsonb_typeof(p_notes) is distinct from 'array' or jsonb_array_length(p_notes)>12 or length(p_notes::text)>2000000 then raise exception 'INVALID_BACKUP';end if;
 perform 1 from public.boards where id=p_board for update;
 if not found then raise exception 'NOT_FOUND';end if;
 -- Organized notes remain occupied even when their text is empty. Only metadata
 -- containing a subset of the empty defaults is safe to replace; preserve unknown keys too.
 select array_agg(id order by position) into ids from (select id,position from public.notes where board_id=p_board and coalesce(text,'')='' and image_url is null and (doodle is null or doodle in ('""'::jsonb,'[]'::jsonb,'null'::jsonb)) and coalesce(metadata,'{}'::jsonb) <@ '{"tags":[],"pinned":false,"archived":false}'::jsonb and (locked_until is null or locked_until<now()) for update) locked_notes;
 if coalesce(array_length(ids,1),0)<jsonb_array_length(p_notes) then raise exception 'BOARD_FULL';end if;
 for n in select value from jsonb_array_elements(p_notes) loop
  if not public.pp_valid_note(n) then raise exception 'INVALID_NOTE';end if;
  update public.notes set text=n->>'text',paper=coalesce((n->>'paper')::integer,0),marks=coalesce(n->'marks','[]'),doodle=coalesce(n->'doodle','""'),image_url=n#>>'{image,url}',metadata=coalesce(n->'metadata','{}'),revision=revision+1,updated_ms=(extract(epoch from now())*1000)::bigint where id=ids[i];
  if not found then raise exception 'OWNER_REQUIRED';end if;i:=i+1;
 end loop;
 return true;
end $$;
revoke all on function public.pp_import_notes(uuid,jsonb) from public,anon;
grant execute on function public.pp_import_notes(uuid,jsonb) to authenticated;

create table if not exists public.pp_note_trash(id uuid primary key default gen_random_uuid(),board_id uuid not null references public.boards(id) on delete cascade,note jsonb not null,expires_at timestamptz not null default now()+interval '30 days');
alter table public.pp_note_trash enable row level security;
grant select,insert,delete on public.pp_note_trash to authenticated;
-- PostgreSQL requires an UPDATE privilege to lock the row during restoration.
grant update(expires_at) on public.pp_note_trash to authenticated;
revoke all on public.pp_note_trash from public,anon;
do $$ begin if not exists(select 1 from pg_policies where schemaname='public' and tablename='pp_note_trash' and policyname='pp_trash_access') then create policy pp_trash_access on public.pp_note_trash for all to authenticated using(exists(select 1 from public.boards b where b.id=board_id)) with check(exists(select 1 from public.boards b where b.id=board_id)); end if;end $$;
create or replace function public.pp_trash_note(p_note uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare n public.notes; t uuid;
begin
 select * into n from public.notes where id=p_note for update;if not found then raise exception 'NOT_FOUND';end if;
 if n.locked_until>now() and n.editing is distinct from auth.uid() then raise exception 'NOTE_LOCKED';end if;
 insert into public.pp_note_trash(board_id,note) values(n.board_id,to_jsonb(n)) returning id into t;
 update public.notes set text='',marks='[]',doodle='""',image_url=null,metadata='{}',editing=null,locked_until=null,revision=revision+1 where id=p_note;
 if not found then raise exception 'OWNER_REQUIRED';end if;return t;
end $$;
create or replace function public.pp_restore_note(p_trash uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare t public.pp_note_trash; dest uuid;
begin
 select * into t from public.pp_note_trash where id=p_trash and expires_at>now() for update;if not found then raise exception 'NOT_FOUND';end if;
 select id into dest from public.notes where board_id=t.board_id and coalesce(text,'')='' and image_url is null and (doodle is null or doodle in ('""'::jsonb,'[]'::jsonb,'null'::jsonb)) and coalesce(metadata,'{}'::jsonb) <@ '{"tags":[],"pinned":false,"archived":false}'::jsonb and (locked_until is null or locked_until<now()) order by position limit 1 for update;
 if dest is null then raise exception 'BOARD_FULL';end if;
 update public.notes set text=t.note->>'text',marks=t.note->'marks',paper=(t.note->>'paper')::integer,doodle=t.note->'doodle',image_url=t.note->>'image_url',metadata=coalesce(t.note->'metadata','{}'),revision=revision+1,updated_ms=(extract(epoch from now())*1000)::bigint where id=dest;
 if not found then raise exception 'OWNER_REQUIRED';end if;
 delete from public.pp_note_trash where id=p_trash;return t.board_id;
end $$;
revoke all on function public.pp_trash_note(uuid),public.pp_restore_note(uuid) from public,anon;
grant execute on function public.pp_trash_note(uuid),public.pp_restore_note(uuid) to authenticated;

create or replace function public.pp_swap_notes(p_board uuid,p_from uuid,p_to uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare a public.notes;b public.notes;
begin
 perform 1 from public.boards where id=p_board for update;if not found then raise exception 'NOT_FOUND';end if;
 select * into a from public.notes where id=p_from and board_id=p_board for update;
 select * into b from public.notes where id=p_to and board_id=p_board for update;
 if a.id is null or b.id is null then raise exception 'NOT_FOUND';end if;
 -- Existing position uniqueness constraints are deferred only if the schema supports it;
 -- use a temporary free position so a unique(board_id,position) index remains valid.
 update public.notes set position=1000000 where id=a.id;
 update public.notes set position=a.position where id=b.id;
 update public.notes set position=b.position where id=a.id;
 return true;
end $$;
revoke all on function public.pp_swap_notes(uuid,uuid,uuid) from public,anon;
grant execute on function public.pp_swap_notes(uuid,uuid,uuid) to authenticated;

-- Sharing is isolated from legacy board_members permissions. Tokens grant access
-- only through narrowly scoped RPCs, never through unrestricted REST tables.
create table if not exists postispop_private.board_links(id uuid primary key default gen_random_uuid(),board_id uuid not null references public.boards(id) on delete cascade,owner_id uuid not null references auth.users(id),role text not null check(role in ('viewer','editor')),email text,expires_at timestamptz not null,revoked_at timestamptz,created_at timestamptz not null default now());
revoke all on postispop_private.board_links from public,anon,authenticated;
alter table postispop_private.board_links enable row level security;
create or replace function public.pp_manage_share(p_board uuid,p_action text,p_id uuid default null,p_role text default 'viewer',p_email text default null,p_days integer default 7) returns jsonb
language plpgsql security definer set search_path='' as $$
declare token uuid; result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.boards where id=p_board and owner_id=auth.uid()) then raise exception 'OWNER_REQUIRED';end if;
 if p_action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'role',role,'expires_at',expires_at) order by created_at desc),'[]') into result from postispop_private.board_links where board_id=p_board and revoked_at is null and expires_at>now();return jsonb_build_object('shares',result);
 elsif p_action='revoke' then update postispop_private.board_links set revoked_at=now() where id=p_id and board_id=p_board;return '{"ok":true}'::jsonb;
 elsif p_action is distinct from 'create' then raise exception 'INVALID_ACTION';end if;
 if p_role is null or p_role not in ('viewer','editor') or p_days is null or p_days not between 1 and 30 or length(coalesce(p_email,''))>254 then raise exception 'INVALID_SHARE';end if;
 -- Serialize creation to enforce the limit under concurrent requests.
 perform 1 from public.boards where id=p_board for update;
 if (select count(*) from postispop_private.board_links where board_id=p_board and revoked_at is null and expires_at>now())>=30 then raise exception 'RATE_LIMITED';end if;
 insert into postispop_private.board_links(board_id,owner_id,role,email,expires_at) values(p_board,auth.uid(),p_role,nullif(lower(trim(p_email)),''),now()+make_interval(days=>p_days)) returning id into token;
 return jsonb_build_object('token',token);
end $$;
revoke all on function public.pp_manage_share(uuid,text,uuid,text,text,integer) from public,anon;
grant execute on function public.pp_manage_share(uuid,text,uuid,text,text,integer) to authenticated;

create or replace function public.pp_read_share(p_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s postispop_private.board_links;result jsonb;
begin
 select * into s from postispop_private.board_links where id=p_token and revoked_at is null and expires_at>now();
 if not found then raise exception 'NOT_FOUND';end if;
 if s.email is not null and not exists(select 1 from auth.users where id=auth.uid() and lower(email)=s.email and email_confirmed_at is not null) then raise exception 'INVITATION_ACCOUNT_REQUIRED';end if;
 if not exists(select 1 from public.boards where id=s.board_id and owner_id=s.owner_id) then raise exception 'NOT_FOUND';end if;
 select jsonb_build_object('title',b.title,'expires_at',s.expires_at,'editable',s.role='editor' and auth.uid() is not null,'requiresLogin',s.role='editor' and auth.uid() is null,'notes',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'text',n.text,'paper',n.paper,'revision',n.revision) order by n.position) from public.notes n where n.board_id=b.id),'[]')) into result from public.boards b where b.id=s.board_id;
 return result;
end $$;
revoke all on function public.pp_read_share(uuid) from public;
grant execute on function public.pp_read_share(uuid) to anon,authenticated;

create or replace function public.pp_edit_shared_note(p_token uuid,p_note uuid,p_text text,p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s postispop_private.board_links;n public.notes;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED';end if;
 select * into s from postispop_private.board_links where id=p_token and role='editor' and revoked_at is null and expires_at>now() for share;
 if not found or not exists(select 1 from public.boards where id=s.board_id and owner_id=s.owner_id) then raise exception 'NOT_FOUND';end if;
 if s.email is not null and not exists(select 1 from auth.users where id=auth.uid() and lower(email)=s.email and email_confirmed_at is not null) then raise exception 'INVITATION_ACCOUNT_REQUIRED';end if;
 if p_text is null or length(p_text)>10000 then raise exception 'INVALID_NOTE';end if;
 update public.notes set text=p_text,marks='[]',revision=revision+1,updated_ms=(extract(epoch from now())*1000)::bigint where id=p_note and board_id=s.board_id and revision=p_revision and (locked_until is null or locked_until<now() or editing=auth.uid()) returning * into n;
 if not found then raise exception 'CONFLICT';end if;
 return jsonb_build_object('id',n.id,'text',n.text,'revision',n.revision);
end $$;
revoke all on function public.pp_edit_shared_note(uuid,uuid,text,integer) from public,anon;
grant execute on function public.pp_edit_shared_note(uuid,uuid,text,integer) to authenticated;
commit;
