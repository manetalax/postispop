import {track, metricsEnabled, setMetricsEnabled, readMetrics, recordVisit} from './usage-metrics.js';
import {initBoardTools, download} from './board-tools.js?v=2';


// A compact visit streak. Account rewards are confirmed exclusively by the server.
const STREAK_KEY='pp:guest-visit-streak-v1';
let streakBusy=false,streakEpoch=0,streakChecked='',streakRetry=0;
const madridDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
function localVisit(today){
  let previous={};try{previous=JSON.parse(localStorage.getItem(STREAK_KEY)||'{}')||{};}catch{}
  const yesterday=new Date(Date.parse(today+'T12:00:00Z')-86400000).toISOString().slice(0,10);
  const old=Number(previous.days),valid=Number.isInteger(old)&&old>=1&&old<=5;
  const days=valid&&previous.date===today?old:valid&&previous.date===yesterday?(old%5)+1:1;
  let saved=true;try{localStorage.setItem(STREAK_KEY,JSON.stringify({date:today,days}));}catch{saved=false;}
  return {days,saved};
}
function paintStreak(days,message){
  const bar=document.querySelector('.pp-visit-streak');if(!bar)return;
  const signature=days+'|'+message;if(bar.dataset.state===signature)return;bar.dataset.state=signature;
  const marks=bar.querySelector('.pp-streak-days');marks.replaceChildren();
  for(let day=1;day<=5;day++){const mark=document.createElement('span');mark.className=day<=days?'done':'';mark.textContent=day<=days?'✓':String(day);mark.setAttribute('aria-label','Día '+day+(day<=days?', completado':', pendiente'));marks.append(mark);}
  bar.querySelector('.pp-streak-status').textContent=message;bar.title=message;
}
async function syncVisitStreak(){
  if(streakBusy||!document.querySelector('.pp-visit-streak')||document.hidden)return;
  const today=madridDay();if(streakChecked===today||Date.now()<streakRetry)return;
  streakBusy=true;const epoch=streakEpoch;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  const request=async(endpoint,body)=>{const response=await fetch('/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});if(!response.ok)throw new Error('STREAK_UNAVAILABLE');return response.json();};
  try{
    const session=await request('session');if(epoch!==streakEpoch)return;
    if(session.actor?.registered){
      if(!navigator.onLine)throw new Error('OFFLINE');
      const rights=await request('designs/checkin',{});if(epoch!==streakEpoch)return;
      if(!Number.isInteger(rights.streak)||rights.streak<0||rights.streak>4)throw new Error('INVALID_STREAK');
      const completed=rights.streak===0?5:rights.streak;
      paintStreak(completed,completed===5?'✓ 5/5 · Recompensa disponible':'✓ Hoy cuenta · '+completed+'/5');
      streakChecked=madridDay(new Date(rights.server_now||Date.now()));
    }else{
      const local=localVisit(today);
      paintStreak(local.days,local.saved?'Visita local · Inicia sesión para premios':'Visita de hoy · Sin guardar');
      streakChecked=today;
    }
    streakRetry=0;
  }catch{if(epoch===streakEpoch){paintStreak(0,navigator.onLine?'Progreso pendiente de confirmar':'Sin conexión · Pendiente de confirmar');streakRetry=Date.now()+30000;}}
  finally{clearTimeout(timer);streakBusy=false;if(epoch!==streakEpoch)syncVisitStreak();}
}
function installVisitStreak(header){
  if(!header)return;
  if(!document.querySelector('.pp-visit-streak')){
    const bar=document.createElement('a');bar.className='pp-visit-streak';bar.href='/premios.html';bar.setAttribute('aria-label','Días seguidos para premios');
    const label=document.createElement('strong');label.textContent='Días seguidos para premios';
    const days=document.createElement('span');days.className='pp-streak-days';
    const status=document.createElement('span');status.className='pp-streak-status';status.setAttribute('role','status');
    bar.append(label,days,status);header.before(bar);paintStreak(0,'Confirmando visita…');
  }
  syncVisitStreak();
}
window.addEventListener('postispop:session-change',()=>{streakEpoch++;streakChecked='';streakRetry=0;paintStreak(0,'Confirmando visita…');syncVisitStreak();});
window.addEventListener('online',()=>{streakChecked='';streakRetry=0;syncVisitStreak();});
document.addEventListener('visibilitychange',syncVisitStreak);
setInterval(syncVisitStreak,60000);

const SEO_TITLE='Bloc de notas online gratis y pizarra de post-it compartida | PostisPop';
let lastSave=null, installPrompt=null;
const notice=(message)=>{
  let node=document.querySelector('.pp-onboarding-tip');
  if(!node){node=document.createElement('p');node.className='pp-onboarding-tip';node.setAttribute('role','status');document.querySelector('.workspace-caption')?.after(node);}
  node.textContent=message;
};
function update() {
  const hydrated=Boolean(document.querySelector('.board-frame:not(.is-loading) .sticky-note:not([disabled])[data-note-id]'));
  const header=hydrated?document.querySelector('.app-header'):null;
  installVisitStreak(header);
  if(header&&!header.querySelector('.pp-arcade-nav')){
    const nav=document.createElement('nav');nav.className='pp-arcade-nav';nav.setAttribute('aria-label','Explorar');
    for(const [label,href] of [['✦ Premios','/premios.html'],['Tienda','/atelier.html'],['? Ayuda','/ayuda.html']]){const link=document.createElement('a');link.textContent=label;link.href=href;nav.append(link);}header.append(nav);
  }
  if(hydrated)document.querySelector('.onboarding-card .onboarding-heading button')?.click();

  // The mobile layout hides the text inside this icon button.
  document.querySelectorAll('.header-share').forEach(button=>{
    if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim()||'Compartir');
  });
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
  const frame=document.querySelector('.board-frame');if(frame&&hydrated){const top=frame.getBoundingClientRect().top+window.scrollY;const height=Math.max(240,Math.floor(window.innerHeight-top-14))+'px';if(frame.style.getPropertyValue('--pp-board-height')!==height)frame.style.setProperty('--pp-board-height',height);}

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

document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.textContent.trim()==='Cómo funciona'){event.preventDefault();event.stopImmediatePropagation();location.href='/ayuda.html';}},true);

window.addEventListener('resize',update);
