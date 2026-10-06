const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const USER='11111111-1111-4111-8111-111111111111',BOARD='22222222-2222-4222-8222-222222222222',NOTE='33333333-3333-4333-8333-333333333333';
const SESSION='postispop-supabase-session';
const disk=()=>{const m=new Map();return{get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),map:m};};
const backup=()=>({format:'postispop',version:1,notes:[{text:'Una idea',paper:1,marks:[]}]});
test('Backup validates every entry and preserves styles, images and envelopes without importing identity',async()=>{
  const {normalizeBackup}=await import('../backup-import.js'),{encryptNote}=await import('../note-crypto.js');
  const envelope=await encryptNote({text:'Secreto'},'clave de prueba');
  const result=normalizeBackup({notes:[{text:'Imagen',image:{url:'https://example.org/foto.png'},id:NOTE,author:'intruso',style:{font:'mono'}},{paper:4,protectedEnvelope:envelope,text:'Nunca copiar en claro'}]});
  assert.equal(result.notes[0].image.url,'https://example.org/foto.png');assert.equal(result.notes[0].style.font,'mono');assert.equal(result.notes[0].id,undefined);
  assert.deepEqual(Object.keys(result.notes[1]).sort(),['paper','protectedEnvelope']);
  assert.throws(()=>normalizeBackup({notes:[...backup().notes,{text:123}]}),/INVALID_BACKUP/);
  assert.throws(()=>normalizeBackup({notes:[{text:'a',image:{url:'javascript:alert(1)'}}]}),/INVALID_BACKUP/);
  assert.throws(()=>normalizeBackup(backup(),{maxBytes:4}),/BACKUP_TOO_LARGE/);
  assert.throws(()=>normalizeBackup({notes:[{text:'a',marks:[{start:0,end:2,ink:'black'}]}]}),/INVALID_BACKUP/);
});
test('A retry ticket persists across reload, stores no contents and isolates account and board',async()=>{
  const {importTicket}=await import('../backup-import.js'),store=disk(),notes=backup().notes;
  const a=await importTicket(store,USER,BOARD,notes),retry=await importTicket(store,USER,BOARD,notes);
  assert.equal(a.requestId,retry.requestId);assert.ok(!JSON.stringify([...store.map]).includes('Una idea'));
  assert.notEqual((await importTicket(store,'other',BOARD,notes)).requestId,a.requestId);
  assert.notEqual((await importTicket(store,USER,'other',notes)).requestId,a.requestId);
  a.finish();assert.notEqual((await importTicket(store,USER,BOARD,notes,Date.now()+1)).requestId,a.requestId);
  await assert.rejects(importTicket({getItem:()=>null,setItem:()=>{throw Error('quota');}},USER,BOARD,notes),/IMPORT_STORAGE_UNAVAILABLE/);
});
test('Concurrent imports reuse a ticket even when its first response has already completed',async()=>{
  const {importTicket}=await import('../backup-import.js'),store=disk(),startedAt=Date.now()-1;
  const a=await importTicket(store,USER,BOARD,backup().notes,startedAt);a.finish();
  const concurrent=await importTicket(store,USER,BOARD,backup().notes,startedAt);
  assert.equal(concurrent.requestId,a.requestId);
  const deliberate=await importTicket(store,USER,BOARD,backup().notes,Date.now()+1);
  assert.notEqual(deliberate.requestId,a.requestId);concurrent.finish();
  assert.equal((await importTicket(store,USER,BOARD,backup().notes)).requestId,deliberate.requestId,'A late retry cannot finish the newer request');
});
test('Old empty-array drawing styles and image-only notes survive backup normalization',async()=>{
  const {normalizeBackup}=await import('../backup-import.js');
  const result=normalizeBackup({notes:[{text:'',image:{url:'https://example.org/photo.png'},style:{drawing:[]}},{text:' '}]});
  assert.equal(result.notes.length,2);assert.deepEqual(result.notes[0].style.drawing.strokes,[]);assert.equal(result.notes[1].text,' ');
});
async function setup({rpc,owner=USER,pending=0,slots,restoreAttachments}={}){
  const sync=await import('../offline-sync.js'),imports=await import('../backup-import.js'),storage=disk(),calls=[];
  storage.setItem(SESSION,JSON.stringify({access_token:'test',user:{id:USER},expires_at:Math.floor(Date.now()/1000)+3600}));
  const navigator={onLine:true},window={addEventListener:()=>{},dispatchEvent:()=>{},fetch:async(url,options={})=>{
    calls.push({url,options});
    if(url.includes('/auth/v1/user'))return Response.json({id:USER});
    if(url.includes('/rest/v1/boards'))return Response.json([{id:BOARD,owner_id:owner}]);
    if(url.includes('/rest/v1/notes'))return Response.json([{id:NOTE}]);
    if(url.includes('/rpc/postispop_import_board'))return rpc?rpc(JSON.parse(options.body)):Response.json({ok:true,imported:1,noteIds:[NOTE]});
    throw Error('Unexpected request '+url);
  }};
  const context=vm.createContext({window,navigator,localStorage:storage,location:{origin:'https://postispop.com',href:'https://postispop.com/'},Response,URL,URLSearchParams,AbortController,TypeError,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,console,
    guestRequest:()=>null,readGuest:()=>({}),...sync,...imports,withImportSlots:async(ids,work)=>slots?slots(ids,work,storage):work([NOTE]),restoreBackupAttachments:async(notes,noteIds,options)=>restoreAttachments?restoreAttachments(notes,noteIds,options,storage):imports.restoreBackupAttachments(notes,noteIds,options),
    createOfflineStore:s=>{const off=sync.createOfflineStore(s);return {...off,status:()=>({pending,conflicts:0})};},installOfflineUI:()=>{},getOfflineRights:async()=>null,saveOfflineReceipt:async()=>false});
  vm.runInContext(fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/gm,''),context);
  const request=async(data=backup())=>{const r=await window.fetch('/api/board/'+BOARD+'/import',{method:'POST',body:JSON.stringify(data)});return{status:r.status,data:await r.json()};};
  return{request,storage,calls,navigator};
}
test('Cloud import makes one transactional RPC and passes reserved slots without per-note writes',async()=>{
  let payload;const app=await setup({rpc:p=>{payload=p;return Response.json({ok:true,imported:1,noteIds:[NOTE]});}});
  assert.equal((await app.request()).status,200);assert.equal(payload.p_board_id,BOARD);assert.deepEqual(payload.p_excluded_note_ids,[NOTE]);assert.equal(payload.p_notes[0].text,'Una idea');
  assert.equal(app.calls.filter(c=>c.options.method==='POST').length,1);assert.ok(JSON.parse([...app.storage.map].find(([k])=>k.startsWith('pp:import-request:'))[1]).finishedAt);
});
test('Lost RPC response retries the same request ID, including after another invocation',async()=>{
  const ids=[];const app=await setup({rpc:p=>{ids.push(p.p_request_id);if(ids.length===1)throw new TypeError('Connection lost after commit');return Response.json({ok:true,replayed:true,imported:1,noteIds:[NOTE]});}});
  assert.equal((await app.request()).status,500);assert.equal((await app.request()).data.replayed,true);assert.equal(ids[0],ids[1]);
});
test('Wrong owner, pending sync, offline, malformed backup and missing migration never fall back to partial writes',async()=>{
  for(const [options,data,error] of [[{owner:'other'},backup(),'OWNER_REQUIRED'],[{pending:1},backup(),'SYNC_PENDING_BEFORE_IMPORT'],[{}, {notes:[{text:3}]},'INVALID_BACKUP']]){
    const app=await setup(options);assert.equal((await app.request(data)).data.error,error);assert.equal(app.calls.filter(c=>c.options.method==='POST').length,0);
  }
  const offline=await setup();offline.navigator.onLine=false;assert.ok((await offline.request()).status>=400);assert.equal(offline.calls.filter(c=>c.options.method==='POST').length,0);
  const missing=await setup({rpc:()=>Response.json({code:'PGRST202',message:'Could not find function'},{status:404})});assert.equal((await missing.request()).data.error,'IMPORT_UNAVAILABLE');
});
test('Account switch while acquiring local locks prevents the cloud mutation',async()=>{
  const app=await setup({slots:async(ids,work,storage)=>{storage.setItem(SESSION,JSON.stringify({access_token:'other',user:{id:'other'}}));return work([]);}});
  assert.equal((await app.request()).data.error,'SESSION_CHANGED');assert.equal(app.calls.filter(c=>c.options.method==='POST').length,0);
});

const attachmentBackup=()=>({format:'postispop',version:2,notes:[{text:'',attachments:[{kind:'link',name:'Documento',url:'https://example.org/doc',created:1}]}]});
test('Cloud backup keeps attachment data local and finishes only after it is restored',async()=>{
  let sent,restored=false;
  const app=await setup({rpc:payload=>{sent=payload;return Response.json({ok:true,noteIds:[NOTE]});},restoreAttachments:async(notes,ids,{validate},storage)=>{
    await validate();assert.equal(notes[0].attachments[0].url,'https://example.org/doc');assert.deepEqual(Array.from(ids),[NOTE]);
    assert.equal(JSON.parse([...storage.map].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
    restored=true;return {rollback:async()=>assert.fail('Successful restore must not rollback')};
  }});
  assert.equal((await app.request(attachmentBackup())).status,200);assert.equal(restored,true);
  assert.equal(sent.p_notes[0].text,'📎 Adjuntos');assert.equal(sent.p_notes[0].attachments,undefined);
  assert.ok(!JSON.stringify(sent).includes('https://example.org/doc'));
  assert.ok(JSON.parse([...app.storage.map].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt);
});
test('Cloud disk failure keeps the ticket pending and retries the same committed note mapping',async()=>{
  const ids=[];let restores=0;
  const app=await setup({rpc:payload=>{ids.push(payload.p_request_id);return Response.json({ok:true,replayed:ids.length>1,noteIds:[NOTE]});},restoreAttachments:async(notes,noteIds,{validate})=>{
    await validate();assert.deepEqual(Array.from(noteIds),[NOTE]);if(++restores===1)throw Error('ATTACHMENT_RESTORE_FAILED');return {rollback:async()=>{}};
  }});
  assert.equal((await app.request(attachmentBackup())).data.error,'ATTACHMENT_RESTORE_FAILED');
  assert.equal(JSON.parse([...app.storage.map].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
  assert.equal((await app.request(attachmentBackup())).data.replayed,true);assert.equal(ids[0],ids[1]);
});
test('Account change during attachment restore rolls back only local rows and leaves cloud retry pending',async()=>{
  let rolledBack=0;
  const app=await setup({restoreAttachments:async(notes,ids,{validate},storage)=>{await validate();storage.setItem(SESSION,JSON.stringify({access_token:'other',user:{id:'other'}}));return {rollback:async()=>rolledBack++};}});
  assert.equal((await app.request(attachmentBackup())).data.error,'SESSION_CHANGED');assert.equal(rolledBack,1);
  assert.equal(JSON.parse([...app.storage.map].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
  assert.equal(app.calls.filter(call=>call.options.method==='DELETE').length,0,'The already committed cloud notes must remain recoverable');
});
test('A server slot created after the lock snapshot requires a safe retry before local file writes',async()=>{
  let restored=false;
  const app=await setup({rpc:()=>Response.json({ok:true,noteIds:['44444444-4444-4444-8444-444444444444']}),restoreAttachments:async()=>{restored=true;return {rollback:async()=>{}};}});
  assert.equal((await app.request(attachmentBackup())).data.error,'IMPORT_RETRY_REQUIRED');assert.equal(restored,false);
  assert.equal(JSON.parse([...app.storage.map].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
});

test('A corrupted attachment digest is rejected before any cloud import mutation',async()=>{
  const data={version:2,notes:[{text:'No importar',attachments:[{kind:'file',name:'prueba.txt',type:'text/plain',size:1,data:'YQ',sha256:'0'.repeat(64),created:1}]}]};
  const app=await setup();assert.equal((await app.request(data)).data.error,'ATTACHMENT_INTEGRITY');
  assert.equal(app.calls.filter(call=>call.options.method==='POST').length,0);
  assert.equal([...app.storage.map.keys()].some(key=>key.startsWith('pp:import-request:')),false);
});
