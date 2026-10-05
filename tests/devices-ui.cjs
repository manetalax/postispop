const {browserOptions}=require('./browser-options.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch(browserOptions());
 const context=await browser.newContext({viewport:{width:1280,height:900},locale:'es-ES',serviceWorkers:'block'});
 const root=path.resolve('_site'),errors=[],dialogs=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='postispop.com')return route.abort();const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+path.sep))return route.abort();try{const contentType=({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream';await route.fulfill({body:await fs.readFile(file),contentType});}catch{await route.fulfill({status:404,body:''});}});

 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.type());d.dismiss();});
 try{
  await fs.mkdir('test-results',{recursive:true});
  for(const [width,height] of [[320,568],[360,640],[390,844],[412,850],[768,1024],[1024,768],[1440,900],[844,390]]){
   await page.setViewportSize({width,height});await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');
   await page.waitForFunction(()=>document.querySelector('.pp-designed-board'));
   const mobile=width<=700;
   await page.waitForFunction(m=>document.querySelectorAll('.sticky-note[data-note-id]').length===(m?6:12),mobile);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow '+width);
   if(mobile){
    await page.evaluate(()=>scrollTo(0,0));
    assert.ok((await page.locator('.board-frame').boundingBox()).y<=76,'Notes appear immediately');
    for(const r of await page.locator('.sticky-note').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height};}))){assert.equal(Math.round(r.w),144);assert.equal(Math.round(r.h),144);}
   }
   for(let i=1;i<=12;i++){
    if(mobile&&i===7){await page.getByRole('button',{name:'Ver las 6 siguientes · 7–12 →',exact:true}).click();await page.waitForSelector('[data-pp-slot="7"]');}
    const note=page.locator(`[data-pp-slot="${i}"]`);
    await note.click({timeout:5000});await page.waitForSelector('.editor-dialog textarea');
    const text=`Primera frase legible ${i}. Más contenido en ${width}`;
    await page.locator('.editor-dialog textarea').fill(text);
    await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});
    await page.waitForFunction(({i,text})=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[i-1]?.text===text,{i,text});
   }
   await page.reload();await page.waitForSelector('[data-pp-slot="1"]');
   assert.match(await page.locator('[data-pp-slot="1"]').innerText(),/Primera frase legible 1/);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/devices-${width}-${height}.png`});
   console.log(`PASS ${width}x${height}: first-screen post-its, paging and all 12 editable notes`);
  }
  assert.deepEqual(errors,[]);
 }catch(e){console.log('device diagnostics',errors,await page.evaluate(()=>({body:document.body.className,frame:document.querySelector('.board-frame')?.className,sheets:[...document.styleSheets].map(s=>s.href),head:document.head.innerHTML.slice(-1500),notes:document.querySelectorAll('.sticky-note').length})));await page.screenshot({path:'test-results/devices-failure.png',fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
