import {whenReactReady} from './ui-ready.js';
import './board-layout.js?v=20261008a';
import {track, metricsEnabled, setMetricsEnabled, readMetrics, recordVisit} from './usage-metrics.js';
import {initBoardTools, download, openShareDialog} from './board-tools.js?v=20261009a';
import {initBoardPreferences} from './board-preferences.js?v=20261008a';
import {readBoardLanguage} from './seo-language.js';

const ACCOUNT_LABELS={es:'Cuenta',en:'Account',de:'Konto',fr:'Compte',pt:'Conta',it:'Account',ja:'アカウント',ko:'계정'};


const SEO_TITLE='Bloc de notas online gratis y pizarra | PostisPop';
let lastSave=null, installPrompt=null, reactReady=false;
function syncHeaderAccountActions(header) {
  if (!header) return;
  const sources = {
    login: header.querySelector('.header-auth-login'),
    signup: header.querySelector('.header-auth-signup'),
    logout: document.querySelector('.workspace-caption .session-identity .session-logout')
  };
  let strip = header.querySelector('.pp-account-strip');
  if (Object.values(sources).some(Boolean) && !strip) {
    strip = document.createElement('nav');
    strip.className = 'pp-account-strip';
    strip.setAttribute('aria-label', ACCOUNT_LABELS[readBoardLanguage()]||ACCOUNT_LABELS.es);
    header.append(strip);
    header.classList.add('pp-has-account-strip');
  }
  if (!strip) return;
  strip.setAttribute('aria-label', ACCOUNT_LABELS[readBoardLanguage()]||ACCOUNT_LABELS.es);
  for (const [action, source] of Object.entries(sources)) {
    let proxy = strip.querySelector(`[data-pp-auth-proxy="${action}"]`);
    if (!source) { proxy?.remove(); continue; }
    if (!proxy) {
      proxy = source.cloneNode(true);
      proxy.removeAttribute('id');
      proxy.dataset.ppAuthProxy = action;
      proxy.removeAttribute('title');
      strip.append(proxy);
    }
    if (proxy.innerHTML !== source.innerHTML) proxy.innerHTML = source.innerHTML;
    proxy.disabled = source.disabled;
    for (const attribute of ['aria-label', 'aria-haspopup', 'aria-expanded']) {
      const value = source.getAttribute(attribute);
      if (value === null) proxy.removeAttribute(attribute); else proxy.setAttribute(attribute, value);
    }
  }
  if (!strip.children.length) { strip.remove(); header.classList.remove('pp-has-account-strip'); }
}
const notice=(message)=>{
  let node=document.querySelector('.pp-onboarding-tip');
  if(!node){node=document.createElement('p');node.className='pp-onboarding-tip';node.setAttribute('role','status');document.querySelector('.workspace-caption')?.after(node);}
  node.textContent=message;
};
function update() {
  // Save/resize events can arrive during the first React commit. Cache their
  // state, but do not insert tools or rewrite any React-owned DOM until ready.
  if(!reactReady)return;
  initBoardPreferences();
  const hydrated=Boolean(document.querySelector('.board-frame:not(.is-loading) .sticky-note:not([disabled])[data-note-id]'));
  const header=hydrated?document.querySelector('.app-header'):null;

  if(header)document.querySelectorAll('.header-share,.group-button').forEach(button=>{button.disabled=false;});

  if (header && !header.querySelector('.pp-menu-toggle')) {
    const button = document.createElement('button');
    button.className = 'pp-icon pp-menu-toggle'; button.type = 'button';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    button.title = 'Menú'; button.setAttribute('aria-label', 'Menú'); button.setAttribute('aria-expanded', 'false');
    button.onclick = () => { const open = header.classList.toggle('pp-menu-open'); button.setAttribute('aria-expanded', String(open)); };
    header.append(button);
    const nav = document.createElement('nav'); nav.className = 'pp-app-links'; nav.setAttribute('aria-label', 'Aplicación');
    for (const [label,href] of [['Premium','/atelier.html'],['Descargas','/descargas/'],['Ayuda','/ayuda.html']]) { const link=document.createElement('a'); link.textContent=label;link.href=href;nav.append(link); }
    header.append(nav);
  }
  syncHeaderAccountActions(header);
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
  const authProxy=event.target.closest('[data-pp-auth-proxy]');
  if(authProxy){
    event.preventDefault();event.stopPropagation();
    const source=authProxy.dataset.ppAuthProxy==='logout'
      ? document.querySelector('.workspace-caption .session-identity .session-logout')
      : document.querySelector(`.header-auth-${authProxy.dataset.ppAuthProxy}`);
    if(source&&!source.disabled)source.click();
    return;
  }
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
  if(action==='metrics'){
    button.disabled=true;
    try{
      const saved=await download('PostisPop-contadores.json',JSON.stringify(readMetrics(),null,2),'application/json');
      if(!saved)notice('Guardado cancelado. Tus contadores se conservan.');
    }catch{notice('No se pudieron guardar los contadores. Vuelve a intentarlo; los datos se conservan.');}
    finally{button.disabled=false;}
  }
  if(action==='install' && installPrompt){await installPrompt.prompt();installPrompt=null;button.hidden=true;}
});
document.addEventListener('click',event=>{
  const button=event.target.closest('.group-button,.header-share,.pp-share-board-link');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  try{openShareDialog(button);}catch{notice('No se pudo abrir el menú para compartir. Tus notas se conservan.');}
},true);
let scheduled=false;
whenReactReady(() => {
reactReady=true;
new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}).observe(document.body,{childList:true,subtree:true});
recordVisit();update();
});

document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.textContent.trim()==='Cómo funciona'){event.preventDefault();event.stopImmediatePropagation();location.href='/ayuda.html';}},true);

window.addEventListener('resize',update);

document.addEventListener('click', event => {
  if (event.target.closest('.store-button')) { event.preventDefault();event.stopImmediatePropagation();location.href='/atelier.html'; }
  const header=document.querySelector('.app-header.pp-menu-open');
  if(header&&!header.contains(event.target)){header.classList.remove('pp-menu-open');header.querySelector('.pp-menu-toggle')?.setAttribute('aria-expanded','false');}
}, true);
document.addEventListener('keydown', event => {if(event.key==='Escape'){const header=document.querySelector('.app-header.pp-menu-open');header?.classList.remove('pp-menu-open');header?.querySelector('.pp-menu-toggle')?.setAttribute('aria-expanded','false');}});
