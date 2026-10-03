import {encryptNote,decryptNote,bytesToBase64,base64ToBytes,MAX_ATTACHMENT_BYTES} from './note-crypto.js';
import {drawStrokes,normalizeStyle} from './style-model.js';
import {withNoteStorageLock,protectedMarker} from './attachment-lock.js';

const messages={LOCAL_STORAGE_FULL:'No queda espacio suficiente en este dispositivo. Tus datos anteriores se conservan; libera espacio y vuelve a intentarlo.',LINK_UNAVAILABLE:'El enlace ha caducado, se ha revocado o ya no está disponible.',STORAGE_LOCK_UNAVAILABLE:'Este navegador no permite coordinar el cifrado con otros editores abiertos. Usa una versión actual de Chrome, Firefox, Safari o la aplicación para proteger esta nota.',UNLOCK_FAILED:'La contraseña no es correcta o la nota está dañada.',PASSWORD_TOO_SHORT:'La contraseña debe tener al menos 4 caracteres.',PASSWORD_TOO_LONG:'La contraseña es demasiado larga.',CONFLICT:'La nota cambió en otro lugar. Cierra y vuelve a abrir antes de guardar.',STYLE_CONFLICT:'El dibujo cambió. Cierra y vuelve a abrir antes de proteger.',ATTACHMENTS_TOO_LARGE:'Los adjuntos superan 2 MB en total. Esta nota se conserva sin cambios; reduce sus adjuntos antes de protegerla.',NOTE_TOO_LARGE:'La nota supera el tamaño de cifrado permitido. Se conserva sin cambios.',PENDING_CHANGES:'Guarda y sincroniza los cambios pendientes antes de proteger esta nota.',UNFINISHED_DRAFT:'Hay un borrador pendiente de esta nota. Ábrelo y guárdalo antes de protegerla.',REMOTE_IMAGE:'Esta nota tiene una captura alojada fuera del cifrado. Descárgala, elimina la captura de la nota y añádela como archivo local antes de protegerla.',SESSION_REQUIRED:'Inicia sesión para compartir una nota protegida.',OWNER_REQUIRED:'Solo la persona propietaria de la pizarra puede modificar o compartir esta nota.',SECURE_CONTEXT_REQUIRED:'El cifrado necesita HTTPS o la aplicación instalada.',CLEANUP_FAILED:'La nota está cifrada, pero no se han podido retirar todos los adjuntos locales anteriores. Mantén este dispositivo privado y reabre la aplicación para reintentar la limpieza.'};
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
export async function protectedApi(endpoint,payload){const r=await fetch('/api/'+endpoint,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:payload===undefined?undefined:JSON.stringify(payload)});let data;try{data=await r.json();}catch{throw Error('SERVER_UNAVAILABLE');}if(!r.ok)throw Error(data.error||'SERVER_UNAVAILABLE');return data;}
export function protectedError(error){return messages[error.message]||'La operación no está disponible. No se ha confirmado ningún cambio. Comprueba la conexión y la configuración del servidor.';}
let cachedBoard=null,refreshPromise=null,toolbar=null,activeDialog=null,editorNoteId=null;
async function board(){const me=await protectedApi('me');let id;try{id=localStorage.getItem('pp:last-board');}catch{}const chosen=me.boards.find(b=>b.id===id)||me.boards[0];if(!chosen)throw Error('NOT_FOUND');return protectedApi('board/'+chosen.id);}

function openAttachments(){return new Promise((resolve,reject)=>{const r=indexedDB.open('postispop-note-attachments',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('attachments',{keyPath:'key'});s.createIndex('noteId','noteId',{unique:false});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function attachmentsFor(id){const db=await openAttachments();return new Promise((resolve,reject)=>{const t=db.transaction('attachments','readonly'),r=t.objectStore('attachments').index('noteId').getAll(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close();});}
async function clearAttachments(id){const db=await openAttachments();return new Promise((resolve,reject)=>{const t=db.transaction('attachments','readwrite'),s=t.objectStore('attachments'),r=s.index('noteId').openCursor(IDBKeyRange.only(id));r.onsuccess=()=>{const c=r.result;if(c){c.delete();c.continue();}};t.oncomplete=()=>{db.close();resolve();};t.onerror=t.onabort=()=>{db.close();reject(Error('CLEANUP_FAILED'));};});}
async function collectPayload(note){
  if(note.image)throw Error('REMOTE_IMAGE');
  for(const key of Object.keys(localStorage))if(key.startsWith('pp:draft:')&&key.endsWith(':'+note.id))throw Error('UNFINISHED_DRAFT');
  if(!note.id.startsWith('guest-')){const pending=await protectedApi('offline/note/'+note.id);if(pending.pending||pending.conflicts)throw Error('PENDING_CHANGES');}
  const files=await attachmentsFor(note.id);if(files.reduce((sum,f)=>sum+(f.blob?.size||0),0)>MAX_ATTACHMENT_BYTES)throw Error('ATTACHMENTS_TOO_LARGE');
  const attachments=await Promise.all(files.map(async f=>f.kind==='link'?{kind:'link',name:f.name,url:f.url}:{kind:'file',name:f.name,type:f.type||'application/octet-stream',data:bytesToBase64(new Uint8Array(await f.blob.arrayBuffer()))}));
  let style=note.style||null;
  if(!note.id.startsWith('guest-')){const data=await protectedApi('designs/styles?note_id='+encodeURIComponent(note.id));style=data.style||data.styles?.find(s=>s.note_id===note.id)||null;note.styleRevision=style?.revision||0;}
  return {text:note.text||'',marks:note.marks||[],paper:note.paper,doodle:note.doodle||'',image:null,style,attachments};
}
function purgeLegacyReads(){for(const key of Object.keys(localStorage))if(key.startsWith('pp:mobile:reads:'))localStorage.removeItem(key);}
async function cleanupProtected(note){localStorage.setItem(protectedMarker(note.id),'1');await clearAttachments(note.id);purgeLegacyReads();window.dispatchEvent(new CustomEvent('postispop:protected',{detail:{noteId:note.id}}));}
function makeDialog(title){
  activeDialog?.close();const el=node('dialog',undefined,'pp-vault-dialog');activeDialog=el;
  const header=node('div',undefined,'pp-vault-heading'),h=node('h2',title);h.id='pp-vault-title';el.setAttribute('aria-labelledby',h.id);
  const close=node('button','Cerrar','pp-vault-close');close.type='button';close.addEventListener('click',()=>el.close());header.append(h,close);el.append(header);
  const restore=document.activeElement;el.addEventListener('close',()=>{el.querySelectorAll('input,textarea').forEach(i=>i.value='');el.replaceChildren();el.remove();activeDialog=null;restore?.focus();},{once:true});document.body.append(el);el.showModal();return el;
}
function passwordInput(labelText,autocomplete='new-password'){
  const label=node('label',labelText),input=node('input');input.type='password';input.minLength=4;input.maxLength=256;input.autocomplete=autocomplete;input.required=true;label.append(input);return {label,input};
}
function vaultGraphic(){const el=node('div',undefined,'pp-vault-art');el.setAttribute('aria-hidden','true');el.append(node('span','✦','pp-vault-spark'),node('span','🔒','pp-vault-lock'));return el;}
function caution(el){el.append(node('p','Mínimo 4 caracteres; recomendamos una frase larga y única. Las claves cortas pueden adivinarse aunque el contenido esté cifrado.','pp-vault-help'),node('p','No hay recuperación de contraseña ni acceso administrativo al contenido. Guarda tu contraseña aparte.','pp-vault-help'));}
function busy(button,operation,status){button.disabled=true;status.textContent='Procesando de forma segura…';return operation().catch(error=>{status.textContent=protectedError(error);}).finally(()=>{button.disabled=false;});}

async function protect(note){
  const el=makeDialog('Proteger esta nota');el.append(vaultGraphic());
  el.append(node('p','El texto, el dibujo y los adjuntos locales de hasta 2 MB se cifrarán con una contraseña propia.'));
  caution(el);const form=node('form'),first=passwordInput('Contraseña de esta nota'),second=passwordInput('Repite la contraseña');form.append(first.label,second.label);
  const acknowledgment=node('label',undefined,'pp-vault-consent'),check=node('input');check.type='checkbox';check.required=true;acknowledgment.append(check,document.createTextNode(note.id.startsWith('guest-')?' Entiendo que se retirarán las versiones anteriores de este espacio de la papelera y los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias ya descargadas no se pueden retirar.':' Entiendo que los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias y versiones guardadas anteriormente fuera de esta nota no se pueden retirar.'));form.append(acknowledgment);
  const button=node('button','Cifrar y proteger','pp-vault-primary');button.type='submit';const status=node('p','','pp-vault-status');status.setAttribute('role','status');form.append(button,status);el.append(form);
  form.addEventListener('submit',event=>{event.preventDefault();busy(button,async()=>{
    if(first.input.value!==second.input.value){status.textContent='Las contraseñas no coinciden.';return;}
    await withNoteStorageLock(note.id,async()=>{
      const marker=protectedMarker(note.id),previous=localStorage.getItem(marker);let committed=false;
      localStorage.setItem(marker,'1');
      try{
        const payload=await collectPayload(note);const envelope=await encryptNote(payload,first.input.value);if(!el.isConnected)return;
        const saved=await protectedApi('note/'+note.id+'/protect',{revision:note.revision,styleRevision:note.styleRevision||0,purgeVersions:true,protectedEnvelope:envelope});committed=true;
        first.input.value='';second.input.value='';
        try{await cleanupProtected(saved.note||note);}catch{status.textContent=messages.CLEANUP_FAILED;await refresh();return;}
        el.close();location.reload();
      }finally{if(!committed){if(previous===null)localStorage.removeItem(marker);else localStorage.setItem(marker,previous);}}
    },{requireLock:true});
  },status);});first.input.focus();
}
export function renderProtectedPayload(container,payload,urls=[]){
  const body=node('p',payload.text,'pp-vault-content');container.append(body);
  if(payload.style){try{const style=normalizeStyle(payload.style);body.style.fontFamily=({sans:'PP Editorial',serif:'PP Clasica',mono:'PP Maquina',hand:'PP Manuscrita',rounded:'PP Redondeada',book:'PP Libro'})[style.font];body.style.fontSize=style.size+'px';body.style.fontStyle=style.italic?'italic':'normal';body.style.textDecoration=style.underline?'underline':'none';body.style.color=style.ink;container.dataset.vaultPaper=style.paper;if(style.drawing?.strokes?.length){const canvas=node('canvas');canvas.width=720;canvas.height=460;canvas.className='pp-vault-drawing';canvas.setAttribute('aria-label','Dibujo de la nota');drawStrokes(canvas.getContext('2d'),style.drawing,720,460);container.append(canvas);}}catch{container.append(node('p','El estilo original no es compatible con esta versión; se conserva dentro de la nota cifrada.','pp-vault-help'));}}
  if(payload.doodle)container.append(node('p','Sello: '+payload.doodle,'pp-vault-help'));
  renderAttachments(container,payload.attachments||[],urls);return body;
}
function renderAttachments(container,attachments,urls){
  if(!attachments.length)return;const list=node('ul',undefined,'pp-vault-files');
  attachments.forEach(item=>{const li=node('li'),a=node('a',item.name);if(item.kind==='link'){a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';}else{const url=URL.createObjectURL(new Blob([base64ToBytes(item.data)],{type:'application/octet-stream'}));urls.push(url);a.href=url;a.download=item.name;}li.append(a);list.append(li);});container.append(list);
}
async function shareControls(el,note,status){
  if(note.id.startsWith('guest-')){el.append(node('p','Las notas de invitado permanecen en este dispositivo. Para compartir por WhatsApp se necesita una nota de una cuenta y conexión.','pp-vault-help'));return;}
  const actions=node('div',undefined,'pp-vault-actions'),share=node('button','Crear enlace protegido'),revoke=node('button','Revocar todos los enlaces');share.type=revoke.type='button';actions.append(share,revoke);el.append(actions);
  share.addEventListener('click',()=>busy(share,async()=>{const result=await protectedApi('protected-shares',{noteId:note.id,expiresInDays:7});if(!/^[a-f0-9]{64}$/.test(result.token))throw Error('SERVER_UNAVAILABLE');const url=new URL('/compartir.html',location.origin);url.hash=result.token;const panel=node('div',undefined,'pp-vault-share'),link=node('a','Abrir WhatsApp');link.href='https://wa.me/?text='+encodeURIComponent('Te comparto una nota protegida de PostisPop. La contraseña te la comunicaré aparte. '+url.href);link.target='_blank';link.rel='noopener noreferrer';const copy=node('button','Copiar enlace');copy.type='button';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url.href);status.textContent='Enlace copiado. Envía la contraseña por separado.';}catch{status.textContent='No se pudo copiar. Usa el campo de enlace.';}});const field=node('input');field.readOnly=true;field.value=url.href;field.setAttribute('aria-label','Enlace protegido');panel.append(node('p','Caduca en 7 días. Comparte la contraseña por otro medio; nunca se incluye en el enlace.'),field,copy,link);el.append(panel);status.textContent='Enlace creado. Quien conozca el enlace podrá descargar el contenido cifrado.';},status));
  revoke.addEventListener('click',()=>busy(revoke,async()=>{await protectedApi('protected-shares/revoke-note',{noteId:note.id});el.querySelectorAll('.pp-vault-share').forEach(n=>n.remove());status.textContent='Enlaces revocados en el servidor. No se pueden retirar copias que alguien ya haya guardado.';},status));
}
async function unlock(note){
  const el=makeDialog('Nota protegida');el.append(vaultGraphic(),node('p','Tu nota permanece cifrada hasta que introduzcas su contraseña.'));
  const form=node('form'),pass=passwordInput('Contraseña','off'),button=node('button','Abrir nota','pp-vault-primary'),status=node('p','','pp-vault-status');button.type='submit';status.setAttribute('role','status');form.append(pass.label,button,status);el.append(form);
  let secret='',payload=null,urls=[];el.addEventListener('close',()=>{secret='';payload=null;urls.forEach(URL.revokeObjectURL);urls=[];},{once:true});
  form.addEventListener('submit',event=>{event.preventDefault();busy(button,async()=>{
    const entered=pass.input.value,result=await decryptNote(note.protectedEnvelope,entered);if(!el.isConnected)return;
    secret=entered;payload=result;pass.input.value='';form.remove();el.classList.add('is-unlocked');el.querySelector('.pp-vault-art')?.remove();
    el.append(node('p','Al cerrar o cambiar de aplicación, la nota se bloquea. Guarda antes de salir.','pp-vault-help'));
    const rendered=node('section');renderProtectedPayload(rendered,payload,urls);el.append(rendered);
    const editor=node('textarea');editor.value=payload.text;editor.maxLength=10000;editor.setAttribute('aria-label','Texto de la nota protegida');const original=rendered.querySelector('.pp-vault-content');editor.style.cssText=original.style.cssText;original.replaceWith(editor);
    const save=node('button','Guardar cifrada y cerrar','pp-vault-primary');save.type='button';el.append(save,status);
    save.addEventListener('click',()=>busy(save,async()=>{const updated={...payload,text:editor.value,marks:editor.value===payload.text?payload.marks:[]};const envelope=await encryptNote(updated,secret);if(!el.isConnected)return;await protectedApi('note/'+note.id+'/protected-save',{revision:note.revision,styleRevision:note.styleRevision||0,protectedEnvelope:envelope});el.close();await refresh();},status));
    await shareControls(el,note,status);status.textContent='El texto descifrado solo permanece en esta ventana.';
  },status);});pass.input.focus();
}
function decorate(){if(!cachedBoard)return;document.querySelectorAll('.sticky-note[data-note-id]').forEach(button=>{const note=cachedBoard.notes.find(n=>n.id===button.dataset.noteId);button.classList.toggle('pp-vault-locked',Boolean(note?.protectedEnvelope));if(note?.protectedEnvelope){try{localStorage.setItem(protectedMarker(note.id),'1');}catch{}button.setAttribute('aria-label','Nota protegida. Abrir con contraseña.');}});}
async function refresh(){if(refreshPromise)return refreshPromise;refreshPromise=(async()=>{cachedBoard=await board();decorate();if(toolbar?.isConnected){const select=toolbar.querySelector('select');const selected=select.value;select.replaceChildren(...cachedBoard.order.map((id,i)=>{const note=cachedBoard.notes.find(n=>n.id===id),option=node('option',`Nota ${i+1}${note?.protectedEnvelope?' · Protegida':''}`);option.value=id;return option;}));if(cachedBoard.notes.some(n=>n.id===selected))select.value=selected;}return cachedBoard;})().finally(()=>refreshPromise=null);return refreshPromise;}
function installEditorLock(){
 const editor=document.querySelector('.editor-dialog');if(!editor||editor.querySelector('.pp-vault-note-action')||!editorNoteId)return;
 const id=editorNoteId,button=node('button','🔒 Contraseña','pp-vault-note-action'),status=node('p','','pp-vault-note-status');button.type='button';status.setAttribute('role','status');
 editor.querySelector('.dialog-heading')?.append(button);editor.append(status);
 button.addEventListener('click',()=>busy(button,async()=>{await refresh();const note=cachedBoard?.notes.find(n=>n.id===id);if(!note)throw Error('NOT_FOUND');const text=editor.querySelector('textarea')?.value;if(text!==undefined&&text!==(note.text||'')){status.textContent='Espera a que termine el guardado de esta nota y vuelve a pulsar.';return;}const close=editor.querySelector('button[aria-label="Listo"]');if(!close){status.textContent='Cierra y vuelve a abrir la nota para continuar.';return;}close.click();await new Promise(resolve=>setTimeout(resolve,100));await protect(note);},status));
}
function install(){installEditorLock();const frame=document.querySelector('.board-frame:not(.is-loading)');if(!frame)return;decorate();if(toolbar?.isConnected)return;toolbar=node('section',undefined,'pp-vault-toolbar');toolbar.setAttribute('aria-label','Notas con contraseña');const label=node('label','Tu caja fuerte'),select=node('select');select.setAttribute('aria-label','Nota que quieres proteger o abrir');label.append(select);const button=node('button','Proteger o abrir'),status=node('span');button.type='button';status.setAttribute('role','status');toolbar.append(label,button,status);frame.after(toolbar);button.addEventListener('click',()=>busy(button,async()=>{const chosen=select.value;await refresh();const note=cachedBoard.notes.find(n=>n.id===chosen);if(!note)return;if(note.protectedEnvelope)await unlock(note);else await protect(note);},status));refresh().then(async result=>{for(const n of result.notes.filter(n=>n.protectedEnvelope)){try{await withNoteStorageLock(n.id,()=>cleanupProtected(n),{requireLock:true});}catch{status.textContent=messages.CLEANUP_FAILED;}}}).catch(()=>{status.textContent='Abre una pizarra para usar las notas protegidas.';});}
if(typeof document!=='undefined'&&!document.body?.hasAttribute('data-protected-share')){
  document.addEventListener('click',event=>{const target=event.target.closest?.('.sticky-note[data-note-id]');if(target)editorNoteId=target.dataset.noteId;const note=cachedBoard?.notes.find(n=>n.id===target?.dataset.noteId);if(note?.protectedEnvelope){event.preventDefault();event.stopImmediatePropagation();unlock(note).catch(()=>{});}},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)activeDialog?.close();});
  let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;install();});}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('storage',event=>{if(event.key==='postispop-supabase-session'||event.key==='pp:last-board'){activeDialog?.close();cachedBoard=null;refresh().catch(()=>{});}});
  window.addEventListener('postispop:session-change',()=>{activeDialog?.close();cachedBoard=null;refresh().catch(()=>{});});
  window.addEventListener('postispop:save',e=>{if(e.detail?.state==='saved')refresh().catch(()=>{});});install();
}
