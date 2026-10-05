import {quoteLocation,quotePreferenceKey} from './daily-quote-model.js';
const create=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n;};
let scheduled=false;const drawings=new Map();
function update(){
 const frame=document.querySelector('.board-frame:not(.is-loading)'),data=document.querySelector('.pp-daily-quote-data');
 if(!frame||!data?.dataset.boardId)return;
 const mobile=matchMedia('(max-width:700px)').matches;
 const header=document.querySelector('.app-header');
 if(header&&!header.querySelector('.pp-mobile-menu')){
  const button=create('button','Menú','pp-mobile-menu');button.type='button';button.setAttribute('aria-expanded','false');
  button.onclick=()=>{const open=header.classList.toggle('pp-mobile-menu-open');button.setAttribute('aria-expanded',String(open));};header.append(button);
 }
 const main=frame.closest('.postispop');main?.classList.toggle('pp-six-note-mobile',mobile);
 if(mobile){
  for(const node of document.querySelectorAll('.workspace-caption,.pp-note-search'))if(node.previousElementSibling!==frame&&node.compareDocumentPosition(frame)&Node.DOCUMENT_POSITION_FOLLOWING)frame.after(node);
 }
 const pager=frame.querySelector('.zoom-button');
 if(pager&&mobile){
  const second=frame.classList.contains('zoom-2');const label=second?'← Ver las 6 primeras · 1–6':'Ver las 6 siguientes · 7–12 →';
  const span=pager.querySelector('span');if(span&&span.textContent!==label)span.textContent=label;
  pager.setAttribute('aria-label',label);pager.title=label;
 }
 let choice=null;const key=quotePreferenceKey(data.dataset.boardId);try{choice=localStorage.getItem(key);}catch{}
 const filled=[...data.dataset.filled].map((c,index)=>c==='1'||Boolean(drawings.get(data.dataset.boardId)?.[index]));const location=data.dataset.boardId!=='guest-board'&&!drawings.has(data.dataset.boardId)?null:quoteLocation(filled,choice);
 for(const note of frame.querySelectorAll('.sticky-note[data-note-id]')){
  const active=Number(note.dataset.ppSlot)===location&&Boolean(data.dataset.text);
  note.classList.toggle('pp-quote-host',active);
  if(active){
   note.dataset.ppQuoteText=data.dataset.text;
   let preview=note.querySelector('.pp-daily-quote-preview');
   if(!preview){preview=create('span','','pp-daily-quote-preview');preview.append(create('small','La frase del día'),create('span','','pp-quote-copy'),create('cite'));note.append(preview);}
   if(preview.querySelector('.pp-quote-copy').textContent!==data.dataset.text)preview.querySelector('.pp-quote-copy').textContent=data.dataset.text;
   if(preview.querySelector('cite').textContent!==data.dataset.author)preview.querySelector('cite').textContent=data.dataset.author;
   note.setAttribute('aria-label','Nota '+location+': La frase del día. '+data.dataset.text+'. Toca para editar');
  }else{delete note.dataset.ppQuoteText;note.querySelector('.pp-daily-quote-preview')?.remove();}
 }
 let banner=main.querySelector('.pp-daily-quote-banner');
 if(location==='banner'){
  if(!banner){banner=create('section','','pp-daily-quote-banner');banner.setAttribute('aria-label','Tu frase del día');banner.append(create('strong','Tu frase del día · Gracias por usar tus 12 notas'),create('p'),create('cite'));frame.before(banner);}
  const text=data.dataset.text||'La frase del día se está preparando.';
  if(banner.querySelector('p').textContent!==text)banner.querySelector('p').textContent=text;
  if(banner.querySelector('cite').textContent!==data.dataset.author)banner.querySelector('cite').textContent=data.dataset.author;
 }else banner?.remove();
 let prompt=main.querySelector('.pp-quote-reward');
 if(location==='ask'){
  if(!prompt){
   prompt=create('section','','pp-quote-reward');prompt.setAttribute('role','region');prompt.setAttribute('aria-label','Conservar la frase del día');
   prompt.append(create('strong','¡Has usado tus 12 notas!'),create('p','¿Quieres conservar la frase del día en una barra encima de la pizarra? A partir de ahora tus doce notas serán siempre tuyas.'));
   const status=create('p','','pp-quote-preference-status');status.setAttribute('role','status');
   for(const [label,value]of [['Sí, conservar la frase del día','banner'],['No, gracias','declined']]){const b=create('button',label);b.type='button';b.onclick=()=>{try{localStorage.setItem(key,value);if(value==='banner'&&mobile&&frame.classList.contains('zoom-2'))frame.querySelector('.zoom-button')?.click();schedule();}catch{status.textContent='No se pudo guardar tu elección. Libera espacio y vuelve a intentarlo.';}};prompt.append(b);}
   prompt.append(status);frame.after(prompt);
  }
 }else prompt?.remove();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-filled','data-text','data-author','data-board-id','class']});
window.addEventListener('postispop:quote-drawings',event=>{const {boardId,filled}=event.detail||{};if(boardId&&Array.isArray(filled)){drawings.set(boardId,filled);schedule();}});
window.addEventListener('resize',schedule);window.addEventListener('storage',schedule);window.addEventListener('postispop:save',schedule);schedule();
