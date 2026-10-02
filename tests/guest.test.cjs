const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const storage=new Map();let calls=0;
const context=vm.createContext({console,Response,Request,URL,URLSearchParams,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{origin:'https://postispop.com',href:'https://postispop.com/'},window:{fetch:async()=>{calls++;throw Error('Unexpected guest network request');}}});
const ready=Promise.all([import('../style-model.js'),import('../note-crypto.js'),import('../offline-sync.js'),import('../offline-license.js'),import('../backup-import.js')]).then(([style,cryptoModule,sync,licenses,imports])=>{
  Object.assign(context,{normalizeStyle:style.normalizeStyle,validateEnvelope:cryptoModule.validateEnvelope,...sync,...licenses,...imports,installOfflineUI:()=>{}});
  vm.runInContext(fs.readFileSync('guest-board.js','utf8').replace(/^import .*\n/gm,'').replaceAll('export function','function')+'\n'+fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/gm,''),context);
});
const request=async(path,data)=>{await ready;const r=await context.window.fetch('/api/'+path,data===undefined?{}:{method:'POST',body:JSON.stringify(data)});return{status:r.status,data:await r.json()};};
test('Guest restores image-only and whitespace notes without silently dropping content',async()=>{
  await ready;storage.clear();
  const r=await request('board/guest-board/import',{format:'postispop',version:1,notes:[{text:'',image:{url:'https://example.org/photo.png'},style:{drawing:[]}},{text:' '}]});
  assert.equal(r.status,200);assert.equal(r.data.notes[0].image.url,'https://example.org/photo.png');assert.equal(r.data.notes[1].text,' ');
  storage.clear();
});
test('Guest opens, edits and reloads a note without a session or network',async()=>{
  const opened=await request('note/guest-note-0/lock',{});assert.equal(opened.status,200);assert.equal(opened.data.lock,'guest-local');
  const saved=await request('note/guest-note-0',{text:'Prueba local',marks:[],revision:1});assert.equal(saved.status,200);
  const board=await request('board/guest-board');assert.equal(board.data.notes[0].text,'Prueba local');assert.equal(calls,0);
});
test('Stale guest edits are rejected without overwriting the saved note',async()=>{
  assert.equal((await request('note/guest-note-0',{text:'stale',marks:[],revision:1})).data.error,'CONFLICT');
  assert.equal((await request('board/guest-board')).data.notes[0].text,'Prueba local');
});
test('Trash can be restored and note order can be swapped',async()=>{
  const trashed=await request('note/guest-note-0/trash',{});assert.equal(trashed.data.board.notes[0].text,'');
  const restored=await request('restore/'+trashed.data.trashId,{});assert.equal(restored.data.notes[0].text,'Prueba local');
  const swapped=await request('board/guest-board/swap',{from:'guest-note-0',to:'guest-note-1'});assert.equal(swapped.data.order[0],'guest-note-1');
});
test('Guest sharing requests sign-in rather than pretending to succeed',async()=>{
  assert.equal((await request('note/guest-note-0/share',{})).data.error,'SESSION_REQUIRED');
});
test('All six colors survive save, reload, reorder, trash and restore',async()=>{
  storage.clear();
  let board=(await request('board/guest-board')).data;
  let note=board.notes.find(n=>n.id==='guest-note-1');
  const initialRevision=note.revision;
  let revision=note.revision;
  for(let paper=0;paper<6;paper++){
    const saved=await request(`note/${note.id}/paper`,{paper,revision});
    assert.equal(saved.status,200);
    revision=saved.data.note.revision;
    board=(await request('board/guest-board')).data;
    note=board.notes.find(n=>n.id==='guest-note-1');
    assert.equal(note.paper,paper);
  }
  assert.equal((await request(`note/${note.id}/paper`,{paper:2,revision:initialRevision})).status,409);
  for(const paper of [-1,6,1.5]) assert.equal((await request(`note/${note.id}/paper`,{paper,revision})).status,400);

  await request('board/guest-board/swap',{from:'guest-note-1',to:'guest-note-2'});
  board=(await request('board/guest-board')).data;
  assert.equal(board.notes.find(n=>n.id==='guest-note-1').paper,5);

  const trashed=await request(`note/${note.id}/trash`,{});
  assert.equal(trashed.data.board.trash[0].note.paper,5);
  const restored=await request(`restore/${trashed.data.trashId}`,{});
  assert.equal(restored.data.notes.find(n=>n.id==='guest-note-0').paper,5);
  board=(await request('board/guest-board')).data;
  assert.equal(board.notes.find(n=>n.id==='guest-note-0').paper,5);
});

test('Backup import preserves existing notes, colors and order in exported copy',async()=>{
  storage.clear();
  await request('note/guest-note-0',{text:'No sustituir',marks:[],revision:1});
  const imported=await request('board/guest-board/import',{notes:[{text:'Nueva #estudio',paper:5,marks:[{start:0,end:5,ink:'blue'}]}]});
  assert.equal(imported.status,200);
  assert.equal(imported.data.notes[0].text,'No sustituir');
  assert.equal(imported.data.notes[1].text,'Nueva #estudio');
  assert.equal(imported.data.notes[1].paper,5);
  await request('board/guest-board/swap',{from:'guest-note-0',to:'guest-note-1'});
  const exported=(await request('board/guest-board/export')).data;
  assert.equal(exported.format,'postispop');
  assert.equal(exported.notes[0].text,'Nueva #estudio');
  assert.equal(exported.notes[1].text,'No sustituir');
});

test('Invalid or oversized imports are atomic and never replace saved notes',async()=>{
  storage.clear();
  await request('note/guest-note-0',{text:'Conservar',marks:[],revision:1});
  const before=storage.get('postispop-guest-board-v1');
  for(const notes of [
    [{text:'Buena'},{text:'Mala',paper:6}],
    [{text:'Buena'},{text:'x'.repeat(10001)}],
    [{text:'Buena'},{text:'Mala',doodle:'<svg onload=alert(1)>'}],
    [{text:'Mala',marks:[{start:0,end:999,ink:'blue'}]}],
    Array.from({length:12},()=>({text:'Sin espacio'}))
  ]){
    assert.ok((await request('board/guest-board/import',{notes})).status>=400);
    assert.equal(storage.get('postispop-guest-board-v1'),before);
  }
});

test('Exported app doodles can be imported into an empty board',async()=>{
  storage.clear();
  await request('note/guest-note-0',{text:'Recordar',marks:[],revision:1});
  await request('note/guest-note-0/doodle',{doodle:'heart'});
  const backup=(await request('board/guest-board/export')).data;
  storage.clear();
  const imported=await request('board/guest-board/import',backup);
  assert.equal(imported.status,200);
  assert.equal(imported.data.notes[0].doodle,'heart');
  assert.equal(imported.data.notes[0].text,'Recordar');
});

test('Independent note styles and sketches persist without invalidating the text editor revision',async()=>{
  storage.clear();const {normalizeStyle}=await import('../style-model.js');
  const style=normalizeStyle({font:'hand',size:28,italic:true,underline:true,paper:'papyrus',ink:'#315750',drawing:{version:1,selectedInstrument:'brush',strokes:[{instrument:'brush',color:'#315750',width:9,points:[{x:.1,y:.2,p:.4},{x:.9,y:.8,p:.8}]}]}});
  const saved=await request('note/guest-note-0/style',{style,styleRevision:0});assert.equal(saved.status,200);assert.equal(saved.data.note.revision,1);assert.equal(saved.data.styleRevision,1);
  await request('note/guest-note-0',{text:'Texto y dibujo',marks:[],revision:1});
  const reopened=(await request('board/guest-board')).data.notes[0];assert.deepEqual(reopened.style,style);assert.equal(reopened.text,'Texto y dibujo');
  const stale=await request('note/guest-note-0/style',{style:{size:16},styleRevision:0});assert.equal(stale.status,409);
  const other=(await request('board/guest-board')).data.notes[1];assert.equal(other.style,null);
  const backup=(await request('board/guest-board/export')).data;storage.clear();
  const restored=await request('board/guest-board/import',backup);assert.equal(restored.status,200);assert.deepEqual(restored.data.notes[0].style,style);
});

test('Malformed style/drawing imports are rejected atomically',async()=>{
  storage.clear();await request('note/guest-note-0',{text:'Conservar',marks:[],revision:1});const before=storage.get('postispop-guest-board-v1');
  for(const style of [{font:'url(https://evil.test)'},{ink:'red;display:none'},{size:100},{drawing:{version:1,selectedInstrument:'brush',strokes:[{instrument:'brush',color:'#000000',width:9,points:[{x:Infinity,y:.5,p:.5}]}]}}]){
    assert.ok((await request('board/guest-board/import',{notes:[{text:'otra',style}]})).status>=400);assert.equal(storage.get('postispop-guest-board-v1'),before);
  }
});

test('Protecting a note removes plain content and prevents legacy writes and empty-slot imports',async()=>{
  storage.clear();
  const cryptoModule=await import('../note-crypto.js');
  const encrypt=cryptoModule.encryptNote;
  assert.equal(typeof encrypt,'function');
  await request('note/guest-note-0',{text:'Secreto privado',marks:[],revision:1});
  const envelope=await encrypt({text:'Secreto privado',marks:[],paper:0,doodle:'',style:{font:'hand'},attachments:[]},'clave-larga');
  const response=await request('note/guest-note-0/protect',{revision:2,styleRevision:0,protectedEnvelope:envelope});assert.equal(response.status,200);
  assert.equal(response.data.note.text,'Nota protegida');assert.equal(response.data.note.style,null);assert.ok(!storage.get('postispop-guest-board-v1').includes('Secreto privado'));
  assert.equal((await request('note/guest-note-0',{text:'leak',marks:[],revision:3})).status,423);
  assert.equal((await request('note/guest-note-0/style',{style:{},styleRevision:0})).status,423);
  assert.equal((await request('note/guest-note-0/lock',{})).status,423);
  const imported=await request('board/guest-board/import',{notes:[{text:'Nueva'}]});assert.equal(imported.data.notes[1].text,'Nueva');assert.deepEqual(imported.data.notes[0].protectedEnvelope,envelope);
  const backup=(await request('board/guest-board/export')).data;storage.clear();const restored=await request('board/guest-board/import',backup);assert.equal(restored.status,200);assert.deepEqual(restored.data.notes[0].protectedEnvelope,envelope);
});

test('A protected backup larger than 2 MB roundtrips with its encrypted attachment',async()=>{
  storage.clear();const {encryptNote,bytesToBase64,decryptNote}=await import('../note-crypto.js');
  const payload={text:'Adjunto privado',attachments:[{kind:'file',name:'prueba.bin',type:'application/octet-stream',data:bytesToBase64(new Uint8Array(1400000))}]};
  const envelope=await encryptNote(payload,'una-clave-larga');
  await request('note/guest-note-0/protect',{revision:1,styleRevision:0,protectedEnvelope:envelope});
  const backup=(await request('board/guest-board/export')).data;assert.ok(JSON.stringify(backup).length>2000000);assert.ok(!JSON.stringify(backup).includes('Adjunto privado'));
  storage.clear();const restored=await request('board/guest-board/import',backup);assert.equal(restored.status,200);
  assert.equal((await decryptNote(restored.data.notes[0].protectedEnvelope,'una-clave-larga')).attachments[0].data,payload.attachments[0].data);
});

test('Storage quota exhaustion leaves the previously saved board intact',async()=>{
  storage.clear();await request('note/guest-note-0',{text:'Conservar',marks:[],revision:1});const before=storage.get('postispop-guest-board-v1'),original=context.localStorage.setItem;
  context.localStorage.setItem=()=>{throw Object.assign(new Error('Full'),{name:'QuotaExceededError'});};
  try{const failure=await request('note/guest-note-0/style',{style:{size:25},styleRevision:0});assert.equal(failure.status,507);assert.equal(failure.data.error,'LOCAL_STORAGE_FULL');assert.equal(storage.get('postispop-guest-board-v1'),before);}finally{context.localStorage.setItem=original;}
});

test('Trash, restore and slot reuse never recycle a revision accepted by an old editor',async()=>{
  storage.clear();const original=await request('note/guest-note-0',{text:'Original',marks:[],revision:1});
  const trashed=await request('note/guest-note-0/trash',{});assert.ok(trashed.data.board.notes[0].revision>original.data.note.revision);
  const restored=await request('restore/'+trashed.data.trashId,{});const note=restored.data.notes[0];assert.ok(note.revision>trashed.data.board.notes[0].revision);
  const stale=await request('note/guest-note-0',{text:'Editor obsoleto',marks:[],revision:original.data.note.revision});assert.equal(stale.data.error,'CONFLICT');
  const replaced=await request('note/guest-note-0/trash',{});const revision=replaced.data.board.notes[0].revision;
  const written=await request('note/guest-note-0',{text:'Nota nueva',marks:[],revision});assert.equal(written.status,200);
  assert.equal((await request('note/guest-note-0/style',{style:{size:16},styleRevision:0})).status,409);
});

test('Protected slot markers follow successful trash/restore and import skips an encryption reservation',async()=>{
  storage.clear();const envelope={v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:600000,salt:'AAAAAAAAAAAAAAAAAAAAAA',iv:'AAAAAAAAAAAAAAAA',id:'AAAAAAAAAAAAAAAAAAAAAA',ciphertext:'AAAAAAAAAAAAAAAAAAAAAA'};
  const protectedNote=await request('note/guest-note-0/protect',{revision:1,styleRevision:0,protectedEnvelope:envelope});assert.equal(protectedNote.status,200);assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
  const trashed=await request('note/guest-note-0/trash',{});assert.equal(storage.has('pp:protected-note:guest-note-0'),false);
  await request('restore/'+trashed.data.trashId,{});assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
  storage.clear();storage.set('pp:protected-note:guest-note-0','1');
  const imported=await request('board/guest-board/import',{notes:[{text:'Debe ir a otra nota'}]});assert.equal(imported.data.notes[0].text,'');assert.equal(imported.data.notes[1].text,'Debe ir a otra nota');assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
});
