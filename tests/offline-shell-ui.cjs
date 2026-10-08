const {browserOptions}=require('./browser-options.cjs');
const {chromium} = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname,'../_site');
  const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
  const server = http.createServer(async (request,response) => {
    try {
      let file = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      if (file.endsWith('/')) file += 'index.html';
      file = path.resolve(root,'.'+file);
      if (!file.startsWith(root+path.sep)) throw Error('Bad path');
      const bytes = await fs.readFile(file);
      response.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
      response.end(bytes);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let serverShutdown;
  const closeServer=()=>serverShutdown ??= new Promise((resolve,reject)=>server.close(error=>{
    if(error && error.code!=='ERR_SERVER_NOT_RUNNING') reject(error);
    else resolve();
  }));
  // This test needs the real CacheStorage snapshot. An opt-in for constrained
  // runners keeps unrelated HTTP caching from storing a second full asset copy.
  const lowDiskArgs=process.env.POSTISPOP_SW_LOW_DISK==='1'?['--disk-cache-size=1','--media-cache-size=1','--disable-gpu']:[];
  let browser;
  try {
    browser = await chromium.launch(browserOptions({args:['--no-sandbox',...lowDiskArgs]}));
    if(process.env.POSTISPOP_SW_DIAGNOSTICS==='1'){
      const cdp=await browser.newBrowserCDPSession(), targets=new Map();
      const remember=({targetInfo})=>targets.set(targetInfo.targetId,targetInfo);
      cdp.on('Target.targetCreated',remember);
      cdp.on('Target.targetInfoChanged',remember);
      cdp.on('Target.targetCrashed',event=>{
        const target=targets.get(event.targetId);
        console.error('SW target crash:',JSON.stringify({...event,type:target?.type,url:String(target?.url||'').replace(/[?#].*$/,'')}));
      });
      await cdp.send('Target.setDiscoverTargets',{discover:true});
    }
    const context = await browser.newContext({serviceWorkers:'allow',locale:'es-ES',viewport:{width:412,height:850}});
    const page = await context.newPage();
    await page.goto(origin);
    await page.waitForSelector('.sticky-note:not([disabled])',{timeout:30000});
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await page.reload();
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    // Playwright's offline emulation does not cover every worker network path.
    // Stop the actual origin so a worker fetch cannot hide a missing cache entry.
    await closeServer();
    assert.equal(server.listening,false);
    await assert.rejects(fetch(origin),'The HTTP fixture must be unreachable before offline checks');
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector('.sticky-note:not([disabled])');
    const marker = 'Prueba privada de persistencia offline 20261002';
    await page.locator('.sticky-note').first().click();
    await page.locator('textarea').fill(marker);
    await page.waitForFunction(text=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text===text,marker);
    const cachePaths = await page.evaluate(async()=>{
      const paths=[];
      for(const name of await caches.keys()) for(const request of await (await caches.open(name)).keys()) paths.push(new URL(request.url).pathname);
      return paths;
    });
    assert.ok(cachePaths.includes('/index.html'));
    assert.ok(cachePaths.includes('/design-tools.js'));
    assert.ok(cachePaths.includes('/protected-notes.js'));
    assert.ok(!cachePaths.some(p=>/^\/(?:api|auth|storage)\//.test(p)));
    await page.close();
    const reopened = await context.newPage();
    await reopened.goto(origin);
    await reopened.waitForSelector('.sticky-note:not([disabled])');
    assert.ok((await reopened.locator('.sticky-note').first().innerText()).includes(marker));
    await reopened.goto(origin+'/atelier.html');
    await reopened.waitForSelector('.plans');
    const offer=await reopened.locator('.plans').innerText();
    for(const price of ['2,95','5,95','19,95','59,95'])assert.ok(offer.includes(price));
    assert.equal(await reopened.locator('.payment-options button:disabled').count(),4,'Offline Premium shell must not activate checkout');
    await reopened.goto(origin+'/compartir.html');
    assert.ok((await reopened.locator('body').innerText()).includes('nota'));
    console.log('PASS: real service-worker install, HTTP origin stopped, offline reload, local edit, tab close/reopen, Premium offer and protected-share shell; no API response cached.');
  } finally {
    try { await browser?.close(); }
    finally { await closeServer(); }
  }
})().catch(error=>{console.error(error);process.exit(1);});
