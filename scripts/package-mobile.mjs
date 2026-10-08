import { mkdir, rm, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { copyPublicTree, copyMobileTree, listFiles, auditBundle, writeBundleManifest } from '../mobile/bundle-tools.mjs';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'android/app/src/main/assets/www');
await stat(resolve(root, 'astro-dist/index.html'));
await import('./stage-site.mjs');
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
await copyMobileTree(resolve(root, '_site'), out, {linkImmutableAssets:process.env.POSTISPOP_MOBILE_ASSET_LINKS==='1'});
for (const file of await listFiles(out)) {
  if (!file.endsWith('.html')) continue;
  let html = await readFile(resolve(out, file), 'utf8');
  html = html.replace(/<script\b[^>]*src=["'][^"']*wpo-register\.js[^"']*["'][^>]*>\s*<\/script>/g, '');
  if (file === 'index.html') {
    const bridge = /src=["'](?:\.\/|\/)?supabase-bridge\.js(?:\?[^"']*)?["']/;
    if (!bridge.test(html)) throw new Error('Main bridge entry point missing; refusing incomplete mobile build');
    html = html.replace(bridge, 'src="/mobile-entry.js"');
  }
  await writeFile(resolve(out, file), html);
}
await copyPublicTree(resolve(root, 'mobile/mobile-entry.js'), resolve(out, 'mobile-entry.js'));
await rm(resolve(out, 'sw.js'), {force:true});
await rm(resolve(out, 'wpo-register.js'), {force:true});
await writeFile(resolve(out, 'mobile-build.json'), JSON.stringify({
  version:'0.6.1', runtime:'bundled-local', applicationId:'com.postispop.android',
  database:'https://htfyjefmviwlgmfqrwue.supabase.co', payments:'coming-soon-disabled',
  attachments:'local-indexeddb', protectedNotes:'aes-gcm-local',
  accountOffline:'persistent-queue-requires-server-migration',
  installationTested:false, newPurchasesEnabled:false,
}, null, 2) + '\n');
await auditBundle(out);
const manifest = await writeBundleManifest(out, {target:'android-assets', version:'0.6.1'});
console.log('Verified complete mobile bundle:', manifest.files, 'files;', manifest.contentHash);
console.log('Assets prepared only. This command does not build, sign, install or publish an APK.');
