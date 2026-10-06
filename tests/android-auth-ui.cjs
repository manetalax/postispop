const { chromium } = require('playwright');
const { browserOptions } = require('./browser-options.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const root = process.env.POSTISPOP_TEST_ROOT ? path.resolve(process.env.POSTISPOP_TEST_ROOT) : path.resolve(__dirname, '../_site');
  const browser = await chromium.launch(browserOptions());
  const verifier = 'v'.repeat(43);
  const exchanges = [];
  let rejectExchange = false;
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2' };
  async function makeContext(storageState) {
    const context = await browser.newContext({ serviceWorkers: 'block', locale: 'es-ES', ...(storageState ? { storageState } : {}) });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'pkce') {
        exchanges.push(route.request().postDataJSON());
        return route.fulfill({ status: rejectExchange ? 400 : 200, contentType: 'application/json', body: JSON.stringify(rejectExchange ? { error_description: 'Test expired code' } : {
          access_token: 'test-access-not-a-real-token', refresh_token: 'test-refresh-not-a-real-token', expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: '00000000-0000-4000-8000-000000000001', email: 'oauth-test@example.invalid' },
        }) });
      }
      if (url.hostname !== 'postispop.com') return route.abort('internetdisconnected');
      let name = decodeURIComponent(url.pathname);
      if (name.endsWith('/')) name += 'index.html';
      const file = path.resolve(root, '.' + name);
      if (!file.startsWith(root + path.sep)) return route.abort();
      try { return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await fs.readFile(file) }); }
      catch { return route.fulfill({ status: 404, body: 'Missing staged test asset' }); }
    });
    return context;
  }
  try {
    // Begin in one WebView, then discard its sessionStorage and heap entirely.
    const original = await makeContext();
    const start = await original.newPage();
    await start.goto('https://postispop.com/');
    await start.waitForSelector('.sticky-note:not([disabled])');
    await start.evaluate(async verifier => {
      const { authPKCE } = await import('/auth-pkce.js');
      authPKCE.save(verifier, '/ayuda.html#oauth-return');
    }, verifier);
    const persisted = await original.storageState();
    await original.close();

    const reopened = await makeContext(persisted);
    const page = await reopened.newPage();
    await page.goto('https://postispop.com/?code=test-code');
    await page.waitForURL('https://postispop.com/ayuda.html#oauth-return');
    assert.equal(exchanges.length, 1);
    assert.equal(exchanges[0].code_verifier, verifier);
    assert.equal(await page.evaluate(() => localStorage.getItem('pp:auth-pkce:v1')), null);
    await reopened.close();

    // An expired verifier must never be sent, and the auth code must leave the URL.
    const expired = JSON.parse(JSON.stringify(persisted));
    const item = expired.origins[0].localStorage.find(item => item.name === 'pp:auth-pkce:v1');
    const record = JSON.parse(item.value); record.createdAt -= 11 * 60 * 1000; item.value = JSON.stringify(record);
    const expiredContext = await makeContext(expired);
    const expiredPage = await expiredContext.newPage();
    await expiredPage.goto('https://postispop.com/?code=expired-test-code');
    await expiredPage.waitForFunction(() => !new URL(location.href).searchParams.has('code'));
    assert.equal(exchanges.length, 1);
    assert.equal(await expiredPage.evaluate(() => localStorage.getItem('pp:auth-pkce:v1')), null);
    await expiredContext.close();

    rejectExchange = true;
    const failedContext = await makeContext(persisted);
    const failedPage = await failedContext.newPage();
    await failedPage.goto('https://postispop.com/?code=rejected-test-code');
    await failedPage.waitForFunction(() => !new URL(location.href).searchParams.has('code'));
    assert.equal(exchanges.length, 2);
    assert.equal(await failedPage.evaluate(() => localStorage.getItem('pp:auth-pkce:v1')), null);
    await failedContext.close();
    console.log('PASS: OAuth after WebView recreation, successful cleanup, expiry, server rejection and auth-code removal');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
