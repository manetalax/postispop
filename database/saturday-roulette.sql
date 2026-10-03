-- Apply after designs.sql and design-catalog-seed.sql. Personal period starts on first completed spin.
begin;
create table if not exists public.postispop_saturday_spins (
 user_id uuid not null references auth.users(id) on delete cascade,
 played_on date not null, result jsonb not null, created_at timestamptz not null default now(),
 primary key(user_id,played_on)
);
alter table public.postispop_saturday_spins enable row level security;
revoke all on public.postispop_saturday_spins from public,anon,authenticated;
grant select on public.postispop_saturday_spins to authenticated;
drop policy if exists saturday_own_result on public.postispop_saturday_spins;
create policy saturday_own_result on public.postispop_saturday_spins for select to authenticated using(user_id=(select auth.uid()));
-- Rejection sampling from the 48 random bits preceding the UUID version field.
create or replace function postispop_private.roulette_random(bound bigint) returns bigint
language plpgsql volatile set search_path='' as $$
declare value bigint; ceiling bigint := 281474976710656;
begin
 if bound<1 or bound>ceiling then raise exception 'INVALID_RANDOM_BOUND'; end if;
 loop
  value:=('x'||substr(replace(gen_random_uuid()::text,'-',''),1,12))::bit(48)::bigint;
  if value < ceiling-(ceiling%bound) then return value%bound; end if;
 end loop;
end $$;
revoke all on function postispop_private.roulette_random(bigint) from public,anon,authenticated;
create or replace function public.postispop_saturday_status() returns jsonb
language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Madrid')::date;
 first_spin date; last_saturday date; outcome jsonb; state text;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 -- Reading status never starts the clock. A persisted first spin does.
 select min(played_on) into first_spin from public.postispop_saturday_spins where user_id=auth.uid();
 -- First spin is a Saturday. Day 60 is Tuesday; day 63 is the next Saturday.
 last_saturday:=first_spin+63;
 select result into outcome from public.postispop_saturday_spins where user_id=auth.uid() and played_on=today;
 state:=case when first_spin is not null and today>last_saturday then 'ended'
  when extract(isodow from today)<>6 then 'not_saturday'
  when outcome is not null then 'played' else 'available' end;
 return jsonb_build_object('state',state,'result',outcome,'starts_on',first_spin,
 'last_saturday',last_saturday,'ends_before',last_saturday+1,'server_day',today,
 'opportunity_saturdays',10,'period_started',first_spin is not null);

end $$;
create or replace function public.postispop_saturday_spin() returns jsonb
language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Madrid')::date;
 status jsonb; outcome jsonb; chosen public.postispop_designs; candidates text[]; prize_ref text;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 -- Serialize simultaneous attempts for this account; reload returns the stored result.
 perform pg_advisory_xact_lock(hashtextextended('saturday:'||auth.uid()::text,0));
 status:=public.postispop_saturday_status();
 if status->>'state'='played' then return status; end if;
 if status->>'state'<>'available' then raise exception 'ROULETTE_NOT_AVAILABLE' using errcode='42501'; end if;
 select array_agg(d.id order by d.id) into candidates from public.postispop_designs d
 where d.category<>'Países' and d.id not like 'country-%' and not public.postispop_can_design(d.id);
 if coalesce(cardinality(candidates),0)=0 then raise exception 'NO_UNOWNED_PRIZES' using errcode='42501'; end if;
 outcome:=jsonb_build_object('kind','none');
 if postispop_private.roulette_random(6)=0 then
  if postispop_private.roulette_random(10000)=0 and not public.postispop_has_license('premium') then
   prize_ref:='saturday:'||auth.uid()::text||':'||today::text;
   insert into public.postispop_licenses(user_id,subject,payment_reference) values(auth.uid(),'premium',prize_ref)
    on conflict(user_id,subject) do update set expires_at=null,revoked_at=null,payment_reference=excluded.payment_reference;
   outcome:=jsonb_build_object('kind','premium','title','Premium de por vida');
  else
   select * into chosen from public.postispop_designs where id=candidates[1+postispop_private.roulette_random(cardinality(candidates))::integer];
   insert into public.postispop_unlocks(user_id,design_id) values(auth.uid(),chosen.id) on conflict do nothing;
   outcome:=jsonb_build_object('kind','design','id',chosen.id,'title',chosen.title);
  end if;
 end if;
 insert into public.postispop_saturday_spins(user_id,played_on,result) values(auth.uid(),today,outcome);
 return public.postispop_saturday_status();
end $$;
revoke all on function public.postispop_saturday_status(),public.postispop_saturday_spin() from public,anon;
grant execute on function public.postispop_saturday_status(),public.postispop_saturday_spin() to authenticated;
commit;
