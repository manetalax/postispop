import {installNativeShare} from './native-share.js';
import {shareFile} from './share-tools.js';
import {parseShareLink,openSharedNote,MAX_SHARE_BYTES} from './note-share-package.js';
import {shareCopy} from './note-share-copy.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';
import {base64ToBytes,decryptNote} from './note-crypto.js';
import {normalizeStyle,drawStrokes,readableInk,paperColor} from './style-model.js';
import {paperSvg,svgUrl} from './editor-catalog.js';
if(window.PostisPopShare)installNativeShare();
const t=shareCopy(),status=document.querySelector('#shared-status'),content=document.querySelector('#shared-content'),form=document.querySelector('#shared-unlock'),password=document.querySelector('#shared-password');
let urls=[],protectedNote=null,link=null,active=true,attempt=0;
const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const objectUrl=blob=>{const url=URL.createObjectURL(blob);urls.push(url);return url;};
function clear(){urls.forEach(URL.revokeObjectURL);urls=[];content.replaceChildren();content.hidden=true;password.value='';}
async function readCopy(){
  const response=await fetch(`${SUPABASE_URL}/functions/v1/postispop-note-share/${link.token}`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},cache:'no-store',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('UNAVAILABLE');
  if(Number(response.headers.get('content-length'))>MAX_SHARE_BYTES+28)throw Error('TOO_LARGE');
  const reader=response.body.getReader(),chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_SHARE_BYTES+28){await reader.cancel();throw Error('TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}
  return openSharedNote(new Blob(chunks),link.token,link.key);
}
function render(note){
  clear();const paper=node('section','','pp-shared-paper'),text=node('p','','pp-shared-text');
  const colors=['#ffec86','#f4cfdd','#cee5f8','#f3ead7','#d6e8c6','#e3d7f1'];paper.style.setProperty('--shared-paper',colors[note.paper]||colors[0]);
  if(note.style){const style=normalizeStyle(note.style);paper.style.setProperty('--shared-paper-image',svgUrl(paperSvg(style.paper)));paper.style.setProperty('--shared-paper',paperColor(style.paper));text.style.fontFamily=({sans:'PP Editorial',serif:'PP Clasica',mono:'PP Maquina',hand:'PP Manuscrita',rounded:'PP Redondeada',book:'PP Libro'})[style.font];text.style.fontSize=style.size+'px';text.style.fontStyle=style.italic?'italic':'normal';text.style.textDecoration=style.underline?'underline':'none';text.style.color=readableInk(style.ink,paperColor(style.paper));
    if(style.drawing?.strokes?.length){const canvas=node('canvas','','pp-shared-drawing');canvas.width=960;canvas.height=600;canvas.setAttribute('aria-label',t.received);drawStrokes(canvas.getContext('2d'),style.drawing,960,600);paper.append(canvas);}}
  const ink={'ink-blue':'#163b62','ink-red':'#883647','marker-blue':'#163b62','marker-red':'#883647',highlight:'#fff09a'};
  const marks=(note.marks||[]).filter(m=>ink[m.ink]).sort((a,b)=>a.start-b.start);let offset=0;
  for(const mark of marks){if(mark.start<offset)continue;text.append(document.createTextNode(note.text.slice(offset,mark.start)));const span=node('span',note.text.slice(mark.start,mark.end));if(mark.ink==='highlight')span.style.backgroundColor=ink[mark.ink];else span.style.color=ink[mark.ink];text.append(span);offset=mark.end;}text.append(document.createTextNode(note.text.slice(offset)));paper.prepend(text);
  const symbols={heart:'♥',idea:'💡',smile:'☺',cart:'🛒',star:'★',check:'✓',ticket:'🎟'};if(symbols[note.doodle])paper.append(node('p',symbols[note.doodle]));content.append(paper);
  const files=node('section','','pp-shared-files');for(const item of note.attachments||[]){
    const card=node('section','','pp-shared-file');card.append(node('h2',item.name));
    const a=node('a',item.kind==='link'?item.url:t.file);
    if(item.kind==='link'){a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';}
    else{const blob=new Blob([item.data?base64ToBytes(item.data):new Uint8Array()],{type:item.type});a.href=objectUrl(blob);a.download=item.name;
      if(item.compression!=='gzip')a.addEventListener('click',async event=>{if(!window.__postispopNativeShare)return;event.preventDefault();try{await shareFile(new File([blob],item.name,{type:blob.type.split(';')[0]}),{title:item.name});}catch{status.textContent=t.unavailable;}});
      // Active file formats (HTML/SVG/PDF/office) remain downloads, never embedded.
      const mime=item.type.split(';')[0];let media;if(/^image\/(png|jpeg|webp|gif|avif)$/.test(mime))media=node('img');else if(/^video\/(mp4|webm|ogg|quicktime)$/.test(mime))media=node('video');else if(/^audio\/(mpeg|mp4|webm|ogg|wav|x-wav|aac)$/.test(mime))media=node('audio');
      if(media&&item.compression!=='gzip'){media.src=a.href;if(media.tagName==='IMG')media.alt=item.name;else{media.controls=true;media.preload='metadata';}card.append(media);}
      if(item.compression==='gzip'){a.addEventListener('click',async event=>{if(!globalThis.DecompressionStream)return;event.preventDefault();try{
        const stream=blob.stream().pipeThrough(new DecompressionStream('gzip')),reader=stream.getReader(),parts=[];let size=0;
        try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>25*1024*1024){await reader.cancel();throw Error('TOO_LARGE');}parts.push(value);}}finally{reader.releaseLock();}
        const download=node('a');download.href=objectUrl(new Blob(parts,{type:item.originalType||'application/octet-stream'}));download.download=item.name;if(window.__postispopNativeShare)await shareFile(new File(parts,item.name,{type:item.originalType||'application/octet-stream'}),{title:item.name});else download.click();
      }catch{status.textContent=t.unavailable;}});if(!globalThis.DecompressionStream)a.download=item.name+'.gz';}
    }card.append(a);files.append(card);
  }content.append(files);content.hidden=false;status.textContent=t.snapshot;
}
async function load(){
  document.title=t.received+' · PostisPop';document.querySelector('#shared-heading').textContent=t.received;document.querySelector('#shared-footer').textContent=t.snapshot;document.querySelector('#shared-password-label').textContent=t.password;form.querySelector('button').textContent=t.open;status.textContent=t.opening;
  try{link=parseShareLink(location.hash);const data=await readCopy();if(!active)return;const note=data.notes[0];if(note.protectedEnvelope){protectedNote=note;form.hidden=false;status.textContent=t.protected;}else render(note);}catch{status.textContent=t.unavailable;}
}
form.addEventListener('submit',async event=>{event.preventDefault();const n=++attempt;const button=form.querySelector('button');button.disabled=true;try{const data=await readCopy();const payload=await decryptNote(data.notes[0].protectedEnvelope,password.value);if(!active||n!==attempt||document.hidden)return;render(payload);password.value='';form.hidden=true;}catch{status.textContent=t.wrongPassword;}finally{button.disabled=false;}});
function relock(){if(protectedNote){attempt++;clear();form.hidden=false;status.textContent=t.protected;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)relock();});window.addEventListener('pagehide',()=>{active=false;attempt++;clear();});window.addEventListener('pageshow',event=>{active=true;if(event.persisted){protectedNote=null;load();}});load();
