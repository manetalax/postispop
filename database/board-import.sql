-- Migration candidate: requires the real base schema plus commerce.sql,
-- designs.sql and protected-notes.sql. Verify staging and backup before applying.
-- Reuses existing slots only; it never grows, replaces or deletes a board.
begin;
create schema if not exists postispop_private;
revoke all on schema postispop_private from public,anon;
-- Preserve existing authenticated schema USAGE required by legacy note policies.

create table if not exists postispop_private.board_import_requests (
 user_id uuid not null references auth.users(id) on delete cascade,
 board_id uuid not null references public.boards(id) on delete cascade,
 request_id uuid not null,
 payload_hash text not null,
 result jsonb not null,
 created_at timestamptz not null default now(),
 primary key(user_id,board_id,request_id)
);
revoke all on postispop_private.board_import_requests from public,anon,authenticated;

create or replace function public.postispop_import_board(p_board_id uuid,p_request_id uuid,p_notes jsonb,p_excluded_note_ids uuid[] default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid(); board_owner uuid; payload_hash text; previous postispop_private.board_import_requests;
 item jsonb; mark jsonb; style jsonb; drawing jsonb; normalized jsonb:='[]'; candidate jsonb;
 txt text; text_units integer; doodle_value text; image_value text; envelope jsonb;
 paper_value integer; limit_notes integer; occupied integer; wanted integer; prior_style_revision integer; i integer:=0;
 slots uuid[]:='{}'; imported_ids uuid[]:='{}'; target uuid; result jsonb;
begin
 if actor is null then raise exception 'SESSION_REQUIRED' using errcode='28000'; end if;
 if p_board_id is null or p_request_id is null or p_notes is null or jsonb_typeof(p_notes)<>'array' then
  raise exception 'INVALID_BACKUP' using errcode='22023';
 end if;
 if jsonb_array_length(p_notes)>100 or octet_length(p_notes::text)>25165824 or p_excluded_note_ids is null or cardinality(p_excluded_note_ids)>1000
  or array_position(p_excluded_note_ids,null) is not null then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
 -- The board lock serializes import requests, including an uncertain retry.
 select owner_id into board_owner from public.boards where id=p_board_id for update;
 if board_owner is distinct from actor then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 payload_hash:=encode(sha256(convert_to(p_notes::text,'UTF8')),'hex');
 select * into previous from postispop_private.board_import_requests r
 where r.user_id=actor and r.board_id=p_board_id and r.request_id=p_request_id;
 if found then
  if previous.payload_hash<>payload_hash then raise exception 'IDEMPOTENCY_CONFLICT' using errcode='22023'; end if;
  return previous.result||jsonb_build_object('replayed',true);
 end if;
 -- Strict validation precedes every write. Never take user IDs or entitlement
 -- claims from a backup. UTF-16 length matches browser selection offsets.
 for item in select value from jsonb_array_elements(p_notes) loop
  if jsonb_typeof(item) is distinct from 'object' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  if exists(select 1 from jsonb_object_keys(item) k where k not in('text','marks','paper','doodle','image','style','protectedEnvelope')) then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  if item ? 'paper' and (jsonb_typeof(item->'paper') is distinct from 'number' or (item->>'paper') !~ '^[0-5]$') then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  paper_value:=coalesce((item->>'paper')::integer,0);
  envelope:=nullif(item->'protectedEnvelope','null'::jsonb);
  if envelope is not null then
   if not public.postispop_envelope_valid(envelope) then raise exception 'INVALID_ENVELOPE' using errcode='22023'; end if;
   if coalesce(item->>'text','') not in('','Nota protegida') or coalesce(item->'marks','[]')<>'[]' or coalesce(item->>'doodle','')<>''
    or nullif(item->'image','null') is not null or nullif(item->'style','null') is not null then raise exception 'PROTECTED_NOTE_REQUIRES_ENCRYPTION' using errcode='22023'; end if;
   normalized:=normalized||jsonb_build_array(jsonb_build_object('text','Nota protegida','marks','[]'::jsonb,'paper',paper_value,'doodle','','image',null,'style',null,'protectedEnvelope',envelope));
   continue;
  end if;
  if jsonb_typeof(item->'text') is distinct from 'string' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  txt:=item->>'text';
  text_units:=char_length(txt)+char_length(regexp_replace(txt,'[^'||chr(65536)||'-'||chr(1114111)||']','','g'));
  if text_units>10000 then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  if item ? 'doodle' and jsonb_typeof(item->'doodle') is distinct from 'string' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  doodle_value:=coalesce(item->>'doodle','');
  if doodle_value not in('','heart','idea','smile','cart','star','check','ticket') then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  if jsonb_typeof(coalesce(item->'marks','[]'))<>'array' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  if jsonb_array_length(coalesce(item->'marks','[]'))>10000 then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  for mark in select value from jsonb_array_elements(coalesce(item->'marks','[]')) loop
   if jsonb_typeof(mark) is distinct from 'object' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
   if (select count(*) from jsonb_object_keys(mark))<>3 or jsonb_typeof(mark->'start') is distinct from 'number' or jsonb_typeof(mark->'end') is distinct from 'number'
    or coalesce(mark->>'start','') !~ '^[0-9]{1,5}$' or coalesce(mark->>'end','') !~ '^[0-9]{1,5}$'
    or jsonb_typeof(mark->'ink') is distinct from 'string' or coalesce(mark->>'ink','') !~ '^[a-z-]{1,30}$' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
   if (mark->>'start')::integer>(mark->>'end')::integer or (mark->>'end')::integer>text_units then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  end loop;
  image_value:=null;
  if nullif(item->'image','null') is not null then
   if jsonb_typeof(item->'image')<>'object' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
   if (select count(*) from jsonb_object_keys(item->'image'))<>1 or jsonb_typeof(item->'image'->'url') is distinct from 'string' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
   image_value:=item->'image'->>'url';
   if length(image_value)>2048 or image_value !~ '^https?://[^/[:space:]]+[^[:space:]]*$' then raise exception 'INVALID_BACKUP' using errcode='22023'; end if;
  end if;
  style:=nullif(item->'style','null'); drawing:='[]';
  if style is not null then
   if jsonb_typeof(style)<>'object' then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   if exists(select 1 from jsonb_object_keys(style) k where k not in('font','size','italic','underline','ink','paper','drawing')) then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   style:=jsonb_build_object('font','sans','size',20,'italic',false,'underline',false,'ink','#163b62','paper','plain','drawing','[]'::jsonb)||style;
   if jsonb_typeof(style->'font') is distinct from 'string' or style->>'font' not in('sans','serif','mono','hand','rounded','book')
    or jsonb_typeof(style->'size') is distinct from 'number' or (style->>'size') !~ '^[0-9]{2}$'
    or jsonb_typeof(style->'italic') is distinct from 'boolean' or jsonb_typeof(style->'underline') is distinct from 'boolean'
    or jsonb_typeof(style->'ink') is distinct from 'string' or (style->>'ink') !~ '^#[0-9a-fA-F]{6}$'
    or jsonb_typeof(style->'paper') is distinct from 'string' or style->>'paper' not in('plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study') then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   if (style->>'size')::integer not between 12 and 36 then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   if not public.postispop_can_paper(style->>'paper') then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   drawing:=style->'drawing';
   if drawing is null or not coalesce(public.postispop_valid_drawing(drawing),false) then raise exception 'INVALID_STYLE' using errcode='22023'; end if;
   style:=jsonb_set(style,'{ink}',to_jsonb(lower(style->>'ink')));
  end if;
  candidate:=jsonb_build_object('text',txt,'marks',coalesce(item->'marks','[]'),'paper',paper_value,'doodle',doodle_value,'image',image_value,'style',style,'protectedEnvelope',null);
  if txt<>'' or candidate->'marks'<>'[]' or doodle_value<>'' or image_value is not null or (drawing<>'[]' and drawing->'strokes' is distinct from '[]'::jsonb) then
   normalized:=normalized||jsonb_build_array(candidate);
  end if;
 end loop;
 wanted:=jsonb_array_length(normalized);
 limit_notes:=case when public.postispop_has_license('premium') then 100 else 6 end;
 -- Lock every existing note in deterministic order. Legacy note writes and
 -- postispop_save_note_style/protect_note use these same row locks.
 perform 1 from public.notes where board_id=p_board_id order by id for update;
 select count(*) into occupied from public.notes n where n.board_id=p_board_id and n.position>=0 and (
  coalesce(n.text,'')<>'' or coalesce(n.marks,'[]')<>'[]' or coalesce(n.doodle,'null'::jsonb) not in ('null'::jsonb,'""'::jsonb) or n.image_url is not null or n.protected_envelope is not null
  or exists(select 1 from public.postispop_note_style s where s.note_id=n.id and s.drawing<>'[]' and s.drawing->'strokes' is distinct from '[]'::jsonb));
 select coalesce(array_agg(n.id order by n.position,n.id),'{}') into slots from public.notes n where n.board_id=p_board_id and n.position>=0
  and postispop_private.can_access_note(p_board_id,n.position)
  and coalesce(n.text,'')='' and coalesce(n.marks,'[]')='[]' and coalesce(n.doodle,'null'::jsonb) in ('null'::jsonb,'""'::jsonb) and n.image_url is null and n.protected_envelope is null
  and (n.locked_until is null or n.locked_until<=now()) and not(n.id=any(p_excluded_note_ids))
  and not exists(select 1 from public.postispop_note_style s where s.note_id=n.id and s.drawing<>'[]' and s.drawing->'strokes' is distinct from '[]'::jsonb);
 if wanted>0 and (occupied+wanted>limit_notes or wanted>cardinality(slots)) then raise exception 'BOARD_FULL' using errcode='54000'; end if;
 for item in select value from jsonb_array_elements(normalized) loop
  i:=i+1; target:=slots[i]; style:=nullif(item->'style','null');
  select coalesce(max(revision),0) into prior_style_revision from public.postispop_note_style where note_id=target;
  -- Remove only formatting of a confirmed empty slot; never a drawing.
  delete from public.postispop_note_style where note_id=target;
  update public.notes set text=item->>'text',marks=item->'marks',paper=(item->>'paper')::integer,doodle=nullif(item->'doodle','""'::jsonb),image_url=item->>'image',
   protected_envelope=nullif(item->'protectedEnvelope','null'),author_id=actor,revision=coalesce(revision,0)+1,
   updated_ms=(extract(epoch from clock_timestamp())*1000)::bigint,locked_until=null,editing=null where id=target;
  if style is not null then
   insert into public.postispop_note_style(user_id,note_id,font,size,italic,underline,ink,paper,drawing,revision)
   values(actor,target,style->>'font',(style->>'size')::integer,(style->>'italic')::boolean,(style->>'underline')::boolean,style->>'ink',style->>'paper',style->'drawing',prior_style_revision+1);
  end if;
  imported_ids:=array_append(imported_ids,target);
 end loop;
 if wanted>0 then update public.boards set revision=coalesce(revision,0)+1 where id=p_board_id; end if;
 result:=jsonb_build_object('ok',true,'requestId',p_request_id,'imported',wanted,'noteIds',to_jsonb(imported_ids),'replayed',false);
 insert into postispop_private.board_import_requests(user_id,board_id,request_id,payload_hash,result) values(actor,p_board_id,p_request_id,payload_hash,result);
 return result;
end $$;
revoke all on function public.postispop_import_board(uuid,uuid,jsonb,uuid[]) from public,anon;
grant execute on function public.postispop_import_board(uuid,uuid,jsonb,uuid[]) to authenticated;
commit;
