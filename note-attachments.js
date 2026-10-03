import {withNoteStorageLock,assertAttachmentWritable,protectedMarker} from './attachment-lock.js';
const DB_NAME = 'postispop-note-attachments';
const STORE = 'attachments';
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ACCEPT = [
  'image/*', 'audio/*', 'video/*', 'application/pdf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'
].join(',');

let activeNoteId = '';
let recorder = null;
let recordingStream = null;
let recordedChunks = [];
let objectUrls = [];

const labels = {
  title: 'Archivos adjuntos', add: 'Añadir archivos', link: 'Añadir enlace',
  voice: 'Grabar voz', stop: 'Detener', empty: 'Todavía no hay adjuntos.',
  local: 'Se guardan de forma privada en este dispositivo.', remove: 'Eliminar adjunto',
  invalid: 'Este tipo de archivo no es compatible.', tooLarge: 'El archivo supera el límite de 25 MB.',
  failed: 'No se pudo guardar el adjunto.', url: 'Pega una dirección web', save: 'Guardar enlace', cancel: 'Cancelar'
};

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(STORE, { keyPath: 'key' });
      store.createIndex('noteId', 'noteId', { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(mode, run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = run(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

async function listForNote(noteId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).index('noteId').getAll(noteId);
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.created - b.created));
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

function extension(name = '') {
  return name.toLowerCase().split('.').pop();
}

function supported(file) {
  const ext = extension(file.name);
  return file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/') ||
    file.type === 'application/pdf' || ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'].includes(ext);
}

function category(item) {
  if (item.kind === 'link') return 'link';
  const type = item.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf' || extension(item.name) === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(extension(item.name))) return 'word';
  if (['xls', 'xlsx'].includes(extension(item.name))) return 'excel';
  if (['ppt', 'pptx'].includes(extension(item.name))) return 'powerpoint';
  if (extension(item.name) === 'zip') return 'zip';
  return 'file';
}

function icon(kind) {
  return ({ image: '🖼️', audio: '🎧', video: '🎬', pdf: 'PDF', word: 'W', excel: 'X',
    powerpoint: 'P', zip: 'ZIP', link: '🔗', file: '📎' })[kind];
}

function humanSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function notify(message) {
  let toast = document.querySelector('.pp-attachment-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'pp-attachment-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

async function saveFiles(files, noteId=activeNoteId) {
  if (!noteId) return;
  try { await withNoteStorageLock(noteId, async()=>{
    await assertAttachmentWritable(noteId);
    for (const file of files) {
      if (!supported(file)) { notify(labels.invalid); continue; }
      if (file.size > MAX_FILE_BYTES) { notify(`${file.name}: ${labels.tooLarge}`); continue; }
      const id=crypto.randomUUID(),item={key:`${noteId}::${id}`,id,noteId,kind:'file',name:file.name||`audio-${Date.now()}.webm`,type:file.type,size:file.size,created:Date.now(),blob:file};
      await transaction('readwrite',store=>store.put(item));
    }
  }); } catch(error) { notify(error.message==='NOTE_PROTECTED'?'La nota se ha protegido. Este adjunto no se ha guardado sin cifrar.':labels.failed); }
  if(activeNoteId===noteId)await renderList();
}

async function saveLink(raw, noteId=activeNoteId) {
  if (!noteId) return;
  let url;try{url=new URL(raw.trim());}catch{notify('Escribe un enlace válido.');return;}
  if(!['http:','https:'].includes(url.protocol)){notify('El enlace debe comenzar por http:// o https://');return;}
  try{await withNoteStorageLock(noteId,async()=>{
    await assertAttachmentWritable(noteId);
    const id=crypto.randomUUID();const item={key:`${noteId}::${id}`,id,noteId,kind:'link',name:url.hostname,url:url.href,created:Date.now(),size:0,type:'text/uri-list'};
    await transaction('readwrite',store=>store.put(item));
  });}catch(error){notify(error.message==='NOTE_PROTECTED'?'La nota se ha protegido. El enlace no se ha guardado sin cifrar.':labels.failed);}
  if(activeNoteId===noteId)await renderList();
}

async function removeItem(key) {
  const noteId=key.split('::')[0];
  try{await withNoteStorageLock(noteId,async()=>{await assertAttachmentWritable(noteId);await transaction('readwrite',store=>store.delete(key));});}
  catch{notify('No se pudo modificar el adjunto. La nota puede estar protegida.');}
  if(activeNoteId===noteId)await renderList();
}

function makeMedia(item, url, kind) {
  if (kind === 'image') {
    const img = document.createElement('img'); img.src = url; img.alt = item.name; img.loading = 'lazy'; return img;
  }
  if (kind === 'audio' || kind === 'video') {
    const media = document.createElement(kind); media.src = url; media.controls = true; media.preload = 'metadata'; return media;
  }
  return null;
}

async function renderList() {
  const list = document.querySelector('.pp-attachments-list');
  if (!list || !activeNoteId) return;
  const renderingNoteId=activeNoteId;
  try{await assertAttachmentWritable(renderingNoteId);}catch{objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];list.replaceChildren();const message=document.createElement('p');message.textContent='Adjuntos cerrados: la nota está protegida o ya no está disponible.';list.append(message);return;}
  objectUrls.forEach(URL.revokeObjectURL); objectUrls = [];
  let items = [];
  try { items = await listForNote(renderingNoteId); } catch { notify(labels.failed); }
  if(activeNoteId!==renderingNoteId||!list.isConnected)return;
  if(localStorage.getItem(protectedMarker(renderingNoteId))==='1'){list.replaceChildren();return;}
  list.replaceChildren();
  list.classList.toggle('is-empty', items.length === 0);
  if (!items.length) {
    const empty = document.createElement('p'); empty.className = 'pp-attachments-empty'; empty.textContent = labels.empty; list.append(empty); return;
  }
  for (const item of items) {
    const kind = category(item);
    const card = document.createElement('article'); card.className = `pp-attachment-card kind-${kind}`;
    let url = item.url;
    if (item.blob) { url = URL.createObjectURL(item.blob); objectUrls.push(url); }
    const media = item.blob && makeMedia(item, url, kind);
    if (media) card.append(media);
    const row = document.createElement('div'); row.className = 'pp-attachment-row';
    const badge = document.createElement('span'); badge.className = 'pp-attachment-icon'; badge.textContent = icon(kind);
    const details = document.createElement('div'); details.className = 'pp-attachment-details';
    const open = document.createElement('a'); open.href = url; open.target = '_blank'; open.rel = 'noopener noreferrer';
    if (item.blob) {
      open.download = item.name;
      open.textContent = item.name;
    } else {
      open.textContent = item.url;
    }
    const meta = document.createElement('small'); meta.textContent = item.kind === 'link' ? item.name : `${kind.toUpperCase()} · ${humanSize(item.size)}`;
    details.append(open, meta);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'pp-attachment-remove';
    remove.setAttribute('aria-label', labels.remove); remove.title = labels.remove; remove.textContent = '×';
    remove.addEventListener('click', () => removeItem(item.key));
    row.append(badge, details, remove); card.append(row); list.append(card);
  }
}

function toggleLinkForm(panel, show) {
  const form = panel.querySelector('.pp-link-form');
  form.hidden = !show;
  if (show) form.querySelector('input').focus();
}

async function toggleRecording(button) {
  if (recorder?.state === 'recording') { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { notify('La grabación de voz no está disponible.'); return; }
  try {
    const recordedNoteId=activeNoteId;await assertAttachmentWritable(recordedNoteId);
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    const preferred = ['audio/webm;codecs=opus', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(recordingStream, preferred ? { mimeType: preferred } : undefined);
    recorder.ondataavailable = event => { if (event.data.size) recordedChunks.push(event.data); };
    recorder.onstop = async () => {
      const type = recorder.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'm4a' : 'webm';
      const blob = new Blob(recordedChunks, { type });
      await saveFiles([new File([blob], `Nota-de-voz-${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`, { type })],recordedNoteId);
      recordedChunks=[];
      recordingStream?.getTracks().forEach(track => track.stop()); recordingStream = null;
      button.classList.remove('is-recording'); button.querySelector('span').textContent = labels.voice;
    };
    recorder.start(); button.classList.add('is-recording'); button.querySelector('span').textContent = labels.stop;
  } catch { notify('No se ha podido acceder al micrófono.'); }
}

function createPanel() {
  const panel = document.createElement('section'); panel.className = 'pp-attachments'; panel.setAttribute('aria-label', labels.title);
  panel.innerHTML = `
    <div class="pp-attachments-heading"><div><strong>${labels.title}</strong><small>${labels.local}</small></div></div>
    <div class="pp-attachment-actions">
      <label class="pp-attachment-action pp-file-action">📎 <span>${labels.add}</span><input type="file" multiple accept="${ACCEPT}"></label>
      <button type="button" class="pp-attachment-action pp-voice-action">🎙️ <span>${labels.voice}</span></button>
      <button type="button" class="pp-attachment-action pp-link-action">🔗 <span>${labels.link}</span></button>
    </div>
    <form class="pp-link-form" hidden><input type="url" inputmode="url" placeholder="${labels.url}" aria-label="${labels.url}"><button type="submit">${labels.save}</button><button type="button" class="pp-link-cancel">${labels.cancel}</button></form>
    <div class="pp-attachments-list" aria-live="polite"></div>`;
  panel.querySelector('input[type=file]').addEventListener('change', async event => {
    const input=event.currentTarget,noteId=activeNoteId;await saveFiles([...input.files],noteId); input.value='';
  });
  panel.querySelector('.pp-voice-action').addEventListener('click', event => toggleRecording(event.currentTarget));
  panel.querySelector('.pp-link-action').addEventListener('click', () => toggleLinkForm(panel, true));
  panel.querySelector('.pp-link-cancel').addEventListener('click', () => toggleLinkForm(panel, false));
  panel.querySelector('.pp-link-form').addEventListener('submit', async event => {
    event.preventDefault(); const input = event.currentTarget.querySelector('input');
    await saveLink(input.value); input.value = ''; toggleLinkForm(panel, false);
  });
  return panel;
}

function noteIdFromDialog(dialog) {
  if (activeNoteId) return activeNoteId;
  const match = dialog.querySelector('.dialog-heading')?.textContent.match(/(\d+)/);
  if (!match) return '';
  return document.querySelectorAll('.sticky-note')[Number(match[1]) - 1]?.dataset.noteId || '';
}

async function enhanceEditor() {
  const dialog = document.querySelector('.editor-dialog');
  if (!dialog || dialog.querySelector('.pp-attachments')) return;
  activeNoteId = noteIdFromDialog(dialog);
  if (!activeNoteId) return;
  const anchor = dialog.querySelector('.edit-paper');
  if (!anchor) return;
  anchor.insertAdjacentElement('afterend', createPanel());
  await renderList();
}

document.addEventListener('pointerdown', event => {
  const note = event.target.closest?.('.sticky-note[data-note-id]');
  if (note) activeNoteId = note.dataset.noteId;
}, true);
document.addEventListener('click', event => {
  const note = event.target.closest?.('.sticky-note[data-note-id]');
  if (note) activeNoteId = note.dataset.noteId;
}, true);

const observer = new MutationObserver(() => enhanceEditor());
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceEditor();

function closeProtectedAttachments(id){
  if(!id||id!==activeNoteId)return;
  objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];
  const panel=document.querySelector('.pp-attachments');if(panel){panel.replaceChildren();const text=document.createElement('p');text.textContent='Esta nota se está protegiendo. Cierra el editor y ábrela con su contraseña.';panel.append(text);}
  const editor=document.querySelector('.editor-dialog');editor?.querySelectorAll('textarea,input,button').forEach(input=>{if(!input.classList.contains('icon-button')&&!input.disabled){input.dataset.ppStorageDisabled='1';input.disabled=true;}});
}
window.addEventListener('storage',event=>{if(event.key!==protectedMarker(activeNoteId))return;if(event.newValue==='1')closeProtectedAttachments(activeNoteId);else if(event.newValue===null){document.querySelectorAll('[data-pp-storage-disabled]').forEach(input=>{input.disabled=false;delete input.dataset.ppStorageDisabled;});document.querySelector('.pp-attachments')?.remove();enhanceEditor();}});
window.addEventListener('postispop:protected',event=>closeProtectedAttachments(event.detail?.noteId));
