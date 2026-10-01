import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
after(()=>db.close());
const owner='11111111-1111-4111-8111-111111111111',editor='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
await db.exec(`
create role anon;create role authenticated;
create schema auth;grant usage on schema auth,public to authenticated,anon;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table public.boards(id uuid primary key default gen_random_uuid(),owner_id uuid references auth.users(id),title text,revision int default 1,created_at timestamptz default now(),updated_at timestamptz default now(),expires_at timestamptz);
create table public.board_members(board_id uuid references boards(id),user_id uuid references auth.users(id),role text check(role in ('owner','admin','member')),primary key(board_id,user_id));
create table public.notes(id uuid primary key default gen_random_uuid(),board_id uuid references boards(id),author_id uuid references auth.users(id),position int,text text default '',image_url text,doodle jsonb,paper int default 0 check(paper between 0 and 5),marks jsonb default '[]',revision int default 1,editing uuid,locked_until timestamptz,created_ms bigint,updated_ms bigint,created_at timestamptz default now(),updated_at timestamptz default now());
grant select,insert,update,delete on boards,notes,board_members to authenticated;
alter table boards enable row level security;alter table notes enable row level security;alter table board_members enable row level security;
create policy ownmembership on board_members for select to authenticated using(user_id=auth.uid());
create policy readboards on boards for select to authenticated using(owner_id=auth.uid() or exists(select 1 from board_members m where m.board_id=boards.id and m.user_id=auth.uid()));
create policy createboards on boards for insert to authenticated with check(owner_id=auth.uid());
create policy updateboards on boards for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy notesaccess on notes for all to authenticated using(exists(select 1 from boards b where b.id=board_id)) with check(exists(select 1 from boards b where b.id=board_id));
insert into auth.users values('${owner}','owner@example.invalid',now()),('${editor}','editor@example.invalid',now()),('${other}','other@example.invalid',now());
`);
await db.exec(await readFile('database/roadmap.sql','utf8'));
async function who(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+(id?'authenticated':'anon'));}
async function one(sql,args=[]){return Object.values((await db.query(sql,args)).rows[0])[0];}
let board,note,viewer,editToken;
test('Atomic cloud creation validates notes and enforces ownership',async()=>{
 await who(owner);assert.equal(await one('select pp_valid_note($1::jsonb)',[{text:'😀',marks:[{start:0,end:2,ink:'blue'}]}]),true);board=await one('select pp_create_board($1,$2::jsonb)',['Plan',[{text:'Primera nota',paper:5,marks:[]}]]);note=await one('select id from notes where board_id=$1 order by position limit 1',[board]);
 assert.equal(await one('select count(*)::int from notes where board_id=$1',[board]),12);
 await assert.rejects(one('select pp_create_board($1,$2::jsonb)',['Bad',[{paper:0}]]),/INVALID_NOTE/);
 assert.equal(await one('select count(*)::int from boards'),1);
 await who(other);assert.equal(await one('select count(*)::int from notes'),0);await assert.rejects(one('select pp_manage_share($1,$2)',[board,'create']),/OWNER_REQUIRED/);
});
test('Viewer token reads limited fields but never grants editing or REST access',async()=>{
 await who(owner);viewer=(await one('select pp_manage_share($1,$2)',[board,'create'])).token;
 await who(null);const result=await one('select pp_read_share($1)',[viewer]);assert.equal(result.editable,false);assert.equal(result.notes[0].text,'Primera nota');assert.ok(!JSON.stringify(result).includes(owner));
 await assert.rejects(one('select pp_edit_shared_note($1,$2,$3,$4)',[viewer,note,'hack',1]),/permission denied/);
 await who(other);await assert.rejects(one('select pp_edit_shared_note($1,$2,$3,$4)',[viewer,note,'hack',1]),/NOT_FOUND/);assert.equal(await one('select count(*)::int from notes'),0);
});
test('Editor links need login, correct invitation account and current revision',async()=>{
 await who(owner);editToken=(await one('select pp_manage_share($1,$2,null,$3,$4,7)',[board,'create','editor','editor@example.invalid'])).token;
 await who(null);await assert.rejects(one('select pp_read_share($1)',[editToken]),/INVITATION_ACCOUNT_REQUIRED/);
 await who(other);await assert.rejects(one('select pp_edit_shared_note($1,$2,$3,$4)',[editToken,note,'hack',1]),/INVITATION_ACCOUNT_REQUIRED/);
 await who(editor);assert.equal((await one('select pp_read_share($1)',[editToken])).editable,true);
 assert.equal((await one('select pp_edit_shared_note($1,$2,$3,$4)',[editToken,note,'Colaboración real',1])).revision,2);
 await assert.rejects(one('select pp_edit_shared_note($1,$2,$3,$4)',[editToken,note,'stale',1]),/CONFLICT/);
});
test('Revoked and expired links immediately lose access',async()=>{
 await who(owner);await one('select pp_manage_share($1,$2,$3)',[board,'revoke',viewer]);
 await who(null);await assert.rejects(one('select pp_read_share($1)',[viewer]),/NOT_FOUND/);
 await db.exec('reset role');await db.query("update postispop_private.board_links set expires_at=now()-interval '1 second' where id=$1",[editToken]);
 await who(editor);await assert.rejects(one('select pp_read_share($1)',[editToken]),/NOT_FOUND/);
});
test('Templates do not overwrite notes; trash restores; swaps are atomic',async()=>{
 await who(owner);await one('select pp_import_notes($1,$2::jsonb)',[board,[{text:'Plantilla',paper:2}]]);assert.equal(await one('select text from notes where id=$1',[note]),'Colaboración real');
 await assert.rejects(one('select pp_import_notes($1,$2::jsonb)',[board,[{text:'would insert'},{text:45}]]),/INVALID_NOTE/);
 assert.equal(await one("select count(*)::int from notes where text='would insert'"),0);
 const trash=await one('select pp_trash_note($1)',[note]);assert.equal(await one('select text from notes where id=$1',[note]),'');await one('select pp_restore_note($1)',[trash]);assert.equal(await one('select text from notes where id=$1',[note]),'Colaboración real');
 const second=await one('select id from notes where board_id=$1 and position=1',[board]);await one('select pp_swap_notes($1,$2,$3)',[board,note,second]);assert.equal(await one('select position from notes where id=$1',[note]),1);
 await who(other);await assert.rejects(one('select pp_import_notes($1,$2::jsonb)',[board,[{text:'hack'}]]),/NOT_FOUND/);
});
test('Import and trash restoration preserve organized notes with empty text',async()=>{
 await who(owner);
 const organized=[{tags:['pendiente']},{pinned:true},{archived:true},{custom:'conservar'}];
 const id=await one('select pp_create_board($1,$2::jsonb)',['Organización',organized.map(metadata=>({text:'',metadata}))]);
 await one('select pp_import_notes($1,$2::jsonb)',[id,[{text:'Nota importada'}]]);
 const imported=await one("select id from notes where board_id=$1 and text='Nota importada'",[id]);
 assert.equal(await one('select position from notes where id=$1',[imported]),4);
 const trash=await one('select pp_trash_note($1)',[imported]);
 await one('select pp_restore_note($1)',[trash]);
 assert.equal(await one('select text from notes where id=$1',[imported]),'Nota importada');
 const retained=(await db.query('select text,metadata from notes where board_id=$1 and position<4 order by position',[id])).rows;
 assert.deepEqual(retained,organized.map(metadata=>({text:'',metadata})));
});
