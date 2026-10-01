// Opt-in, device-local aggregate counters. No network requests, content or user IDs.
const KEY = 'pp:usage-counts-v1';
const ENABLED = 'pp:usage-enabled-v1';
const allowed = new Set(['first_note_created','first_board_created','signup_completed','first_sync','board_shared','export','reminder_created','pricing_viewed','trial_started','purchase','cancellation','return_7_days']);
const protectedPreference = () => globalThis.navigator?.doNotTrack === '1' || globalThis.navigator?.globalPrivacyControl === true;
export function metricsEnabled() { try { return !protectedPreference() && localStorage.getItem(ENABLED) === '1'; } catch { return false; } }
export function setMetricsEnabled(enabled) { try { localStorage.setItem(ENABLED, enabled && !protectedPreference() ? '1' : '0'); if (!enabled) localStorage.removeItem(KEY); } catch {} }
export function readMetrics() { try { const value = JSON.parse(localStorage.getItem(KEY) || 'null'); return value?.version === 1 ? value : {version:1, firstDay:new Date().toISOString().slice(0,10), counts:{}}; } catch { return {version:1, firstDay:new Date().toISOString().slice(0,10), counts:{}}; } }
export function track(name) {
  if (!allowed.has(name) || !metricsEnabled()) return;
  try {
    const data = readMetrics();
    const once = name.startsWith('first_') || name === 'return_7_days';
    data.counts[name] = once ? 1 : Math.min(1000000, (Number(data.counts[name]) || 0) + 1);
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}
export function recordVisit() { if (metricsEnabled() && Date.now() - Date.parse(readMetrics().firstDay) >= 7 * 86400000) track('return_7_days'); }
