const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

test('public bundle rejects secrets, captured API data, source maps and binaries', async () => {
  const {canBundle} = await import('../mobile/bundle-tools.mjs');
  for (const file of ['api/me.json','.git/config','.signing/release.keystore','.env','assets/debug.map','app.apk','secret.p12']) assert.equal(canBundle(file),false,file);
  for (const file of ['assets/flags/es.svg','assets/fonts/serif.woff2','note-crypto.js','atelier.html']) assert.equal(canBundle(file),true,file);
});

test('packaging verifies actual imports and rejects missing or remote visual assets', async () => {
  const {auditBundle} = await import('../mobile/bundle-tools.mjs');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),'postispop-bundle-test-'));
  try {
    await fs.writeFile(path.join(directory,'index.html'),'<link rel="canonical" href="https://example.com/"><script type="module" src="/app.js?v=4"></script>');
    await fs.writeFile(path.join(directory,'app.js'),"import './feature.js';");
    await assert.rejects(auditBundle(directory,{required:['index.html']}),/feature\.js/);
    await fs.writeFile(path.join(directory,'feature.js'),'export const ready=true;');
    await auditBundle(directory,{required:['index.html']});
    await fs.writeFile(path.join(directory,'feature.css'),'@font-face{src:url(https://fonts.example.com/font.woff2)}');
    await assert.rejects(auditBundle(directory,{required:['index.html']}),/Remote visual/);
    await fs.writeFile(path.join(directory,'feature.css'),'.paper{background:url(/missing.svg)}');
    await assert.rejects(auditBundle(directory,{required:['index.html']}),/missing\.svg/);
  } finally { await fs.rm(directory,{recursive:true,force:true}); }
});

test('manifest hashes the deliverable content and changes when an asset changes', async () => {
  const {writeBundleManifest} = await import('../mobile/bundle-tools.mjs');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),'postispop-manifest-test-'));
  try {
    await fs.writeFile(path.join(directory,'index.html'),'Version A');
    const first = await writeBundleManifest(directory);
    assert.equal((await writeBundleManifest(directory)).contentHash,first.contentHash);
    await fs.writeFile(path.join(directory,'index.html'),'Version B');
    assert.notEqual((await writeBundleManifest(directory)).contentHash,first.contentHash);
    assert.equal(first.files,1);
  } finally { await fs.rm(directory,{recursive:true,force:true}); }
});

test('space-saving generated copies isolate HTML and manifests before native changes', async () => {
  const {copyMobileTree} = await import('../mobile/bundle-tools.mjs');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),'postispop-generated-link-test-'));
  const source=path.join(directory,'_site'), target=path.join(directory,'android-www');
  try {
    await fs.mkdir(source);
    await fs.writeFile(path.join(source,'index.html'),'web entry');
    await fs.writeFile(path.join(source,'bundle-manifest.json'),'web manifest');
    await fs.writeFile(path.join(source,'module.js'),'public module');
    await copyMobileTree(source,target,{linkImmutableAssets:true});
    assert.equal((await fs.stat(path.join(source,'module.js'))).ino,(await fs.stat(path.join(target,'module.js'))).ino);
    await fs.writeFile(path.join(target,'index.html'),'native entry');
    await fs.writeFile(path.join(target,'bundle-manifest.json'),'native manifest');
    assert.equal(await fs.readFile(path.join(source,'index.html'),'utf8'),'web entry');
    assert.equal(await fs.readFile(path.join(source,'bundle-manifest.json'),'utf8'),'web manifest');
  } finally { await fs.rm(directory,{recursive:true,force:true}); }
});

test('offline worker routes only its explicit public shell; account APIs and tokens bypass cache', async () => {
  const {renderServiceWorker} = await import('../mobile/service-worker.mjs');
  const handlers = {};
  const context = vm.createContext({URL,Set,self:{location:{origin:'https://postispop.com'},addEventListener:(name,fn)=>handlers[name]=fn}});
  vm.runInContext(renderServiceWorker(['/index.html','/supabase-bridge.js','/assets/font.woff2'],'fixture'),context);
  const request = (pathname,extra={})=>({url:'https://postispop.com'+pathname,method:'GET',headers:{has:()=>false},...extra});
  assert.equal(context.publicPath(request('/')),'/index.html');
  assert.equal(context.publicPath(request('/supabase-bridge.js?v=6')),'/supabase-bridge.js');
  for(const url of ['/api/me','/api/board/test','/storage/v1/object/private','/?access_token=SECRET','/index.html?code=SECRET','/share/private']) assert.equal(context.publicPath(request(url)),null,url);
  assert.equal(context.publicPath(request('/index.html',{headers:{has:()=>true}})),null);
  assert.equal(context.publicPath(request('/index.html',{method:'POST'})),null);
  assert.equal(context.publicPath(request('/index.html',{url:'https://foreign.test/index.html'})),null);
  assert.ok(handlers.install && handlers.activate && handlers.fetch);
});

test('an installed HTML shell stays with its cached module snapshot during an online update', async () => {
  const {renderServiceWorker} = await import('../mobile/service-worker.mjs');
  const handlers = {}, cached = {body:'installed document, version A'};
  let networkRequests = 0, response;
  const context = vm.createContext({URL,Set,
    self:{location:{origin:'https://postispop.com'},addEventListener:(name,fn)=>handlers[name]=fn},
    caches:{open:async()=>({match:async()=>cached})},
    fetch:async()=>{networkRequests++;return {body:'new document, version B'};},
  });
  vm.runInContext(renderServiceWorker(['/index.html'],'installed-a'),context);
  handlers.fetch({request:{url:'https://postispop.com/',method:'GET',headers:{has:()=>false}},respondWith:promise=>response=promise});
  assert.equal(await response,cached);
  assert.equal(networkRequests,0,'a new HTML document must not run with installed old modules');
});
