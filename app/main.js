import { mountTools } from './board-tools.js';
import { initStatus } from './save-status.js';
import { revisit, enabled, setConsent, track } from './analytics.js';
import { notice } from './ui.js';
revisit();
let installEvent;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;document.querySelectorAll('[data-install]').forEach(b=>b.hidden=false);});
window.addEventListener('appinstalled',()=>{installEvent=null;document.querySelectorAll('[data-install]').forEach(b=>b.hidden=true);});
function setup(){
  document.documentElement.dataset.theme=localStorage.getItem('pp:appearance')||'light';
  mountTools();
  if(new URLSearchParams(location.search).has('signin')&&!document.querySelector('dialog[open]')){document.querySelector('.header-auth-login,.header-auth-signup')?.click();history.replaceState(null,'','/');}
  const lead=document.querySelector('.value-proposition');
  if(lead&&!document.getElementById('pp-hero-actions')){
    const row=document.createElement('div');row.id='pp-hero-actions';row.className='pp-hero-actions';
    row.innerHTML='<button type="button" data-start>Probar sin registro</button><button type="button" data-register>Crear cuenta gratis</button><a href="#como-funciona">Cómo funciona</a><button type="button" data-install hidden>Instalar aplicación</button>';
    lead.after(row);
  }
}
// React emits this only after hydration; avoid changing its initial HTML.
window.addEventListener('postispop:board',setup);
initStatus();
document.addEventListener('click',async e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.hasAttribute('data-start')){document.querySelector('.board-frame')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.querySelector('.sticky-note:not([disabled])')?.focus();}
  if(b.hasAttribute('data-register'))document.querySelector('.header-auth-signup,.header-auth-login')?.click();
  if(b.hasAttribute('data-install')&&installEvent){await installEvent.prompt();installEvent=null;b.hidden=true;}
  if(b.hasAttribute('data-metrics')){setConsent(!enabled());b.textContent=enabled()?'Desactivar métricas locales':'Activar métricas locales';notice(enabled()?'Métricas activadas solo en este dispositivo.':'Métricas desactivadas y contadores borrados.');}
});
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{/* Board remains usable when installation is unavailable. */});},{once:true});
window.addEventListener('postispop:request',e=>{if(e.detail.stage==='end'&&e.detail.ok&&e.detail.endpoint==='auth/signup')track('signup_completed',true);});
// The shared-link token remains in sessionStorage, never in an OAuth return URL.
window.addEventListener('postispop:board',e=>{if(e.detail.actor?.registered){const token=sessionStorage.getItem('pp:pending-share');if(token&&/^[\da-f-]{36}$/.test(token)){sessionStorage.removeItem('pp:pending-share');location.assign('/compartir/#'+token);}}});
