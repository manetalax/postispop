import {base64ToBytes} from './note-crypto.js';

// A preview is sent only to the chosen application, never to a public metadata endpoint.
export function previewEligible(note){
  if(!note||note.protectedEnvelope||note.image||note.doodle||note.style?.drawing?.strokes?.length)return false;
  const text=String(note.text||'');
  if([...text].length>300||text.split('\n').length>8)return false;
  const files=note.attachments||[];
  return files.length<=1&&files.every(f=>f.kind==='file'&&!f.compression&&/^image\/(png|jpeg|webp|gif|avif)$/.test(f.type?.split(';')[0]))&&Boolean(text.trim()||files.length);
}
function wrap(ctx,text,width){
  const lines=[];
  for(const paragraph of text.split('\n')){
    let line='';
    for(const character of paragraph){if(line&&ctx.measureText(line+character).width>width){lines.push(line);line='';}line+=character;}
    lines.push(line);
  }
  return lines;
}
export async function createNotePreview(note,copy){
  if(!previewEligible(note))return null;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return null;
  canvas.width=960;ctx.font='48px sans-serif';
  const text=String(note.text||''),lines=wrap(ctx,text,848);
  if(lines.length>8)return null;
  let image=null,url=null;
  try{
    if(note.attachments?.length){
      const file=note.attachments[0];url=URL.createObjectURL(new Blob([base64ToBytes(file.data)],{type:file.type}));
      image=new Image();image.src=url;await image.decode();
      if(!image.naturalWidth||!image.naturalHeight)return null;
    }
    const imageHeight=image?Math.min(320,848*image.naturalHeight/image.naturalWidth):0;
    canvas.height=148+(image?imageHeight+36:0)+(text?lines.length*62+32:0)+104;
    ctx.fillStyle='#fff9e9';ctx.fillRect(0,0,960,canvas.height);
    ctx.fillStyle='#153f37';ctx.font='bold 40px sans-serif';ctx.fillText('PostisPop',56,70);
    let y=112;
    if(image){const width=Math.min(848,imageHeight*image.naturalWidth/image.naturalHeight);ctx.drawImage(image,(960-width)/2,y,width,imageHeight);y+=imageHeight+36;}
    ctx.fillStyle='#192b26';ctx.font='48px sans-serif';ctx.textBaseline='top';for(const line of text?lines:[]){ctx.fillText(line,56,y);y+=62;}
    ctx.fillStyle='#153f37';ctx.font='22px sans-serif';const hintLines=wrap(ctx,copy.previewHint,848);hintLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,56,canvas.height-104+i*28));
    ctx.font='bold 24px sans-serif';ctx.fillText('postispop.com',56,canvas.height-48);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    return blob?new File([blob],'PostisPop-nota.png',{type:'image/png'}):null;
  }catch{return null;}finally{if(url)URL.revokeObjectURL(url);}
}
