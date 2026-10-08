const { browserOptions } = require('./browser-options.cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(process.env.POSTISPOP_TEST_ROOT || '.');
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon'
};

(async () => {
  const browser = await chromium.launch(browserOptions());
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'es-ES', serviceWorkers: 'block' });
  const errors = [];
  const missing = [];
  const paymentRequests = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (/\/api\/commerce\/(checkout|portal)(?:[/?]|$)|stripe\.com/.test(url.href)) paymentRequests.push(url.pathname);
    if (url.hostname !== 'postispop.com') return route.abort('internetdisconnected');
    let name = decodeURIComponent(url.pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) return route.abort();
    try {
      await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await fs.readFile(file) });
    } catch {
      missing.push(name);
      await route.fulfill({ status: 404, body: 'Missing source asset' });
    }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('https://postispop.com/atelier.html');
    await page.waitForSelector('.payment-options');
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.payment-option').count(), 4);
    assert.equal(await page.locator('.payment-option button:disabled').count(), 4);
    assert.deepEqual(await page.locator('.payment-option h3').allTextContents(), ['Mensual', 'Trimestral', 'Anual', 'De por vida']);
    assert.deepEqual((await page.locator('.price').allTextContents()).map(value => value.trim().replace(/\u00a0/g, ' ')), ['2,95 €', '5,95 €', '19,95 €', '59,95 €']);
    assert.match(await page.locator('.free-plan').innerText(), /6 notas/);
    assert.match(await page.locator('.purchase-status').innerText(), /Pagos temporalmente no disponibles/);
    assert.equal(await page.locator('#at-grid, #at-cart, #at-roulette, .pp-launch-promo').count(), 0);
    assert.equal(await page.locator('.start-link').getAttribute('href'), '/?lang=es');
    await fs.mkdir('test-results', { recursive: true });
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Overflow at ' + width);
      assert.equal(await page.locator('.payment-option').evaluateAll(elements => elements.every(element => element.scrollWidth <= element.clientWidth + 1)), true, 'Price card overflow at ' + width);
    }
    await page.getByText('¿Hay diferentes niveles Premium?', { exact: true }).click();
    assert.match(await page.locator('details[open]').innerText(), /mismo Premium/);
    await page.getByText('¿Qué ocurre con mis compras anteriores?', { exact: true }).click();
    assert.match(await page.locator('details[open]').last().innerText(), /se conservan/);
    await page.screenshot({ path: 'test-results/premium-offer-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-results/premium-offer-mobile.png', fullPage: true });
    await page.reload();
    assert.equal(await page.locator('.payment-option button:disabled').count(), 4);
    // Old offline HTML must not revive the catalogue or loop through redirects.
    await page.setContent('<main id="at-grid">Catálogo antiguo</main>');
    await page.addScriptTag({ type: 'module', url: 'https://postispop.com/atelier.js' });
    await page.waitForSelector('.payment-options');
    assert.equal(await page.locator('#at-grid').count(), 0);
    assert.equal(await page.locator('.payment-option button:disabled').count(), 4);
    assert.match(await page.locator('body').innerText(), /6 notas gratis/);
    assert.deepEqual(paymentRequests, [], 'Pricing must never contact a payment endpoint');
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    console.log('PASS: one Premium, four exact EUR prices, six free notes, offline-disabled purchases, useful links, six responsive widths and no checkout requests.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
