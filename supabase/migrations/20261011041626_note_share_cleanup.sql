-- Isolated cleanup credential: never send the service-role key through pg_net.
create extension if not exists pg_net with schema extensions;
do $$
declare secret text;
begin
 select decrypted_secret into secret from vault.decrypted_secrets where name='postispop_share_cleanup';
 if secret is null then
   secret:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
   perform vault.create_secret(secret,'postispop_share_cleanup','Only authorizes expiry cleanup of shared notes');
 end if;
 insert into public.postispop_share_settings(name,value)
 values('cleanup_sha256',encode(sha256(convert_to(secret,'UTF8')),'hex'))
 on conflict(name) do update set value=excluded.value;
end; $$;
select cron.schedule('postispop-shared-note-cleanup','*/15 * * * *',$job$
 select net.http_post(
   url:=(select value from public.postispop_share_settings where name='service_url')||'/functions/v1/postispop-note-share/cleanup',
   headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='postispop_share_cleanup')),
   body:='{}'::jsonb,
   timeout_milliseconds:=30000
 );
$job$);
