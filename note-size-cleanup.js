import {MAX_NOTE_BYTES,noteSize} from './note-size.js';
import {readAttachmentRows} from './backup-import.js';
import {withNoteStorageLock} from './attachment-lock.js';
const checking=new Set();
async function deleteFiles(noteId) {
 const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('postispop-note-attachments',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readwrite'),store=tx.objectStore('attachments'),request=store.index('noteId').openCursor(IDBKeyRange.only(noteId));request.onsuccess=()=>{const cursor=request.result;if(cursor){cursor.delete();cursor.continue();}};tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
export async function purgeOversizedBoard(board,{styles=[],remove}) {
 if(!board?.notes||typeof indexedDB==='undefined'||checking.has(board.id))return board;
 checking.add(board.id);
 try{
  const deleted=new Set();
  for(const note of board.notes){
   await withNoteStorageLock(note.id,async()=>{
    const attachments=await readAttachmentRows(note.id);
    const bytes=noteSize({...note,style:note.style||styles.find(s=>s.note_id===note.id)||null,attachments});
    if(bytes<=MAX_NOTE_BYTES)return;
    await remove(note,bytes);
    await deleteFiles(note.id);
    deleted.add(note.id);
   },{requireLock:true,ifAvailable:true});
  }
  return deleted.size?{...board,revision:(board.revision||0)+deleted.size,notes:board.notes.filter(n=>!deleted.has(n.id)),order:board.order?.filter(id=>!deleted.has(id))}:board;
 }finally{checking.delete(board.id);}
}
