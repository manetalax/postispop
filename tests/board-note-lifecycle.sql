-- Isolated synthetic account. Every fixture and mutation is rolled back.
begin;
do $$
declare actor uuid:=gen_random_uuid();b uuid;n uuid;
begin
 insert into auth.users(id,email,created_at,updated_at,aud,role,raw_user_meta_data)values(actor,'postispop-lifecycle-test@example.invalid',now(),now(),'authenticated','authenticated','{}');
 select id into b from public.boards where owner_id=actor;
 insert into public.board_trials(user_id,expires_at)values(actor,now()+interval '1 day')on conflict(user_id)do update set expires_at=excluded.expires_at;
 perform set_config('request.jwt.claim.sub',actor::text,true);perform set_config('pp.test_actor',actor::text,true);perform set_config('pp.test_board',b::text,true);
 for i in 13..25 loop perform public.postispop_add_board_note(b);end loop;
 select id into n from public.notes where board_id=b and position=24;
 update public.notes set text='Nota protegida',protected_envelope='{"v":1,"alg":"AES-256-GCM","kdf":"PBKDF2-SHA-256","iterations":600000,"salt":"AAAAAAAAAAAAAAAAAAAAAA","iv":"AAAAAAAAAAAAAAAA","id":"AAAAAAAAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA"}',paper=5 where id=n;
 perform set_config('pp.test_note',n::text,true);
end $$;
set local role authenticated;
do $$
declare b uuid:=current_setting('pp.test_board')::uuid;n uuid:=current_setting('pp.test_note')::uuid;t uuid;fresh uuid;result jsonb;denied boolean;token text;
begin
 if (select count(*)from public.notes where board_id=b)<>25 then raise exception 'initial count';end if;
 token:=public.postispop_create_protected_share(n,7)->>'token';
 result:=public.postispop_remove_board_note(n,1);t:=(result->>'trashId')::uuid;
 if(select count(*)from public.notes where board_id=b)<>24 or exists(select 1 from public.notes where id=n)then raise exception 'archived note still visible';end if;
 denied:=false;begin perform public.postispop_read_protected_share(token);exception when sqlstate 'P0002'then denied:=true;end;
 if not denied then raise exception 'archived share remains available';end if;
 if jsonb_array_length(public.postispop_board_note_trash(b)->'items')<>1 then raise exception 'trash missing';end if;
 fresh:=(public.postispop_add_board_note(b)->>'id')::uuid;
 if fresh=n then raise exception 'identity reused';end if;
 update public.notes set text='Nueva nota intacta'where id=fresh;
 perform public.postispop_restore_board_note(t);
 if public.postispop_read_protected_share(token)->'envelope'->>'ciphertext'<>'AAAAAAAAAAAAAAAAAAAAAA'then raise exception 'restored share unavailable';end if;
 if (select count(*)from public.notes where board_id=b)<>26 then raise exception 'restore count';end if;
 if not exists(select 1 from public.notes where id=n and paper=5 and protected_envelope->>'ciphertext'='AAAAAAAAAAAAAAAAAAAAAA' and text='Nota protegida')then raise exception 'protected contents lost';end if;
 if not exists(select 1 from public.notes where id=fresh and text='Nueva nota intacta')then raise exception 'fresh note overwritten';end if;
 if (postispop_private.board_access(b)->>'note_count')::integer<>26 then raise exception 'access count includes trash';end if;
 denied:=false;begin perform public.postispop_remove_board_note(n,0);exception when sqlstate '40001'then denied:=true;end;
 if not denied then raise exception 'stale delete accepted';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;begin perform public.postispop_board_note_trash(b);exception when others then if sqlerrm='BOARD_ACCESS_DENIED'then denied:=true;else raise;end if;end;
 if not denied then raise exception 'outsider read trash';end if;
 denied:=false;begin perform public.postispop_remove_board_note(n,3);exception when others then if sqlerrm='BOARD_ACCESS_DENIED'then denied:=true;else raise;end if;end;
 if not denied then raise exception 'outsider removed a note';end if;
 perform set_config('request.jwt.claim.sub',current_setting('pp.test_actor'),true);
 if has_function_privilege('anon','public.postispop_remove_board_note(uuid,integer)','EXECUTE')or has_function_privilege('anon','public.postispop_restore_board_note(uuid)','EXECUTE')or has_function_privilege('anon','public.postispop_board_note_trash(uuid)','EXECUTE')then raise exception 'anonymous RPC enabled';end if;
end $$;
reset role;
update public.board_trials set expires_at=now()-interval '1 day'where user_id=current_setting('pp.test_actor')::uuid;
set local role authenticated;
do $$
declare b uuid:=current_setting('pp.test_board')::uuid;denied boolean:=false;
begin
 begin perform public.postispop_add_board_note(b);exception when sqlstate '42501'then denied:=true;end;
 if not denied then raise exception 'account limit bypassed';end if;
 if(select count(*)from public.notes where board_id=b)<>12 then raise exception 'expired account policy changed';end if;
end $$;
reset role;
rollback;
select 'PASS: add/remove/restore preserve encrypted content and identity, hide archives through RLS, reject stale/foreign/anonymous calls and keep account limits; all fixtures rolled back' as result;
