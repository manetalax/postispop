import './supabase-bridge.js';
// Android serves all page assets locally; the common bridge owns account
// caching, the persistent offline queue and conflict resolution.
const upstream = window.fetch.bind(window);
// Legacy read caches never contained pending edits. Removing them prevents
// their retaining old plaintext after a note is protected with encryption.
try {
  Object.keys(localStorage).filter(key => key.startsWith('pp:mobile:reads:')).forEach(key => localStorage.removeItem(key));
} catch {}
if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(items => Promise.all(items.map(item => item.unregister()))).catch(() => {});
window.__postispopNative = true;
window.__postispopSaveDownload = async url => {
  if (!window.PostisPopFiles || !(url.startsWith('blob:' + location.origin + '/') || url.startsWith('data:image/png;'))) return;
  const blob = await (await upstream(url)).blob();
  if (blob.type !== 'image/png' || blob.size > 10000000) return;
  const reader = new FileReader();
  reader.onload = () => window.PostisPopFiles.postMessage(JSON.stringify({dataUrl:reader.result}));
  reader.readAsDataURL(blob);
};
