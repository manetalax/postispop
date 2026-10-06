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
const nativeDownloadMessages = {
  NATIVE_DOWNLOAD_UNAVAILABLE: 'Este Android no permite guardar el archivo. Actualiza Android System WebView y vuelve a intentarlo. Tus notas se conservan.',
  NATIVE_DOWNLOAD_TYPE: 'Este tipo de archivo no se puede guardar desde la aplicación. Tus notas se conservan.',
  NATIVE_DOWNLOAD_TOO_LARGE: 'Esta versión de la app guarda archivos de hasta 10 MB. Conserva primero los adjuntos por separado si necesitas reducir la copia. La versión web admite copias de hasta 50 MB. Tus notas se conservan.',
  NATIVE_DOWNLOAD_BUSY: 'Termina o cancela el guardado anterior antes de guardar otro archivo.',
  NATIVE_DOWNLOAD_READ_FAILED: 'No se pudo preparar el archivo. Vuelve a intentarlo. Tus notas se conservan.',
  NATIVE_DOWNLOAD_WRITE_FAILED: 'No se pudo guardar el archivo. Comprueba el espacio disponible y elige de nuevo dónde guardarlo. Tus notas se conservan.',
  NATIVE_DOWNLOAD_PICKER_UNAVAILABLE: 'Android no pudo abrir el selector para guardar archivos. Vuelve a intentarlo. Tus notas se conservan.',
  NATIVE_DOWNLOAD_INVALID: 'No se pudo comprobar el archivo que se iba a guardar. Vuelve a intentarlo. Tus notas se conservan.'
};
function nativeDownloadError(code) {
  const known = Object.hasOwn(nativeDownloadMessages, code) ? code : 'NATIVE_DOWNLOAD_WRITE_FAILED';
  return Object.assign(new Error(nativeDownloadMessages[known]), {code:known});
}
let nativeDownloadPending = false, nativeDownloadSequence = 0;
window.__postispopSaveDownload = async (url, name) => {
  const bridge = window.PostisPopFiles;
  if (!bridge || typeof bridge.postMessage !== 'function') throw nativeDownloadError('NATIVE_DOWNLOAD_UNAVAILABLE');
  if (typeof url !== 'string' || !(url.startsWith('blob:' + location.origin + '/') || url.startsWith('data:image/png;base64,'))) throw nativeDownloadError('NATIVE_DOWNLOAD_INVALID');
  if (nativeDownloadPending) throw nativeDownloadError('NATIVE_DOWNLOAD_BUSY');
  nativeDownloadPending = true;
  try {
    let blob;
    try { blob = await (await upstream(url)).blob(); }
    catch { throw nativeDownloadError('NATIVE_DOWNLOAD_READ_FAILED'); }
    if (blob.type !== 'image/png' && blob.type !== 'application/json') throw nativeDownloadError('NATIVE_DOWNLOAD_TYPE');
    if (blob.size > 10000000) throw nativeDownloadError('NATIVE_DOWNLOAD_TOO_LARGE');
    const filename = blob.type === 'image/png' ? 'PostisPop-pizarra.png' : name === 'PostisPop-contadores.json' ? name : 'PostisPop-copia.json';
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(nativeDownloadError('NATIVE_DOWNLOAD_READ_FAILED'));
      reader.onerror = reader.onabort = () => reject(nativeDownloadError('NATIVE_DOWNLOAD_READ_FAILED'));
      try { reader.readAsDataURL(blob); } catch { reject(nativeDownloadError('NATIVE_DOWNLOAD_READ_FAILED')); }
    });
    const id = 'download-' + Date.now().toString(36) + '-' + (++nativeDownloadSequence);
    return await new Promise((resolve, reject) => {
      const previous = bridge.onmessage;
      const cleanup = () => { if (bridge.onmessage === receive) bridge.onmessage = previous; };
      const receive = event => {
        let result;
        try { result = JSON.parse(event.data); } catch { return; }
        if (!result || result.id !== id) return;
        if (!['saved', 'cancelled', 'error'].includes(result.status)) return;
        cleanup();
        if (result.status === 'saved') resolve(true);
        else if (result.status === 'cancelled') resolve(false);
        else reject(nativeDownloadError(result.error));
      };
      bridge.onmessage = receive;
      try { bridge.postMessage(JSON.stringify({id, filename, dataUrl})); }
      catch { cleanup(); reject(nativeDownloadError('NATIVE_DOWNLOAD_UNAVAILABLE')); }
    });
  } finally { nativeDownloadPending = false; }
};
