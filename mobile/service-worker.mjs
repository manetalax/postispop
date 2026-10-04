import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { listFiles } from './bundle-tools.mjs';

export function renderServiceWorker(paths, version) {
  return `/* Generated public application shell. Never cache account/API responses. */
const CACHE = 'postispop-shell-${version}';
const FILES = ${JSON.stringify(paths)};
const ALLOWED = new Set(FILES);
function publicPath(request) {
  const u = new URL(request.url);
  if (request.method !== 'GET' || u.origin !== self.location.origin || request.headers.has('Authorization')) return null;
  // Versioned local module URLs resolve to the exact packaged public file.
  if ([...u.searchParams.keys()].some(key => key !== 'v')) return null;
  const path = u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname;
  return ALLOWED.has(path) ? path : null;
}
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  try {
    for (let i = 0; i < FILES.length; i += 12) {
      await Promise.all(FILES.slice(i, i + 12).map(async path => {
        const response = await fetch(new Request(path, {credentials:'omit', cache:'reload'}));
        if (!response.ok || response.redirected || /private|no-store/i.test(response.headers.get('Cache-Control') || '')) throw Error('Public asset unavailable: ' + path);
        await cache.put(path, response);
      }));
    }
  } catch (error) { await caches.delete(CACHE); throw error; }
})())); // No skipWaiting: an open editor keeps its current version.
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('postispop-shell-') || key.startsWith('postispop-wpo-')) && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  const path = publicPath(event.request);
  if (!path) return; // API, storage, shares and auth requests are never intercepted.
  event.respondWith((async () => {
    const cached = await (await caches.open(CACHE)).match(path);
    // Keep HTML and its unversioned modules in the SAME installed snapshot.
    // Network-first navigation could combine a new document with old scripts.
    // The browser checks /sw.js for updates; a waiting version activates after
    // the old clients close, without interrupting an active editor.
    if (cached) return cached;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(event.request, {signal:controller.signal});
      if (response.status >= 500) throw Error('Network unavailable');
      return response; // Never put runtime responses, user content or tokens in cache.
    } catch (error) {
      if (cached) return cached;
      throw error;
    } finally { clearTimeout(timeout); }
  })());
});
`;
}

export async function writePublicServiceWorker(root) {
  const files = (await listFiles(root)).filter(path => /\.(?:html|js|css|json|webmanifest|svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|wasm|pf_meta|pf_fragment|pf_index|pf_filter)$/i.test(path)
    && !['sw.js', 'bundle-manifest.json'].includes(path));
  const hash = createHash('sha256');
  for (const file of files) { hash.update(file); hash.update(await readFile(resolve(root, file))); }
  await writeFile(resolve(root, 'sw.js'), renderServiceWorker(files.map(file => '/' + file), hash.digest('hex').slice(0, 16)));
  return files.length;
}
