const { test } = require('node:test');
const assert = require('node:assert/strict');

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
const verifier = 'a'.repeat(43);
const origin = 'https://postispop.com';

test('OAuth survives destruction of the original WebView and expires after ten minutes', async () => {
  const { createAuthPKCEStore, AUTH_PKCE_TTL_MS, AUTH_PKCE_KEY } = await import('../auth-pkce.js');
  const storage = memoryStorage(); let now = 1000;
  createAuthPKCEStore({ storage, origin, now: () => now }).save(verifier, '/compartir.html#note');
  now += 1000;
  const reopened = createAuthPKCEStore({ storage, origin, now: () => now });
  assert.deepEqual(reopened.read(), { verifier, returnTo: '/compartir.html#note' });
  now += AUTH_PKCE_TTL_MS;
  assert.equal(reopened.read(), null);
  assert.equal(storage.getItem(AUTH_PKCE_KEY), null);
});

test('OAuth completion clears its verifier without deleting a newer attempt', async () => {
  const { createAuthPKCEStore } = await import('../auth-pkce.js');
  const storage = memoryStorage();
  const store = createAuthPKCEStore({ storage, origin });
  store.save(verifier, '/');
  const second = 'b'.repeat(43);
  store.save(second, '/');
  store.clear(verifier);
  assert.equal(store.read().verifier, second);
  store.clear(second);
  assert.equal(store.read(), null);
});

test('OAuth rejects external and malformed return paths and removes callback credentials', async () => {
  const { safeAuthReturnPath } = await import('../auth-pkce.js');
  for (const value of ['https://evil.test', '//evil.test', '/\\evil.test', '/\nevil.test', 'javascript:alert(1)', null]) assert.equal(safeAuthReturnPath(value, origin), '/');
  assert.equal(safeAuthReturnPath('/?code=private&mode=notes&access_token=private#page', origin), '/?mode=notes#page');
  assert.equal(safeAuthReturnPath('/compartir.html#encrypted-note', origin), '/compartir.html#encrypted-note');
});

test('malformed, future-dated and invalid OAuth records cannot be exchanged', async () => {
  const { createAuthPKCEStore, AUTH_PKCE_KEY } = await import('../auth-pkce.js');
  const storage = memoryStorage();
  const store = createAuthPKCEStore({ storage, origin, now: () => 1000 });
  for (const value of ['{', 'null', JSON.stringify({version: 1, verifier: 'short', createdAt: 1000}), JSON.stringify({version: 1, verifier, createdAt: 1001})]) {
    storage.setItem(AUTH_PKCE_KEY, value);
    assert.equal(store.read(), null);
    assert.equal(storage.getItem(AUTH_PKCE_KEY), null);
  }
  assert.throws(() => store.save('short', '/'), /INVALID_AUTH_VERIFIER/);
});

test('an in-flight sessionStorage handshake migrates once without losing its return path', async () => {
  const { createAuthPKCEStore } = await import('../auth-pkce.js');
  const storage = memoryStorage(), legacyStorage = memoryStorage();
  legacyStorage.setItem('pp:auth-verifier', verifier);
  legacyStorage.setItem('pp:auth-return', '/#pizarra');
  const store = createAuthPKCEStore({ storage, legacyStorage, origin });
  assert.deepEqual(store.read(), { verifier, returnTo: '/#pizarra' });
  assert.equal(legacyStorage.getItem('pp:auth-verifier'), null);
  assert.equal(legacyStorage.getItem('pp:auth-return'), null);
  store.clear(verifier);
  assert.equal(store.read(), null);
});

test('blocked durable storage fails before OAuth can navigate to the browser', async () => {
  const { createAuthPKCEStore } = await import('../auth-pkce.js');
  const storage = { getItem() { return null; }, setItem() { throw new Error('QuotaExceeded'); }, removeItem() {} };
  const store = createAuthPKCEStore({ storage, origin });
  assert.throws(() => store.save(verifier, '/'), /QuotaExceeded/);
  assert.equal(store.read(), null);
});
