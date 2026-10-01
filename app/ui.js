export const escape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function api(endpoint, body) {
  const response=await fetch('/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json(); if(!response.ok) throw Object.assign(Error(data.error||'REQUEST_FAILED'),{status:response.status}); return data;
}
export function notice(text) {
  let node=document.getElementById('pp-feedback'); if(!node){node=document.createElement('p');node.id='pp-feedback';node.setAttribute('role','status');document.body.append(node);}
  node.textContent=text; clearTimeout(notice.timer);notice.timer=setTimeout(()=>node.remove(),8000);
}
export function errorMessage(error) {
  const known={SESSION_REQUIRED:'Inicia sesión para usar esta función en la nube.',MIGRATION_REQUIRED:'Esta función necesita activar la actualización de la base de datos. Tus notas no se han cambiado.',BOARD_FULL:'No hay suficientes espacios vacíos. Exporta una copia o utiliza otra pizarra.',INVALID_BACKUP:'La copia no tiene un formato compatible.',CONFLICT:'La nota ha cambiado en otro dispositivo. Actualiza antes de guardar.',OWNER_REQUIRED:'Solo el propietario puede gestionar este acceso.',NOT_FOUND:'No se encuentra la pizarra o el enlace ha caducado.',INVALID_NOTE:'La nota supera los límites admitidos.',BACKUP_TOO_LARGE:'La copia supera el límite de 2 MB.'};
  return known[error.message] || 'No se pudo completar la operación. Conserva tus datos y vuelve a intentarlo.';
}
export function dialog(title, body) {
  const previous=document.activeElement;const node=document.createElement('dialog');node.className='pp-tools-dialog';
  node.innerHTML=`<header><h2>${escape(title)}</h2><button type="button" aria-label="Cerrar">×</button></header>${body}`;
  document.body.append(node);node.setAttribute('aria-label',title);node.querySelector('header button').onclick=()=>node.close();node.addEventListener('close',()=>{node.remove();previous?.focus();},{once:true});node.showModal();return node;
}
export function download(name, content, type='application/json') {
  const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
