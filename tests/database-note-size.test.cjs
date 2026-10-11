const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Database note budget rejects oversized writes and preserves reducible legacy notes',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');const db=new PGlite();
 try{
 await db.exec("create role anon;create role authenticated;create schema postispop_private;create schema storage;create table notes(id int,text text);create table storage.buckets(id text,file_size_limit bigint);insert into storage.buckets values('postispop-note-shares',52428828);insert into notes values(2,repeat('x',10010000));");
 await db.exec(fs.readFileSync('supabase/migrations/20261011080000_note_size_budget.sql','utf8'));
 await db.exec("insert into notes values(1,'ok')");
 await assert.rejects(()=>db.exec("update notes set text=repeat('x',10000001) where id=1"),/NOTE_TOO_LARGE/);
 assert.equal((await db.query('select text from notes where id=1')).rows[0].text,'ok');
 await db.exec("update notes set text=repeat('x',10001000) where id=2");
 await assert.rejects(()=>db.exec("update notes set text=repeat('x',10020000) where id=2"),/NOTE_TOO_LARGE/);
 assert.equal((await db.query('select file_size_limit from storage.buckets')).rows[0].file_size_limit,14000028);
 }finally{await db.close();}
});
test('Strict policy deletes old oversized cloud notes and checks drawings with note data',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');const db=new PGlite();
 try{
 await db.exec("create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$select '00000000-0000-0000-0000-000000000001'::uuid$$;create schema postispop_private;create schema storage;create table storage.buckets(id text,file_size_limit bigint);create table boards(id uuid primary key,owner_id uuid,revision int default 1);create table notes(id uuid primary key,board_id uuid references boards(id),text text);create table postispop_note_style(note_id uuid primary key references notes(id) on delete cascade,drawing text);insert into boards(id,owner_id) values('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001');insert into notes values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',repeat('x',10000001));");
 await db.exec(fs.readFileSync('supabase/migrations/20261011080000_note_size_budget.sql','utf8'));
 await db.exec(fs.readFileSync('supabase/migrations/20261011090000_strict_note_size.sql','utf8'));
 assert.equal((await db.query('select count(*)::int as n from notes')).rows[0].n,0);
 await db.exec("insert into notes values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',repeat('x',9900000))");
 await assert.rejects(()=>db.exec("insert into postispop_note_style values('20000000-0000-0000-0000-000000000001',repeat('x',110000))"),/NOTE_TOO_LARGE/);
 await assert.rejects(()=>db.exec("select postispop_purge_oversized_note('20000000-0000-0000-0000-000000000001',0)"),/NOTE_WITHIN_BUDGET/);
 await db.exec("select postispop_purge_oversized_note('20000000-0000-0000-0000-000000000001',10000001)");assert.equal((await db.query('select count(*)::int as n from notes')).rows[0].n,0);
 }finally{await db.close();}
});
