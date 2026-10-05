import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

// Use the same audited public bundle as GitHub Pages. Never upload repository
// sources or Supabase function code as Cloudflare Functions.
const root = fileURLToPath(new URL('../_site/', import.meta.url));
async function directoryIndexes(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await directoryIndexes(path));
    else if (entry.name === 'index.html') results.push(relative(root, path).replaceAll('\\', '/'));
  }
  return results;
}
const redirects = [];
for (const file of await directoryIndexes(root)) {
  const directory = file.slice(0, -'index.html'.length);
  const route = `/${directory}`;
  if (directory) redirects.push(`${route.slice(0, -1)} ${route} 301`);
  redirects.push(`${route} /${file} 200`);
}
if (redirects.filter(rule => rule.endsWith(' 200')).length > 100) throw new Error('Cloudflare rewrite limit exceeded.');
await writeFile(join(root, '_redirects'), redirects.join('\n') + '\n');
await writeFile(join(root, '_headers'), '/sw.js\n  Cache-Control: no-cache\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
await writeFile(join(root, '404.html'), '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Página no encontrada · PostisPop</title></head><body><main><h1>Página no encontrada</h1><p>Esta dirección no existe.</p><a href="/">Volver a la pizarra</a></main></body></html>');
console.log(`Cloudflare bundle ready: ${redirects.length} routing rules; existing .html URLs preserved.`);
