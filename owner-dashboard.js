import './supabase-bridge.js?v=6';
const $=id=>document.getElementById(id);
let page=0,request=0;
const date=value=>value?new Date(value).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'}):'Sin registro';
function clear(){ $('dashboard').hidden=true;$('users').replaceChildren();for(const id of ['users-total','boards-total','notes-total','updated','analytics'])$(id).textContent='';}
async function load(){
 const version=++request;clear();$('refresh').disabled=true;$('status').textContent='Comprobando permisos y consultando datos…';
 try{
  const response=await fetch('/api/owner/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({page_number:page})});
  const data=await response.json();if(version!==request)return;
  if(!response.ok){if(response.status===401)throw Error('SESSION_REQUIRED');if(response.status===403||data.error==='FORBIDDEN')throw Error('FORBIDDEN');throw Error('SERVER_UNAVAILABLE');}
  for(const [id,key] of [['users-total','users_total'],['boards-total','boards_total'],['notes-total','notes_total']]){
   if(!Number.isSafeInteger(data[key])||data[key]<0)throw Error('SERVER_UNAVAILABLE');$(id).textContent=new Intl.NumberFormat('es-ES').format(data[key]);
  }
  if(!Array.isArray(data.users))throw Error('SERVER_UNAVAILABLE');
  for(const user of data.users){const row=document.createElement('tr');for(const value of [user.email||'Sin correo',(user.providers||[]).join(', ')||'Sin registro',date(user.created_at),date(user.last_sign_in_at),user.email_confirmed_at?'Sí':'Pendiente']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}$('users').append(row);}
  $('updated').textContent='Datos consultados: '+date(data.server_now);$('analytics').textContent=data.analytics_note||'Google Analytics no está conectado.';
  $('page').textContent='Página '+(page+1);$('previous').disabled=page===0;$('next').disabled=(page+1)*50>=data.users_total;
  $('dashboard').hidden=false;$('status').textContent=data.users.length?'Acceso verificado.':'No hay cuentas en esta página.';
 }catch(error){if(version!==request)return;clear();$('status').textContent=error.message==='SESSION_REQUIRED'?'Inicia sesión con la cuenta propietaria en la pizarra y vuelve aquí.':error.message==='FORBIDDEN'?'Esta cuenta no tiene permiso para abrir el panel privado.':'No se pueden consultar las estadísticas. Comprueba la conexión y que el servidor esté configurado. No se muestran datos de ejemplo.';}
 finally{if(version===request)$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',load);$('previous').addEventListener('click',()=>{page=Math.max(0,page-1);load();});$('next').addEventListener('click',()=>{page++;load();});
window.addEventListener('storage',()=>{++request;clear();$('status').textContent='La sesión ha cambiado. Actualiza para comprobar el acceso.';});
window.addEventListener('pagehide',()=>{++request;clear();});load();
