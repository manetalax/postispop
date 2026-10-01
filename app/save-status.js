import { track } from './analytics.js';
let current=null,lastSync=null,pending=0,failed=false;
function paint() {
  const el=document.getElementById('pp-save-status');if(!el)return;
  const cloud=current?.actor?.registered && !current?.board?.id?.startsWith('guest-board');
  const mode=cloud?'Modo nube':'Modo local';
  el.textContent=failed?`${mode} · Error al guardar. Conserva la nota y vuelve a intentarlo.`:pending?`${mode} · Guardando…`:`${mode} · ${cloud?(lastSync?'Guardado en la nube':'Conectado'):'Guardado en este dispositivo'}${cloud&&lastSync?' · Última sincronización: '+new Date(lastSync).toLocaleTimeString('es-ES'):''}`;
}
export function initStatus() {
  window.addEventListener('postispop:board',e=>{current=e.detail;paint();});
  window.addEventListener('postispop:request',e=>{
    const {stage,endpoint,method,ok}=e.detail;
    if(!/^(note\/|board\/|restore\/|tools\/)/.test(endpoint) || method==='GET' || /\/(lock|unlock)$/.test(endpoint))return;
    if(stage==='start'){pending++;failed=false;}else{pending=Math.max(0,pending-1);failed=!ok;if(ok&&current?.actor?.registered){lastSync=Date.now();track('first_sync',true);}}
    paint();
  });
  window.addEventListener('offline',paint);window.addEventListener('online',paint);
}
