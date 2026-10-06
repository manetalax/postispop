import {track} from './usage-metrics.js';
import {drawStrokes} from './style-model.js';
import {normalizeBackup,LOCAL_BACKUP_BYTES,createBoardBackup,verifyBackupAttachments} from './backup-import.js';

let tools=null, options=null, searchTools=null, lastFocus=null;
export async function download(name,body,type='application/json') {
  const url=URL.createObjectURL(body instanceof Blob?body:new Blob([body],{type}));
  if(window.__postispopNative){
    try {
      if(typeof window.__postispopSaveDownload!=='function')throw new Error('No se pudo abrir la descarga. Cierra y vuelve a abrir la aplicación.');
      return await window.__postispopSaveDownload(url,name);
    } catch(error) { throw Object.assign(new Error(error?.message||'No se pudo guardar el archivo. Vuelve a intentarlo.'),{code:error?.code||'DOWNLOAD_FAILED'}); }
    finally { URL.revokeObjectURL(url); }
  }
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  return true;
}
const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
async function api(endpoint,payload) {
  const r=await fetch('/api/'+endpoint,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok)throw new Error(data.error||'REQUEST_FAILED');return data;
}
async function currentBoard() {
  const me=await api('me');let selected;try{selected=localStorage.getItem('pp:last-board');}catch{}
  const board=me.boards.find(b=>b.id===selected)||me.boards[0];
  if(!board)throw new Error('BOARD_NOT_FOUND');
  const data=await api('board/'+board.id);
  if(data.id!=='guest-board'){
    // A missing style response is not an empty drawing. Exports must stop if
    // the required read fails, instead of advertising a partial backup.
    const styleData=await api('designs/styles'),{styles}=styleData;
    if(!Array.isArray(styles)||(styleData.offline&&!data.offline))throw new Error('STYLES_UNAVAILABLE');
    for(const note of data.notes){if(!note.protectedEnvelope)note.style=styles.find(s=>s.note_id===note.id)||null;}
  }
  return data;
}
function message(value){const node=searchTools?.querySelector('[role=status]');if(node)node.textContent=value;}
function dialog(title,returnFocus=document.activeElement) {
  lastFocus=returnFocus;
  const el=document.createElement('dialog');el.className='pp-feature-dialog';
  el.setAttribute('aria-labelledby','pp-feature-title');
  const heading=text('h2',title);heading.id='pp-feature-title';el.append(heading);
  const close=text('button','Cerrar');close.type='button';close.addEventListener('click',()=>el.close());el.append(close);
  el.addEventListener('close',()=>{el.remove();lastFocus?.focus();},{once:true});document.body.append(el);el.showModal();return el;
}
const ordered=board=>board.order.map(id=>board.notes.find(n=>n.id===id)).filter(Boolean);
async function exportJson(){
  message('Preparando la copia…');
  const board=await currentBoard(),backup=await createBoardBackup(board);
  if(!await download('PostisPop-copia.json',JSON.stringify(backup))){message('Descarga cancelada. Tus notas se conservan.');return;}
  track('export');
  message('Copia completa descargada: notas, dibujos y adjuntos de este dispositivo. Las notas protegidas permanecen cifradas.');
}
async function exportPng() {
  message('Preparando la imagen…');
  const board=await currentBoard(), notes=ordered(board);
  // Preserve every page at the same readable scale. The supported 100-note
  // board needs at most 1600 × 8724 pixels (under 56 MB of RGBA storage).
  if(notes.length>100)throw new Error('IMAGE_EXPORT_TOO_LARGE');
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1200+Math.max(0,Math.ceil(notes.length/4)-3)*342;
  try {
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('IMAGE_EXPORT_FAILED');
  ctx.fillStyle='#f6f2e9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#172339';ctx.font='bold 40px sans-serif';ctx.fillText((board.title||'Mi pizarra').slice(0,60),50,64);
  const colors=['#ffec86','#ffc5d2','#b9e0f8','#f9f0d7','#c5e7bd','#d9c8f3'];
  notes.forEach((n,i)=>{
    const x=50+(i%4)*385,y=100+Math.floor(i/4)*342;
    ctx.fillStyle=colors[n.paper]||colors[0];ctx.fillRect(x,y,360,315);ctx.fillStyle='#172339';ctx.font='bold 17px sans-serif';ctx.fillText('NOTA '+(i+1),x+20,y+30);ctx.font='22px sans-serif';
    const content=n.protectedEnvelope?'Nota protegida':n.text||'';
    const lines=[];for(const paragraph of content.split('\n')){let line='';for(const word of paragraph.split(/\s+/)){for(const piece of word.match(/.{1,24}/gu)||['']){const next=line?line+' '+piece:piece;if(ctx.measureText(next).width>320&&line){lines.push(line);line=piece;}else line=next;}}lines.push(line);}
    const hasDrawing=!n.protectedEnvelope&&n.style?.drawing?.strokes?.length;
    const limit=hasDrawing?4:8;lines.slice(0,limit).forEach((line,j)=>ctx.fillText(line+(j===limit-1&&lines.length>limit?'…':''),x+20,y+65+j*28,320));
    if(hasDrawing){const sketch=document.createElement('canvas');sketch.width=320;sketch.height=135;drawStrokes(sketch.getContext('2d'),n.style.drawing,320,135);ctx.drawImage(sketch,x+20,y+170);}
  });
  ctx.font='16px sans-serif';ctx.fillText('PostisPop · Vista de texto resumida · Guarda una copia de seguridad para conservar todo el texto.',50,canvas.height-25);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('IMAGE_EXPORT_FAILED')),'image/png'));
  canvas.width=0;canvas.height=0;
  if(!await download('PostisPop-pizarra.png',blob,'image/png')){message('Descarga cancelada. Tus notas se conservan.');return;}
  track('export');message('PNG descargado: '+notes.length+' notas, con texto resumido, colores y trazos. Las notas protegidas siguen cerradas; no se incluyen adjuntos.');
  } finally { canvas.width=0;canvas.height=0; }
}
async function printPdf() {
  const board=await currentBoard();const frame=document.createElement('iframe');frame.title='Vista de impresión';frame.style.cssText='position:fixed;width:1px;height:1px;left:-9999px;border:0';document.body.append(frame);
  const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>PostisPop · Exportación</title><style>body{font:12pt system-ui;color:#172339;margin:24px}article{break-inside:avoid;border:1px solid #aeb9ca;padding:16px;margin:12px 0}p{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:24pt}h2{font-size:14pt}@page{size:A4;margin:15mm}</style></head><body></body></html>');doc.close();
  const h=doc.createElement('h1');h.textContent=board.title||'Mi pizarra';doc.body.append(h);
  ordered(board).filter(n=>n.text||n.doodle||n.image||n.protectedEnvelope||n.style?.drawing?.strokes?.length).forEach((n,i)=>{const article=doc.createElement('article'),head=doc.createElement('h2'),body=doc.createElement('p');head.textContent='Nota '+(i+1);body.textContent=n.protectedEnvelope?'Nota protegida':n.text||'(Nota sin texto)';article.append(head,body);if(!n.protectedEnvelope&&(n.doodle||n.image||n.style?.drawing?.strokes?.length)){const hint=doc.createElement('p');hint.textContent='Esta nota contiene un dibujo o imagen que no se incluye en esta impresión de texto.';article.append(hint);}doc.body.append(article);});
  const foot=doc.createElement('p');foot.textContent='Exportación de texto · Los archivos adjuntos no están incluidos.';doc.body.append(foot);
  frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});
  frame.contentWindow.focus();frame.contentWindow.print();track('export');message('Elige «Guardar como PDF» en la ventana de impresión.');setTimeout(()=>frame.remove(),120000);
}
const importError=error=>({
  BOARD_FULL:'No hay suficientes notas vacías o la copia supera el límite de tu plan. No se ha sustituido ninguna nota.',
  NOTE_LIMIT:'La copia supera el límite de notas de tu plan. No se ha importado ninguna nota.',
  OWNER_REQUIRED:'Solo la persona propietaria de la pizarra puede importar notas.',
  SYNC_PENDING_BEFORE_IMPORT:'Sincroniza los cambios pendientes y resuelve los conflictos antes de importar.',
  IMPORT_UNAVAILABLE:'La importación en cuentas aún no está habilitada en el servidor. Conserva tu copia.',
  OFFLINE:'Conéctate a internet para importar en tu cuenta. La pizarra local funciona sin conexión.',
  SESSION_CHANGED:'La cuenta ha cambiado. Cierra este diálogo y vuelve a abrir la importación.',
  SESSION_REQUIRED:'Inicia sesión de nuevo antes de importar.',
  INVALID_BACKUP:'La copia no es compatible o contiene una nota dañada. No se ha importado ninguna nota.',
  STYLE_LOCKED:'La copia usa un estilo que tu plan no incluye. No se ha importado ninguna nota.',
  INVALID_STYLE:'La copia contiene un estilo no compatible. No se ha importado ninguna nota.',
  INVALID_ENVELOPE:'La copia contiene una nota cifrada dañada. No se ha importado ninguna nota.',
  BACKUP_TOO_LARGE:'El archivo supera el tamaño máximo indicado.',
  LOCAL_STORAGE_FULL:'El almacenamiento de este dispositivo está lleno. Conserva el archivo de copia.',
  IMPORT_STORAGE_UNAVAILABLE:'No se pudo preparar un reintento seguro. Libera almacenamiento y conserva tu copia.',
  STORAGE_LOCK_UNAVAILABLE:'Este navegador no permite coordinar la importación con los adjuntos. Prueba un navegador actualizado.',
  INVALID_ATTACHMENT:'La copia contiene un adjunto no compatible. No se ha restaurado.',
  ATTACHMENT_INTEGRITY:'Un archivo de la copia está dañado. Conserva el original y vuelve a exportarlo.',
  ATTACHMENT_MAPPING_FAILED:'No se pudo vincular cada archivo a su nota. Conserva la copia y reintenta.',
  ATTACHMENT_RESTORE_FAILED:'No se pudieron guardar los archivos en este dispositivo. Libera espacio y reintenta con la misma copia.',
  ATTACHMENT_ROLLBACK_FAILED:'No se pudo deshacer una restauración de archivos incompleta. Conserva tu copia y vuelve a intentarlo.',
  ATTACHMENT_CHECK_UNAVAILABLE:'No se pudieron comprobar los adjuntos locales. Cierra otras pestañas y vuelve a intentarlo.',
  IMPORT_RETRY_REQUIRED:'La pizarra cambió durante la restauración. Vuelve a intentarlo con la misma copia; no se duplicarán las notas ya añadidas.',
  IDEMPOTENCY_CONFLICT:'Este reintento no coincide con la copia original. Conserva el archivo y vuelve a abrir el diálogo.'
}[error.message]||'No se pudo confirmar el resultado. Reintenta con la misma copia; la importación en cuenta evita duplicar un envío ya completado.');
const exportError=error=>{
  if(error.code==='DOWNLOAD_FAILED'||/^NATIVE_DOWNLOAD_/.test(error.code||''))return error.message;
  return {
    IMAGE_EXPORT_TOO_LARGE:'La imagen admite hasta 100 notas. Guarda una copia de seguridad para conservar la pizarra completa.',
    IMAGE_EXPORT_FAILED:'No se pudo generar la imagen. Vuelve a intentarlo o guarda una copia de seguridad. Tus notas se conservan.',
    BACKUP_TOO_LARGE:'La copia completa supera 50 MB. Descarga los archivos por separado antes de reducir sus adjuntos. Tus notas se conservan.',
    NOTE_PROTECTED:'Una nota acaba de protegerse. Vuelve a guardar la copia para incluir su versión cifrada.'
  }[error.message]||'No se pudo completar la operación. No se ha descargado una copia incompleta. Tus notas se conservan.';
};
async function showImport(initialFile,returnFocus=document.activeElement){
  const board=await currentBoard(),el=dialog('Restaurar una copia de seguridad',returnFocus),cloud=board.id!=='guest-board',maxBytes=LOCAL_BACKUP_BYTES;
  el.append(text('p','Añade texto, colores, estilos, dibujos y notas cifradas a espacios vacíos. Incluye los archivos y enlaces de la copia. Los archivos se restauran en este dispositivo; las notas protegidas conservan su cifrado. Las notas actuales se conservan. Máximo 50 MB.'));
  if(cloud)el.append(text('p','Necesita conexión. Se respetan el límite de tu plan y los espacios disponibles. Los adjuntos locales de otro dispositivo no pueden comprobarse aquí.'));
  const label=text('label','Selecciona una copia de PostisPop'),file=document.createElement('input');file.type='file';file.accept='.json,application/json';label.append(file);el.append(label);
  const status=text('p','');status.setAttribute('role','status');el.append(status);
  const submit=text('button','Añadir a las notas vacías');submit.type='button';submit.disabled=true;el.append(submit);
  let prepared=null,selection=0;
  const preview=async selected=>{
    const generation=++selection;prepared=null;submit.disabled=true;
    if(!selected){status.textContent='Selecciona una copia para revisar cuántas notas contiene.';return;}
    try{
      if(selected.size>maxBytes)throw Error('BACKUP_TOO_LARGE');
      let data;try{data=JSON.parse(await selected.text());}catch{throw Error('INVALID_BACKUP');}
      const normalized=normalizeBackup(data,{maxNotes:cloud?100:12,maxBytes});
      await verifyBackupAttachments(normalized.notes);
      if(generation!==selection)return;
      prepared=normalized;
      status.textContent=normalized.notes.length?selected.name+' · '+normalized.notes.length+' notas con contenido. Se añadirán sin sustituir las actuales.':'La copia no contiene notas para añadir.';
      submit.disabled=!normalized.notes.length;
    }catch(error){if(generation===selection)status.textContent=importError(error);}
  };
  file.addEventListener('change',()=>{initialFile=null;void preview(file.files[0]);});
  submit.addEventListener('click',async()=>{
    if(!prepared)return;submit.disabled=true;file.disabled=true;status.textContent='Importando la copia…';
    try{await api('board/'+board.id+'/import',prepared);location.reload();}
    catch(error){status.textContent=importError(error);submit.disabled=false;file.disabled=false;}
  });
  void preview(initialFile);
}
window.addEventListener('postispop:import-legacy',event=>{showImport(event.detail?.file).catch(()=>message('No se pudo abrir la restauración. Conserva tu archivo de copia.'));});
function filter(){
  const query=searchTools.querySelector('[type=search]').value.trim();
  const color=searchTools.querySelector('select').value;
  window.dispatchEvent(new CustomEvent('postispop:filter',{detail:{query,color}}));
  message(query||color?'Búsqueda en todas tus notas. Las notas protegidas no exponen su texto.':'');
}
export function initBoardTools(){
  const board=document.querySelector('.board-frame:not(.is-loading)');if(!board)return;
  if(tools?.isConnected)return;
  searchTools?.remove();
  options=document.createElement('details');options.className='pp-board-options';
  const summary=text('summary','⋯');summary.title='Opciones de la pizarra';summary.setAttribute('aria-label','Opciones avanzadas');options.append(summary);
  tools=document.createElement('div');tools.className='pp-tools';tools.setAttribute('aria-label','Herramientas de la pizarra');
  searchTools=document.createElement('section');searchTools.className='pp-tools pp-note-search';searchTools.setAttribute('aria-label','Buscar en tus notas');board.before(searchTools);
  const search=document.createElement('input');search.type='search';search.placeholder='Buscar notas o #etiqueta';search.setAttribute('aria-label','Buscar notas o etiquetas');searchTools.append(search);
  const colors=document.createElement('select');colors.setAttribute('aria-label','Filtrar por color');['Todos los colores','Amarillo','Rosa','Azul','Crema','Verde','Violeta'].forEach((label,i)=>{const opt=text('option',label);opt.value=i===0?'':String(i-1);colors.append(opt);});searchTools.append(colors);
  let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,180);});colors.addEventListener('change',filter);
  window.addEventListener('postispop:clear-filter',()=>{if(!searchTools?.contains(search))return;clearTimeout(timer);search.value='';colors.value='';filter();});
  const operations=[['Guardar una copia',exportJson],['Restaurar una copia',trigger=>showImport(undefined,trigger)],['Descargar imagen',exportPng],['Imprimir',printPdf]];
  operations.forEach(([name,fn])=>{const button=text('button',name);button.type='button';button.addEventListener('click',async()=>{button.disabled=true;try{await fn(button);}catch(error){message(exportError(error));}finally{button.disabled=false;}});tools.append(button);});
  const installHelp=text('a','Descargas e instalación');installHelp.href='/descargas/';tools.append(installHelp);
  const install=text('button','Instalar aplicación');install.type='button';install.dataset.experience='install';install.hidden=true;tools.append(install);
  const status=text('span','');status.className='pp-search-status';status.setAttribute('role','status');searchTools.append(status);options.append(tools);searchTools.append(options);
}
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,[contenteditable=true],dialog,[role=dialog]'))return;
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey){if(!tools?.isConnected)return;event.preventDefault();searchTools?.querySelector('[type=search]')?.focus();}
  if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==='e'){if(!tools?.isConnected)return;event.preventDefault();options.open=true;exportJson().catch(error=>message(exportError(error)));}
});
