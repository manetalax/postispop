import {fonts,instruments,papers,palettes,paperSvg,svgUrl} from './editor-catalog.js';
import {normalizeStyle,drawStrokes,readableInk,paperColor} from './style-model.js';
import {readGuest} from './guest-board.js';
import {whenReactReady} from './ui-ready.js';

let activeId='',board=null,styles=new Map(),mountedBoard=null,scheduled=false,loading=false;
const paperImages=new Map();
const el=(tag,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;};
const paperImage=id=>{if(!paperImages.has(id))paperImages.set(id,svgUrl(paperSvg(id)));return paperImages.get(id);};
const safeStyle=value=>{try{return normalizeStyle(value||{});}catch{return normalizeStyle();}};
const noteById=id=>board?.notes?.find(note=>note.id===id);
// Apply the current writing default only when the note has no saved style.
const styleFor=note=>safeStyle(styles.get(note.id)||note.style||{ink:'#2d3933'});
// Extension labels use the same document-language fallback as guest-status.
const noteOptionsLabels={
  es:['Opciones','Más opciones de la nota'],
  en:['Options','More note options'],
  de:['Optionen','Weitere Notizoptionen'],
  fr:['Options','Plus d’options pour la note'],
  ja:['オプション','ノートの追加オプション'],
  pt:['Opções','Mais opções da nota'],
  it:['Opzioni','Altre opzioni della nota'],
  ko:['옵션','노트 추가 옵션']
};
const ICONS={
  text:'M4 5h16M12 5v15M8 20h8',
  pen:'m15 4 5 5M4 20l4-1 12-12a2 2 0 0 0-4-4L4 15z',
  brush:'m14 5 5 5M9 15 20 4M9 15c-4-1-2 6-7 6 7 2 9-2 7-6Z',
  eraser:'m4 13 8-9a2 2 0 0 1 3 0l6 6a2 2 0 0 1 0 3l-8 9H9l-5-5a2 2 0 0 1 0-3ZM8 9l9 9M13 21h9',
  undo:'M9 4 4 9l5 5M4 9h9a7 7 0 0 1 0 14',
  redo:'m15 4 5 5-5 5m5-5h-9a7 7 0 0 0 0 14',
  more:'M5 12h.01M12 12h.01M19 12h.01',
  italic:'M11 4h9M4 20h9M15 4 9 20',
  underline:'M6 3v7a6 6 0 0 0 12 0V3M4 21h16'
};
function icon(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [key,value]of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':name==='more'?'3':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))svg.setAttribute(key,value);
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',ICONS[name]);svg.append(path);return svg;
}
function iconButton(label,name,action){
  const button=el('button','','pp-editor-tool');button.type='button';button.title=label;button.setAttribute('aria-label',label);button.append(icon(name));button.addEventListener('click',action);return button;
}
async function api(path,payload){
  const response=await fetch('/api/'+path,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'REQUEST_FAILED'),{status:response.status});return data;
}
function setVariables(node,style){
  const values={'--pp-font':fonts.find(font=>font.id===style.font)?.css||'sans-serif','--pp-font-size':style.size+'px','--pp-ink':readableInk(style.ink,paperColor(style.paper)),'--pp-slant':style.italic?'italic':'normal','--pp-decoration':style.underline?'underline':'none','--pp-paper-image':`url("${paperImage(style.paper)}")`};
  for(const [name,value]of Object.entries(values))if(node.style.getPropertyValue(name)!==value)node.style.setProperty(name,value);
  node.dataset.ppPaper=style.paper;
}
function renderBoard(){
  const frame=document.querySelector('.board-frame:not(.is-loading)');if(!frame)return;
  // Old purchased decorations remain in storage; the workspace itself is now
  // deliberately quiet and reserves its entire frame for readable notes.
  frame.classList.remove('pp-designed-board');frame.style.removeProperty('--pp-board-art');delete frame.dataset.ppDesign;
  frame.querySelectorAll('.pp-frame-ornament').forEach(node=>node.remove());
  document.querySelectorAll('.pp-template-selector,.pp-design-bar').forEach(node=>node.remove());
  document.querySelector('.app-header')?.classList.remove('pp-pattern-header');
  for(const button of frame.querySelectorAll('.sticky-note[data-note-id]')){
    const note=noteById(button.dataset.noteId);if(!note)continue;
    if(note.protectedEnvelope){button.classList.remove('pp-styled-note');button.querySelector('.pp-note-sketch')?.remove();continue;}
    const stored=styles.get(note.id)||note.style;
    if(!stored){button.classList.remove('pp-styled-note');button.querySelector('.pp-note-sketch')?.remove();continue;}
    const style=safeStyle(stored);button.classList.add('pp-styled-note');setVariables(button,style);
    let sketch=button.querySelector('.pp-note-sketch');
    if(style.drawing.strokes.length){
      if(!sketch){sketch=el('canvas','','pp-note-sketch');sketch.width=640;sketch.height=400;sketch.setAttribute('aria-hidden','true');button.append(sketch);}
      const signature=JSON.stringify([style.drawing,style.paper]);
      if(sketch.dataset.signature!==signature){drawStrokes(sketch.getContext('2d'),style.drawing,640,400,paperColor(style.paper));sketch.dataset.signature=signature;}
    }else sketch?.remove();
  }
  if(board?.id)window.dispatchEvent(new CustomEvent('postispop:quote-drawings',{detail:{boardId:board.id,filled:board.order.map(id=>{const note=noteById(id);return Boolean(note&&!note.protectedEnvelope&&styleFor(note).drawing.strokes.length);})}}));
}
async function refresh(){
  if(loading)return;loading=true;
  try{
    const ids=[...document.querySelectorAll('.sticky-note[data-note-id]')].map(node=>node.dataset.noteId);if(!ids.length)return;
    if(ids.every(id=>id.startsWith('guest-note-'))){board=readGuest();styles=new Map();}
    else{
      const me=await api('me');let id;try{id=localStorage.getItem('pp:last-board');}catch{}
      const summary=me.boards?.find(item=>item.id===id)||me.boards?.[0];if(!summary)return;
      const nextBoard=await api('board/'+summary.id);
      if(board?.id!==nextBoard.id)styles=new Map();
      board=nextBoard;
      try{const result=await api('designs/styles');styles=new Map((result.styles||[]).map(style=>[style.note_id,style]));}catch{/* Text and saved note styles remain usable when the optional style service is unavailable. */}
    }
    renderBoard();enhanceEditor();
  }catch{/* Preserve visible notes and unsaved editor state if remote data is unavailable. */}
  finally{loading=false;}
}
function control(labelText,input){const label=el('label',labelText);label.append(input);return label;}
function select(labelText,items,value,onChange){
  const input=el('select');input.setAttribute('aria-label',labelText);
  for(const item of items){const option=el('option',item.name);option.value=item.id;input.append(option);}
  input.value=value;input.addEventListener('change',()=>onChange(input.value));return control(labelText,input);
}
function errorMessage(error){
  if(error.message==='CONFLICT'||error.status===409)return 'Esta nota cambió en otra ventana. Tu dibujo sigue aquí. Cierra y vuelve a abrir la nota para cargar la versión guardada.';
  if(error.message==='NOTE_PROTECTED')return 'La nota ya está protegida. Ábrela con su contraseña para continuar.';
  if(error.message==='LOCAL_STORAGE_FULL'||error.status===507)return 'No queda espacio en este dispositivo. Conserva esta nota abierta hasta liberar espacio.';
  if(!navigator.onLine)return 'Sin conexión: estos cambios aún no se han guardado. Conserva la nota abierta; volveremos a intentarlo al conectarte.';
  if(error.status===403||error.message.includes('LOCKED'))return 'Tu cuenta no permite guardar este cambio todavía. La nota sigue abierta con tus cambios.';
  if(error.message==='INVALID_STYLE')return 'El dibujo ha alcanzado el límite de esta nota. Deshaz el último trazo antes de guardar.';
  return 'No se pudo guardar. Tu dibujo sigue aquí; vuelve a intentarlo.';
}

// Erasing removes the touched stroke, including the segment between recorded
// points. It never paints over text or changes the shared drawing data format.
export function strokeAt(strokes,point,width=640,height=400,radius=14){
  const px=point.x*width,py=point.y*height;
  for(let index=strokes.length-1;index>=0;index--){
    const stroke=strokes[index],limit=radius+stroke.width*width/640/2;
    for(let i=0;i<stroke.points.length;i++){
      const a=stroke.points[Math.max(0,i-1)],b=stroke.points[i];
      const ax=a.x*width,ay=a.y*height,dx=(b.x-a.x)*width,dy=(b.y-a.y)*height;
      const t=dx||dy?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))):0;
      if(Math.hypot(px-(ax+t*dx),py-(ay+t*dy))<=limit)return index;
    }
  }
  return -1;
}
function enhanceEditor(){
  const dialog=document.querySelector('.editor-dialog');if(!dialog||dialog.querySelector('.pp-design-tools'))return;
  const headingIndex=Number(dialog.querySelector('.dialog-heading')?.textContent.match(/\d+/)?.[0])-1;
  const id=board?.order?.[headingIndex]||activeId,note=noteById(id);if(!note||note.protectedEnvelope)return;
  const paper=dialog.querySelector('.edit-paper');if(!paper)return;
  activeId=id;
  const value=styleFor(note);
  let revision=note.styleRevision||0,remoteRevision=styles.get(id)?.revision,dirty=false,saveTimer,inflight=null;
  let mode='text',stroke=null,pointerId=null,gestureBefore=null;
  const undoHistory=[],redoHistory=[];
  const panel=el('section','','pp-design-tools'),toolbar=el('div','','pp-editor-toolbar');
  panel.setAttribute('aria-label','Herramientas de la nota');toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Escribir y dibujar');panel.append(toolbar);
  const options=el('details','','pp-editor-options'),summary=el('summary');summary.title='Más herramientas';summary.setAttribute('aria-label','Más herramientas');summary.append(icon('more'));options.append(summary);
  options.addEventListener('keydown',event=>{if(event.key==='Escape'&&options.open){event.stopPropagation();options.open=false;summary.focus();}});
  const content=el('div','','pp-design-content'),fields=el('div','','pp-style-fields');options.append(content);content.append(el('h3','Texto y papel'),fields);
  const status=el('p','','pp-style-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const canvas=el('canvas','','pp-drawing-canvas');canvas.width=960;canvas.height=600;
  canvas.setAttribute('aria-label','Dibujo de la nota. Activa el lápiz para dibujar.');
  const sketch=el('div','','pp-note-drawing');sketch.append(canvas);
  const savedLayer=el('canvas'),activeLayer=el('canvas');
  for(const layer of [savedLayer,activeLayer]){layer.width=canvas.width;layer.height=canvas.height;}
  let savedLayerKey='';
  function paintSketch(){
    const context=canvas.getContext('2d'),background=paperColor(value.paper);
    if(stroke&&gestureBefore!==null){
      const key=gestureBefore+'|'+value.paper;
      if(savedLayerKey!==key){
        drawStrokes(savedLayer.getContext('2d'),{strokes:JSON.parse(gestureBefore)},canvas.width,canvas.height,background);
        savedLayerKey=key;
      }
      // Existing strokes are rasterized once per gesture. Only the live stroke
      // is redrawn on pointer movement, even on a heavily illustrated note.
      drawStrokes(activeLayer.getContext('2d'),{strokes:[stroke]},canvas.width,canvas.height,background);
      context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(savedLayer,0,0);context.drawImage(activeLayer,0,0);
    }else{
      drawStrokes(context,value.drawing,canvas.width,canvas.height,background);savedLayerKey='';
    }
  }
  const text=paper.querySelector('textarea');
  const textContainer=text.closest('.rich-paper-input');
  const updateTextOverflow=()=>textContainer.classList.toggle('pp-text-scrollable',text.scrollHeight>text.clientHeight+1);
  const textResize=new ResizeObserver(updateTextOverflow);
  textResize.observe(text);text.addEventListener('input',updateTextOverflow);
  const drawingSnapshot=()=>JSON.stringify(value.drawing.strokes);
  function pushUndo(snapshot){undoHistory.push(snapshot);if(undoHistory.length>20)undoHistory.shift();redoHistory.length=0;}
  function syncTools(){
    textButton.setAttribute('aria-pressed',String(mode==='text'));
    penButton.setAttribute('aria-pressed',String(mode==='draw'&&value.drawing.selectedInstrument!=='brush'));
    brushButton.setAttribute('aria-pressed',String(mode==='draw'&&value.drawing.selectedInstrument==='brush'));
    eraserButton.setAttribute('aria-pressed',String(mode==='erase'));
    undo.disabled=!undoHistory.length;redo.disabled=!redoHistory.length;
    eraserButton.disabled=!value.drawing.strokes.length&&mode!=='erase';
    sketch.hidden=mode==='text'&&!value.drawing.strokes.length;
    paper.dataset.ppEditMode=mode;canvas.tabIndex=mode==='text'&&value.drawing.strokes.length?0:-1;
    canvas.setAttribute('aria-label',mode==='text'?'Abrir el dibujo de esta nota':mode==='erase'?'Goma: toca un trazo para borrarlo. Puedes deshacer.':'Dibuja con el ratón, lápiz o dedo.');
    canvas.style.cursor=mode==='text'?'pointer':mode==='erase'?'cell':'crosshair';
  }
  function preview(){
    paper.classList.add('pp-styled-editor');setVariables(paper,value);canvas.style.backgroundImage=`url("${paperImage(value.paper)}")`;
    paintSketch();syncTools();updateTextOverflow();
  }
  function changed(){dirty=true;status.textContent='Guardando…';status.dataset.state='saving';preview();clearTimeout(saveTimer);saveTimer=setTimeout(()=>flush(),350);}
  function finishGesture(){
    if(pointerId===null)return;
    if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);
    if(gestureBefore!==drawingSnapshot()){pushUndo(gestureBefore);changed();}
    stroke=null;pointerId=null;gestureBefore=null;syncTools();
  }
  function setMode(next,instrument){
    finishGesture();mode=next;
    if(instrument)value.drawing.selectedInstrument=instrument;
    options.open=false;syncTools();
    if(mode==='text')text?.focus({preventScroll:true});
    else {text?.blur();canvas.scrollIntoView({block:'nearest',behavior:'instant'});}
  }
  const textButton=iconButton('Escribir','text',()=>setMode('text'));
  const penButton=iconButton('Lápiz','pen',()=>setMode('draw','graphite'));
  const brushButton=iconButton('Pincel','brush',()=>setMode('draw','brush'));
  const eraserButton=iconButton('Borrar trazos','eraser',()=>setMode('erase'));
  const undo=iconButton('Deshacer trazo','undo',()=>{finishGesture();if(!undoHistory.length)return;redoHistory.push(drawingSnapshot());value.drawing.strokes=JSON.parse(undoHistory.pop());changed();});
  const redo=iconButton('Rehacer trazo','redo',()=>{finishGesture();if(!redoHistory.length)return;undoHistory.push(drawingSnapshot());value.drawing.strokes=JSON.parse(redoHistory.pop());changed();});
  toolbar.append(textButton,penButton,brushButton,eraserButton,undo,redo,options);
  fields.append(select('Tipo de letra',fonts,value.font,font=>{value.font=font;changed();}));
  const size=el('input');size.type='range';size.min='12';size.max='36';size.step='1';size.value=String(value.size);size.setAttribute('aria-label','Tamaño del texto');
  const sizeLabel=control('Tamaño del texto',size),sizeOutput=el('output',value.size+' px');sizeLabel.append(sizeOutput);
  size.addEventListener('input',()=>{value.size=Number(size.value);sizeOutput.value=value.size+' px';changed();});fields.append(sizeLabel);
  fields.append(select('Tipo de papel',papers,value.paper,paperId=>{value.paper=paperId;changed();}));
  const formats=el('div','','pp-format-toggles');
  for(const [name,label]of [['italic','Cursiva'],['underline','Subrayado']]){
    const button=iconButton(label,name,()=>{value[name]=!value[name];button.setAttribute('aria-pressed',String(value[name]));changed();});button.setAttribute('aria-pressed',String(value[name]));formats.append(button);
  }
  fields.append(formats);
  content.append(el('h3','Dibujo'),select('Instrumento',instruments,value.drawing.selectedInstrument,instrument=>{value.drawing.selectedInstrument=instrument;setMode('draw',instrument);changed();}));
  const inkArea=el('fieldset','','pp-ink-colors');inkArea.append(el('legend','Color de tinta'));
  for(const color of palettes.find(palette=>palette.id==='classic').colors){
    const button=el('button');button.type='button';button.style.background=color;button.title='Tinta '+color;button.setAttribute('aria-label','Tinta '+color);button.setAttribute('aria-pressed',String(color===value.ink));
    button.addEventListener('click',()=>{value.ink=color;ink.value=color;syncInk();changed();});inkArea.append(button);
  }
  const ink=el('input');ink.type='color';ink.value=value.ink;ink.title='Elegir otro color de tinta';ink.setAttribute('aria-label','Elegir otro color de tinta');
  const syncInk=()=>inkArea.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-label')==='Tinta '+value.ink)));
  ink.addEventListener('input',()=>{value.ink=ink.value;syncInk();changed();});inkArea.append(ink);content.append(inkArea);
  const point=event=>{const box=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height)),p:Math.max(0,Math.min(1,event.pointerType==='pen'?event.pressure:.5))};};
  function eraseAt(event){const box=canvas.getBoundingClientRect(),index=strokeAt(value.drawing.strokes,point(event),box.width,box.height);if(index>=0){value.drawing.strokes.splice(index,1);preview();}}
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||pointerId!==null)return;
    if(mode==='text'){setMode('draw',value.drawing.selectedInstrument);return;}
    if(mode==='draw'&&(value.drawing.strokes.length>=120||value.drawing.strokes.reduce((total,item)=>total+item.points.length,0)>=16000)){status.dataset.state='error';status.textContent='Límite del dibujo alcanzado. Borra o deshaz un trazo para continuar.';return;}
    event.preventDefault();clearTimeout(saveTimer);canvas.setPointerCapture(event.pointerId);pointerId=event.pointerId;gestureBefore=drawingSnapshot();
    if(mode==='erase'){eraseAt(event);return;}
    const pen=instruments.find(item=>item.id===value.drawing.selectedInstrument)||instruments[1];
    stroke={instrument:pen.id,color:readableInk(value.ink,paperColor(value.paper)),width:pen.width,points:[point(event)]};value.drawing.strokes.push(stroke);preview();
  });
  canvas.addEventListener('pointermove',event=>{
    if(pointerId!==event.pointerId)return;
    if(mode==='erase'){eraseAt(event);return;}
    if(!stroke)return;
    const next=point(event),last=stroke.points.at(-1);if(Math.hypot(next.x-last.x,next.y-last.y)<.0025)return;
    if(value.drawing.strokes.reduce((total,item)=>total+item.points.length,0)>=16000)return;
    stroke.points.push(next);paintSketch();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,event=>{if(pointerId===event.pointerId)finishGesture();});
  canvas.addEventListener('keydown',event=>{if(mode==='text'&&['Enter',' '].includes(event.key)){event.preventDefault();setMode('draw',value.drawing.selectedInstrument);}});
  const retry=iconButton('Reintentar guardar','redo',()=>flush());retry.classList.add('pp-style-retry');retry.hidden=true;
  const saveLine=el('div','','pp-style-save-line');saveLine.append(status,retry);panel.append(saveLine);
  async function persist(){
    const snapshot=JSON.stringify(value);status.textContent='Guardando…';status.dataset.state='saving';retry.hidden=true;
    try{
      const normalized=normalizeStyle(value);let queued=false;
      if(id.startsWith('guest-note-')){const data=await api('note/'+id+'/style',{style:normalized,styleRevision:revision});revision=data.styleRevision;Object.assign(noteById(id)||note,data.note);}
      else{const data=await api('designs/styles',{...normalized,note_id:id,revision:remoteRevision??0});styles.set(id,data.style);remoteRevision=data.style?.revision;queued=data.pending===true;}
      dirty=JSON.stringify(value)!==snapshot;status.dataset.state=dirty?'saving':queued?'queued':'saved';
      status.textContent=dirty?'Guardando…':queued?'Guardado en este dispositivo · pendiente de sincronizar':'Guardado';
      window.dispatchEvent(new CustomEvent('postispop:style-saved',{detail:{noteId:id}}));renderBoard();return true;
    }catch(error){dirty=true;options.open=false;status.dataset.state='error';status.textContent=errorMessage(error);retry.hidden=false;return false;}
  }
  async function flush(){
    clearTimeout(saveTimer);finishGesture();
    if(inflight){if(!await inflight)return false;}
    while(dirty){inflight=persist();const ok=await inflight;inflight=null;if(!ok)return false;}
    return true;
  }
  // Closing waits for the actual write. A failure leaves the editable note open.
  const beforeClose=event=>{if(panel.isConnected)event.detail.waits.push(flush());};
  const shareSnapshot=event=>{if(panel.isConnected&&event.detail.noteId===id){finishGesture();event.detail.snapshot={style:structuredClone(value)};}};
  window.addEventListener('postispop:editor-snapshot',shareSnapshot);
  const backgroundSave=()=>{if(dirty||pointerId!==null)void flush();};
  window.addEventListener('postispop:editor-flush',beforeClose);
  for(const name of ['pagehide','online','postispop:native-background'])window.addEventListener(name,backgroundSave);
  const cleanup=new MutationObserver(()=>{
    if(panel.isConnected)return;
    textResize.disconnect();text.removeEventListener('input',updateTextOverflow);
    clearTimeout(saveTimer);window.removeEventListener('postispop:editor-flush',beforeClose);window.removeEventListener('postispop:editor-snapshot',shareSnapshot);
    for(const name of ['pagehide','online','postispop:native-background'])window.removeEventListener(name,backgroundSave);
    cleanup.disconnect();
  });cleanup.observe(document.body,{childList:true,subtree:true});
  paper.prepend(panel);paper.querySelector('.rich-paper-input')?.after(sketch);
  const actions=paper.querySelector('.editor-actions');
  if(actions){
    paper.dataset.ppSecondary='closed';
    const [optionsText,optionsLabel]=noteOptionsLabels[(document.documentElement.lang||'es').split('-')[0]]||noteOptionsLabels.es;
    const secondary=iconButton(optionsLabel,'more',()=>{
      const open=paper.dataset.ppSecondary!=='open';paper.dataset.ppSecondary=open?'open':'closed';secondary.setAttribute('aria-expanded',String(open));
    });
    secondary.append(el('span',optionsText));
    secondary.classList.add('pp-editor-secondary');secondary.setAttribute('aria-expanded','false');
    const controls=[];
    for(const [index,node]of [...paper.querySelectorAll('.note-customization,.pen-tray,.capture-editor,.pp-attachments')].entries()){
      if(!node.id)node.id='pp-note-options-'+index;
      controls.push(node.id);
    }
    secondary.setAttribute('aria-controls',controls.join(' '));
    for(const button of actions.querySelectorAll('button')){
      if(!button.getAttribute('aria-label')&&button.textContent.trim())button.setAttribute('aria-label',button.textContent.trim());
      if(!button.title)button.title=button.getAttribute('aria-label')||'';
    }
    actions.append(secondary);
  }
  preview();
  // Never steal focus after a user starts operating another control.
  requestAnimationFrame(()=>{if(dialog.isConnected&&mode==='text'&&(!document.activeElement||document.activeElement===document.body||document.activeElement===dialog))text?.focus({preventScroll:true});});
}
function mount(){
  const frame=document.querySelector('.board-frame:not(.is-loading)');if(!frame)return;
  if(frame!==mountedBoard){mountedBoard=frame;void refresh();}
  renderBoard();enhanceEditor();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}
if(typeof document!=='undefined')whenReactReady(()=>{
  document.addEventListener('click',event=>{const note=event.target.closest?.('.sticky-note[data-note-id]');if(note){activeId=note.dataset.noteId;if(activeId.startsWith('guest-note-'))board=readGuest();schedule();}},true);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('postispop:save',event=>{if(event.detail?.state==='saved')void refresh();});
  for(const name of ['postispop:protected-changed','postispop:session-change','pageshow','storage'])window.addEventListener(name,()=>{void refresh();});
  schedule();
});
