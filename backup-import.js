import {normalizeStyle} from './style-model.js';
import {validateEnvelope} from './note-crypto.js';
import {withNoteStorageLock,protectedMarker} from './attachment-lock.js';

export const CLOUD_BACKUP_BYTES=24*1024*1024;
const fail=code=>{throw Object.assign(new Error(code),{status:400});};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Copy data only. IDs, authors and revision fields in an export never grant access.
export function normalizeBackup(data,{maxNotes=100,maxBytes=CLOUD_BACKUP_BYTES}={}) {
  if(!data||typeof data!=='object'||Array.isArray(data)||
    (data.format!==undefined&&data.format!=='postispop')||(data.version!==undefined&&data.version!==1)||
    !Array.isArray(data.notes)||data.notes.length>maxNotes)fail('INVALID_BACKUP');
  if(new TextEncoder().encode(JSON.stringify(data)).length>maxBytes)fail('BACKUP_TOO_LARGE');
  const notes=data.notes.map(n=>{
    if(!n||typeof n!=='object'||Array.isArray(n))fail('INVALID_BACKUP');
    const paper=n.paper??0;
    if(!Number.isInteger(paper)||paper<0||paper>5)fail('INVALID_BACKUP');
    if(n.protectedEnvelope){validateEnvelope(n.protectedEnvelope);return {paper,protectedEnvelope:n.protectedEnvelope};}
    if(typeof n.text!=='string'||n.text.length>10000)fail('INVALID_BACKUP');
    const marks=n.marks??[],doodle=n.doodle??'';
    if(!Array.isArray(marks)||marks.length>10000||typeof doodle!=='string'||
      !['','heart','idea','smile','cart','star','check','ticket'].includes(doodle))fail('INVALID_BACKUP');
    if(marks.some(m=>!m||!Number.isInteger(m.start)||!Number.isInteger(m.end)||m.start<0||m.end<m.start||m.end>n.text.length||typeof m.ink!=='string'||!/^[a-z-]{1,30}$/.test(m.ink)))fail('INVALID_BACKUP');
    let image=null;
    if(n.image!=null){
      if(typeof n.image!=='object'||typeof n.image.url!=='string'||n.image.url.length>2048)fail('INVALID_BACKUP');
      let url;try{url=new URL(n.image.url);}catch{fail('INVALID_BACKUP');}
      if(!['http:','https:'].includes(url.protocol)||url.username||url.password)fail('INVALID_BACKUP');
      image={url:url.href};
    }
    const rawStyle=n.style&&Array.isArray(n.style.drawing)&&n.style.drawing.length===0?{...n.style,drawing:undefined}:n.style;
    const style=rawStyle?normalizeStyle(rawStyle):null;
    if(style&&!Number.isInteger(style.size))fail('INVALID_STYLE');
    return {text:n.text,paper,marks:marks.map(({start,end,ink})=>({start,end,ink})),doodle,image,style};
  }).filter(n=>n.protectedEnvelope||n.text!==''||n.marks?.length||n.doodle||n.image||n.style?.drawing?.strokes?.length);
  return {format:'postispop',version:1,notes};
}

// A pending request survives a lost response and a page reload. Only its digest
// and random request ID are persisted, never the imported note contents.
export async function importTicket(storage,accountId,boardId,notes,startedAt=Date.now()) {
  const bytes=new TextEncoder().encode(JSON.stringify(notes));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
  const key=`pp:import-request:${accountId}:${boardId}:${hash}`;
  const prepare=async()=>{
    let saved;try{saved=JSON.parse(storage.getItem(key)||'null');}catch{}
    const reuse=UUID.test(saved?.requestId||'')&&(!saved.finishedAt||saved.finishedAt>=startedAt);
    const record=reuse?saved:{requestId:crypto.randomUUID()};
    try{storage.setItem(key,JSON.stringify(record));if(JSON.parse(storage.getItem(key)||'null')?.requestId!==record.requestId)throw Error();}
    catch{fail('IMPORT_STORAGE_UNAVAILABLE');}
    return {requestId:record.requestId,finish(){
      try{
        const current=JSON.parse(storage.getItem(key)||'null');
        if(current?.requestId===record.requestId&&!current.finishedAt)storage.setItem(key,JSON.stringify({...current,finishedAt:Date.now()}));
      }catch{/* Replaying a pending request remains safe if cleanup fails. */}
    }};
  };
  // Only the short read/write needs this lock. Concurrent invocations reuse the
  // pending ticket; a new deliberate import begun after completion gets a new ID.
  return globalThis.navigator?.locks?.request?navigator.locks.request('postispop-import-ticket:'+key,prepare):prepare();
}

async function attachmentNoteIds() {
  if(!globalThis.indexedDB)fail('ATTACHMENT_CHECK_UNAVAILABLE');
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('postispop-note-attachments',1);let absent=false;
    request.onupgradeneeded=()=>{absent=true;request.transaction.abort();};
    request.onerror=()=>absent?resolve([]):reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));
    request.onblocked=()=>reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));
    request.onsuccess=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains('attachments')){db.close();reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));return;}
      const tx=db.transaction('attachments','readonly'),ids=new Set();
      const cursor=tx.objectStore('attachments').index('noteId').openKeyCursor();
      cursor.onsuccess=()=>{const item=cursor.result;if(item){ids.add(item.key);item.continue();}};
      tx.oncomplete=()=>{db.close();resolve([...ids]);};
      tx.onerror=tx.onabort=()=>{db.close();reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));};
    };
  });
}

// Coordinate with attachment writes in all tabs while the server chooses slots.
// Other devices' unsynchronised attachments cannot be discovered from here.
export async function withImportSlots(noteIds,work) {
  const ids=[...new Set(noteIds)].sort();
  const lock=async i=>i<ids.length?withNoteStorageLock(ids[i],()=>lock(i+1),{requireLock:true}):
    work([...new Set([...(await attachmentNoteIds()).filter(id=>ids.includes(id)),...ids.filter(id=>localStorage.getItem(protectedMarker(id)))])]);
  return lock(0);
}
