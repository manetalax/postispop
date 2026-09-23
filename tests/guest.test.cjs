const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const storage=new Map();let calls=0;
const context=vm.createContext({console,Response,Request,URL,URLSearchParams,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{origin:'https://postispop.com',href:'https://postispop.com/'},window:{fetch:async()=>{calls++;throw Error('Unexpected guest network request');}}});
vm.runInContext(fs.readFileSync('guest-board.js','utf8').replaceAll('export function','function')+'\n'+fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/,''),context);
const request=async(path,data)=>{const r=await context.window.fetch('/api/'+path,data===undefined?{}:{method:'POST',body:JSON.stringify(data)});return{status:r.status,data:await r.json()};};
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
