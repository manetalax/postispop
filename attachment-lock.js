// Shared origin-wide lock: migration and every legacy attachment write participate.
export const protectedMarker=id=>'pp:protected-note:'+id;
export function canCoordinateAttachments(){return Boolean(globalThis.navigator?.locks?.request);}
export async function withNoteStorageLock(id,work,{requireLock=false,ifAvailable=false}={}){
  if(!id)throw Error('NOTE_REQUIRED');
  if(canCoordinateAttachments())return navigator.locks.request('postispop-note-storage:'+id,{mode:'exclusive',...(ifAvailable?{ifAvailable:true}:{})},lock=>{if(ifAvailable&&!lock)return;return work();});
  if(requireLock)throw Error('STORAGE_LOCK_UNAVAILABLE');
  return work();
}
export async function assertAttachmentWritable(noteId){
  // Guest slots are reused; inspect authoritative local state after acquiring the lock.
  if(noteId.startsWith('guest-note-')){
    const board=JSON.parse(localStorage.getItem('postispop-guest-board-v1')||'null');const note=board?.notes?.find(n=>n.id===noteId);
    if(note?.protectedEnvelope||localStorage.getItem(protectedMarker(noteId))==='1')throw Error('NOTE_PROTECTED');
    return;
  }
  if(localStorage.getItem(protectedMarker(noteId))==='1')throw Error('NOTE_PROTECTED');
  const response=await fetch('/api/me',{cache:'no-store'});if(!response.ok)throw Error('NOTE_UNAVAILABLE');const me=await response.json();
  for(const item of me.boards||[]){const r=await fetch('/api/board/'+encodeURIComponent(item.id),{cache:'no-store'});if(!r.ok)continue;const board=await r.json(),note=board.notes?.find(n=>n.id===noteId);if(note){if(note.protectedEnvelope){localStorage.setItem(protectedMarker(noteId),'1');throw Error('NOTE_PROTECTED');}return;}}
  throw Error('NOTE_UNAVAILABLE');
}
