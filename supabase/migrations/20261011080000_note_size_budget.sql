-- Count persisted note data; ordinary file bytes live on the device and are
-- checked together with note metadata by the browser before each mutation.
create or replace function postispop_private.enforce_note_size_budget()
returns trigger language plpgsql security invoker set search_path='' as $$
declare next_bytes bigint; previous_bytes bigint := 0;
begin
 next_bytes := pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(new)::text,'UTF8'));
 if tg_op = 'UPDATE' then
  previous_bytes := pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(old)::text,'UTF8'));
 end if;
 if next_bytes > 10000000 and next_bytes > previous_bytes then
  raise exception 'NOTE_TOO_LARGE' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function postispop_private.enforce_note_size_budget() from public,anon,authenticated;
create trigger postispop_note_size_budget before insert or update on public.notes
for each row execute function postispop_private.enforce_note_size_budget();

update storage.buckets set file_size_limit=14000028 where id='postispop-note-shares';
