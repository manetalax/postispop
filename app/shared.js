import '../supabase-bridge.js?v=5';
import { api, escape, notice, errorMessage } from './ui.js';
const root=document.getElementById('pp-shared');
const token=location.hash.slice(1);
let board=null;
const login=()=>{sessionStorage.setItem('pp:pending-share',token);location.assign('/?signin=1');};
async function load(){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))throw Error('NOT_FOUND');
  board=await api('tools/readshare',{token});
  root.innerHTML=`<header><h1>${escape(board.title||'Pizarra compartida')}</h1><p>${board.editable?'Puedes editar el texto de las notas.':'Vista de solo lectura.'} Enlace válido hasta ${escape(new Date(board.expires_at).toLocaleString('es-ES'))}.</p><p>Esta vista comparte texto y colores. Los archivos adjuntos, imágenes y dibujos no se muestran.</p>${board.requiresLogin?'<button data-login>Iniciar sesión para editar</button>':''}<button data-refresh>Actualizar pizarra</button><a href="/">Crear mi propia pizarra</a></header><div class="pp-shared-grid">${board.notes.map((n,i)=>`<article style="--paper:${['#ffec86','#ffc9dd','#d5ecc7','#cce6fb','#e2d7fa','#fff'][n.paper]||'#fff'}"><h2>Nota ${i+1}</h2>${board.editable?`<form data-note="${escape(n.id)}"><label>Texto de la nota ${i+1}<textarea maxlength="10000" rows="8">${escape(n.text)}</textarea></label><button type="submit">Guardar nota</button><p role="status"></p></form>`:`<p class="pp-shared-text">${escape(n.text||'Nota vacía')}</p>`}</article>`).join('')}</div>`;
  root.querySelector('[data-login]')?.addEventListener('click',login);
  root.querySelector('[data-refresh]').onclick=async()=>{
    if(root.querySelector('form[data-dirty]')){notice('Guarda primero tus cambios antes de actualizar.');return;}
    try{await load();}catch(e){notice(errorMessage(e));}
  };
  root.querySelectorAll('form').forEach(form=>{
    form.oninput=()=>{form.dataset.dirty='true';};
    form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button'),status=form.querySelector('[role=status]'),n=board.notes.find(n=>n.id===form.dataset.note);button.disabled=true;status.textContent='Guardando…';
      try{const submitted=form.querySelector('textarea').value;const saved=await api('tools/editshared',{token,note_id:n.id,text:submitted,revision:n.revision});Object.assign(n,saved);if(form.querySelector('textarea').value===submitted){delete form.dataset.dirty;status.textContent='Nota guardada en la nube.';}else status.textContent='Versión enviada guardada. Tienes nuevos cambios pendientes.';}
      catch(err){status.textContent=err.message==='CONFLICT'?'Otra persona ha cambiado o está editando esta nota. Copia tu borrador antes de volver a abrir el enlace.':errorMessage(err);}
      finally{button.disabled=false;}
    };
  });
}
load().catch(error=>{
  root.innerHTML=`<h1>No se puede abrir esta pizarra</h1><p>${error.message==='INVITATION_ACCOUNT_REQUIRED'?'Este enlace está restringido al correo de la persona invitada. Inicia sesión con esa cuenta y confirma su correo.':error.message==='MIGRATION_REQUIRED'?errorMessage(error):'El enlace puede haber caducado o haber sido revocado.'}</p><button data-login>Iniciar sesión</button><a href="/">Volver a PostisPop</a>`;root.querySelector('[data-login]').onclick=login;
});
window.addEventListener('beforeunload',event=>{if(root.querySelector('form[data-dirty]')){event.preventDefault();event.returnValue='';}});
