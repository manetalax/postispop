const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const retiredOffer = /pack-rebel|pack-minimal|reloj-recordatorios|postispop-pro|premios\.html|\/tienda\//i;

function sitemapUrls() {
  return [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
}

test('Sitemap lists unique canonical documents and excludes retired commercial routes', () => {
  const urls = sitemapUrls();
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes('https://postispop.com/'));
  assert.ok(urls.includes('https://postispop.com/atelier.html'));
  for (const url of urls) {
    assert.doesNotMatch(url, /\/(api|share|invite|favoritos|buscar)\//);
    assert.doesNotMatch(url, retiredOffer);
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://postispop.com');
    const file = parsed.pathname === '/' ? 'index.html' : parsed.pathname.slice(1);
    const html = fs.readFileSync(file, 'utf8');
    assert.equal((html.match(/<title>/g) || []).length, 1, file);
    assert.equal((html.match(/<meta name="description"/g) || []).length, 1, file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    assert.ok(html.includes('lang="es"'), file);
    assert.ok(html.includes(`rel="canonical" href="${url}"`), file);
    assert.doesNotMatch(html, /<meta name="robots" content="noindex/, file);
  }
});

test('Public search promotes current guides and Premium without resurrecting discontinued products', () => {
  const index = JSON.parse(fs.readFileSync('search-index.json', 'utf8'));
  const sitemap = new Set(sitemapUrls());
  assert.equal(new Set(index.map(entry => entry.url)).size, index.length);
  assert.ok(index.some(entry => entry.title === 'Recordatorios de notas'));
  assert.ok(index.some(entry => entry.title === 'Gratis y Premium'));
  for (const entry of index) {
    assert.ok(entry.title.trim() && entry.description.trim());
    assert.doesNotMatch(JSON.stringify(entry), retiredOffer);
    const url = new URL(entry.url, 'https://postispop.com');
    url.hash = '';
    assert.ok(sitemap.has(url.href), entry.url + ' must be public canonical content');
  }
});

test('Generated use guides explain tools without removed templates or separate clock purchases', () => {
  const guidePaths = JSON.parse(fs.readFileSync('search-index.json', 'utf8'))
    .map(entry => entry.url.split('#')[0])
    .filter(url => !['/atelier.html', '/instalar.html'].includes(url));
  for (const url of new Set(guidePaths)) {
    const html = fs.readFileSync(url.slice(1), 'utf8');
    assert.doesNotMatch(html, /plantilla|Pack Rebel|Pack Minimal|PostisPop Pro|compra(?:r)? el reloj|prueba de 30 días|>Tienda</i, url);
    assert.match(html, /seis notas gratuitas/, url);
  }
  const reminderHelp = fs.readFileSync('bloc-de-notas-online.html', 'utf8');
  assert.match(reminderHelp, /id="recordatorios"/);
  assert.match(reminderHelp, /PostisPop abierto y el dispositivo activo/);
});

test('Install manifest references real PNG icons with required sizes', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(item => item.sizes === `${size}x${size}`);
    assert.ok(icon);
    const data = fs.readFileSync(icon.src.slice(1));
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  }
  assert.deepEqual(manifest, JSON.parse(fs.readFileSync('manifest.json', 'utf8')));
});

test('Static HTML and recovered component share the same quiet board content', async () => {
  const { heroActions, learnContent } = await import('../experience-content.js');
  const html = fs.readFileSync('index.html', 'utf8');
  const start = html.match(/<div\b[^>]*\bid="pp-start"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(start, 'Static board has the shared start-content mount');
  assert.equal(start[1], heroActions);
  if (learnContent) assert.ok(html.includes(learnContent));
  else assert.doesNotMatch(html, /aria-label="Descubre PostisPop"/);
  const bundle = fs.readFileSync('_next/static/chunks/Board-BrRAatyY.js', 'utf8');
  assert.ok(bundle.includes('experience-content.js'));
  assert.ok(bundle.includes('G.current.data?.id!==`guest-board`'));
  assert.ok(!html.includes('/cdn-cgi/challenge-platform/'));
});
