-- Idempotent migration. Apply after database/commerce.sql as database administrator.
-- New purchases remain disabled. This does not bind an owner UUID automatically.
begin;
create schema if not exists postispop_private;
revoke all on schema postispop_private from public, anon;
-- Preserve existing authenticated schema USAGE required by legacy note policies.

create table if not exists postispop_private.owner_account (
  singleton boolean primary key default true check(singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
revoke all on postispop_private.owner_account from public,anon,authenticated;
-- Bind the verified owner's UUID separately in a private administration session.
-- Never grant ownership using a browser parameter, metadata or an unverified email.
create or replace function public.postispop_is_owner() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from postispop_private.owner_account a join auth.users u on u.id=a.user_id where a.user_id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)='manetala@gmail.com');
$$;
revoke all on function public.postispop_is_owner() from public,anon;
grant execute on function public.postispop_is_owner() to authenticated;

create or replace function postispop_private.bind_owner(verified_user_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=verified_user_id and lower(email)='manetala@gmail.com' and email_confirmed_at is not null) then raise exception 'VERIFIED_OWNER_REQUIRED'; end if;
 if exists(select 1 from postispop_private.owner_account where user_id<>verified_user_id) then raise exception 'OWNER_ALREADY_BOUND'; end if;
 insert into postispop_private.owner_account(singleton,user_id) values(true,verified_user_id) on conflict(singleton) do nothing;
end $$;
revoke all on function postispop_private.bind_owner(uuid) from public,anon,authenticated;

create table if not exists public.postispop_designs (
  id text primary key, title text not null, category text not null, tier text not null check(tier in('reward','premium')),pack text not null, default_paper text not null default 'plain'
);
alter table public.postispop_designs add column if not exists default_paper text not null default 'plain';
alter table public.postispop_designs enable row level security;
drop policy if exists designs_preview on public.postispop_designs;
create policy designs_preview on public.postispop_designs for select using(true);
grant select on public.postispop_designs to anon,authenticated;
revoke insert,update,delete on public.postispop_designs from anon,authenticated;

-- A design may belong to multiple coherent packs (e.g. medical + professions).
create table if not exists public.postispop_design_pack_entries (
 pack_id text not null check(pack_id ~ '^[a-z0-9_-]{1,80}$'),
 design_id text not null references public.postispop_designs(id) on delete cascade,
 primary key(pack_id,design_id)
);
alter table public.postispop_design_pack_entries enable row level security;
drop policy if exists design_packs_preview on public.postispop_design_pack_entries;
create policy design_packs_preview on public.postispop_design_pack_entries for select using(true);
grant select on public.postispop_design_pack_entries to anon,authenticated;
revoke insert,update,delete on public.postispop_design_pack_entries from anon,authenticated;

create table if not exists public.postispop_licenses (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null, expires_at timestamptz, revoked_at timestamptz,
  payment_reference text not null unique, primary key(user_id,subject)
);
alter table public.postispop_licenses enable row level security;
drop policy if exists licenses_read on public.postispop_licenses;
create policy licenses_read on public.postispop_licenses for select to authenticated using(user_id=(select auth.uid()));
grant select on public.postispop_licenses to authenticated;
grant all on public.postispop_licenses to service_role;
revoke all on public.postispop_licenses from anon;
revoke insert,update,delete on public.postispop_licenses from authenticated;

create table if not exists public.postispop_rewards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_visit date, streak integer not null default 0 check(streak between 0 and 4),
  credits integer not null default 0 check(credits>=0), visits integer not null default 0 check(visits>=0)
);
create table if not exists public.postispop_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  design_id text not null references public.postispop_designs(id), created_at timestamptz not null default now(),
  primary key(user_id,design_id)
);
create table if not exists public.postispop_appearance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  design_id text references public.postispop_designs(id), updated_at timestamptz not null default now()
);
alter table public.postispop_rewards enable row level security;
alter table public.postispop_unlocks enable row level security;
alter table public.postispop_appearance enable row level security;
drop policy if exists reward_read on public.postispop_rewards;
create policy reward_read on public.postispop_rewards for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists unlock_read on public.postispop_unlocks;
create policy unlock_read on public.postispop_unlocks for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists appearance_read on public.postispop_appearance;
create policy appearance_read on public.postispop_appearance for select to authenticated using(user_id=(select auth.uid()));
grant select on public.postispop_rewards,public.postispop_unlocks,public.postispop_appearance to authenticated;
revoke all on public.postispop_rewards,public.postispop_unlocks,public.postispop_appearance from anon;
revoke insert,update,delete on public.postispop_rewards,public.postispop_unlocks,public.postispop_appearance from authenticated;

create or replace function public.postispop_has_license(subject_id text) returns boolean
language sql stable security definer set search_path='' as $$
select auth.uid() is not null and (public.postispop_is_owner()
 or exists(select 1 from public.store_entitlements e where e.user_id=auth.uid() and e.product_slug='postispop-pro') or exists(
 select 1 from public.postispop_licenses l where l.user_id=auth.uid() and l.subject in('premium',subject_id) and l.revoked_at is null and (l.expires_at is null or l.expires_at>now())
)); $$;
create or replace function public.postispop_can_design(design_id text) returns boolean
language sql stable security definer set search_path='' as $$
select auth.uid() is not null and exists(select 1 from public.postispop_designs d where d.id=design_id and (
 public.postispop_has_license(d.id) or public.postispop_has_license('pack:'||d.pack)
 or exists(select 1 from public.postispop_design_pack_entries p where p.design_id=d.id and public.postispop_has_license('pack:'||p.pack_id))
 or exists(select 1 from public.postispop_unlocks u where u.user_id=auth.uid() and u.design_id=d.id)
)); $$;
revoke all on function public.postispop_has_license(text),public.postispop_can_design(text) from public,anon;
grant execute on function public.postispop_has_license(text),public.postispop_can_design(text) to authenticated;

create or replace function public.postispop_catalog_status() returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 select jsonb_build_object('owner',public.postispop_is_owner(),'premium',public.postispop_has_license('premium'),
  'legacy_pro',exists(select 1 from public.store_entitlements e where e.user_id=auth.uid() and e.product_slug='postispop-pro'),
  'purchases_enabled',false,'server_now',now(),
  'offline_valid_until',least(now()+interval '7 days',coalesce((select min(l.expires_at) from public.postispop_licenses l where l.user_id=auth.uid() and l.revoked_at is null and l.expires_at>now()),now()+interval '7 days')),'streak',case when r.last_visit >= (now() at time zone 'Europe/Madrid')::date-1 then coalesce(r.streak,0) else 0 end,
  'credits',coalesce(r.credits,0),'visits',coalesce(r.visits,0),
  'unlocked',coalesce((select jsonb_agg(d.id) from public.postispop_designs d where public.postispop_can_design(d.id)),'[]'::jsonb),
  'selected',(select a.design_id from public.postispop_appearance a where a.user_id=auth.uid() and public.postispop_can_design(a.design_id)),
  'tools',jsonb_build_object('fonts',public.postispop_has_license('tools:fonts'),'pens',public.postispop_has_license('tools:pens'),'papers',public.postispop_has_license('tools:papers'),'palettes',public.postispop_has_license('tools:palettes')))
 into result from (select 1) seed left join public.postispop_rewards r on r.user_id=auth.uid();
 return result;
end $$;

create or replace function public.postispop_checkin() returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.postispop_rewards; today date := (now() at time zone 'Europe/Madrid')::date; next_streak integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 insert into public.postispop_rewards(user_id) values(auth.uid()) on conflict do nothing;
 select * into r from public.postispop_rewards where user_id=auth.uid() for update;
 if r.last_visit is null or r.last_visit < today then
  next_streak:=case when r.last_visit=today-1 then r.streak+1 else 1 end;
  update public.postispop_rewards set last_visit=today,visits=visits+1,streak=next_streak%5,credits=credits+case when next_streak=5 then 1 else 0 end where user_id=auth.uid();
 end if;
 return public.postispop_catalog_status();
end $$;

create or replace function public.postispop_claim_design(design_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare available integer;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 select credits into available from public.postispop_rewards where user_id=auth.uid() for update;
 if public.postispop_can_design(design_id) then return public.postispop_catalog_status(); end if;
 if not exists(select 1 from public.postispop_designs d where d.id=design_id and d.tier='reward') then raise exception 'NOT_A_REWARD' using errcode='42501'; end if;
 if coalesce(available,0)<1 then raise exception 'NO_REWARD_CREDIT' using errcode='42501'; end if;
 insert into public.postispop_unlocks(user_id,design_id) values(auth.uid(),design_id);
 update public.postispop_rewards set credits=credits-1 where user_id=auth.uid();
 return public.postispop_catalog_status();
end $$;

create or replace function public.postispop_select_design(design_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 if design_id is not null and not public.postispop_can_design(design_id) then raise exception 'DESIGN_LOCKED' using errcode='42501'; end if;
 insert into public.postispop_appearance(user_id,design_id) values(auth.uid(),design_id) on conflict(user_id) do update set design_id=excluded.design_id,updated_at=now();
 return public.postispop_catalog_status();
end $$;
revoke all on function public.postispop_catalog_status(),public.postispop_checkin(),public.postispop_claim_design(text),public.postispop_select_design(text) from public,anon;
grant execute on function public.postispop_catalog_status(),public.postispop_checkin(),public.postispop_claim_design(text),public.postispop_select_design(text) to authenticated;

create table if not exists public.postispop_note_style (
 user_id uuid not null references auth.users(id) on delete cascade,
 note_id uuid not null references public.notes(id) on delete cascade,
 font text not null default 'sans' check(font in('sans','serif','mono','hand','rounded','book')),
 size integer not null default 18 check(size between 12 and 36),
 italic boolean not null default false, underline boolean not null default false,
 ink text not null default '#163b62' check(ink ~ '^#[0-9a-fA-F]{6}$'),
 paper text not null default 'plain' check(paper in('plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study')),
 drawing jsonb not null default '[]'::jsonb,
 revision integer not null default 1 check(revision>0),
 primary key(user_id,note_id)
);

-- Protected-notes migration may run later; the column permits fail-closed style policies.
alter table public.notes add column if not exists protected_envelope jsonb;
alter table public.postispop_note_style add column if not exists revision integer not null default 1;
alter table public.postispop_note_style drop constraint if exists postispop_note_style_size_check;
alter table public.postispop_note_style add constraint postispop_note_style_size_check check(size between 12 and 36);
alter table public.postispop_note_style drop constraint if exists postispop_note_style_drawing_check;
alter table public.postispop_note_style drop constraint if exists postispop_note_style_paper_check;
alter table public.postispop_note_style add constraint postispop_note_style_paper_check check(paper in('plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'));

create or replace function public.postispop_can_paper(paper_id text) returns boolean
language sql stable security definer set search_path='' as $$
select auth.uid() is not null and (paper_id='plain' or public.postispop_has_license('tools:papers') or exists(
 select 1 from public.postispop_appearance a join public.postispop_designs d on d.id=a.design_id
 where a.user_id=auth.uid() and d.default_paper=paper_id and public.postispop_can_design(d.id)
)); $$;
revoke all on function public.postispop_can_paper(text) from public,anon;
grant execute on function public.postispop_can_paper(text) to authenticated;

create or replace function public.postispop_valid_drawing(value jsonb) returns boolean
language plpgsql stable security invoker set search_path='' as $$
declare strokes jsonb; stroke jsonb; point jsonb; total_points integer:=0; instrument text;
begin
 if octet_length(value::text)>150000 then return false; end if;
 if jsonb_typeof(value)='array' then strokes:=value;
 elsif jsonb_typeof(value)='object' and value->>'version'='1' then
  if coalesce(value->>'selectedInstrument','') not in('graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor') then return false; end if;
  if value->>'selectedInstrument'<>'ballpoint' and not public.postispop_has_license('tools:pens') then return false; end if;
  strokes:=value->'strokes';
 else return false; end if;
 if strokes is null or jsonb_typeof(strokes)<>'array' or jsonb_array_length(strokes)>120 then return false; end if;
 for stroke in select * from jsonb_array_elements(strokes) loop
  instrument:=stroke->>'instrument';
  if instrument is null or instrument not in('graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor') then return false; end if;
  if instrument<>'ballpoint' and not public.postispop_has_license('tools:pens') then return false; end if;
  if coalesce(stroke->>'color','') !~ '^#[0-9a-fA-F]{6}$' then return false; end if;
  if lower(stroke->>'color')<>'#163b62' and not (public.postispop_has_license('tools:palettes') or public.postispop_has_license('tools:pens')) then return false; end if;
  if jsonb_typeof(stroke->'width') is distinct from 'number' or not ((stroke->>'width')::numeric between 0.5 and 28) then return false; end if;
  if jsonb_typeof(stroke->'points') is distinct from 'array' then return false; end if;
  if jsonb_array_length(stroke->'points')=0 then return false; end if;
  total_points:=total_points+jsonb_array_length(stroke->'points'); if total_points>16000 then return false; end if;
  for point in select * from jsonb_array_elements(stroke->'points') loop
   if jsonb_typeof(point->'x') is distinct from 'number' or jsonb_typeof(point->'y') is distinct from 'number' or jsonb_typeof(point->'p') is distinct from 'number' then return false; end if;
   if not ((point->>'x')::numeric between 0 and 1 and (point->>'y')::numeric between 0 and 1 and (point->>'p')::numeric between 0 and 1) then return false; end if;
  end loop;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function public.postispop_valid_drawing(jsonb) from public,anon;
grant execute on function public.postispop_valid_drawing(jsonb) to authenticated;
alter table public.postispop_note_style enable row level security;
drop policy if exists styles_read on public.postispop_note_style;
create policy styles_read on public.postispop_note_style for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())));
-- Invoker/RLS deliberately uses existing note access, not a service-role bypass.
drop policy if exists styles_insert on public.postispop_note_style;
create policy styles_insert on public.postispop_note_style for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())) and
 (font='sans' or public.postispop_has_license('tools:fonts')) and
 (ink='#163b62' or public.postispop_has_license('tools:palettes') or public.postispop_has_license('tools:pens')) and public.postispop_valid_drawing(drawing) and
 public.postispop_can_paper(paper));
drop policy if exists styles_update on public.postispop_note_style;
create policy styles_update on public.postispop_note_style for update to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid()))) with check(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())) and
 (font='sans' or public.postispop_has_license('tools:fonts')) and
 (ink='#163b62' or public.postispop_has_license('tools:palettes') or public.postispop_has_license('tools:pens')) and public.postispop_valid_drawing(drawing) and
 public.postispop_can_paper(paper));
grant select,insert,update on public.postispop_note_style to authenticated;
revoke all on public.postispop_note_style from anon;


-- Optimistic locking for offline style writes; RLS remains in force (SECURITY INVOKER).
create or replace function public.postispop_save_note_style(p_style jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result public.postispop_note_style; expected integer:=coalesce((p_style->>'revision')::integer,0); nid uuid:=(p_style->>'note_id')::uuid;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 -- Match protection RPC lock order: note first, style second.
 perform 1 from public.notes where id=nid for update;
 if expected=0 then
  insert into public.postispop_note_style(user_id,note_id,font,size,italic,underline,ink,paper,drawing)
  values(auth.uid(),nid,coalesce(p_style->>'font','sans'),coalesce((p_style->>'size')::integer,18),coalesce((p_style->>'italic')::boolean,false),coalesce((p_style->>'underline')::boolean,false),coalesce(p_style->>'ink','#163b62'),coalesce(p_style->>'paper','plain'),coalesce(p_style->'drawing','[]'::jsonb)) on conflict do nothing returning * into result;
 else
  update public.postispop_note_style set font=coalesce(p_style->>'font',font),size=coalesce((p_style->>'size')::integer,size),italic=coalesce((p_style->>'italic')::boolean,italic),underline=coalesce((p_style->>'underline')::boolean,underline),ink=coalesce(p_style->>'ink',ink),paper=coalesce(p_style->>'paper',paper),drawing=coalesce(p_style->'drawing',drawing),revision=revision+1
  where user_id=auth.uid() and note_id=nid and revision=expected returning * into result;
 end if;
 if result.note_id is null then raise exception 'CONFLICT' using errcode='40001'; end if;
 return to_jsonb(result);
end $$;
revoke all on function public.postispop_save_note_style(jsonb) from public,anon;
grant execute on function public.postispop_save_note_style(jsonb) to authenticated;

create or replace function public.postispop_owner_dashboard(page_number integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.postispop_is_owner() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 return jsonb_build_object('server_now',now(),'users_total',(select count(*) from auth.users),'boards_total',(select count(*) from public.boards),'notes_total',(select count(*) from public.notes),
 'users',coalesce((select jsonb_agg(t) from(select id,email,created_at,last_sign_in_at,email_confirmed_at,raw_app_meta_data->'providers' as providers from auth.users order by created_at desc limit 50 offset greatest(0,least(page_number,100000))*50)t),'[]'::jsonb),
 'analytics_connected',false,'analytics_note','Google Analytics y las métricas de comportamiento no están conectados. No se muestran datos inventados.');
end $$;
revoke all on function public.postispop_owner_dashboard(integer) from public,anon;
grant execute on function public.postispop_owner_dashboard(integer) to authenticated;
-- Preserve historical products while granting owner/current Premium access, without fake orders.
create or replace function public.postispop_access() returns jsonb
language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
 'server_now',now(),'owner',public.postispop_is_owner(),'premium',public.postispop_has_license('premium'),
 'trial_expires_at',(select expires_at from public.clock_trials where user_id=(select auth.uid())),
 'products',coalesce((select jsonb_agg(product_slug) from public.store_entitlements where user_id=(select auth.uid())),'[]'::jsonb),
 'clock_active',public.postispop_has_license('premium') or exists(select 1 from public.clock_trials where user_id=(select auth.uid()) and expires_at>now()) or exists(select 1 from public.store_entitlements where user_id=(select auth.uid()) and product_slug in('reloj-recordatorios','postispop-pro'))
); $$;
revoke all on function public.postispop_access() from public,anon;
grant execute on function public.postispop_access() to authenticated;

-- Statistics do not grant permission to read the contents of other users' notes.
drop policy if exists postispop_owner_boards on public.boards;
drop policy if exists postispop_owner_notes on public.notes;
commit;
