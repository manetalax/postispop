import { track } from './usage-metrics.js';
import './supabase-bridge.js?v=6';

/**
 * Quiet compatibility layer for existing reminder entitlements.
 * New purchases are disabled. There is one public Premium page and no shop dock.
 */
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

let actor = null;
let access = null;
let alarms = [];
let dialog = null;
let lastFocus = null;
let serverOffset = 0;
let lastSync = 0;
let pendingSync = null;
let audio = null;
let checkingAlarms = false;

async function api(endpoint, payload) {
  const response = await fetch(`/api/${endpoint}`, {
    method: payload === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(body.error || 'REQUEST_FAILED'), { status: response.status });
  }
  return body;
}

function ownsReminders() {
  return Boolean(access?.owner || access?.premium ||
    access?.products?.includes('reloj-recordatorios') ||
    access?.products?.includes('postispop-pro'));
}

function remindersActive() {
  return ownsReminders() || Boolean(access?.clock_active &&
    Date.parse(access.trial_expires_at) > Date.now() + serverOffset);
}

function notify(message) {
  let toast = document.querySelector('.pp-toast');
  if (!toast) {
    toast = document.createElement('p');
    toast.className = 'pp-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  clearTimeout(toast.dismissTimer);
  toast.dismissTimer = setTimeout(() => toast.remove(), 7000);
}

function errorMessage(error) {
  if (error.status === 401 || error.message === 'SESSION_REQUIRED') {
    return 'Inicia sesión para ver los recordatorios de tu cuenta.';
  }
  if (error.status === 403) return 'Tu cuenta no tiene acceso a este recordatorio.';
  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

function closeDialog() {
  const current = dialog;
  if (!current) return;
  dialog = null;
  current.close();
  current.remove();
  if (lastFocus?.isConnected) lastFocus.focus();
}

function showDialog(title, content) {
  closeDialog();
  lastFocus = document.activeElement;
  dialog = document.createElement('dialog');
  dialog.className = 'pp-dialog';
  dialog.setAttribute('aria-labelledby', 'pp-dialog-title');
  dialog.innerHTML = `<header class="pp-dialog-head"><h2 id="pp-dialog-title">${escapeHtml(title)}</h2><button type="button" data-action="close" aria-label="Cerrar">×</button></header>${content}`;
  const current = dialog;
  current.addEventListener('close', () => {
    if (dialog === current) closeDialog();
  });
  current.addEventListener('click', event => {
    if (event.target !== current) return;
    const bounds = current.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  });
  document.body.append(current);
  current.showModal();
  current.querySelector('button')?.focus();
  return current;
}

async function sync() {
  if (pendingSync) return pendingSync;
  pendingSync = (async () => {
    const session = await api('session');
    actor = session.actor;
    access = null;
    renderOwnerLink();
    alarms = [];
    serverOffset = 0;
    if (actor?.registered) {
      access = await api('commerce/status');
      renderOwnerLink();
      const serverTime = Date.parse(access.server_now);
      serverOffset = Number.isFinite(serverTime) ? serverTime - Date.now() : 0;
      if (remindersActive()) alarms = (await api('commerce/alarms')).alarms || [];
    }
    lastSync = Date.now();
  })();
  try { await pendingSync; } finally { pendingSync = null; }
}

function renderOwnerLink() {
  const nav=document.querySelector('.pp-app-links');
  const existing=document.querySelector('[data-owner-dashboard-link]');
  if(!access?.owner){existing?.remove();return;}
  if(!nav)return;
  const labels={es:'Estadísticas privadas',en:'Private statistics',de:'Private Statistiken',fr:'Statistiques privées',pt:'Estatísticas privadas',it:'Statistiche private',ja:'非公開の統計',ko:'비공개 통계'};
  const lang=(document.documentElement.lang||'es').split('-')[0];
  const link=existing||document.createElement('a');
  link.dataset.ownerDashboardLink='';
  link.href='/propietario.html';
  const label=labels[lang]||labels.es;
  if(link.textContent!==label)link.textContent=label;
  if(!existing)nav.append(link);
}
new MutationObserver(renderOwnerLink).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang']});
window.addEventListener('postispop:session-change',()=>{access=null;renderOwnerLink();lastSync=0;});
function openPremium() {
  track('pricing_viewed');
  window.location.assign('/atelier.html');
}

async function openReminders() {
  try {
    await sync();
    if (!actor?.registered) {
      showDialog('Recordatorios', '<p>Inicia sesión desde tu cuenta para consultar los recordatorios guardados.</p><button class="pp-secondary" data-action="close">Entendido</button>');
      return;
    }
    if (!remindersActive()) {
      showDialog('Recordatorios', '<p>Las nuevas activaciones estarán disponibles con Premium próximamente. Los recordatorios de cuentas con acceso vigente siguen funcionando.</p><button class="pp-secondary" data-action="close">Entendido</button>');
      return;
    }
    await renderReminders();
  } catch (error) { notify(errorMessage(error)); }
}

async function renderReminders() {
  if (!remindersActive()) return;
  const current = showDialog('Recordatorios', '<p role="status">Cargando tus notas…</p>');
  try {
    const me = await api('me');
    const boards = await Promise.all(me.boards.map(board => api(`board/${board.id}`)));
    if (dialog !== current) return;
    const notes = boards.flatMap(board => board.notes.map((note, index) => ({
      ...note,
      label: `${board.title || 'Pizarra'} · Nota ${index + 1}: ${(note.text || 'Sin texto').slice(0, 70)}`
    })));
    const pending = alarms.filter(alarm => !alarm.delivered_at);
    current.querySelector('p').outerHTML = `
      <form id="pp-alarm-form">
        <label>Nota<select name="note_id" required>${notes.map(note => `<option value="${escapeHtml(note.id)}">${escapeHtml(note.label)}</option>`).join('')}</select></label>
        <label>Recordatorio<input name="label" maxlength="200" placeholder="¿Qué necesitas recordar?" required></label>
        <label>Fecha y hora<input name="due_at" type="datetime-local" required></label>
        <p class="pp-muted">Hora local de tu dispositivo. Mantén PostisPop abierto y el dispositivo activo para recibir el aviso.</p>
        <div class="pp-form-actions"><button class="pp-primary" type="submit" ${notes.length ? '' : 'disabled'}>Guardar</button><button class="pp-secondary" data-action="notifications" type="button">Permitir notificaciones</button></div>
        ${notes.length ? '' : '<p>Crea una nota en tu cuenta para añadir un recordatorio.</p>'}
        <p class="pp-form-status" role="status"></p>
      </form>
      <section class="pp-alarm-list"><h3>Pendientes</h3>${pending.length ? pending.map(alarm => `<article><p><strong>${escapeHtml(alarm.label)}</strong><br><time>${escapeHtml(new Date(alarm.due_at).toLocaleString('es-ES'))}</time></p><button data-action="delete-alarm" data-id="${escapeHtml(alarm.id)}" aria-label="Eliminar recordatorio ${escapeHtml(alarm.label)}">Eliminar</button></article>`).join('') : '<p>No tienes recordatorios pendientes.</p>'}</section>`;
    const minimum = new Date(Date.now() + serverOffset + 60000);
    current.querySelector('[name=due_at]').min = new Date(+minimum - minimum.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  } catch (error) {
    if (dialog === current) current.querySelector('p').textContent = errorMessage(error);
  }
}

document.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const legacyShop = event.target.closest('.store-button');
  if (legacyShop) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openPremium();
    return;
  }
  const button = event.target.closest('[data-pp-action], .pp-dialog [data-action]');
  if (!button) return;
  const action = button.dataset.ppAction || button.dataset.action;
  try {
    if (action === 'close') closeDialog();
    if (action === 'shop') openPremium();
    if (action === 'clock' || action === 'alarms') await openReminders();
    // Cached legacy buttons must never initiate a new payment.
    if (action === 'buy') notify('Premium estará disponible próximamente. No se ha realizado ningún cobro.');
    if (action === 'delete-alarm') {
      button.disabled = true;
      try {
        await api('commerce/alarms', { action: 'delete', id: button.dataset.id });
        await sync();
        await renderReminders();
      } finally { button.disabled = false; }
    }
    if (action === 'notifications') {
      if (!('Notification' in window)) notify('Verás los avisos dentro de PostisPop.');
      else notify((await Notification.requestPermission()) === 'granted'
        ? 'Notificaciones permitidas mientras PostisPop esté abierto.'
        : 'Verás los avisos dentro de PostisPop.');
    }
  } catch (error) { notify(errorMessage(error)); }
}, true);

document.addEventListener('submit', async event => {
  if (event.target.id !== 'pp-alarm-form') return;
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('[type=submit]');
  const status = form.querySelector('[role=status]');
  if (button.disabled) return;
  button.disabled = true;
  try {
    const data = new FormData(form);
    const due = new Date(data.get('due_at'));
    if (!Number.isFinite(+due) || +due <= Date.now() + serverOffset) {
      status.textContent = 'Elige una fecha y hora futuras.';
      return;
    }
    if (!ownsReminders() && +due >= Date.parse(access.trial_expires_at)) {
      status.textContent = 'Elige una fecha dentro del período de acceso de tu cuenta.';
      return;
    }
    if (!audio && window.AudioContext) audio = new AudioContext();
    await audio?.resume();
    await api('commerce/alarms', {
      note_id: data.get('note_id'),
      label: String(data.get('label')).trim(),
      due_at: due.toISOString()
    });
    await sync();
    await renderReminders();
    notify('Recordatorio guardado. Mantén PostisPop abierto para recibirlo.');
  } catch (error) { status.textContent = errorMessage(error); }
  finally { button.disabled = false; }
});

function ring(alarm) {
  const banner = document.createElement('section');
  banner.className = 'pp-alarm-alert';
  banner.setAttribute('role', 'alert');
  const title = document.createElement('strong');
  title.textContent = alarm.label;
  const dismiss = document.createElement('button');
  dismiss.textContent = 'Entendido';
  dismiss.addEventListener('click', () => banner.remove());
  banner.append(title, dismiss);
  document.body.append(banner);
  if (audio?.state === 'running') {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.15;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1);
    oscillator.stop(audio.currentTime + 1);
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('PostisPop · Recordatorio', { body: alarm.label, tag: alarm.id, icon: '/favicon.svg' }); }
    catch { /* The in-app alert remains available if the browser blocks notifications. */ }
  }
}

async function checkReminders() {
  if (checkingAlarms || document.hidden) return;
  checkingAlarms = true;
  try {
    if (Date.now() - lastSync > 30000) await sync();
    if (!remindersActive()) return;
    for (const alarm of alarms.filter(item => !item.delivered_at && Date.parse(item.due_at) <= Date.now() + serverOffset)) {
      const result = await api('commerce/alarms', { action: 'ack', id: alarm.id });
      if (result.claimed) {
        alarm.delivered_at = new Date().toISOString();
        ring(alarm);
      }
    }
  } catch { /* Retry after connectivity returns; never mark an unclaimed alarm delivered. */ }
  finally { checkingAlarms = false; }
}

function mount() {
  sync().catch(() => {});
  setInterval(checkReminders, 1000);
  const refresh = () => { lastSync = 0; checkReminders(); };
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);
  window.addEventListener('storage', refresh);
  const params = new URLSearchParams(window.location.search);
  // Only reconcile a previously started legacy purchase. This never creates a charge.
  if (params.has('purchase')) {
    api('commerce/reconcile', { session_id: params.get('purchase') }).then(async result => {
      if (result.granted) { await sync(); notify('Tu compra anterior está confirmada. Tus derechos se conservan.'); }
      else notify('La compra anterior sigue pendiente de confirmación.');
    }).catch(error => notify(errorMessage(error)));
  } else if (params.has('shop')) openPremium();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
