// Opt-in, local aggregate counters. No note text, account IDs or external requests.
const KEY = 'pp:metrics:v1';
export const EVENTS = new Set(['first_note_created','first_board_created','signup_completed','first_sync','board_shared','export','reminder_created','premium_clicked','pricing_viewed','trial_started','purchase','cancelled','return_7_days']);
export function enabled() { try { return localStorage.getItem('pp:metrics-consent') === 'yes' && navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl; } catch { return false; } }
export function track(name, once = false) {
  if (!EVENTS.has(name) || !enabled()) return;
  try {
    const state = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (once && state[name]) return;
    state[name] = (Number(state[name]) || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('postispop:metric', { detail: { event: name } }));
  } catch { /* Storage restrictions never interrupt note saving. */ }
}
export function setConsent(allow) {
  try {
    localStorage.setItem('pp:metrics-consent', allow ? 'yes' : 'no');
    if (!allow) { localStorage.removeItem(KEY); localStorage.removeItem('pp:metrics-first-day'); }
    else { if (!localStorage.getItem('pp:metrics-first-day')) localStorage.setItem('pp:metrics-first-day', String(Date.now())); }
  } catch { /* Consent remains unavailable if storage is blocked. */ }
}
export function revisit() {
  if (!enabled()) return;
  const first = Number(localStorage.getItem('pp:metrics-first-day'));
  if (first && Date.now() - first >= 7 * 86400000) track('return_7_days', true);
}
