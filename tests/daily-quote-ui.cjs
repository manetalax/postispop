const {browserOptions}=require('./browser-options.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch(browserOptions());
 const context=await browser.newContext({viewport:{width:1280,height:900},locale:'es-ES',serviceWorkers:'block'});
 const root=path.resolve('_site'),errors=[],dialogs=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='postispop.com')return route.abort();const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+path.sep))return route.abort();try{const contentType=({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream';await route.fulfill({body:await fs.readFile(file),contentType});}catch{await route.fulfill({status:404,body:''});}});
 await context.addInitScript(()=>localStorage.setItem('pp:analytics-consent-v2','no'));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.type());d.dismiss();});
 try{
  await page.setViewportSize({width:390,height:844});
  await page.goto('https://postispop.com/');await page.waitForSelector('[data-pp-slot="6"].pp-quote-host');
  const originalQuote=await page.locator('[data-pp-slot="6"]').getAttribute('data-pp-quote-text');
  async function edit(slot,text){
   await page.locator(`[data-pp-slot="${slot}"]`).click();await page.waitForSelector('.editor-dialog textarea');
   await page.locator('.editor-dialog textarea').fill(text);await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});
   await page.waitForFunction(({slot,text})=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[slot-1]?.text===text,{slot,text});
  }
  async function first(){for(let i=0;i<3&&await page.locator('.board-frame').getAttribute('data-pp-view')!=='1';i++){await page.locator('.zoom-button').click();await page.waitForTimeout(30);}await page.waitForSelector('[data-pp-slot="1"]');}
  async function second(){for(let i=0;i<3&&await page.locator('.board-frame').getAttribute('data-pp-view')!=='2';i++){await page.locator('.zoom-button').click();await page.waitForTimeout(30);}await page.waitForSelector('[data-pp-slot="7"]');}
  await page.locator('[data-pp-slot="6"]').click();await page.waitForSelector('.editor-dialog textarea');assert.equal(await page.locator('textarea').inputValue(),originalQuote);
  await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});
  await page.waitForSelector('[data-pp-slot="6"].pp-quote-host');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[5]?.text||''),'','Opening is not editing');
  await edit(6,'Mi frase personal en la nota seis');await second();await page.waitForSelector('[data-pp-slot="12"].pp-quote-host');
  await edit(12,'Mi nota doce');await page.waitForSelector('.pp-quote-host',{state:'detached'});
  await first();await edit(6,'');await page.waitForSelector('[data-pp-slot="6"].pp-quote-host');
  for(let i=1;i<=12;i++){if(i===7)await second();await edit(i,'Contenido propio '+i);}
  await page.waitForSelector('.pp-quote-reward');await page.getByRole('button',{name:'Sí, conservar la frase del día',exact:true}).click();
  await page.waitForSelector('.pp-daily-quote-banner');await page.waitForSelector('[data-pp-slot="1"]');assert.equal(await page.locator('.pp-quote-host').count(),0);
  await page.reload();await page.waitForSelector('.pp-daily-quote-banner');await edit(6,'');assert.equal(await page.locator('.pp-quote-host').count(),0,'Permanent banner never returns to a note');
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/daily-quote-reward-mobile.png'});
  await page.evaluate(()=>localStorage.removeItem('pp:daily-quote-layout-v1:guest-board'));await page.reload();await page.waitForSelector('[data-pp-slot="6"].pp-quote-host');await edit(6,'Restaurada seis');
  await page.waitForSelector('.pp-quote-reward');await page.getByRole('button',{name:'No, gracias',exact:true}).click();await page.waitForSelector('.pp-quote-reward',{state:'detached'});
  await page.reload();await page.waitForSelector('[data-pp-slot="1"]');assert.equal(await page.locator('.pp-quote-reward,.pp-daily-quote-banner').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS: editable quote 6 → 12 → hidden → 6; opening without saving; twelve filled notes; permanent banner and declined choice persist without overwriting notes.');
 }catch(e){console.error(errors);await page.screenshot({path:'test-results/daily-quote-failure.png',fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
