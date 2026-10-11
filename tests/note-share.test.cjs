const {test}=require('node:test'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs/promises');
test('Full snapshot encryption preserves bytes, drawing and password protection; detects changes',async()=>{
 const {sealSharedNote,openSharedNote,parseShareLink}=await import('../note-share-package.js');
 const {encryptNote}=await import('../note-crypto.js');
 const bytes=Buffer.from('Video bytes including all metadata');const digest=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 const data={format:'postispop',version:2,notes:[{text:'Texto',paper:2,doodle:'heart',marks:[],attachments:[{kind:'file',name:'video.webm',type:'video/webm',size:bytes.length,sha256:digest,data:bytes.toString('base64url'),created:0}]}]};
 const sealed=await sealSharedNote(data);assert.equal(Buffer.from(await sealed.blob.arrayBuffer()).includes(Buffer.from('Texto')),false);
 assert.deepEqual(parseShareLink('#'+sealed.token+'.'+sealed.key),{token:sealed.token,key:sealed.key});
 const opened=await openSharedNote(sealed.blob,sealed.token,sealed.key);assert.equal(opened.notes[0].text,'Texto');assert.equal(opened.notes[0].attachments[0].data,data.notes[0].attachments[0].data);
 const raw=new Uint8Array(await sealed.blob.arrayBuffer());raw[15]^=1;await assert.rejects(openSharedNote(new Blob([raw]),sealed.token,sealed.key));
 await assert.rejects(openSharedNote(sealed.blob,sealed.token,'A'.repeat(43)));assert.throws(()=>parseShareLink('#bad'));
 const env=await encryptNote({text:'Secreto',attachments:[]},'abcd');const p=await sealSharedNote({format:'postispop',version:2,notes:[{paper:0,protectedEnvelope:env}]});const restored=await openSharedNote(p.blob,p.token,p.key);assert.deepEqual(restored.notes[0].protectedEnvelope,env);assert.equal(restored.notes[0].text,undefined);
 const corrupt=structuredClone(data);corrupt.notes[0].attachments[0].sha256='0'.repeat(64);const bad=await sealSharedNote(corrupt);await assert.rejects(openSharedNote(bad.blob,bad.token,bad.key));
});
test('Snapshot reservations are private, atomic, rate-limited and cannot overwrite',async()=>{
 const db=new PGlite();try{
 await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(bucket_id text);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select on storage.objects to anon,authenticated;create policy broad_legacy_read on storage.objects for select to anon,authenticated using(true);insert into storage.objects values('postispop-note-shares');");
 const sql=await fs.readFile('supabase/migrations/20261011034211_note_share_snapshots.sql','utf8');await db.exec(sql);await db.exec(sql);
 assert.equal((await db.query("select public from storage.buckets")).rows[0].public,false);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);assert.equal((await db.query('select count(*)::int as n from storage.objects')).rows[0].n,0);await assert.rejects(db.query('select * from public.postispop_note_shares'));await assert.rejects(db.query("select postispop_reserve_note_share($1,29,$2)",['A'.repeat(43),'a'.repeat(64)]));await db.exec('reset role');}
 await db.exec('set role service_role');
 for(let i=0;i<10;i++)await db.query('select postispop_reserve_note_share($1,100,$2)',['A'.repeat(42)+i,'a'.repeat(64)]);
 await assert.rejects(db.query('select postispop_reserve_note_share($1,100,$2)',['B'.repeat(43),'a'.repeat(64)]),/RATE_LIMITED/);
 assert.equal((await db.query('select count(*)::int as n from postispop_note_shares')).rows[0].n,10);
 await assert.rejects(db.query('select postispop_reserve_note_share($1,100,$2)',['A'.repeat(42)+'0','b'.repeat(64)]));
 const row=(await db.query('select ready,expires_at>now() as valid from postispop_note_shares limit 1')).rows[0];assert.equal(row.ready,false);assert.equal(row.valid,true);
 }finally{await db.close();}
});
test('Edge transport rejects expiry, wrong origin, huge bodies and unauthorized cleanup',async()=>{
 const {createNoteShareHandler,MAX_SHARE_BODY}=await import('../functions/shared/note-share-server.js');
 const token='A'.repeat(43),calls=[];let ready=false,expired=false;
 const handler=createNoteShareHandler({base:'https://example.supabase.co',key:'server-private-key',fetchImpl:async(url,options={})=>{calls.push({url,options});if(url.includes('rpc/'))return new Response('null');if(options.method==='PATCH'){ready=true;return new Response(null,{status:204});}if(url.includes('expires_at=lte'))return Response.json([]);if(url.includes('/rest/'))return Response.json(ready&&!expired?[{bytes:30}]:[]);return new Response(new Uint8Array(30));}});
 const base='https://example.supabase.co/functions/v1/postispop-note-share/';
 assert.equal((await handler(new Request(base+token))).status,404);
 const put=await handler(new Request(base+token,{method:'PUT',headers:{origin:'https://postispop.com','content-type':'application/octet-stream','x-forwarded-for':'1.2.3.4'},body:new Uint8Array(30)}));assert.equal(put.status,200);
 assert.equal((await handler(new Request(base+token))).status,200);expired=true;assert.equal((await handler(new Request(base+token))).status,404);
 assert.equal((await handler(new Request(base+'cleanup',{method:'POST'}))).status,403);
 assert.equal((await handler(new Request(base+token,{headers:{origin:'https://evil.example'}}))).status,403);
 assert.equal((await handler(new Request(base+token,{method:'PUT',headers:{'content-type':'application/octet-stream','content-length':String(MAX_SHARE_BODY+1)},body:new Uint8Array(1)}))).status,413);
 const reservation=JSON.parse(calls.find(c=>c.url.includes('rpc/')).options.body);assert.match(reservation.p_subject,/^[a-f0-9]{64}$/);assert.equal(reservation.p_subject.includes('1.2.3.4'),false);
});
test('Preview selection never reveals protected notes or hides videos, extra files or long text',async()=>{
 const {previewEligible}=await import('../note-share-preview.js');
 assert.equal(previewEligible({text:'Una nota breve'}),true);
 const image={kind:'file',type:'image/png',data:'',size:0};
 assert.equal(previewEligible({text:'Foto con texto',attachments:[image]}),true);
 assert.equal(previewEligible({text:'',attachments:[image]}),true);
 for(const note of [{text:''},{text:'x'.repeat(301)},{text:'Hola',protectedEnvelope:{}},{text:'Hola',attachments:[{kind:'file',type:'video/webm'}]},{text:'Hola',attachments:[image,image]},{text:'Hola',attachments:[{kind:'link'}]},{text:'Hola',style:{drawing:{strokes:[{}]}}}])assert.equal(previewEligible(note),false);
});
