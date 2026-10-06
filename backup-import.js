import {normalizeStyle} from './style-model.js';
import {validateEnvelope,bytesToBase64,base64ToBytes} from './note-crypto.js';
import {withNoteStorageLock,protectedMarker,assertAttachmentWritable} from './attachment-lock.js';

export const CLOUD_BACKUP_BYTES=24*1024*1024;
export const LOCAL_BACKUP_BYTES=50*1024*1024;
export const MAX_BACKUP_FILE_BYTES=25*1024*1024;
const fail=code=>{throw Object.assign(new Error(code),{status:400});};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Copy data only. IDs, authors and revision fields in an export never grant access.
export function normalizeBackup(data,{maxNotes=100,maxBytes=CLOUD_BACKUP_BYTES}={}) {
  if(!data||typeof data!=='object'||Array.isArray(data)||
    (data.format!==undefined&&data.format!=='postispop')||(data.version!==undefined&&![1,2].includes(data.version))||
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
    const attachments=normalizeBackupAttachments(n.attachments);
    return {text:n.text,paper,marks:marks.map(({start,end,ink})=>({start,end,ink})),doodle,image,style,...(attachments.length?{attachments}:{})};
  }).filter(n=>n.protectedEnvelope||n.text!==''||n.marks?.length||n.doodle||n.image||n.style?.drawing?.strokes?.length||n.attachments?.length);
  return {format:'postispop',version:data.version===2||notes.some(note=>note.attachments?.length)?2:1,notes};
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

export async function attachmentNoteIds() {
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

function normalizeBackupAttachments(items=[]){
  if(!Array.isArray(items)||items.length>100)fail('INVALID_ATTACHMENT');
  return items.map(item=>{
    if(!item||typeof item!=='object'||typeof item.name!=='string'||!item.name||item.name.length>512||/[\x00-\x1f\\/]/.test(item.name))fail('INVALID_ATTACHMENT');
    const created=item.created??0;if(!Number.isSafeInteger(created)||created<0)fail('INVALID_ATTACHMENT');
    if(item.kind==='link'){
      if(typeof item.url!=='string'||item.url.length>8192)fail('INVALID_ATTACHMENT');
      let url;try{url=new URL(item.url);}catch{fail('INVALID_ATTACHMENT');}
      if(!['https:','http:'].includes(url.protocol)||url.username||url.password)fail('INVALID_ATTACHMENT');
      return {kind:'link',name:item.name,url:url.href,created};
    }
    if(item.kind!=='file'||typeof item.type!=='string'||item.type.length>150||/[\x00-\x20<>]/.test(item.type)||
      typeof item.data!=='string'||!/^[A-Za-z0-9_-]*$/.test(item.data)||item.data.length%4===1||
      !Number.isSafeInteger(item.size)||item.size<0||item.size>MAX_BACKUP_FILE_BYTES||Math.floor(item.data.length*3/4)!==item.size||
      !/^[a-f0-9]{64}$/.test(item.sha256||''))fail('INVALID_ATTACHMENT');
    // An imported HTML document must never acquire an executable blob URL.
    // Unrecognised document MIME types are downloaded as opaque binary data.
    const documentTypes=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/zip','application/x-zip-compressed','application/octet-stream'];
    const type=/^(image|audio|video)\//i.test(item.type)||documentTypes.includes(item.type)?item.type:'application/octet-stream';
    return {kind:'file',name:item.name,type,size:item.size,created,data:item.data,sha256:item.sha256};
  });
}
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
function openAttachmentDb(){
  if(!globalThis.indexedDB)throw Error('ATTACHMENT_CHECK_UNAVAILABLE');
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('postispop-note-attachments',1);
    request.onupgradeneeded=()=>{const store=request.result.createObjectStore('attachments',{keyPath:'key'});store.createIndex('noteId','noteId',{unique:false});};
    request.onsuccess=()=>resolve(request.result);request.onerror=request.onblocked=()=>reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));
  });
}
async function readAttachmentRows(noteId){
  const db=await openAttachmentDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('attachments','readonly'),request=tx.objectStore('attachments').index('noteId').getAll(noteId);let rows=[];
    request.onsuccess=()=>{rows=request.result;};
    tx.oncomplete=()=>{db.close();resolve(rows);};
    tx.onerror=tx.onabort=()=>{db.close();reject(Error('ATTACHMENT_CHECK_UNAVAILABLE'));};
  });
}

// Caller obtains each note's storage lock and verifies its current protection
// state. File contents travel only in the downloaded backup, never to analytics
// or the server. Protected notes keep all attachments inside their envelope.
export async function exportNoteAttachments(noteId){
  if(localStorage.getItem(protectedMarker(noteId)))throw Error('NOTE_PROTECTED');
  const rows=await readAttachmentRows(noteId),items=[];
  if(rows.length>100)fail('INVALID_ATTACHMENT');
  for(const row of rows){
    if(row.kind==='link'){items.push({kind:'link',name:row.name,url:row.url,created:row.created||0});continue;}
    if(!(row.blob instanceof Blob)||row.blob.size>MAX_BACKUP_FILE_BYTES)fail('INVALID_ATTACHMENT');
    const bytes=new Uint8Array(await row.blob.arrayBuffer());
    items.push({kind:'file',name:row.name,type:row.type||row.blob.type||'application/octet-stream',size:bytes.length,created:row.created||0,data:bytesToBase64(bytes),sha256:await digest(bytes)});
  }
  if(localStorage.getItem(protectedMarker(noteId)))throw Error('NOTE_PROTECTED');
  return normalizeBackupAttachments(items);
}

// Attachment-only notes need a visible marker to survive legacy server import
// filtering and to remain occupied on devices where the local files are absent.
export function backupNotesForServer(notes){
  return notes.map(({attachments,...note})=>{
    if(attachments?.length&&!note.text&&!note.marks?.length&&!note.doodle&&!note.image&&!note.style?.drawing?.strokes?.length)return {...note,text:'📎 Adjuntos'};
    return note;
  });
}

// Validate binaries before the server commits any note rows. Metadata-only
// normalization remains synchronous for legacy callers and preview counters.
export async function verifyBackupAttachments(notes){
  for(const note of notes){
    if(note.protectedEnvelope)continue;
    for(const item of normalizeBackupAttachments(note.attachments)){
      if(item.kind!=='file')continue;
      let bytes;try{bytes=item.data?base64ToBytes(item.data):new Uint8Array();}catch{fail('INVALID_ATTACHMENT');}
      if(bytes.length!==item.size||await digest(bytes)!==item.sha256)fail('ATTACHMENT_INTEGRITY');
    }
  }
}

// Caller holds withImportSlots locks. No writes occur until every binary digest
// and mapping is verified. Deterministic IDs make a cloud RPC replay safe after
// a local disk failure; rollback deletes only records newly added by this call.
export async function restoreBackupAttachments(notes,noteIds,{requestId,validate=()=>{}}={}){
  if(!notes.some(note=>note.attachments?.length))return {rollback:async()=>{}};
  if(!UUID.test(requestId||'')||!Array.isArray(noteIds)||noteIds.length!==notes.length||new Set(noteIds).size!==noteIds.length||noteIds.some(id=>typeof id!=='string'||!id||id.includes('::')))fail('ATTACHMENT_MAPPING_FAILED');
  await validate();
  const rows=[];
  for(let index=0;index<notes.length;index++){
    const note=notes[index],noteId=noteIds[index];
    if(note.protectedEnvelope&&note.attachments?.length)fail('INVALID_ATTACHMENT');
    const items=normalizeBackupAttachments(note.attachments);
    for(let position=0;position<items.length;position++){
      const item=items[position],id=`backup-${requestId}-${index}-${position}`,key=noteId+'::'+id;
      if(item.kind==='link')rows.push({...item,id,key,noteId,type:'text/uri-list',size:0,backupImport:requestId,backupDigest:await digest(new TextEncoder().encode(JSON.stringify(item)))});
      else{
        let bytes;try{bytes=item.data?base64ToBytes(item.data):new Uint8Array();}catch{fail('INVALID_ATTACHMENT');}
        if(bytes.length!==item.size||await digest(bytes)!==item.sha256)fail('ATTACHMENT_INTEGRITY');
        const {data,...metadata}=item;
        rows.push({...metadata,id,key,noteId,blob:new Blob([bytes],{type:item.type}),backupImport:requestId,backupDigest:await digest(new TextEncoder().encode(JSON.stringify(metadata)))});
      }
    }
  }
  await validate();
  if(rows.some(row=>localStorage.getItem(protectedMarker(row.noteId))))throw Error('NOTE_PROTECTED');
  const db=await openAttachmentDb(),inserted=[];
  try{
    await validate();
    if(rows.some(row=>localStorage.getItem(protectedMarker(row.noteId))))throw Error('NOTE_PROTECTED');
    await new Promise((resolve,reject)=>{
    const tx=db.transaction('attachments','readwrite'),store=tx.objectStore('attachments');let failure;
    for(const row of rows){
      const request=store.get(row.key);
      request.onsuccess=()=>{
        if(request.result){if(request.result.backupDigest!==row.backupDigest){failure=Error('ATTACHMENT_INTEGRITY');tx.abort();}return;}
        try{inserted.push(row.key);store.add(row);}catch{failure=Error('ATTACHMENT_RESTORE_FAILED');tx.abort();}
      };
    }
    tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(failure||Error('ATTACHMENT_RESTORE_FAILED'));
  });}finally{db.close();}
  return {rollback:async()=>{
    if(!inserted.length)return;
    const rollbackDb=await openAttachmentDb();
    try{await new Promise((resolve,reject)=>{
      const tx=rollbackDb.transaction('attachments','readwrite'),store=tx.objectStore('attachments');
      for(const key of inserted){const request=store.get(key);request.onsuccess=()=>{if(request.result?.backupImport===requestId)store.delete(key);};}
      tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('ATTACHMENT_ROLLBACK_FAILED'));
    });}finally{rollbackDb.close();}
  }};
}


export async function createBoardBackup(board,{maxBytes=LOCAL_BACKUP_BYTES}={}){
  const identity=()=>{try{return JSON.parse(localStorage.getItem('postispop-supabase-session')||'null')?.user?.id||'guest';}catch{throw Error('SESSION_CHANGED');}};
  const initialIdentity=identity();let sessionChanged=false;
  const changed=event=>{if(event.type!=='storage'||event.key==='postispop-supabase-session')sessionChanged=true;};
  const validate=()=>{if(sessionChanged||identity()!==initialIdentity)throw Error('SESSION_CHANGED');};
  for(const event of ['postispop:session-change','storage'])globalThis.window?.addEventListener(event,changed);
  try{
    const notes=[];
    for(const id of board.order){
      validate();const note=board.notes.find(item=>item.id===id);if(!note)continue;
      notes.push(await withNoteStorageLock(id,async()=>{
        validate();
        if(note.protectedEnvelope){validateEnvelope(note.protectedEnvelope);return {paper:note.paper,protectedEnvelope:note.protectedEnvelope};}
        await assertAttachmentWritable(id);validate();
        const attachments=await exportNoteAttachments(id);validate();
        return {text:note.text||'',marks:note.marks||[],paper:note.paper,doodle:note.doodle||'',image:note.image||null,style:note.style||null,...(attachments.length?{attachments}:{})};
      },{requireLock:true}));
    }
    validate();
    const result={format:'postispop',version:2,title:board.title,exportedAt:new Date().toISOString(),notes};
    if(new TextEncoder().encode(JSON.stringify(result)).length>maxBytes)fail('BACKUP_TOO_LARGE');
    return result;
  }finally{for(const event of ['postispop:session-change','storage'])globalThis.window?.removeEventListener(event,changed);}
}
