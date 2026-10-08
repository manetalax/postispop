-- Production follow-up for postispop_note_trial_retention_v2.
-- Run a targeted expiry purge when the authenticated owner reads their board.
-- No note is deleted at migration time.
begin;

create or replace function postispop_private.purge_expired_extra_notes_for_user(p_user uuid)
returns bigint language plpgsql security definer set search_path='' as $$
declare removed bigint;
begin
 if p_user is null then raise exception 'USER_REQUIRED' using errcode='22023';end if;
 delete from public.notes n using public.boards b
 where n.board_id=b.id and b.owner_id=p_user
  and (n.position>=6 or exists(select 1 from postispop_private.locked_note_archive a where a.note_id=n.id and a.user_id=b.owner_id))
  and not exists(select 1 from public.board_trials t where t.user_id=b.owner_id and t.expires_at>now())
  and not exists(select 1 from public.store_entitlements e where e.user_id=b.owner_id and e.product_slug in('postispop-pro','premium-lifetime'))
  and not exists(select 1 from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium' and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()))
  and greatest(coalesce((select t.expires_at from public.board_trials t where t.user_id=b.owner_id),now()),
    coalesce((select max(coalesce(l.expires_at,l.revoked_at)) from public.postispop_licenses l where l.user_id=b.owner_id and l.subject='premium'),now()),
    coalesce((select g.grace_started_at from postispop_private.note_retention_grace g where g.user_id=b.owner_id),'-infinity'::timestamptz)) + interval '30 days'<=now();
 get diagnostics removed=row_count;return removed;
end $$;
revoke all on function postispop_private.purge_expired_extra_notes_for_user(uuid) from public,anon,authenticated;

create or replace function public.postispop_board_access(p_board uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare board_owner uuid;
begin
 if auth.uid() is null then raise exception 'SESSION_REQUIRED' using errcode='28000';end if;
 select b.owner_id into board_owner from public.boards b where b.id=p_board
  and (b.owner_id=auth.uid() or exists(select 1 from public.board_members m where m.board_id=b.id and m.user_id=auth.uid()));
 if board_owner is null then raise exception 'BOARD_ACCESS_DENIED' using errcode='42501';end if;
 if board_owner=auth.uid() then perform postispop_private.purge_expired_extra_notes_for_user(board_owner);end if;
 return postispop_private.board_access(p_board);
end $$;
revoke all on function public.postispop_board_access(uuid) from public,anon;
grant execute on function public.postispop_board_access(uuid) to authenticated;

commit;
