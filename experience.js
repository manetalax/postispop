import {track, metricsEnabled, setMetricsEnabled, readMetrics, recordVisit} from './usage-metrics.js';
import {initBoardTools, download} from './board-tools.js?v=2';

const SEO_TITLE='Bloc de notas online gratis y pizarra de post-it compartida | PostisPop';
let lastSave=null, installPrompt=null;
const notice=(message)=>{
  let node=document.querySelector('.pp-onboarding-tip');
  if(!node){node=document.createElement('p');node.className='pp-onboarding-tip';node.setAttribute('role','status');document.querySelector('.workspace-caption')?.after(node);}
  node.textContent=message;
};
function update() {
  // Recovered React may replace its document title; preserve the real SEO title.
  if(document.title==='PostisPop')document.title=SEO_TITLE;
  const opt=document.querySelector('[data-experience-analytics]');
  if(opt && opt.checked!==metricsEnabled())opt.checked=metricsEnabled();
  const local=Boolean(document.querySelector('.guest-header'));
  document.querySelectorAll('.connection').forEach(node=>{
    const span=node.querySelector('span');
    if(!span)return;
    if(lastSave && lastSave.mode===(local?'local':'cloud')){
      const text=lastSave.state==='saving'?'Guardando…':lastSave.state==='error'?'Error al guardar. Conserva el borrador y vuelve a intentarlo.':local?'Guardado en este dispositivo':'Guardado en la nube';
      if(span.textContent!==text)span.textContent=text;
      const at=lastSave.state==='saved'?new Date(lastSave.at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}):null;
      const title=at?(local?'Último guardado local: ':'Última sincronización: ')+at:(local?'Modo local':'Modo nube');
      if(node.title!==title)node.title=title;
    }
  });
  initBoardTools();
  const installButton=document.querySelector('[data-experience="install"]');
  if(installButton)installButton.hidden=!installPrompt;
}
window.addEventListener('postispop:save',event=>{lastSave=event.detail;update();});
window.addEventListener('postispop:activity',event=>track(event.detail?.name));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;document.querySelector('[data-experience="install"]')?.removeAttribute('hidden');});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.querySelector('[data-experience="install"]')?.setAttribute('hidden','');});
document.addEventListener('change',event=>{if(event.target.matches('[data-experience-analytics]')){setMetricsEnabled(event.target.checked);recordVisit();}});
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-experience]');if(!button)return;
  const action=button.dataset.experience;
  if(action==='signup')document.querySelector('.header-auth-signup')?.click();
  if(action==='start'){
    // Use the app's own editor and dismissible onboarding, preserving its save flow.
    const close=document.querySelector('.onboarding-card .onboarding-heading button');close?.click();
    const note=[...document.querySelectorAll('.sticky-note:not([disabled])')].find(n=>n.querySelector('.blank-note'))||document.querySelector('.sticky-note:not([disabled])');
    note?.click();
    if(!note)notice('La pizarra se está preparando. Espera un momento y vuelve a pulsar.');
  }
  if(action==='metrics')download('PostisPop-contadores.json',JSON.stringify(readMetrics(),null,2),'application/json');
  if(action==='install' && installPrompt){await installPrompt.prompt();installPrompt=null;button.hidden=true;}
});
// Sharing controls in the recovered UI call APIs that are not implemented.
// Explain the real state instead of allowing a misleading success path.
document.addEventListener('click',event=>{
  if(event.target.closest('.group-button,.header-share')){
    event.preventDefault();event.stopImmediatePropagation();
    notice('Los enlaces y las invitaciones están en revisión. Puedes descargar una copia desde «Opciones avanzadas» para conservar o compartir tus notas.');
  }
},true);
let scheduled=false;
new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}).observe(document.body,{childList:true,subtree:true});
recordVisit();update();
