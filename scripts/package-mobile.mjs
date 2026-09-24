import { cp, mkdir, rm, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'android/app/src/main/assets/www');
await stat(resolve(root, 'astro-dist/index.html')); // Build the shop first.
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
for (const name of ['index.html','manifest.json','favicon.svg','privacy.html','terms.html','legal.html','cookies.html','commerce-ui.js','commerce.css','supabase-bridge.js','supabase-config.js','guest-board.js','guest-status.js','postispop-shop.js']) {
  await cp(resolve(root,name),resolve(out,name));
}
for (const name of ['assets','_next']) await cp(resolve(root,name),resolve(out,name),{recursive:true});
await cp(resolve(root,'astro-dist'),resolve(out,'tienda'),{recursive:true});
// Stored API snapshots from the recovered website must never ship as personal data.
await cp(resolve(root,'mobile/mobile-entry.js'),resolve(out,'mobile-entry.js'));
let html = await readFile(resolve(out,'index.html'),'utf8');
html = html.replace('src="./supabase-bridge.js?v=5"','src="./mobile-entry.js"').replaceAll(' async=""','');
await writeFile(resolve(out,'index.html'),html);
await writeFile(resolve(out,'mobile-build.json'),JSON.stringify({version:'0.2.0-beta',runtime:'bundled-local',database:'https://htfyjefmviwlgmfqrwue.supabase.co',payments:'existing-stripe'},null,2));
console.log('Mobile UI bundled locally, including the shop. No remote website fallback.');
