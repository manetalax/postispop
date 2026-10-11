import {readGuest} from './guest-board.js';
import {createBoardBackup} from './backup-import.js';
import {withNoteStorageLock,assertAttachmentWritable,protectedMarker} from './attachment-lock.js';
import {sealSharedNote,MAX_SHARE_BYTES} from './note-share-package.js';
import {shareCopy} from './note-share-copy.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';
import {shareText,shareFile,openWhatsApp} from './share-tools.js';
import {bytesToBase64} from './note-crypto.js';
import {createNotePreview} from './note-share-preview.js';
let activeShare=null;
const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
async function api(path){const r=await fetch('/api/'+path,{cache:'no-store'});if(!r.ok)throw Error('SNAPSHOT_UNAVAILABLE');return r.json();}
export function liveEditorSnapshot(id){
  const detail={noteId:id,snapshot:null};window.dispatchEvent(new CustomEvent('postispop:editor-snapshot',{detail}));
  return detail.snapshot;
}
export function hasShareContent(note){return Boolean(note?.protectedEnvelope||note?.text?.trim()||note?.image||note?.doodle||note?.marks?.length||note?.style?.drawing?.strokes?.length||note?.attachments?.length);}
async function collectNote(id){
  const editor=document.querySelector('.editor-dialog');
  if(!editor)throw Error('NOTE_UNAVAILABLE');
  const text=editor.querySelector('textarea')?.value??'';
  const live=liveEditorSnapshot(id);
  let board;
  if(id.startsWith('guest-'))board=readGuest();
  else{const me=await api('me');const last=localStorage.getItem('pp:last-board');const entry=me.boards?.find(b=>b.id===last)||me.boards?.[0];if(!entry)throw Error('NOTE_UNAVAILABLE');board=await api('board/'+entry.id);}
  const saved=board?.notes?.find(n=>n.id===id);if(!saved||saved.protectedEnvelope)throw Error('NOTE_PROTECTED');
  let style=live?.style||saved.style;
  if(!style&&!id.startsWith('guest-')){const data=await api('designs/styles?note_id='+encodeURIComponent(id));style=data.style||data.styles?.find(s=>s.note_id===id)||null;}
  const note={...saved,text,marks:text===saved.text?saved.marks:[],style};
  const backup=await createBoardBackup({title:'PostisPop',order:[id],notes:[note]},{maxBytes:MAX_SHARE_BYTES});
  // Legacy photos must travel with the snapshot, rather than as fragile remote URLs.
  if(note.image){
    const url=new URL(note.image.url);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('INVALID_IMAGE');
    const r=await fetch(url.href,{credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error('IMAGE_UNAVAILABLE');
    const blob=await r.blob();if(blob.size>25*1024*1024||!/^image\/(png|jpeg|webp|gif|avif)$/.test(blob.type))throw Error('INVALID_IMAGE');
    const bytes=new Uint8Array(await blob.arrayBuffer());const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
    backup.notes[0].image=null;(backup.notes[0].attachments??=[]).unshift({kind:'file',name:'PostisPop-foto',type:blob.type,size:bytes.length,created:0,sha256,data:bytesToBase64(bytes)});
  }
  if(!hasShareContent(backup.notes[0]))throw Error('EMPTY_NOTE');
  return backup;
}
export async function prepareNoteShare(id,{snapshot=null,signal,onSnapshot}={}){
  // Recheck local protection after all async reads and before any upload.
  const data=snapshot?{format:'postispop',version:2,title:'PostisPop',exportedAt:new Date().toISOString(),notes:[snapshot]}:await collectNote(id);
  const sealed=await sealSharedNote(data);
  const upload=async()=>{
    if(!snapshot)await assertAttachmentWritable(id);
    const response=await fetch(`${SUPABASE_URL}/functions/v1/postispop-note-share/${sealed.token}`,{method:'PUT',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/octet-stream'},body:sealed.blob,signal,cache:'no-store'});
    if(!response.ok)throw Error(response.status===413?'SHARE_TOO_LARGE':'SHARE_UNAVAILABLE');
    const result=await response.json();if(result.token!==sealed.token)throw Error('SHARE_UNAVAILABLE');
    onSnapshot?.(data.notes[0]);
    return `https://postispop.com/nota-compartida.html#${sealed.token}.${sealed.key}`;
  };
  return snapshot?upload():withNoteStorageLock(id,upload,{requireLock:true});
}
export function shortcutFile(url,label){
  const safe=new URL(url);if(safe.origin!=='https://postispop.com'||safe.pathname!=='/nota-compartida.html')throw Error('INVALID_SHARE_LINK');
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  return new File([`<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0;url=${escape(url)}"><title>PostisPop</title></head><body><a href="${escape(url)}">${escape(label)}</a></body></html>`],'PostisPop-nota.html',{type:'text/html'});
}
function download(file){const url=URL.createObjectURL(file),a=node('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export async function showCompleteNoteShare(id,{getSnapshot}={}){
  if(activeShare?.isConnected)return;
  const t=shareCopy(),dialog=node('dialog','','pp-note-share-dialog');activeShare=dialog;
  const controller=new AbortController(),heading=node('h2',t.title),description=node('p',t.notice),status=node('p',t.preparing),close=node('button',t.close);
  heading.id='pp-note-share-heading';dialog.setAttribute('aria-labelledby',heading.id);status.setAttribute('role','status');close.type='button';close.addEventListener('click',()=>dialog.close());
  const actions=node('div','','pp-note-share-actions');dialog.append(heading,description,status,actions,close);(document.querySelector('.editor-dialog')||document.querySelector('.pp-vault-dialog')||document.body).append(dialog);dialog.showModal();
  let previewUrl=null;
  dialog.addEventListener('close',()=>{controller.abort();if(previewUrl)URL.revokeObjectURL(previewUrl);dialog.remove();activeShare=null;},{once:true});
  try{
    const snapshot=getSnapshot?await getSnapshot():null;
    let sharedNote;
    const url=await prepareNoteShare(id,{snapshot,signal:controller.signal,onSnapshot:note=>{sharedNote=note;}});if(!dialog.isConnected)return;
    const preview=await createNotePreview(sharedNote,t);if(!dialog.isConnected)return;
    if(preview){const image=node('img','','pp-note-share-preview');previewUrl=URL.createObjectURL(preview);image.src=previewUrl;image.alt=t.preview;dialog.insertBefore(image,status);}
    const message=t.message+'\n'+url;
    const input=node('input');input.readOnly=true;input.value=url;input.setAttribute('aria-label',t.copy);dialog.insertBefore(input,actions);
    const make=(label,handler)=>{const b=node('button',label);b.type='button';b.addEventListener('click',()=>Promise.resolve(handler()).catch(()=>{status.textContent=t.failed;}));actions.append(b);return b;};
    const send=async whatsapp=>{
      if(preview){const result=await shareFile(preview,{title:t.received,text:message});if(result!=='unsupported')return;status.textContent=t.previewFallback;}
      if(whatsapp){openWhatsApp(message);return;}
      const result=await shareText(message,{title:t.received});if(result==='unsupported'){input.focus();input.select();status.textContent=t.copyFailed;}else if(result==='copied'&&!preview)status.textContent=t.copied;
    };
    make(t.apps,()=>send(false));
    make(t.whatsapp,()=>send(true));
    if(preview)make(t.downloadPreview,()=>download(preview));
    make(t.copy,async()=>{try{await navigator.clipboard.writeText(url);status.textContent=t.copied;}catch{input.focus();input.select();status.textContent=t.copyFailed;}});
    make(t.download,async()=>{const file=shortcutFile(url,t.openApp);const result=await shareFile(file,{title:t.received,text:url});if(result==='unsupported')download(file);});
    status.textContent=preview?t.chooseApp:t.snapshot;
  }catch(error){if(controller.signal.aborted)return;status.textContent=['SHARE_TOO_LARGE','BACKUP_TOO_LARGE','NOTE_TOO_LARGE'].includes(error.message)?t.tooLarge:error.message==='EMPTY_NOTE'?t.empty:t.failed;}
}
export function installEditorShareButton(editor,id){
  if(editor.querySelector('.pp-complete-note-share'))return;
  const t=shareCopy(),actions=editor.querySelector('.editor-actions');if(!actions)return;
  const legacy=actions.querySelector('button:has(svg.lucide-share2)');if(legacy)legacy.dataset.ppLegacyShare='true';
  const button=node('button','','icon-button pp-complete-note-share');button.type='button';button.title=t.title;button.setAttribute('aria-label',t.title);
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></svg>';
  button.addEventListener('click',()=>showCompleteNoteShare(id));actions.insertBefore(button,actions.querySelector('.pp-editor-secondary'));
}
