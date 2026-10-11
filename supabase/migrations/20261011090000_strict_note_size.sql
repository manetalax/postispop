create or replace function postispop_private.enforce_note_size_budget()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(new)::text,'UTF8')) + coalesce((select pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(s)::text,'UTF8')) from public.postispop_note_style s where s.note_id=new.id),0) > 10000000 then
  raise exception 'NOTE_TOO_LARGE' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function postispop_private.enforce_note_size_budget() from public,anon,authenticated;
create or replace function public.postispop_purge_oversized_note(p_note uuid,p_device_bytes bigint default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare total bigint; parent_board uuid;
begin
 perform 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=p_note and b.owner_id=auth.uid() for update of n;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 select pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(n)::text,'UTF8'))+
 coalesce((select pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(s)::text,'UTF8')) from public.postispop_note_style s where s.note_id=n.id),0)
 into total from public.notes n where n.id=p_note;
 -- Device files are private; owners already have the right to delete their note.
 if greatest(total,p_device_bytes)<=10000000 then raise exception 'NOTE_WITHIN_BUDGET';end if;
 delete from public.notes where id=p_note returning board_id into parent_board;
 update public.boards set revision=coalesce(revision,0)+1 where id=parent_board;
 return jsonb_build_object('deleted',true);
end $$;
revoke all on function public.postispop_purge_oversized_note(uuid,bigint) from public,anon;
grant execute on function public.postispop_purge_oversized_note(uuid,bigint) to authenticated;
-- Explicitly authorized cleanup; ordinary binary files live on client devices.
delete from public.notes n where pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(n)::text,'UTF8'))+
coalesce((select pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(s)::text,'UTF8')) from public.postispop_note_style s where s.note_id=n.id),0)>10000000;

create or replace function postispop_private.enforce_note_style_size_budget()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.notes n where n.id=new.note_id for update;
 if pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(new)::text,'UTF8')) + coalesce((select pg_catalog.octet_length(pg_catalog.convert_to(pg_catalog.to_jsonb(n)::text,'UTF8')) from public.notes n where n.id=new.note_id),0) > 10000000 then
  raise exception 'NOTE_TOO_LARGE' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function postispop_private.enforce_note_style_size_budget() from public,anon,authenticated;
create trigger postispop_note_style_size_budget before insert or update on public.postispop_note_style
for each row execute function postispop_private.enforce_note_style_size_budget();
