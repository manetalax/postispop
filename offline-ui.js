/** Small account outbox status. No timers, credentials or note contents in the status badge. */
export function installOfflineUI({status}) {
  if(typeof document==='undefined'||typeof window.addEventListener!=='function')return;
  const start=()=>{
    if(document.getElementById('pp-offline-state'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='/offline-ui.css';document.head.append(link);
    const button=document.createElement('button');button.id='pp-offline-state';button.type='button';button.hidden=true;button.setAttribute('aria-live','polite');document.body.append(button);
    const dialog=document.createElement('dialog');dialog.className='pp-offline-dialog';dialog.setAttribute('aria-label','Cambios guardados en este dispositivo');document.body.append(dialog);
    let dialogAccount=null;
    const refresh=()=>{const s=status();if(dialogAccount&&dialogAccount!==s.userId){dialog.close();dialog.replaceChildren();dialogAccount=null;}button.hidden=!s.userId||(!s.pending&&!s.conflicts&&s.online);button.textContent=s.conflicts?`${s.conflicts} conflicto${s.conflicts===1?'':'s'} · Revisar`:s.pending?`${s.pending} cambio${s.pending===1?'':'s'} pendiente${s.pending===1?'':'s'}`:'Sin conexión · guardado local';button.dataset.problem=String(!!s.conflicts);};
    const el=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
    async function open(){
      const account=status().userId;if(!account)return;dialogAccount=account;
      dialog.replaceChildren(el('h2','Tus cambios están guardados aquí'));
      dialog.append(el('p','Los cambios pendientes se envían a tu cuenta al recuperar conexión. Si otra versión cambió la misma nota, puedes revisar ambas antes de elegir.'));
      const close=el('button','Cerrar');close.type='button';close.addEventListener('click',()=>dialog.close());dialog.append(close);
      const sync=el('button','Intentar sincronizar');sync.type='button';sync.addEventListener('click',async()=>{sync.disabled=true;await fetch('/api/offline/sync',{method:'POST',body:'{}'});sync.disabled=false;refresh();await open();});dialog.append(sync);
      const response=await fetch('/api/offline/conflicts');if(!response.ok){dialog.append(el('p','Inicia sesión en esta cuenta para revisar sus cambios.'));if(!dialog.open)dialog.showModal();return;}
      const data=await response.json();if(status().userId!==account){dialog.close();dialog.replaceChildren();return;}
      if(!data.conflicts.length)dialog.append(el('p','No hay conflictos.'));
      for(const conflict of data.conflicts){
        const section=el('section','');section.append(el('h3',conflict.kind==='style'?'Estilo de nota':'Versiones de una nota'));
        const protectedNote=!!(conflict.after?.protectedEnvelope||conflict.server?.protectedEnvelope);
        section.append(el('p',protectedNote?(conflict.after?.protectedEnvelope?'Nota protegida: tu versión se conserva cifrada.':'La cuenta protegió esta nota. Tu borrador local anterior aún no está cifrado; no se enviará como texto.'):`Tu versión: ${conflict.after?.text||'(cambio de formato o imagen)'}`));
        section.append(el('p',protectedNote?'No se muestra contenido privado.':`Versión de la cuenta: ${conflict.server?.text||'(no disponible)'}`));
        for(const [choice,label] of [['server','Conservar versión de la cuenta'],['local','Enviar mi versión']]){
          const choose=el('button',label);choose.type='button';choose.disabled=choice==='local'&&!conflict.server?.revision;
          choose.addEventListener('click',async()=>{choose.disabled=true;const r=await fetch('/api/offline/resolve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:conflict.id,choice})});if(!r.ok){const body=await r.json();section.append(el('p',body.error||'No se pudo resolver.'));choose.disabled=false;}else{refresh();await open();}});section.append(choose);
        }
        dialog.append(section);
      }
      if(data.conflicts.length||data.recovery.length){
        const save=el('button','Descargar copias de recuperación');save.type='button';save.addEventListener('click',()=>{if(status().userId!==account)return;const blob=new Blob([JSON.stringify({format:'postispop-offline-recovery',version:1,...data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='postispop-cambios-recuperacion.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});dialog.append(save);
        dialog.append(el('p','Al conservar la versión de la cuenta, tus cambios se archivan en este dispositivo. El archivo de recuperación no está cifrado: los borradores anteriores a una protección pueden contener texto legible.'));
      }
      if(!dialog.open)dialog.showModal();
    }
    button.addEventListener('click',()=>void open());
    window.addEventListener('postispop:offline',refresh);window.addEventListener('online',refresh);window.addEventListener('offline',refresh);refresh();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
