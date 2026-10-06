const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const verifier = path.resolve(__dirname, '../android/verify-archive.py');

test('APK/AAB verification catches Android removing underscore directories after staging passes', async () => {
  const { writeBundleManifest } = await import('../mobile/bundle-tools.mjs');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'postispop-android-archive-'));
  const root = path.join(directory, 'www');
  try {
    for (const folder of ['_next/static', 'tienda/_astro', '.well-known']) await fs.mkdir(path.join(root, folder), { recursive: true });
    for (const [file, text] of Object.entries({ 'index.html': '<h1>Local app</h1>', '_next/static/app.js': 'startApp()', 'tienda/_astro/store.js': 'store()', '.well-known/assetlinks.json': '[]' })) await fs.writeFile(path.join(root, file), text);
    await writeBundleManifest(root, { target: 'android-assets', version: 'test' });
    const manifest = path.join(root, 'bundle-manifest.json');
    const buildZip = (prefix, mode) => {
      const target = path.join(directory, mode + (prefix.startsWith('base') ? '.aab' : '.apk'));
      const result = spawnSync('python3', ['-c', `
import pathlib,sys,zipfile
root,target,prefix,mode=sys.argv[1:]
with zipfile.ZipFile(target,'w') as z:
 for p in pathlib.Path(root).rglob('*'):
  if not p.is_file():continue
  rel=p.relative_to(root).as_posix()
  if mode=='missing' and rel.startswith('_next/'):continue
  data=p.read_bytes()
  if mode=='changed' and rel=='index.html':data=b'changed'
  z.writestr(prefix+rel,data)
 if mode=='extra':z.writestr(prefix+'unreviewed.js',b'extra')
`, root, target, prefix, mode], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      return target;
    };
    for (const prefix of ['assets/www/', 'base/assets/www/']) {
      const normal = spawnSync('python3', [verifier, buildZip(prefix, 'complete'), '--manifest', manifest], { encoding: 'utf8' });
      assert.equal(normal.status, 0, normal.stderr);
      assert.equal(JSON.parse(normal.stdout).bundledFiles, 4);
      for (const [mode, message] of [['missing', /_next\/static\/app.js/], ['changed', /changed inside archive/], ['extra', /absent from the audited manifest/]]) {
        const result = spawnSync('python3', [verifier, buildZip(prefix, mode), '--manifest', manifest], { encoding: 'utf8' });
        assert.equal(result.status, 1);
        assert.match(result.stderr, message);
      }
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
