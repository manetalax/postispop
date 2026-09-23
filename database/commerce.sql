-- Server-owned access records; never trust browser storage for paid features.
create schema if not exists postispop_private;
revoke all on schema postispop_private from public, anon, authenticated;

create table public.clock_trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null
);
alter table public.clock_trials enable row level security;
grant select on public.clock_trials to authenticated;
revoke all on public.clock_trials from anon;
revoke insert,update,delete on public.clock_trials from authenticated;
create policy own_trial on public.clock_trials for select to authenticated using(user_id=(select auth.uid()));
insert into public.clock_trials(user_id,expires_at)
select id,created_at+interval '30 days' from auth.users on conflict do nothing;

create function postispop_private.start_clock_trial() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if TG_TABLE_SCHEMA <> 'auth' or TG_TABLE_NAME <> 'users' or TG_OP <> 'INSERT' then raise exception 'Invalid trigger'; end if;
  insert into public.clock_trials(user_id,expires_at) values(new.id,new.created_at+interval '30 days') on conflict do nothing;
  return new;
end $$;
revoke all on function postispop_private.start_clock_trial() from public,anon,authenticated;
create trigger postispop_clock_trial after insert on auth.users for each row execute function postispop_private.start_clock_trial();

create table public.store_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null references public.store_products(slug),
  stripe_session_id text not null unique,
  granted_at timestamptz not null default now(),
  primary key(user_id,product_slug)
);
alter table public.store_entitlements enable row level security;
grant select on public.store_entitlements to authenticated;
grant all on public.store_entitlements to service_role;
revoke all on public.store_entitlements from anon;
revoke insert,update,delete on public.store_entitlements from authenticated;
create policy own_purchases on public.store_entitlements for select to authenticated using(user_id=(select auth.uid()));

create function public.postispop_access() returns jsonb
language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
  'server_now',now(),
  'trial_expires_at',(select expires_at from public.clock_trials where user_id=(select auth.uid())),
  'products',coalesce((select jsonb_agg(product_slug) from public.store_entitlements where user_id=(select auth.uid())),'[]'::jsonb),
  'clock_active',exists(select 1 from public.clock_trials where user_id=(select auth.uid()) and expires_at>now()) or exists(select 1 from public.store_entitlements where user_id=(select auth.uid()) and product_slug in ('reloj-recordatorios','postispop-pro'))
); $$;
revoke all on function public.postispop_access() from public,anon;
grant execute on function public.postispop_access() to authenticated;

create table public.note_alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  label text not null check(length(label) between 1 and 200),
  due_at timestamptz not null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index note_alarms_user_due on public.note_alarms(user_id,due_at);
create index note_alarms_note on public.note_alarms(note_id);
alter table public.note_alarms enable row level security;
revoke all on public.note_alarms from anon;
grant select,insert,update,delete on public.note_alarms to authenticated;
create policy own_alarms_read on public.note_alarms for select to authenticated using(user_id=(select auth.uid()));
create policy own_alarms_delete on public.note_alarms for delete to authenticated using(user_id=(select auth.uid()));
create policy own_alarms_insert on public.note_alarms for insert to authenticated with check(
  user_id=(select auth.uid()) and due_at>now()
  and exists(select 1 from public.notes n where n.id=note_id)
  and ((select public.postispop_access())->>'clock_active')::boolean
);
create policy own_alarms_update on public.note_alarms for update to authenticated
using(user_id=(select auth.uid()) and ((select public.postispop_access())->>'clock_active')::boolean)
with check(user_id=(select auth.uid()) and exists(select 1 from public.notes n where n.id=note_id) and ((select public.postispop_access())->>'clock_active')::boolean);
