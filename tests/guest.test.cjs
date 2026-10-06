const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const storage=new Map();let calls=0;
const context=vm.createContext({console,Response,Request,URL,URLSearchParams,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{origin:'https://postispop.com',href:'https://postispop.com/'},window:{fetch:async()=>{calls++;throw Error('Unexpected guest network request');}}});
const ready=Promise.all([import('../style-model.js'),import('../note-crypto.js'),import('../offline-sync.js'),import('../offline-license.js'),import('../backup-import.js')]).then(([style,cryptoModule,sync,licenses,imports])=>{
  // Storage-lock and attachment persistence are exercised with real IndexedDB
  // in backup-attachments-ui; these unit fixtures contain no attachment rows.
  Object.assign(context,{normalizeStyle:style.normalizeStyle,validateEnvelope:cryptoModule.validateEnvelope,...sync,...licenses,...imports,withImportSlots:async(ids,work)=>work([]),createBoardBackup:async board=>({format:'postispop',version:2,title:board.title,notes:board.order.map(id=>board.notes.find(n=>n.id===id)).filter(Boolean)}),installOfflineUI:()=>{}});
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
  const trashed=await request('note/guest-note-0/trash',{});assert.equal(trashed.data.board.notes.length,5);assert.equal(trashed.data.board.order.includes('guest-note-0'),false);
  const restored=await request('restore/'+trashed.data.trashId,{});assert.equal(restored.data.notes.find(n=>n.id==='guest-note-0').text,'Prueba local');
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
  assert.equal(restored.data.notes.find(n=>n.id===note.id).paper,5);
  board=(await request('board/guest-board')).data;
  assert.equal(board.notes.find(n=>n.id===note.id).paper,5);
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

test('Removed notes stay recoverable and stale editors cannot recreate or overwrite a slot',async()=>{
  storage.clear();const original=await request('note/guest-note-0',{text:'Original',marks:[],revision:1});
  const trashed=await request('note/guest-note-0/trash',{revision:original.data.note.revision});assert.equal(trashed.data.board.notes.length,5);
  assert.equal((await request('note/guest-note-0',{text:'Stale',marks:[],revision:original.data.note.revision})).data.error,'NOT_FOUND');
  const restored=await request('restore/'+trashed.data.trashId,{});const note=restored.data.notes.find(n=>n.id==='guest-note-0');assert.ok(note.revision>original.data.note.revision);
  const stale=await request('note/guest-note-0',{text:'Editor obsoleto',marks:[],revision:original.data.note.revision});assert.equal(stale.data.error,'CONFLICT');
  await request('note/guest-note-0/trash',{revision:note.revision});const added=await request('board/guest-board/notes',{}),newNote=added.data.notes.at(-1);assert.notEqual(newNote.id,'guest-note-0');
  const written=await request('note/'+newNote.id,{text:'Nota nueva',marks:[],revision:newNote.revision});assert.equal(written.status,200);
  assert.equal((await request('note/guest-note-0/style',{style:{size:16},styleRevision:0})).data.error,'NOT_FOUND');
  assert.equal((await request('restore/'+trashed.data.trashId,{})).data.error,'TRASH_EXPIRED');
});

test('Protected slot markers follow successful trash/restore and import skips an encryption reservation',async()=>{
  storage.clear();const envelope={v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:600000,salt:'AAAAAAAAAAAAAAAAAAAAAA',iv:'AAAAAAAAAAAAAAAA',id:'AAAAAAAAAAAAAAAAAAAAAA',ciphertext:'AAAAAAAAAAAAAAAAAAAAAA'};
  const protectedNote=await request('note/guest-note-0/protect',{revision:1,styleRevision:0,protectedEnvelope:envelope});assert.equal(protectedNote.status,200);assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
  const trashed=await request('note/guest-note-0/trash',{});assert.equal(storage.has('pp:protected-note:guest-note-0'),false);
  await request('restore/'+trashed.data.trashId,{});assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
  storage.clear();storage.set('pp:protected-note:guest-note-0','1');
  const imported=await request('board/guest-board/import',{notes:[{text:'Debe ir a otra nota'}]});assert.equal(imported.data.notes[0].text,'');assert.equal(imported.data.notes[1].text,'Debe ir a otra nota');assert.equal(storage.get('pp:protected-note:guest-note-0'),'1');
});

test('Free boards start with six notes and refuse a seventh without touching saved data',async()=>{
  storage.clear();
  const initial=await request('board/guest-board');assert.equal(initial.data.notes.length,6);assert.equal(initial.data.capacity,6);
  assert.equal((await request('config')).data.features.notes,6);
  const before=storage.get('postispop-guest-board-v1');
  const extra=await request('board/guest-board/notes',{});assert.equal(extra.status,409);assert.equal(extra.data.error,'BOARD_FULL');assert.equal(storage.get('postispop-guest-board-v1'),before);
  const removed=await request('note/guest-note-2/trash',{revision:1});assert.equal(removed.data.board.notes.length,5);
  const replaced=await request('board/guest-board/notes',{});assert.equal(replaced.data.notes.length,6);
  assert.equal((await request('restore/'+removed.data.trashId,{})).data.error,'BOARD_FULL');
});

test('A legacy twelve-note board stays readable, editable, exportable and recoverable at the six-note limit',async()=>{
  storage.clear();
  const template=(await request('board/guest-board')).data;
  const notes=Array.from({length:12},(_,i)=>({...template.notes[0],id:'guest-note-'+i,text:'Conservar '+i}));
  storage.set('postispop-guest-board-v1',JSON.stringify({...template,schemaVersion:undefined,legacyNoteIds:undefined,capacity:12,notes,order:notes.map(n=>n.id)}));
  const board=await request('board/guest-board');assert.equal(board.data.notes.length,12);assert.equal(board.data.capacity,6);
  assert.equal((await request('board/guest-board/notes',{})).data.error,'BOARD_FULL');
  const last=await request('note/guest-note-11',{text:'Sigue accesible',marks:[],revision:1});assert.equal(last.status,200);
  assert.equal((await request('board/guest-board/export')).data.notes[11].text,'Sigue accesible');
  const removed=await request('note/guest-note-11/trash',{revision:2});assert.equal(removed.data.board.notes.length,11);
  const restored=await request('restore/'+removed.data.trashId,{});assert.equal(restored.data.notes.length,12);assert.equal(restored.data.notes.find(n=>n.id==='guest-note-11').text,'Sigue accesible');
});

test('Guest image and doodle changes reject stale revisions and unsafe image URLs',async()=>{
  storage.clear();
  const image=await request('note/guest-note-0/image',{url:'https://example.org/note.png',revision:1});assert.equal(image.status,200);assert.equal(image.data.note.image.url,'https://example.org/note.png');
  assert.equal((await request('note/guest-note-0/doodle',{doodle:'heart',revision:1})).status,409);
  assert.equal((await request('note/guest-note-0/image',{url:'javascript:alert(1)',revision:2})).status,400);
  assert.equal((await request('note/guest-note-0/doodle',{doodle:'<svg>',revision:2})).status,400);
  assert.equal((await request('board/guest-board')).data.notes[0].image.url,'https://example.org/note.png');
});

test('Guest import excludes notes with local attachments even when their text is empty',async()=>{
  await ready;storage.clear();const previous=context.withImportSlots;
  try{
    context.withImportSlots=async(ids,work)=>{assert.ok(ids.includes('guest-note-0'));return work(['guest-note-0']);};
    const result=await request('board/guest-board/import',{notes:[{text:'Restaurada'}]});
    assert.equal(result.status,200);assert.equal(result.data.notes[0].text,'');assert.equal(result.data.notes[1].text,'Restaurada');
  }finally{context.withImportSlots=previous;storage.clear();}
});
test('Guest attachment restore aborts and rolls back local files when another edit changes its reserved snapshot',async()=>{
  await ready;storage.clear();const previous=context.restoreBackupAttachments;let rolledBack=0;
  try{
    context.restoreBackupAttachments=async(notes,ids,{validate})=>{
      await validate();assert.equal(ids[0],'guest-note-0');
      const edit=await request('note/guest-note-0',{text:'Edición concurrente',marks:[],revision:1});assert.equal(edit.status,200);
      return {rollback:async()=>rolledBack++};
    };
    const result=await request('board/guest-board/import',{version:2,notes:[{text:'Copia',attachments:[{kind:'link',name:'Documento',url:'https://example.org/doc',created:1}]}]});
    assert.equal(result.data.error,'CONFLICT');assert.equal(rolledBack,1);
    const board=(await request('board/guest-board')).data;
    assert.equal(board.notes[0].text,'Edición concurrente');assert.equal(board.notes.some(note=>note.text==='Copia'),false);
    assert.equal(JSON.parse([...storage].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
  }finally{context.restoreBackupAttachments=previous;storage.clear();}
});
test('Guest attachment restore rolls back its local files when the board commit exceeds storage quota',async()=>{
  await ready;storage.clear();const previous=context.restoreBackupAttachments,save=context.localStorage.setItem;let rolledBack=0;
  try{
    context.restoreBackupAttachments=async(notes,ids,{validate})=>{await validate();context.localStorage.setItem=(key,value)=>{if(key==='postispop-guest-board-v1')throw Object.assign(Error('quota'),{name:'QuotaExceededError'});save(key,value);};return {rollback:async()=>rolledBack++};};
    const result=await request('board/guest-board/import',{notes:[{text:'No confirmar'}]});
    assert.equal(result.data.error,'LOCAL_STORAGE_FULL');assert.equal(rolledBack,1);assert.equal(storage.has('postispop-guest-board-v1'),false);
    assert.equal(JSON.parse([...storage].find(([key])=>key.startsWith('pp:import-request:'))[1]).finishedAt,undefined);
  }finally{context.restoreBackupAttachments=previous;context.localStorage.setItem=save;storage.clear();}
});
test('Concurrent guest imports sharing a pending ticket never duplicate notes',async()=>{
  await ready;storage.clear();const previous=context.withImportSlots;let serial=Promise.resolve();
  try{
    context.withImportSlots=(ids,work)=>{const next=serial.then(()=>work([]));serial=next.catch(()=>{});return next;};
    const backup={notes:[{text:'Una sola copia'}]};
    const responses=await Promise.all([request('board/guest-board/import',backup),request('board/guest-board/import',backup)]);
    assert.ok(responses.every(response=>response.status===200));
    assert.equal((await request('board/guest-board')).data.notes.filter(note=>note.text==='Una sola copia').length,1);
  }finally{context.withImportSlots=previous;storage.clear();}
});
