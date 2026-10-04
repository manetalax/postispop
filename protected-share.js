import './supabase-bridge.js';
import {decryptNote,validateEnvelope} from './note-crypto.js';
import {protectedApi,protectedError,renderProtectedPayload} from './protected-notes.js';
const form=document.querySelector('#share-unlock'),status=document.querySelector('#share-status'),content=document.querySelector('#share-content'),lock=document.querySelector('#share-lock');
const field=form.elements.password,button=form.querySelector('button');
let envelope=null,objectUrls=[],attempt=0,active=true;
const token=location.hash.slice(1);
function clear(){attempt++;field.value='';content.replaceChildren();content.hidden=true;lock.hidden=true;form.hidden=false;objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];}
function relock(){clear();status.textContent='La nota vuelve a estar bloqueada.';}
async function load(){
  if(!/^[a-f0-9]{64}$/.test(token)){status.textContent='Este enlace no es válido. Pide un enlace nuevo a quien te lo envió.';return;}
  try{const result=await protectedApi('protected-shares/'+token);validateEnvelope(result.envelope);envelope=result.envelope;field.disabled=false;button.disabled=false;status.textContent='Nota protegida. Introduce su contraseña para abrirla.';}catch{status.textContent='El enlace no está disponible, ha caducado o se ha revocado. Comprueba la conexión o pide un enlace nuevo.';}
}
form.addEventListener('submit',async event=>{event.preventDefault();if(!envelope)return;const thisAttempt=++attempt;button.disabled=true;status.textContent='Abriendo en este dispositivo…';try{
  // Recheck server expiry/revocation for each new opening. Never cache plaintext.
  const current=await protectedApi('protected-shares/'+token);validateEnvelope(current.envelope);
  const payload=await decryptNote(current.envelope,field.value);if(!active||thisAttempt!==attempt||document.hidden)return;
  field.value='';content.replaceChildren();renderProtectedPayload(content,payload,objectUrls);form.hidden=true;content.hidden=false;lock.hidden=false;status.textContent='Nota abierta. Se bloqueará al cambiar de aplicación. Quien puede leerla también puede copiarla.';
}catch(error){if(thisAttempt===attempt)status.textContent=protectedError(error);}finally{button.disabled=false;}});
lock.addEventListener('click',relock);document.addEventListener('visibilitychange',()=>{if(document.hidden)relock();});window.addEventListener('pagehide',()=>{active=false;clear();});window.addEventListener('pageshow',()=>{active=true;});load();
