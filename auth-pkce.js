/**
 * A short-lived, durable OAuth handshake. Android may destroy the WebView while
 * Google is open in the browser; sessionStorage cannot survive that transition.
 * This stores only the PKCE verifier, never a password or a session token.
 */
export const AUTH_PKCE_KEY = 'pp:auth-pkce:v1';
export const AUTH_PKCE_TTL_MS = 10 * 60 * 1000;
const VALID_VERIFIER = /^[A-Za-z0-9._~-]{43,128}$/;

export function safeAuthReturnPath(value, origin) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return '/';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return '/';
    // An old auth response must not become a return destination.
    for (const key of ['code', 'access_token', 'refresh_token', 'error', 'error_description']) url.searchParams.delete(key);
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}

export function createAuthPKCEStore({ storage, legacyStorage, origin, now = Date.now }) {
  const forgetLegacy = () => {
    try {
      legacyStorage?.removeItem('pp:auth-verifier');
      legacyStorage?.removeItem('pp:auth-return');
    } catch { /* Legacy storage may be disabled. */ }
  };
  const clear = expectedVerifier => {
    try {
      if (expectedVerifier) {
        const current = JSON.parse(storage.getItem(AUTH_PKCE_KEY) || 'null');
        // A late response from one tab must not clear a newer sign-in attempt.
        if (current && current.verifier !== expectedVerifier) return;
      }
      storage.removeItem(AUTH_PKCE_KEY);
    } catch { /* An unavailable store cannot contain a usable handshake. */ }
    forgetLegacy();
  };
  const save = (verifier, returnTo = '/') => {
    if (!VALID_VERIFIER.test(verifier)) throw new Error('INVALID_AUTH_VERIFIER');
    const record = { version: 1, verifier, returnTo: safeAuthReturnPath(returnTo, origin), createdAt: now() };
    const serialized = JSON.stringify(record);
    // Fail before navigating away if durable storage is unavailable or full.
    storage.setItem(AUTH_PKCE_KEY, serialized);
    if (storage.getItem(AUTH_PKCE_KEY) !== serialized) throw new Error('AUTH_STORAGE_UNAVAILABLE');
    forgetLegacy();
    return { verifier: record.verifier, returnTo: record.returnTo };
  };
  const read = () => {
    try {
      let raw = storage.getItem(AUTH_PKCE_KEY);
      if (!raw) {
        // Preserve an already-started sign-in from the previous browser build.
        const verifier = legacyStorage?.getItem('pp:auth-verifier');
        if (!verifier) return null;
        if (!VALID_VERIFIER.test(verifier)) { forgetLegacy(); return null; }
        save(verifier, legacyStorage.getItem('pp:auth-return') || '/');
        raw = storage.getItem(AUTH_PKCE_KEY);
      }
      const record = JSON.parse(raw);
      const age = now() - record.createdAt;
      if (record.version !== 1 || !VALID_VERIFIER.test(record.verifier) ||
          !Number.isFinite(record.createdAt) || age < 0 || age >= AUTH_PKCE_TTL_MS) {
        clear(); return null;
      }
      return { verifier: record.verifier, returnTo: safeAuthReturnPath(record.returnTo, origin) };
    } catch { clear(); return null; }
  };
  return { save, read, clear };
}

// Resolve browser storage lazily so importing the module never blocks startup.
function browserStore() {
  let legacyStorage;
  try { legacyStorage = window.sessionStorage; } catch { /* Optional migration. */ }
  return createAuthPKCEStore({ storage: window.localStorage, legacyStorage, origin: window.location.origin });
}
export const authPKCE = {
  save(verifier, returnTo) { return browserStore().save(verifier, returnTo); },
  read() { try { return browserStore().read(); } catch { return null; } },
  clear(expectedVerifier) { try { browserStore().clear(expectedVerifier); } catch { /* No accessible state. */ } },
};
