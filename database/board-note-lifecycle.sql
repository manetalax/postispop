-- Reversible note removal. Negative positions hold archived rows; existing
-- can_access_note RLS already excludes them. Contents, encryption, styles and
-- attachments retain the same note ID and are not overwritten by a new note.
begin;
create or replace function postispop_private.board_access(p_board uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare b public.boards;actor uuid:=auth.uid();premium boolean;expiry timestamptz;total integer;
begin
 if actor is null then raise exception 'SESSION_REQUIRED';end if;
 select * into b from public.boards where id=p_board;
 if b.id is null or not(b.owner_id=actor or exists(select 1 from public.board_members where board_id=p_board and user_id=actor))then raise exception 'BOARD_ACCESS_DENIED';end if;
 premium:=exists(select 1 from public.store_entitlements where user_id=b.owner_id and product_slug='postispop-pro');
 select expires_at into expiry from public.board_trials where user_id=b.owner_id;
 select count(*) into total from public.notes where board_id=p_board and position>=0;
 return jsonb_build_object('premium',premium,'trial_expires_at',expiry,'purge_at',expiry+interval '30 days','retention_enabled',true,'trial_active',coalesce(expiry>now(),false),'max_notes',case when premium or expiry>now()then 100 else 12 end,'note_count',total,'locked_positions',case when premium or expiry>now()then '[]'::jsonb else coalesce((select jsonb_agg(position order by position)from public.notes where board_id=p_board and position>=12),'[]'::jsonb)end,'locked_count',case when premium or expiry>now()then 0 else(select count(*)from public.notes where board_id=p_board and position>=12)end,'owner',b.owner_id=actor,'server_now',now());
end $$;

create or replace function postispop_private.limit_notes()returns trigger
language plpgsql security definer set search_path='' as $$
declare owner uuid;cap integer;expiry timestamptz;count_notes integer;
begin
 select owner_id into owner from public.boards where id=new.board_id for update;
 if owner is null then raise exception 'BOARD_NOT_FOUND';end if;
 if tg_op='UPDATE' and new.board_id<>old.board_id then raise exception 'NOTE_BOARD_IMMUTABLE';end if;
 -- Only the authorized archive helper sets this transaction-local note marker.
 if tg_op='UPDATE' and new.position<0 and old.position>=0 and current_setting('postispop.archiving_note',true)=new.id::text then return new;end if;
 select expires_at into expiry from public.board_trials where user_id=owner;
 cap:=case when expiry>now()or exists(select 1 from public.store_entitlements where user_id=owner and product_slug='postispop-pro')then 100 else 12 end;
 select count(*)into count_notes from public.notes where board_id=new.board_id and id<>new.id and position>=0 and position<cap;
 if new.position<0 or new.position>=cap or(tg_op='INSERT'and count_notes>=cap)then raise exception 'NOTE_LIMIT_REACHED';end if;
 return new;
end $$;

create or replace function postispop_private.add_board_note(p_board uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare state jsonb;position_new integer;result public.notes;
begin
 perform 1 from public.boards where id=p_board and owner_id=auth.uid() for update;
 if not found then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 state:=postispop_private.board_access(p_board);
 select min(slot)into position_new from generate_series(0,(state->>'max_notes')::integer-1)slot where not exists(select 1 from public.notes n where n.board_id=p_board and n.position=slot);
 if position_new is null then raise exception 'PREMIUM_REQUIRED' using errcode='42501';end if;
 insert into public.notes(board_id,author_id,position,paper)values(p_board,auth.uid(),position_new,position_new%6)returning * into result;
 update public.boards set revision=coalesce(revision,0)+1 where id=p_board;
 return to_jsonb(result);
end $$;

create or replace function postispop_private.archive_board_note(p_note uuid,p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare n public.notes;b uuid;trash uuid;archived_position integer;state jsonb;
begin
 select board_id into b from public.notes where id=p_note;
 if b is null then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 state:=postispop_private.board_access(b);
 -- Same board-first lock order as import and note creation.
 perform 1 from public.boards where id=b for update;
 select * into n from public.notes where id=p_note for update;
 if n.position<0 or not postispop_private.can_access_note(b,n.position)then raise exception 'NOTE_ACCESS_DENIED' using errcode='42501';end if;
 if p_revision is null or n.revision<>p_revision or (n.locked_until>now() and n.editing is distinct from auth.uid())then raise exception 'CONFLICT' using errcode='40001';end if;
 insert into postispop_private.note_trash(note_id,board_id,snapshot)values(n.id,b,to_jsonb(n))returning id into trash;
 select least(coalesce(min(position),0),0)-1 into archived_position from public.notes where board_id=b;
 perform set_config('postispop.archiving_note',n.id::text,true);
 update public.notes set position=archived_position,editing=null,locked_until=null,revision=revision+1,updated_at=now(),updated_ms=(extract(epoch from now())*1000)::bigint where id=n.id;
 perform set_config('postispop.archiving_note','',true);
 update public.notes dst set position=s.position from(select id,(row_number()over(order by position,id)-1)::integer as position from public.notes where board_id=b and position>=0 and position<(state->>'max_notes')::integer)s where dst.id=s.id and dst.position<>s.position;
 update public.boards set revision=coalesce(revision,0)+1 where id=b;
 return jsonb_build_object('board_id',b,'trashId',trash);
end $$;

create or replace function postispop_private.restore_archived_board_note(p_trash uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare t postispop_private.note_trash;n public.notes;b uuid;state jsonb;total integer;target integer;
begin
 select board_id into b from postispop_private.note_trash where id=p_trash and expires_at>now();
 if b is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 state:=postispop_private.board_access(b);
 perform 1 from public.boards where id=b for update;
 select * into t from postispop_private.note_trash where id=p_trash and expires_at>now()for update;
 if t.id is null then raise exception 'TRASH_EXPIRED' using errcode='P0002';end if;
 select * into n from public.notes where id=t.note_id for update;
 if n.id is null then raise exception 'NOT_FOUND' using errcode='P0002';end if;
 -- Preserve recovery of the older, cleared-slot trash format.
 if n.position>=0 then return postispop_private.restore_note(p_trash);end if;
 if n.revision<>coalesce((t.snapshot->>'revision')::integer,0)+1 then raise exception 'CONFLICT' using errcode='40001';end if;
 select count(*) into total from public.notes where board_id=b and position>=0 and position<(state->>'max_notes')::integer;
 if total>=(state->>'max_notes')::integer then raise exception 'BOARD_FULL' using errcode='23514';end if;
 target:=greatest(0,least(coalesce((t.snapshot->>'position')::integer,total),total));
 update public.notes set position=position+1 where board_id=b and position>=target and position<(state->>'max_notes')::integer;
 update public.notes set position=target,revision=revision+1,updated_at=now(),updated_ms=(extract(epoch from now())*1000)::bigint where id=n.id;
 delete from postispop_private.note_trash where id=t.id;
 update public.boards set revision=coalesce(revision,0)+1 where id=b;
 return jsonb_build_object('board_id',b);
end $$;

create or replace function postispop_private.archived_board_note_trash(p_board uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform postispop_private.board_access(p_board);
 return jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'text',coalesce(t.snapshot->>'text',''),'doodle',t.snapshot->'doodle','image',case when t.snapshot->>'image_url' is null then null else jsonb_build_object('url',t.snapshot->>'image_url')end,'expires',(extract(epoch from t.expires_at)*1000)::bigint)order by t.expires_at desc)from postispop_private.note_trash t where t.board_id=p_board and t.expires_at>now()),'[]'::jsonb));
end $$;
create or replace function public.postispop_remove_board_note(p_note uuid,p_revision integer)returns jsonb language sql security invoker set search_path='' as $$select postispop_private.archive_board_note(p_note,p_revision)$$;
create or replace function public.postispop_restore_board_note(p_trash uuid)returns jsonb language sql security invoker set search_path='' as $$select postispop_private.restore_archived_board_note(p_trash)$$;
create or replace function public.postispop_board_note_trash(p_board uuid)returns jsonb language sql security invoker set search_path='' as $$select postispop_private.archived_board_note_trash(p_board)$$;
revoke all on function postispop_private.archive_board_note(uuid,integer),postispop_private.restore_archived_board_note(uuid),postispop_private.archived_board_note_trash(uuid)from public,anon;
grant execute on function postispop_private.archive_board_note(uuid,integer),postispop_private.restore_archived_board_note(uuid),postispop_private.archived_board_note_trash(uuid)to authenticated;
revoke all on function public.postispop_remove_board_note(uuid,integer),public.postispop_restore_board_note(uuid),public.postispop_board_note_trash(uuid)from public,anon;
grant execute on function public.postispop_remove_board_note(uuid,integer),public.postispop_restore_board_note(uuid),public.postispop_board_note_trash(uuid)to authenticated;
-- Archived notes are unavailable through existing shared links until restored.
create or replace function public.postispop_read_protected_share(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare envelope jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'LINK_UNAVAILABLE' using errcode='P0002'; end if;
 select n.protected_envelope into envelope from public.postispop_protected_shares s join public.notes n on n.id=s.note_id join public.boards b on b.id=n.board_id
 where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and s.revoked_at is null and s.expires_at>now() and b.owner_id=s.owner_id and n.position>=0;
 if envelope is null then raise exception 'LINK_UNAVAILABLE' using errcode='P0002'; end if;
 return jsonb_build_object('envelope',envelope);
end $$;

commit;
