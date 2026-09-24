import './supabase-bridge.js?v=5';
// The native host serves this entire origin from APK assets, including /tienda/.
// Remote requests are exclusively the existing authenticated Supabase/Stripe flows.
const upstream = window.fetch.bind(window);
const userId = () => { try { return JSON.parse(localStorage.getItem('postispop-supabase-session'))?.user?.id || 'guest'; } catch { return 'guest'; } };
const key = (id) => 'pp:mobile:reads:'+id;
const cached = (id) => { try { return JSON.parse(localStorage.getItem(key(id))) || {}; } catch { return {}; } };
const isRead = (path) => /^\/(api\/(session|me|board\/[^/]+))$/.test(path);
window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  const id = userId();
  const method = init.method || (input instanceof Request ? input.method : 'GET');
  if (url.origin !== location.origin || !isRead(url.pathname) || method !== 'GET' || id === 'guest') return upstream(input, init);
  let response;
  try { response = await upstream(input, init); } catch {}
  if (response?.ok) {
    const data = await response.clone().json();
    const reads = cached(id); reads[url.pathname] = data;
    try { localStorage.setItem(key(id),JSON.stringify(reads)); } catch {}
    return response;
  }
  // Never disguise expired credentials or permission errors as cached success.
  if (!response || response.status >= 500) {
    const value = cached(id)[url.pathname];
    if (value) { document.documentElement.dataset.mobileCached = 'true'; updateStatus(); return new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}}); }
  }
  return response || new Response(JSON.stringify({error:'NETWORK_UNAVAILABLE'}),{status:503});
};
function updateStatus() {
  let banner = document.querySelector('#mobile-offline-status');
  const offline = !navigator.onLine || document.documentElement.dataset.mobileCached === 'true';
  if (!offline) { banner?.remove(); return; }
  if (!banner) {
    banner = document.createElement('p'); banner.id = 'mobile-offline-status'; banner.setAttribute('role','status');
    Object.assign(banner.style,{position:'fixed',top:'0',left:'0',right:'0',zIndex:'99999',margin:'0',padding:'10px 16px',background:'#211f24',color:'#fff',font:'14px/1.4 system-ui',textAlign:'center'});
    document.body.append(banner);
  }
  banner.textContent = userId() === 'guest'
    ? 'Sin Internet · Tus notas de invitado se guardan en este móvil.'
    : 'Sin conexión · Última copia disponible. Conéctate para guardar cambios en tu cuenta.';
}
addEventListener('offline',updateStatus);
addEventListener('online',()=>{delete document.documentElement.dataset.mobileCached;updateStatus();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateStatus,{once:true});else updateStatus();

window.__postispopSaveDownload = async (url) => {
  if (!window.PostisPopFiles || !(url.startsWith('blob:'+location.origin+'/') || url.startsWith('data:image/png;'))) return;
  const blob = await (await upstream(url)).blob();
  if (blob.type !== 'image/png' || blob.size > 10000000) return;
  const reader = new FileReader();
  reader.onload = () => window.PostisPopFiles.postMessage(JSON.stringify({dataUrl:reader.result}));
  reader.readAsDataURL(blob);
};
