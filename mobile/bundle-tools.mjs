import { cp, link, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative } from 'node:path';

// Required public features. A missing source fails packaging instead of silently
// producing an APK with the previous version of the application.
export const publicFiles = [
  'index.html', 'instalar.html', 'install-page.js', 'manifest.json', 'manifest.webmanifest',
  'robots.txt', 'sitemap.xml', 'CNAME', 'favicon.svg', 'favicon.ico',
  'privacy.html', 'terms.html', 'legal.html', 'cookies.html',
  'postispop-shop.js', 'commerce-ui.js', 'home-promo.js', 'commerce.css', 'supabase-bridge.js', 'supabase-config.js',
  'guest-board.js', 'guest-status.js', 'note-attachments.js', 'note-attachments.css',
  'experience-content.js', 'experience.css', 'experience.js', 'usage-metrics.js', 'board-tools.js', 'backup-import.js',
  'search.js', 'search-index.json', 'premios.html', 'site-metrics.js', 'atelier.html', 'atelier.js', 'atelier.css', 'design-catalog.js',
  'design-tools.js', 'design-tools.css', 'style-model.js', 'fonts.css',
  'note-crypto.js', 'protected-notes.js', 'protected-notes.css', 'protected-share.js', 'compartir.html', 'attachment-lock.js',
  'offline-sync.js', 'offline-ui.js', 'offline-ui.css', 'offline-license.js', 'license-public-keys.json', 'propietario.html', 'owner-dashboard.js', 'owner-dashboard.css',
];
const forbidden = /(?:^|\/)(?:api|\.git|\.signing|node_modules)(?:\/|$)|(?:^|\/)\.env(?:\.|$)|\.(?:map|keystore|jks|p12|key|apk|aab)$/i;
export function canBundle(path) { return !forbidden.test(path.replaceAll('\\', '/')); }
export async function copyPublicTree(source, destination) {
  await cp(source, destination, { recursive: true, filter: item => canBundle(relative(source, item)) });
}
// Optional space-saving copy between two GENERATED outputs on one filesystem.
// Files changed by native packaging always get independent copies. Source repo
// assets are never passed here; hard links are regular local files, not symlinks.
export async function copyMobileTree(source, destination, {linkImmutableAssets=false}={}) {
  if (!linkImmutableAssets) return copyPublicTree(source, destination);
  for (const file of await listFiles(source)) {
    if (!canBundle(file)) continue;
    const target=resolve(destination,file);
    await mkdir(dirname(target),{recursive:true});
    if (file.endsWith('.html') || ['bundle-manifest.json','mobile-build.json','mobile-entry.js'].includes(file)) {
      await cp(resolve(source,file),target);
    } else {
      await link(resolve(source,file),target);
    }
  }
}
export async function listFiles(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(resolve(root, prefix), { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link is not a bundled asset: ${name}`);
    if (entry.isDirectory()) result.push(...await listFiles(root, name + '/'));
    else result.push(name);
  }
  return result.sort();
}
function references(file, source) {
  const refs = [];
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/<(script|img|source|video|audio|link)\b[^>]*>/gi)) {
      if (match[1].toLowerCase() === 'link' && !/\brel=["'](?:stylesheet|preload|modulepreload|icon|manifest|apple-touch-icon)["']/i.test(match[0])) continue;
      const attr = match[0].match(/\b(?:src|href)=["']([^"']+)["']/i);
      if (attr) refs.push(attr[1]);
    }
  }
  if (file.endsWith('.css')) for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) refs.push(match[1]);
  if (/\.(?:m?js)$/.test(file)) {
    for (const match of source.matchAll(/\b(?:import\s*(?:[^;'"\n]*?\sfrom\s*)?|export\s+[^;'"\n]*?\sfrom\s*|import\s*\(\s*)["']([^"']+)["']/g)) {
      if (/^(?:\.{1,2}\/|\/|https?:)/.test(match[1])) refs.push(match[1]);
    }
  }
  return refs;
}
export async function auditBundle(root, { required = publicFiles } = {}) {
  const files = await listFiles(root), names = new Set(files), errors = [];
  for (const file of required) if (!names.has(file)) errors.push(`Required feature missing: ${file}`);
  for (const file of files) {
    if (!canBundle(file)) errors.push(`Private or build-only file bundled: ${file}`);
    if (!/\.(?:html|css|m?js)$/.test(file)) continue;
    const source = await readFile(resolve(root, file), 'utf8');
    for (const ref of references(file, source)) {
      if (/^(?:data:|blob:|#)/.test(ref) || ref.includes('${')) continue;
      const url = new URL(ref, `https://postispop.com/${file}`);
      if (url.origin !== 'https://postispop.com') { errors.push(`Remote visual/code dependency: ${file} → ${url.origin}${url.pathname}`); continue; }
      const path = decodeURIComponent(url.pathname.slice(1));
      if (!names.has(path) && !names.has(path + 'index.html')) errors.push(`Missing local dependency: ${file} → ${path}`);
    }
  }
  if (errors.length) throw new Error('Bundle verification failed:\n' + [...new Set(errors)].join('\n'));
  return files;
}
export async function writeBundleManifest(root, metadata = {}) {
  const files = (await listFiles(root)).filter(file => file !== 'bundle-manifest.json'), entries = [];
  for (const path of files) {
    const content = await readFile(resolve(root, path));
    entries.push({ path, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
  }
  const contentHash = createHash('sha256').update(JSON.stringify(entries)).digest('hex');
  const manifest = { schema: 1, ...metadata, files: entries.length, bytes: entries.reduce((n, e) => n + e.bytes, 0), contentHash, entries };
  await writeFile(resolve(root, 'bundle-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
