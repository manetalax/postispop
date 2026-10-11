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
