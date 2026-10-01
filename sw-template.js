const CACHE='postispop-public-__CACHE_VERSION__';
const ASSETS=__PRECACHE__;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('postispop-public-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/compartir/')||event.request.headers.has('Authorization'))return;
  const key=url.pathname+url.search;
  if(!ASSETS.includes(key))return;
  event.respondWith(fetch(event.request).then(async response=>{if(response.ok&&(response.type==='basic'||response.type==='default')){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());}return response;}).catch(()=>caches.match(event.request)));
});
