const {browserOptions}=require('./browser-options.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(process.env.POSTISPOP_TEST_ROOT||'_site');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.wasm':'application/wasm','.webmanifest':'application/manifest+json'};
(async()=>{
 const browser=await chromium.launch(browserOptions());
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-ES',serviceWorkers:'block'});
 const errors=[],missing=[];let page;
 try{
  await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='postispop.com')return route.abort('internetdisconnected');let name=decodeURIComponent(u.pathname);if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return route.abort();try{await route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:await fs.readFile(file)});}catch{missing.push(name);await route.fulfill({status:404,body:'Missing test asset'});}});
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('test-results',{recursive:true});
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');
  await page.locator('.sticky-note').first().click();await page.locator('.editor-dialog textarea').fill('Secreto de prueba 6429');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Secreto de prueba 6429');
  await page.getByText('Papeles, letras y trazos',{exact:true}).click();await page.getByRole('button',{name:'Cursiva',exact:true}).click();
  const canvas=page.locator('.pp-drawing-canvas');await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();
  await page.mouse.move(box.x+30,box.y+30);await page.mouse.down();await page.mouse.move(box.x+80,box.y+65,{steps:8});await page.mouse.up();
  await page.getByRole('button',{name:'Guardar estilo y dibujo',exact:true}).click();
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.style;return s?.italic&&s.drawing.strokes.length===1;});
  await context.setOffline(true);await page.reload();await page.waitForSelector('.sticky-note:not([disabled])');
  assert.match(await page.locator('.sticky-note').first().innerText(),/Secreto de prueba/);await page.waitForSelector('.pp-note-sketch');
  assert.equal(await page.locator('.pp-vault-toolbar').isVisible(),false);
  await page.locator('.sticky-note').first().click();
  await page.getByRole('button',{name:'🔒 Contraseña',exact:true}).click();
  await page.getByLabel('Contraseña de esta nota',{exact:true}).fill('Una frase privada 6429');await page.getByLabel('Repite la contraseña',{exact:true}).fill('Una frase privada 6429');await page.locator('.pp-vault-consent input').check();
  await page.getByRole('button',{name:'Cifrar y proteger',exact:true}).click();
  await page.waitForFunction(()=>Boolean(JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.protectedEnvelope),{timeout:15000});
  await page.waitForSelector('.pp-vault-locked');
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage}).includes('Secreto de prueba')),false,'Plaintext must be absent from all local storage after protection');
  assert.equal(await page.locator('.sticky-note').first().innerText().then(t=>t.includes('Secreto')),false);
  await page.locator('.pp-vault-locked').first().click();await page.getByLabel('Contraseña',{exact:true}).fill('incorrecta');await page.getByRole('button',{name:'Abrir nota',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.pp-vault-status')?.textContent.includes('no es correcta'));
  assert.equal(await page.getByLabel('Texto de la nota protegida').count(),0);
  await page.getByLabel('Contraseña',{exact:true}).fill('Una frase privada 6429');await page.getByRole('button',{name:'Abrir nota',exact:true}).click();
  await page.waitForSelector('.pp-vault-dialog.is-unlocked');assert.equal(await page.getByLabel('Texto de la nota protegida').inputValue(),'Secreto de prueba 6429');assert.equal(await page.locator('.pp-vault-drawing').count(),1);
  await page.getByLabel('Texto de la nota protegida').fill('Secreto actualizado');await page.getByRole('button',{name:'Guardar cifrada y cerrar'}).click();await page.waitForSelector('.pp-vault-dialog',{state:'detached'});
  await page.reload();await page.waitForSelector('.pp-vault-locked');assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage}).includes('Secreto actualizado')),false);
  await page.screenshot({path:'test-results/nota-protegida-mobile.png',fullPage:true});
  await context.setOffline(false);await page.goto('https://postispop.com/atelier.html');await page.waitForSelector('#at-grid article');
  for(const width of [360,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Atelier width '+width);await page.screenshot({path:`test-results/atelier-${width}.png`,fullPage:false});}
  await page.goto('https://postispop.com/propietario.html');await page.waitForFunction(()=>!document.querySelector('#status').textContent.includes('Comprobando'));assert.equal(await page.locator('#dashboard').isHidden(),true,'Guest cannot see owner metrics');
  await page.goto('https://postispop.com/compartir.html#invalido');await page.waitForFunction(()=>document.querySelector('#share-status').textContent.includes('no es válido'));
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(missing)],[]);
  console.log('PASS: styles, drawing, offline guest reopen, encrypted text/drawing, wrong password, encrypted edits, responsive atelier and owner access denial.');
 }catch(e){if(page){console.error('URL:',page.url());console.error('UI:',(await page.locator('body').innerText()).slice(-4500));await page.screenshot({path:'test-results/premium-failure.png',fullPage:true}).catch(()=>{});}console.error('Errors:',errors,'Missing:',missing);throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
