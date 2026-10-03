import {designs,fonts,instruments,papers,palettes,boardSvg,paperSvg,svgUrl} from './design-catalog.js';
import {normalizeStyle,drawStrokes,readableInk,paperColor} from './style-model.js';
import {readGuest} from './guest-board.js';

let activeId='',board=null,rights=null,styles=new Map(),mountedBoard=null,scheduled=false,loading=false;
const previews=new Map(),paperImages=new Map();
const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n;};
const paperImage=id=>{if(!paperImages.has(id))paperImages.set(id,svgUrl(paperSvg(id)));return paperImages.get(id);};
async function api(path,payload) {
  const r=await fetch('/api/'+path,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.error||'REQUEST_FAILED'),{status:r.status});return data;
}
const owns=group=>Boolean(rights?.owner||rights?.premium||rights?.tools?.[group]||rights?.unlocked?.includes('tools:'+group));
const safeStyle=value=>{try{return normalizeStyle(value||{});}catch{return normalizeStyle();}};
const noteById=id=>board?.notes?.find(n=>n.id===id);
function styleFor(note) {return safeStyle(styles.get(note.id)||note.style);}
function setVariables(node,style) {
  const values={'--pp-font':fonts.find(f=>f.id===style.font)?.css||'sans-serif','--pp-font-size':style.size+'px','--pp-ink':readableInk(style.ink,paperColor(style.paper)),'--pp-slant':style.italic?'italic':'normal','--pp-decoration':style.underline?'underline':'none','--pp-paper-image':`url("${paperImage(style.paper)}")`};
  for(const [name,value] of Object.entries(values))if(node.style.getPropertyValue(name)!==value)node.style.setProperty(name,value);
  node.dataset.ppPaper=style.paper;
}
function renderBoard() {
  const frame=document.querySelector('.board-frame:not(.is-loading)');if(!frame)return;
  const design=designs.find(d=>d.id===rights?.selected);
  if(design) {
    if(!previews.has(design.id))previews.set(design.id,svgUrl(boardSvg(design)));
    const image=`url("${previews.get(design.id)}")`;
    if(frame.style.getPropertyValue('--pp-board-art')!==image)frame.style.setProperty('--pp-board-art',image);
    frame.classList.add('pp-designed-board');frame.dataset.ppDesign=design.id;
  } else {frame.classList.remove('pp-designed-board');frame.style.removeProperty('--pp-board-art');delete frame.dataset.ppDesign;}
  for(const button of frame.querySelectorAll('.sticky-note[data-note-id]')) {
    const note=noteById(button.dataset.noteId);if(!note)continue;
    if(note.protectedEnvelope){button.classList.remove('pp-styled-note');button.querySelector('.pp-note-sketch')?.remove();continue;}
    const stored=styles.get(note.id)||note.style;
    const style=stored?safeStyle(stored):design?safeStyle({paper:design.paper}):null;
    if(!style){button.classList.remove('pp-styled-note');button.querySelector('.pp-note-sketch')?.remove();continue;}
    button.classList.add('pp-styled-note');setVariables(button,style);
    let sketch=button.querySelector('.pp-note-sketch');
    if(style.drawing.strokes.length){if(!sketch){sketch=el('canvas','','pp-note-sketch');sketch.width=640;sketch.height=400;sketch.setAttribute('aria-hidden','true');button.append(sketch);}const signature=JSON.stringify([style.drawing,style.paper]);if(sketch.dataset.signature!==signature){drawStrokes(sketch.getContext('2d'),style.drawing,640,400,paperColor(style.paper));sketch.dataset.signature=signature;}}
    else sketch?.remove();
  }
  const summary=document.querySelector('.pp-design-summary');if(summary){const text=design?design.title:'Tu pizarra, a tu manera';if(summary.textContent!==text)summary.textContent=text;}
}
async function refresh() {
  if(loading)return;loading=true;
  try {
    const ids=[...document.querySelectorAll('.sticky-note[data-note-id]')].map(n=>n.dataset.noteId);
    if(!ids.length)return;
    if(ids.every(id=>id.startsWith('guest-note-'))) {board=readGuest();rights=null;styles=new Map();}
    else {
      const me=await api('me');let id;try{id=localStorage.getItem('pp:last-board');}catch{}
      const summary=me.boards?.find(b=>b.id===id)||me.boards?.[0];if(!summary)return;
      board=await api('board/'+summary.id);
      const results=await Promise.allSettled([api('designs/status'),api('designs/styles')]);
      rights=results[0].status==='fulfilled'?results[0].value:null;
      styles=new Map(results[1].status==='fulfilled'?(results[1].value.styles||[]).map(s=>[s.note_id,s]):[]);
    }
    renderBoard();enhanceEditor();
  } catch { /* Existing board content remains visible when a remote service is unavailable. */ }
  finally {loading=false;}
}
function control(labelText,input) {const label=el('label',labelText);label.append(input);return label;}
function select(labelText,items,value,allowed,onChange) {
  const input=el('select');input.setAttribute('aria-label',labelText);
  for(const item of items){const option=el('option',item.name+(allowed(item.id)?'':' · Premium'));option.value=item.id;option.disabled=!allowed(item.id);input.append(option);}
  input.value=value;input.addEventListener('change',()=>onChange(input.value));return control(labelText,input);
}
function errorMessage(error) {
  if(error.message==='CONFLICT'||error.status===409)return 'Esta nota cambió en otra ventana. Tu propuesta sigue aquí. Cierra y vuelve a abrir la nota para cargar la versión guardada.';
  if(error.message==='NOTE_PROTECTED')return 'La nota ya está protegida. Ábrela con su contraseña para continuar.';
  if(!navigator.onLine)return 'Sin conexión: los cambios de esta cuenta todavía no se han guardado. Conserva esta ventana abierta y vuelve a intentar al conectarte.';
  if(error.status===403||error.message.includes('LOCKED'))return 'Esta herramienta necesita una licencia verificada en tu cuenta.';
  if(error.message==='INVALID_STYLE')return 'El dibujo ha alcanzado el límite de esta nota. Deshaz el último trazo antes de guardar.';
  return 'No se pudo guardar el estilo. Tu propuesta sigue visible; vuelve a intentarlo.';
}
function enhanceEditor() {
  const dialog=document.querySelector('.editor-dialog');if(!dialog||dialog.querySelector('.pp-design-tools'))return;
  const headingIndex=Number(dialog.querySelector('.dialog-heading')?.textContent.match(/\d+/)?.[0])-1;
  const id=board?.order?.[headingIndex]||activeId;
  const note=noteById(id);if(!note||note.protectedEnvelope)return;
  activeId=id;
  const paper=dialog.querySelector('.edit-paper');if(!paper)return;
  const selected=designs.find(d=>d.id===rights?.selected);
  let value=styleFor(note);if(!note.style&&!styles.has(id)&&selected)value.paper=selected.paper;
  let revision=note.styleRevision||0,remoteRevision=styles.get(id)?.revision,dirty=false,saving=false;
  const panel=el('details','','pp-design-tools');panel.append(el('summary','Papeles, letras y trazos'));
  const content=el('div','','pp-design-content'),fields=el('div','','pp-style-fields');panel.append(content);
  const status=el('p',board.id==='guest-board'?'Herramientas básicas · guardado en este dispositivo.':'Los estilos se guardan en tu cuenta.','pp-style-status');status.setAttribute('role','status');
  const save=el('button','Guardar estilo y dibujo','pp-style-save');save.type='button';save.disabled=true;
  const preview=()=>{paper.classList.add('pp-styled-editor');setVariables(paper,value);canvas.style.backgroundImage=`url("${paperImage(value.paper)}")`;drawStrokes(canvas.getContext('2d'),value.drawing,canvas.width,canvas.height,paperColor(value.paper));};
  const changed=()=>{dirty=true;save.disabled=false;status.textContent='Cambios pendientes. Guarda el estilo y el dibujo antes de cerrar la nota.';preview();};
  fields.append(select('Tipo de letra',fonts,value.font,id=>id==='sans'||owns('fonts'),v=>{value.font=v;changed();}));
  const size=el('input');size.type='range';size.min='14';size.max='36';size.step='1';size.value=String(value.size);size.setAttribute('aria-label','Tamaño del texto');
  const sizeLabel=control('Tamaño del texto',size),sizeOutput=el('output',value.size+' px');sizeLabel.append(sizeOutput);size.addEventListener('input',()=>{value.size=Number(size.value);sizeOutput.value=value.size+' px';changed();});fields.append(sizeLabel);
  fields.append(select('Tipo de papel',papers,value.paper,id=>id==='plain'||owns('papers')||id===selected?.paper,v=>{value.paper=v;changed();}));
  const formats=el('div','','pp-format-toggles');for(const [name,label]of [['italic','Cursiva'],['underline','Subrayado']]){const button=el('button',label);button.type='button';button.setAttribute('aria-pressed',String(value[name]));button.addEventListener('click',()=>{value[name]=!value[name];button.setAttribute('aria-pressed',String(value[name]));changed();});formats.append(button);}fields.append(formats);content.append(fields);
  const inkArea=el('fieldset','','pp-ink-colors');inkArea.append(el('legend','Color de tinta'));
  for(const palette of palettes){const group=el('div','','pp-palette-row');group.append(el('span',palette.name));for(const color of palette.colors){const button=el('button');button.type='button';button.style.background=color;button.setAttribute('aria-label',palette.name+' '+color);button.title=palette.name+' '+color;button.setAttribute('aria-pressed',String(color===value.ink));button.disabled=color!=='#163b62'&&!owns('palettes');button.addEventListener('click',()=>{value.ink=color;inkArea.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));changed();});group.append(button);}inkArea.append(group);}content.append(inkArea);
  const canvas=el('canvas','','pp-drawing-canvas');canvas.width=640;canvas.height=400;canvas.setAttribute('aria-label','Área de dibujo de esta nota. Dibuja con ratón, lápiz o dedo.');
  const drawingTools=el('div','','pp-drawing-controls');drawingTools.append(select('Instrumento',instruments,value.drawing.selectedInstrument,id=>id==='ballpoint'||owns('pens'),v=>{value.drawing.selectedInstrument=v;if(v==='stamp')value.ink=readableInk('#b52335',paperColor(value.paper));changed();}));
  const undo=el('button','Deshacer trazo');undo.type='button';undo.addEventListener('click',()=>{if(value.drawing.strokes.length){value.drawing.strokes.pop();changed();}});drawingTools.append(undo);
  const sketchHelp=el('p','Dibuja dentro del papel. Los trazos se adaptan al tamaño de la nota. Deshacer retira el último trazo.','pp-sketch-help');content.append(el('h3','Un dibujo en tu nota'),drawingTools,canvas,sketchHelp);
  let stroke=null;
  const point=event=>{const box=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height)),p:Math.max(0,Math.min(1,event.pointerType==='pen'?event.pressure:.5))};};
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0||saving)return;if(value.drawing.strokes.length>=120){status.textContent='Límite de 120 trazos. Deshaz uno para seguir.';return;}event.preventDefault();canvas.setPointerCapture(event.pointerId);const pen=instruments.find(p=>p.id===value.drawing.selectedInstrument)||instruments[1];stroke={instrument:pen.id,color:readableInk(value.ink,paperColor(value.paper)),width:pen.width,points:[point(event)]};value.drawing.strokes.push(stroke);changed();});
  canvas.addEventListener('pointermove',event=>{if(!stroke||!canvas.hasPointerCapture(event.pointerId))return;const p=point(event),last=stroke.points.at(-1);if(Math.hypot(p.x-last.x,p.y-last.y)<.0025)return;if(value.drawing.strokes.reduce((count,s)=>count+s.points.length,0)>=16000)return;stroke.points.push(p);preview();});
  const end=event=>{if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);stroke=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  if(!owns('fonts')||!owns('pens')||!owns('papers')||!owns('palettes')){const link=el('a','Ver papeles, fuentes e instrumentos en el Atelier');link.href='/atelier.html#herramientas';content.append(link);}
  content.append(status,save);
  save.addEventListener('click',async()=>{
    if(saving)return;saving=true;save.disabled=true;const snapshot=JSON.stringify(value);status.textContent='Guardando estilo y dibujo…';
    try {
      const normalized=normalizeStyle(value);
      let queued=false;
      if(id.startsWith('guest-note-')){const data=await api('note/'+id+'/style',{style:normalized,styleRevision:revision});revision=data.styleRevision;Object.assign(noteById(id)||note,data.note);}
      else {const data=await api('designs/styles',{...normalized,note_id:id,revision:remoteRevision??0});styles.set(id,data.style);remoteRevision=data.style?.revision;queued=data.pending===true;}
      dirty=JSON.stringify(value)!==snapshot;status.textContent=dirty?'Hay nuevos cambios pendientes. Guarda de nuevo.':id.startsWith('guest-note-')?'Estilo y dibujo guardados en este dispositivo.':queued?'Estilo y dibujo guardados en este dispositivo, pendientes de sincronizar con tu cuenta.':'Estilo y dibujo guardados en tu cuenta.';
      window.dispatchEvent(new CustomEvent('postispop:style-saved',{detail:{noteId:id}}));renderBoard();
    }catch(error){dirty=true;status.textContent=errorMessage(error);}finally{saving=false;save.disabled=!dirty;}
  });
  // This UI is an enhancement around the recovered editor; text keeps its own
  // autosave. Warn before closing an unsaved drawing, including browser exit.
  const warn=event=>{if(dirty&&panel.isConnected){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);
  const closeGuard=event=>{if(!dirty||!panel.isConnected||!event.target.closest?.('.dialog-heading button'))return;if(!window.confirm('El estilo o dibujo aún no se ha guardado. ¿Cerrar y descartar estos cambios?')){event.preventDefault();event.stopImmediatePropagation();}};
  dialog.addEventListener('click',closeGuard,true);
  const keyGuard=event=>{if(event.key==='Escape'&&dirty&&panel.isConnected&&!window.confirm('El estilo o dibujo aún no se ha guardado. ¿Cerrar y descartar estos cambios?')){event.preventDefault();event.stopImmediatePropagation();}};dialog.addEventListener('keydown',keyGuard,true);
  const outsideGuard=event=>{if(dirty&&panel.isConnected&&!dialog.contains(event.target)&&!window.confirm('El estilo o dibujo aún no se ha guardado. ¿Cerrar y descartar estos cambios?')){event.preventDefault();event.stopImmediatePropagation();}};document.addEventListener('pointerdown',outsideGuard,true);
  const cleanup=new MutationObserver(()=>{if(!panel.isConnected){window.removeEventListener('beforeunload',warn);document.removeEventListener('pointerdown',outsideGuard,true);cleanup.disconnect();}});cleanup.observe(document.body,{childList:true,subtree:true});
  paper.after(panel);preview();
}
function mount() {
  const frame=document.querySelector('.board-frame:not(.is-loading)');if(!frame)return;
  if(frame!==mountedBoard||!document.querySelector('.pp-design-bar')) {
    mountedBoard=frame;document.querySelector('.pp-design-bar')?.remove();
    const bar=el('aside','','pp-design-bar'),text=el('span','Tu pizarra, a tu manera','pp-design-summary'),link=el('a','Elegir diseño en el Atelier');link.href='/atelier.html';bar.append(text,link);frame.before(bar);refresh();
  }
  renderBoard();enhanceEditor();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}
document.addEventListener('click',event=>{const note=event.target.closest?.('.sticky-note[data-note-id]');if(note){activeId=note.dataset.noteId;if(activeId.startsWith('guest-note-'))board=readGuest();schedule();}},true);
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('postispop:save',event=>{if(event.detail?.state==='saved')refresh();});
window.addEventListener('postispop:protected-changed',refresh);
window.addEventListener('pageshow',refresh);
window.addEventListener('storage',()=>refresh());
schedule();
