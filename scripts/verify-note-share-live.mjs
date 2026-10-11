// Explicit opt-in: this uploads synthetic notes to the configured live service.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {sealSharedNote,openSharedNote} from '../note-share-package.js';
import {encryptNote,decryptNote} from '../note-crypto.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../supabase-config.js';
if(process.env.POSTISPOP_VERIFY_LIVE_SHARE!=='1')throw Error('Set POSTISPOP_VERIFY_LIVE_SHARE=1 to upload synthetic test notes.');
const endpoint=SUPABASE_URL+'/functions/v1/postispop-note-share/';
const bytes=new TextEncoder().encode('Synthetic attachment for live PostisPop verification.');
const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
const file={kind:'file',name:'verificacion.txt',type:'text/plain',size:bytes.length,created:0,sha256,data:Buffer.from(bytes).toString('base64url')};
const notes=[{text:'Comprobación de compartir PostisPop',paper:0,attachments:[file]},
 {paper:0,protectedEnvelope:await encryptNote({text:'Contenido protegido de prueba',attachments:[file]},'clave-de-prueba')}];
const links=[];
for(const note of notes){
 const sealed=await sealSharedNote({format:'postispop',version:2,notes:[note]});
 const put=await fetch(endpoint+sealed.token,{method:'PUT',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/octet-stream',Origin:'https://postispop.com'},body:sealed.blob});
 assert.equal(put.status,200,'Live upload: '+await put.clone().text());
 assert.equal((await put.json()).token,sealed.token);
 const get=await fetch(endpoint+sealed.token,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Origin:'https://postispop.com'}});
 assert.equal(get.status,200);assert.equal(get.headers.get('access-control-allow-origin'),'https://postispop.com');
 const restored=await openSharedNote(await get.blob(),sealed.token,sealed.key);
 const content=note.protectedEnvelope?await decryptNote(restored.notes[0].protectedEnvelope,'clave-de-prueba'):restored.notes[0];
 assert.equal(content.text,note.protectedEnvelope?'Contenido protegido de prueba':note.text);
 assert.equal(content.attachments[0].data,file.data);
 const direct=await fetch(SUPABASE_URL+'/storage/v1/object/public/postispop-note-shares/'+sealed.token+'.bin',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
 assert.ok(!direct.ok,'Ciphertext bucket must not be public');
 links.push({token:sealed.token,url:'https://postispop.com/nota-compartida.html#'+sealed.token+'.'+sealed.key,protected:Boolean(note.protectedEnvelope)});
}
assert.equal((await fetch(endpoint+'cleanup',{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY}})).status,403);
await mkdir('.cache',{recursive:true});await writeFile('.cache/note-share-live-check.json',JSON.stringify({checkedAt:new Date().toISOString(),links},null,2));
console.log('Live encrypted upload, independent download, file integrity, password and private bucket checks passed. Synthetic links saved only in ignored .cache/.');
