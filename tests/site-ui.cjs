const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../_site');await fs.mkdir('test-results',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.POSTISPOP_CHROME,args:['--no-sandbox']});
 try{
 for(const width of [390,1366]){
  const context=await browser.newContext({locale:'es-ES',viewport:{width,height:900},serviceWorkers:'block'}),page=await context.newPage();const errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message);});
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.hostname!=='postispop.com')return route.abort();let name=u.pathname;if(name.endsWith('/'))name+='index.html';
   try{const body=await fs.readFile(path.join(root,name)),ext=path.extname(name);await route.fulfill({contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'}[ext]||'application/octet-stream',body});}catch{await route.fulfill({status:404,body:'missing'});}
  });
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');await page.waitForSelector('#pp-board-tools');
  assert.equal(await page.locator('h1').count(),1);assert.match(await page.title(),/Bloc de notas online gratis/);
  assert.equal(await page.locator('html').getAttribute('lang'),'es');assert.equal(await page.locator('#como-funciona').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
  await page.locator('[data-tool=templates]').click();await page.locator('[data-template=tareas]').click();await page.waitForSelector('dialog.pp-tools-dialog',{state:'detached'});
  await page.waitForFunction(()=>document.querySelector('.sticky-note')?.textContent.includes('Por hacer'));
  await page.locator('[data-search]').fill('Terminado');await page.waitForFunction(()=>document.querySelectorAll('.note-cell:not([hidden])').length===1);
  await page.locator('[data-search]').fill('');await page.locator('[data-tool=organize]').click();await page.locator('input[name=tags]').fill('urgente');await page.locator('input[name=pinned]').check();await page.getByRole('button',{name:'Guardar organización'}).click();await page.waitForSelector('dialog.pp-tools-dialog',{state:'detached'});
  await page.reload();await page.waitForSelector('#pp-board-tools');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.metadata?.tags[0]==='urgente');
  await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});
  await page.locator('[data-tool=backup]').click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar JSON'}).click();assert.equal((await download).suggestedFilename(),'postispop-copia.json');
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();await page.locator('[data-tool=share]').click();assert.match(await page.locator('.pp-tools-dialog').textContent(),/solo en este dispositivo/);await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.locator('[data-pp-action=shop]').click();await page.waitForSelector('.pp-dialog');await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.goto('https://postispop.com/bloc-de-notas-online/');assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://postispop.com/bloc-de-notas-online/');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'guide overflow');
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px: Spanish homepage, no overflow, templates, filters, tags, persistence, JSON, sharing and guide.`);await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
