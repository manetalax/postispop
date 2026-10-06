-- Staging candidate. Apply after designs.sql and protected-notes.sql.
-- Note tools belong to the core editor; this grants no Premium entitlement.
begin;
create or replace function public.postispop_can_paper(paper_id text) returns boolean
language sql stable security definer set search_path='' as $$
select auth.uid() is not null and paper_id in('plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'); $$;
revoke all on function public.postispop_can_paper(text) from public,anon;
grant execute on function public.postispop_can_paper(text) to authenticated;

create or replace function public.postispop_valid_drawing(value jsonb) returns boolean
language plpgsql stable security invoker set search_path='' as $$
declare strokes jsonb; stroke jsonb; point jsonb; total_points integer:=0; instrument text;
begin
 if octet_length(value::text)>150000 then return false; end if;
 if jsonb_typeof(value)='array' then strokes:=value;
 elsif jsonb_typeof(value)='object' and value->>'version'='1' then
  if coalesce(value->>'selectedInstrument','') not in('graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor','blood') then return false; end if;
  strokes:=value->'strokes';
 else return false; end if;
 if strokes is null or jsonb_typeof(strokes)<>'array' or jsonb_array_length(strokes)>120 then return false; end if;
 for stroke in select * from jsonb_array_elements(strokes) loop
  instrument:=stroke->>'instrument';
  if instrument is null or instrument not in('graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor','blood') then return false; end if;
  if coalesce(stroke->>'color','') !~ '^#[0-9a-fA-F]{6}$' then return false; end if;
  if jsonb_typeof(stroke->'width') is distinct from 'number' or not ((stroke->>'width')::numeric between 0.5 and 28) then return false; end if;
  if jsonb_typeof(stroke->'points') is distinct from 'array' then return false; end if;
  if jsonb_array_length(stroke->'points')=0 then return false; end if;
  total_points:=total_points+jsonb_array_length(stroke->'points'); if total_points>16000 then return false; end if;
  for point in select * from jsonb_array_elements(stroke->'points') loop
   if jsonb_typeof(point->'x') is distinct from 'number' or jsonb_typeof(point->'y') is distinct from 'number' or jsonb_typeof(point->'p') is distinct from 'number' then return false; end if;
   if not ((point->>'x')::numeric between 0 and 1 and (point->>'y')::numeric between 0 and 1 and (point->>'p')::numeric between 0 and 1) then return false; end if;
  end loop;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function public.postispop_valid_drawing(jsonb) from public,anon;
grant execute on function public.postispop_valid_drawing(jsonb) to authenticated;
alter table public.postispop_note_style enable row level security;
drop policy if exists styles_read on public.postispop_note_style;
create policy styles_read on public.postispop_note_style for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())));
-- Invoker/RLS deliberately uses existing note access, not a service-role bypass.
drop policy if exists styles_insert on public.postispop_note_style;
create policy styles_insert on public.postispop_note_style for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())) and
 public.postispop_valid_drawing(drawing) and
 public.postispop_can_paper(paper));
drop policy if exists styles_update on public.postispop_note_style;
create policy styles_update on public.postispop_note_style for update to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid()))) with check(user_id=(select auth.uid()) and exists(select 1 from public.notes n join public.boards b on b.id=n.board_id where n.id=note_id and n.protected_envelope is null and (n.author_id=auth.uid() or b.owner_id=auth.uid())) and
 public.postispop_valid_drawing(drawing) and
 public.postispop_can_paper(paper));

commit;
