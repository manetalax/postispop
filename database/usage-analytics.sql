begin;
create table if not exists postispop_private.usage_events(id bigint generated always as identity primary key,created_at timestamptz not null default now(),visitor_id uuid not null,session_id uuid not null,user_id uuid,event text not null,page text not null,device text not null,source text not null,action text not null default '',seconds integer not null default 0);
alter table postispop_private.usage_events enable row level security;
create index if not exists usage_events_created on postispop_private.usage_events(created_at);
create index if not exists usage_events_visitor on postispop_private.usage_events(visitor_id,created_at);
create index if not exists usage_events_session on postispop_private.usage_events(session_id,created_at);
revoke all on postispop_private.usage_events from public,anon,authenticated;
create or replace function public.postispop_record_usage(p_event jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid; s uuid; e text; p text; d text; r text; a text; n integer;
begin
 if p_event->>'consent' is distinct from 'yes' then raise exception 'CONSENT_REQUIRED'; end if;
 v:=(p_event->>'visitor')::uuid;s:=(p_event->>'session')::uuid;e:=p_event->>'event';p:=p_event->>'page';d:=p_event->>'device';r:=p_event->>'source';a:=coalesce(p_event->>'action','');
 if v is null or s is null or e is null or e not in ('page_view','active_time','click','scroll','note_create','note_edit','board_create','share','export','account','error','page_exit') or p is null or p not in ('home','shop','prizes','terms','other') or d is null or d not in ('mobile','tablet','desktop') or r is null or r not in ('direct','internal','search','social','other') or length(a)>64 or a !~ '^[a-z0-9_-]*$' then raise exception 'INVALID_EVENT';end if;
 n:=case when e='active_time' then greatest(0,least(30,coalesce((p_event->>'seconds')::integer,0))) else 0 end;
 perform pg_advisory_xact_lock(hashtextextended('usage:'||v::text,0));
 if (select count(*) from postispop_private.usage_events where visitor_id=v and created_at>now()-interval '1 day')>=3000 then return jsonb_build_object('accepted',false);end if;
 insert into postispop_private.usage_events(visitor_id,session_id,user_id,event,page,device,source,action,seconds) values(v,s,auth.uid(),e,p,d,r,a,n);
 return jsonb_build_object('accepted',true);
end $$;
revoke all on function public.postispop_record_usage(jsonb) from public; grant execute on function public.postispop_record_usage(jsonb) to anon,authenticated;
create or replace function public.postispop_owner_metrics() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.postispop_is_owner() then raise exception 'FORBIDDEN' using errcode='42501';end if;
 with ev as(select * from postispop_private.usage_events where created_at>now()-interval '30 days'),sessions as(select session_id,count(*) filter(where event='page_view') as views,sum(seconds) as seconds,bool_or(event in ('note_create','note_edit','board_create','share','export')) as engaged from ev group by session_id),firsts as(select visitor_id,min(created_at)::date as first_day from postispop_private.usage_events group by visitor_id)
 select jsonb_build_object('window_days',30,'started_at',(select min(created_at) from postispop_private.usage_events),'page_views',(select count(*) from ev where event='page_view'),'visitors',(select count(distinct visitor_id) from ev),'sessions',(select count(*) from sessions),'active_seconds',(select coalesce(sum(seconds),0) from ev),'average_session_seconds',(select coalesce(round(avg(seconds)),0) from sessions),'short_sessions',(select count(*) from sessions where views<=1 and seconds<10 and not engaged),'returning_visitors',(select count(*) from(select visitor_id from ev group by visitor_id having count(distinct session_id)>1)t),'daily',coalesce((select jsonb_agg(t order by day) from(select created_at::date as day,count(*) filter(where event='page_view') as views,count(distinct visitor_id) as visitors from ev group by created_at::date)t),'[]'::jsonb),'events',coalesce((select jsonb_agg(t order by total desc) from(select event,count(*) as total from ev where event<>'active_time' group by event)t),'[]'::jsonb),'pages',coalesce((select jsonb_agg(t order by views desc) from(select page,count(*) filter(where event='page_view') as views,sum(seconds) as active_seconds,count(*) filter(where event='page_exit') as exits from ev group by page)t),'[]'::jsonb),'devices',coalesce((select jsonb_agg(t) from(select device,count(distinct session_id) as sessions from ev group by device)t),'[]'::jsonb),'sources',coalesce((select jsonb_agg(t) from(select source,count(distinct session_id) as sessions from ev group by source)t),'[]'::jsonb),'clicks',coalesce((select jsonb_agg(t order by total desc) from(select page,action,count(*) as total from ev where event='click' group by page,action limit 30)t),'[]'::jsonb),'retention',coalesce((select jsonb_agg(jsonb_build_object('day',k,'eligible',(select count(*) from firsts f where f.first_day between current_date-30 and current_date-k),'returned',(select count(*) from firsts f where f.first_day between current_date-30 and current_date-k and exists(select 1 from postispop_private.usage_events u where u.visitor_id=f.visitor_id and u.created_at::date=f.first_day+k)))) from unnest(array[1,7,14])k),'[]'::jsonb),'geography_available',false,'ga4_connected',false) into result;
 return result;
end $$;
revoke all on function public.postispop_owner_metrics() from public,anon;grant execute on function public.postispop_owner_metrics() to authenticated;
commit;
