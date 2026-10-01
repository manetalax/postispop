import {track} from './usage-metrics.js';

const templates = {
  'Lista de tareas':['Por hacer\n#tareas','En marcha\n#tareas','Terminado\n#tareas'],
  'Plan semanal':['Lunes:','Martes:','Miércoles:','Jueves:','Viernes:','Fin de semana:'],
  'Reunión':['Objetivo de la reunión','Temas para tratar','Decisiones','Próximos pasos · Responsable · Fecha'],
  'Estudio':['Pregunta clave\n#estudio','Explícalo con tus palabras','Ejemplo práctico','Qué repasar mañana'],
  'Lluvia de ideas':['El reto que queremos resolver','Ideas sin filtrar','Ideas para explorar','Primer experimento'],
  'Objetivos':['Mi objetivo','Por qué me importa','Primer paso','Cómo mediré el avance'],
  'Compras':['Alimentación\n#compras','Hogar\n#compras','Otros\n#compras'],
  'Hábitos':['Hábito que quiero practicar','Cuándo y dónde','Versión mínima para días difíciles','Revisión semanal']
};
let tools=null, lastFocus=null;
export function download(name,body,type='application/json') {
  const url=URL.createObjectURL(body instanceof Blob?body:new Blob([body],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
async function api(endpoint,payload) {
  const r=await fetch('/api/'+endpoint,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok)throw new Error(data.error||'REQUEST_FAILED');return data;
}
async function currentBoard() {
  const me=await api('me');let selected;try{selected=localStorage.getItem('pp:last-board');}catch{}
  const board=me.boards.find(b=>b.id===selected)||me.boards[0];
  if(!board)throw new Error('BOARD_NOT_FOUND');return api('board/'+board.id);
}
function message(value){const node=tools?.querySelector('[role=status]');if(node)node.textContent=value;}
function dialog(title) {
  lastFocus=document.activeElement;
  const el=document.createElement('dialog');el.className='pp-feature-dialog';
  el.setAttribute('aria-labelledby','pp-feature-title');
  const heading=text('h2',title);heading.id='pp-feature-title';el.append(heading);
  const close=text('button','Cerrar');close.type='button';close.addEventListener('click',()=>el.close());el.append(close);
  el.addEventListener('close',()=>{el.remove();lastFocus?.focus();},{once:true});document.body.append(el);el.showModal();return el;
}
const ordered=board=>board.order.map(id=>board.notes.find(n=>n.id===id)).filter(Boolean);
function exportData(board){return {format:'postispop',version:1,title:board.title,exportedAt:new Date().toISOString(),notes:ordered(board).map(({text,marks,paper,doodle,image})=>({text,marks,paper,doodle,image}))};}
async function exportJson(){const board=await currentBoard();download('PostisPop-copia.json',JSON.stringify(exportData(board),null,2));track('export');message('Copia descargada. Los archivos adjuntos locales se guardan por separado y no se incluyen.');}
async function exportPng() {
  const board=await currentBoard(), notes=ordered(board);
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1200;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f6f2e9';ctx.fillRect(0,0,1600,1200);ctx.fillStyle='#172339';ctx.font='bold 40px sans-serif';ctx.fillText((board.title||'Mi pizarra').slice(0,60),50,64);
  const colors=['#fff0a2','#f6c4d7','#cde7f5','#d8ecc2','#e4d2f4','#f9d0a1'];
  notes.forEach((n,i)=>{
    const x=50+(i%4)*385,y=100+Math.floor(i/4)*342;
    ctx.fillStyle=colors[n.paper]||colors[0];ctx.fillRect(x,y,360,315);ctx.fillStyle='#172339';ctx.font='bold 17px sans-serif';ctx.fillText('NOTA '+(i+1),x+20,y+30);ctx.font='22px sans-serif';
    const lines=[];for(const paragraph of (n.text||'').split('\n')){let line='';for(const word of paragraph.split(/\s+/)){for(const piece of word.match(/.{1,24}/gu)||['']){const next=line?line+' '+piece:piece;if(ctx.measureText(next).width>320&&line){lines.push(line);line=piece;}else line=next;}}lines.push(line);}
    lines.slice(0,8).forEach((line,j)=>ctx.fillText(line+(j===7&&lines.length>8?'…':''),x+20,y+65+j*28,320));
  });
  ctx.font='16px sans-serif';ctx.fillText('PostisPop · Vista de texto resumida · Usa la copia JSON para conservar todo el texto.',50,1175);
  canvas.toBlob(blob=>{if(blob){download('PostisPop-pizarra.png',blob,'image/png');track('export');message('PNG descargado: vista resumida del texto y los colores, sin adjuntos ni dibujos.');}},'image/png');
}
async function printPdf() {
  const board=await currentBoard();const frame=document.createElement('iframe');frame.title='Vista de impresión';frame.style.cssText='position:fixed;width:1px;height:1px;left:-9999px;border:0';document.body.append(frame);
  const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>PostisPop · Exportación</title><style>body{font:12pt system-ui;color:#172339;margin:24px}article{break-inside:avoid;border:1px solid #aeb9ca;padding:16px;margin:12px 0}p{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:24pt}h2{font-size:14pt}@page{size:A4;margin:15mm}</style></head><body></body></html>');doc.close();
  const h=doc.createElement('h1');h.textContent=board.title||'Mi pizarra';doc.body.append(h);
  ordered(board).filter(n=>n.text||n.doodle||n.image).forEach((n,i)=>{const article=doc.createElement('article'),head=doc.createElement('h2'),body=doc.createElement('p');head.textContent='Nota '+(i+1);body.textContent=n.text||'(Nota sin texto)';article.append(head,body);if(n.doodle||n.image){const hint=doc.createElement('p');hint.textContent='Esta nota contiene un dibujo o imagen que no se incluye en esta impresión de texto.';article.append(hint);}doc.body.append(article);});
  const foot=doc.createElement('p');foot.textContent='Exportación de texto · Los archivos adjuntos no están incluidos.';doc.body.append(foot);
  frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});
  frame.contentWindow.focus();frame.contentWindow.print();track('export');message('Elige «Guardar como PDF» en la ventana de impresión.');setTimeout(()=>frame.remove(),120000);
}
async function showTemplates(){
  const board=await currentBoard();const el=dialog('Plantillas para empezar');
  el.append(text('p','Las plantillas añaden notas en espacios vacíos de la pizarra local. No sustituyen tus notas.'));
  if(board.id!=='guest-board'){el.append(text('p','La aplicación de plantillas en la nube necesita una importación transaccional y está pendiente. Puedes descargar una plantilla JSON.'));}
  const grid=document.createElement('div');grid.className='pp-template-grid';el.append(grid);
  Object.entries(templates).forEach(([name,notes])=>{
    const button=text('button',name);button.type='button';grid.append(button);
    button.addEventListener('click',async()=>{button.disabled=true;try{const data={format:'postispop',version:1,notes:notes.map((text,i)=>({text,paper:i%6,marks:[]}))};if(board.id!=='guest-board'){download('PostisPop-'+name+'.json',JSON.stringify(data,null,2));button.disabled=false;return;}await api('board/guest-board/import',data);location.reload();}catch(error){el.append(text('p',error.message==='BOARD_FULL'?'No hay suficientes notas vacías. Exporta una copia o elige una plantilla más pequeña.':'No se pudo aplicar la plantilla. Tus notas anteriores se conservan.'));button.disabled=false;}});
  });
}
async function showImport(){
  const board=await currentBoard(),el=dialog('Importar una copia JSON');
  el.append(text('p','Añade texto, colores y dibujos compatibles a notas vacías. No importa archivos adjuntos ni enlaces a imágenes. Las notas actuales se conservan.'));
  if(board.id!=='guest-board'){el.append(text('p','La importación en la nube está pendiente de una operación transaccional. Esta función está disponible en la pizarra local.'));return;}
  const label=text('label','Selecciona una copia de PostisPop');const file=document.createElement('input');file.type='file';file.accept='.json,application/json';label.append(file);el.append(label);
  const status=text('p','');status.setAttribute('role','status');el.append(status);
  const submit=text('button','Añadir a las notas vacías');submit.type='button';submit.disabled=true;el.append(submit);
  file.addEventListener('change',()=>{submit.disabled=!file.files[0];});
  submit.addEventListener('click',async()=>{submit.disabled=true;try{const selected=file.files[0];if(!selected||selected.size>2000000)throw Error('INVALID_BACKUP');const data=JSON.parse(await selected.text());await api('board/guest-board/import',data);location.reload();}catch(error){status.textContent=error.message==='BOARD_FULL'?'No hay espacio suficiente. No se ha importado ni sustituido ninguna nota.':'La copia no es compatible o supera 2 MB. No se ha cambiado ninguna nota.';submit.disabled=false;}});
}
async function filter(){
  try{
    const board=await currentBoard(),query=tools.querySelector('[type=search]').value.trim().toLocaleLowerCase('es'),color=tools.querySelector('select').value;
    let matches=0;const notes=ordered(board),cells=document.querySelectorAll('.board-grid .note-cell');
    cells.forEach((cell,i)=>{const note=notes[i],match=note&&(!query||note.text.toLocaleLowerCase('es').includes(query))&&(!color||String(note.paper)===color);cell.classList.toggle('pp-filtered',!match);const button=cell.querySelector('.sticky-note');if(button)button.tabIndex=match?0:-1;if(match)matches++;});
    message(query||color?`${matches} notas coinciden. Las demás siguen guardadas. Usa #etiqueta en el texto para agrupar notas.`:'Puedes buscar por texto o por #etiqueta.');
  }catch{message('No se pudo actualizar la búsqueda. Tus notas se conservan.');}
}
export function initBoardTools(){
  const board=document.querySelector('.board-frame:not(.is-loading)');if(!board)return;
  if(tools?.isConnected)return;
  tools=document.createElement('div');tools.className='pp-tools';tools.setAttribute('aria-label','Herramientas de la pizarra');
  const search=document.createElement('input');search.type='search';search.placeholder='Buscar notas o #etiqueta';search.setAttribute('aria-label','Buscar notas o etiquetas');tools.append(search);
  const colors=document.createElement('select');colors.setAttribute('aria-label','Filtrar por color');['Todos los colores','Amarillo','Rosa','Azul','Verde','Violeta','Naranja'].forEach((label,i)=>{const opt=text('option',label);opt.value=i===0?'':String(i-1);colors.append(opt);});tools.append(colors);
  let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,180);});colors.addEventListener('change',filter);
  const operations=[['Copia JSON',exportJson],['Importar',showImport],['PNG',exportPng],['PDF / Imprimir',printPdf],['Plantillas',showTemplates]];
  operations.forEach(([name,fn])=>{const button=text('button',name);button.type='button';button.addEventListener('click',async()=>{button.disabled=true;try{await fn();}catch{message('No se pudo completar la operación. Tus notas se conservan.');}finally{button.disabled=false;}});tools.append(button);});
  const install=text('button','Instalar aplicación');install.type='button';install.dataset.experience='install';install.hidden=true;tools.append(install);
  const status=text('span','Buscar: / · Exportar JSON: Ctrl + Mayús + E · Etiquetas: escribe #tema en una nota.');status.setAttribute('role','status');tools.append(status);board.before(tools);
}
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,[contenteditable=true],dialog,[role=dialog]'))return;
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();tools?.querySelector('[type=search]')?.focus();}
  if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==='e'){event.preventDefault();exportJson().catch(()=>message('No se pudo exportar la copia.'));}
});
