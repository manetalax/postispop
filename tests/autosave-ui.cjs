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
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');
  assert.equal(await page.locator('.sticky-note').count(),6,'Free starts with six notes');
  for(const mode of ['Escape','outside','back']){
   await page.locator('.sticky-note').first().click();await page.waitForSelector('.pp-design-tools');
   assert.equal(await page.locator('.edit-paper .pen-tray').count(),1);
   assert.equal(await page.locator('.edit-paper .editor-actions').count(),1);
   assert.equal(await page.locator('.editor-actions').getByRole('button',{name:'Listo',exact:true}).count(),0);
   const text='Último cambio '+mode;
   await page.locator('.editor-dialog textarea').fill(text);
   await page.getByLabel('Más herramientas',{exact:true}).click();
   await page.getByRole('button',{name:'Cursiva',exact:true}).click();
   if(mode==='Escape')await page.keyboard.press('Escape');
   if(mode==='outside')await page.mouse.click(5,5);
   if(mode==='back')await page.goBack();
   await page.waitForSelector('.editor-dialog',{state:'detached'});
   await page.waitForFunction(t=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text===t,text);
   await page.reload();await page.waitForSelector('.sticky-note:not([disabled])');
   assert.match(await page.locator('.sticky-note').first().innerText(),new RegExp(text));
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).notes[0].style.italic),mode!=='outside');
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.sticky-note').first().click();
  await page.waitForSelector('.edit-paper .pen-tray');await page.locator('.edit-paper .pen-tray').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:'test-results/nota-autoguardado-mobile.png'});
  assert.deepEqual(dialogs,[],'No confirmation on close');assert.deepEqual(errors,[]);
  console.log('PASS: tools inside note; immediate text/style persistence on Escape, outside click and browser Back; reload; mobile layout; zero confirmations.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
