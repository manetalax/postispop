-- Only the Edge Function may access encrypted snapshots; no direct public reads.
create table if not exists public.postispop_note_shares (
 token text primary key check (token ~ '^[A-Za-z0-9_-]{43}$'),
 bytes bigint not null check (bytes between 29 and 52428828),
 ready boolean not null default false,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '7 days')
);
create index if not exists postispop_note_shares_expiry on public.postispop_note_shares(expires_at);
create table if not exists public.postispop_share_rate (
 subject text not null, window_start timestamptz not null,
 requests integer not null default 0, bytes bigint not null default 0,
 primary key(subject,window_start)
);
create table if not exists public.postispop_share_settings (
 name text primary key, value text not null
);
alter table public.postispop_note_shares enable row level security;
alter table public.postispop_share_rate enable row level security;
alter table public.postispop_share_settings enable row level security;
revoke all on public.postispop_note_shares,public.postispop_share_rate,public.postispop_share_settings from public,anon,authenticated;
grant select,insert,update,delete on public.postispop_note_shares,public.postispop_share_rate,public.postispop_share_settings to service_role;
create or replace function public.postispop_reserve_note_share(p_token text,p_bytes bigint,p_subject text)
returns void language plpgsql security invoker set search_path='' as $$
declare n integer; b bigint;
begin
 if p_subject !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_SUBJECT'; end if;
 insert into public.postispop_share_rate(subject,window_start,requests,bytes)
 values(p_subject,date_trunc('hour',now()),1,p_bytes)
 on conflict(subject,window_start) do update set requests=postispop_share_rate.requests+1,bytes=postispop_share_rate.bytes+excluded.bytes
 returning requests,bytes into n,b;
 if n>10 or b>209715200 then raise exception 'RATE_LIMITED'; end if;
 insert into public.postispop_share_rate(subject,window_start,requests,bytes)
 values('global',date_trunc('day',now()),1,p_bytes)
 on conflict(subject,window_start) do update set requests=postispop_share_rate.requests+1,bytes=postispop_share_rate.bytes+excluded.bytes
 returning requests,bytes into n,b;
 if b>1073741824 then raise exception 'RATE_LIMITED'; end if;
 insert into public.postispop_note_shares(token,bytes) values(p_token,p_bytes);
end; $$;
revoke all on function public.postispop_reserve_note_share(text,bigint,text) from public,anon,authenticated;
grant execute on function public.postispop_reserve_note_share(text,bigint,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('postispop-note-shares','postispop-note-shares',false,52428828,array['application/octet-stream'])
 on conflict(id) do nothing;

-- Guard this bucket even if a deployment already has broad permissive policies.
drop policy if exists postispop_share_bucket_private on storage.objects;
create policy postispop_share_bucket_private on storage.objects as restrictive
 for all to anon,authenticated
 using(bucket_id <> 'postispop-note-shares')
 with check(bucket_id <> 'postispop-note-shares');
