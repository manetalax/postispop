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
   const mobile=width<=700||(width<=1000&&height<=500&&width>height);
   await page.waitForFunction(m=>document.querySelectorAll('.sticky-note[data-note-id]').length===(m?6:12),mobile);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow '+width);
   if(mobile){
    await page.evaluate(()=>scrollTo(0,0));
    assert.ok((await page.locator('.board-frame').boundingBox()).y<=76,'Notes appear immediately');
    for(const r of await page.locator('.sticky-note').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height};}))){assert.equal(Math.round(r.w),144);assert.equal(Math.round(r.h),144);}
   }
   const rects=await page.locator('.sticky-note').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,y:r.y};}));
   for(const r of rects){assert.equal(r.w,144);assert.equal(r.h,144);}
   if(mobile){assert.equal(new Set(rects.map(r=>r.x)).size,width>height?3:2);assert.equal(new Set(rects.map(r=>r.y)).size,width>height?2:3);}
   for(let i=1;i<=12;i++){
    if(mobile&&i===7){await page.getByRole('button',{name:'Ver las 6 siguientes · 7–12 →',exact:true}).click();await page.waitForSelector('[data-pp-slot="7"]');}
    const note=page.locator(`[data-pp-slot="${i}"]`);
    await note.click({timeout:5000});await page.waitForSelector('.editor-dialog textarea');
    const text=`Primera frase legible ${i}. Más contenido en ${width}`;
    await page.locator('.editor-dialog textarea').fill(text);
    await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});
    await page.waitForFunction(({i,text})=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[i-1]?.text===text,{i,text});
   }
   // With twelve notes, cycle ends at twelve before returning to the first six.
   if(mobile){await page.getByRole('button',{name:'Ver 12 notas · 1–12',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===12);}
   else{await page.getByRole('button',{name:'Ver las 6 primeras · 1–6',exact:true}).click();await page.waitForSelector('.board-frame[data-pp-view="1"]');await page.getByRole('button',{name:'Ver las 6 siguientes · 7–12 →',exact:true}).click();await page.waitForSelector('.board-frame[data-pp-view="2"]');await page.getByRole('button',{name:'Ver 12 notas · 1–12',exact:true}).click();await page.waitForSelector('.board-frame[data-pp-view="0"]');}
   await page.waitForFunction(()=>[...document.querySelectorAll('.sticky-note[data-note-id]')].every(n=>n.getBoundingClientRect().width===144&&n.getBoundingClientRect().height===144));
   for(const r of await page.locator('.sticky-note').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})))){assert.equal(r.w,144);assert.equal(r.h,144);}
   await page.reload();await page.waitForSelector('[data-pp-slot="1"]');
   assert.match(await page.locator('[data-pp-slot="1"]').innerText(),/Primera frase legible 1/);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/devices-${width}-${height}.png`});
   console.log(`PASS ${width}x${height}: first-screen post-its, paging and all 12 editable notes`);
  }
  // Existing extra notes unlock exactly the next populated six-note group.
  await page.setViewportSize({width:390,height:844});
  for(const count of [13,18,19,24,25,30,31]){
   await page.evaluate(count=>{const b=JSON.parse(localStorage.getItem('postispop-guest-board-v1'));while(b.notes.length<count){const i=b.notes.length;b.notes.push({...b.notes[0],id:'guest-note-'+i,text:'Nota adicional '+(i+1),revision:1,image:null,style:null,protectedEnvelope:null});b.order.push('guest-note-'+i);}localStorage.setItem('postispop-guest-board-v1',JSON.stringify(b));},count);
   await page.reload();await page.waitForSelector('[data-pp-slot="1"]');
   for(let group=2;group<=Math.ceil(count/6);group++){await page.locator('.zoom-button').click();await page.waitForSelector(`[data-pp-slot="${(group-1)*6+1}"]`);assert.equal(await page.locator('.sticky-note[data-note-id]').count(),Math.min(6,count-(group-1)*6));}
   await page.getByRole('button',{name:'Ver 12 notas · 1–12',exact:true}).waitFor();assert.equal(await page.locator('.zoom-button').getAttribute('aria-label'),'Ver 12 notas · 1–12');await page.locator('.zoom-button').click();await page.waitForSelector('.board-frame[data-pp-view="0"]');assert.equal(await page.locator('.sticky-note[data-note-id]').count(),12);
   await page.locator('.zoom-button').click();await page.waitForSelector('.board-frame[data-pp-view="1"]');
   console.log(`PASS ${count} notes: only populated groups and twelve-note overview`);
  }
  async function noteCount(){return page.evaluate(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).order.length);}
  async function goGroup(group){for(let i=0;i<8&&Number(await page.locator('.board-frame').getAttribute('data-pp-view'))!==group;i++){await page.locator('.zoom-button').click();await page.waitForTimeout(40);}await page.waitForSelector(`.board-frame[data-pp-view="${group}"]`);}
  const undoName=/Deshacer|Undo/;
  for(const count of [30,25,24,19,18,13,12]){
   while(await noteCount()>count){const before=await noteCount();await goGroup(Math.ceil(before/6));await page.locator(`[data-pp-slot="${before}"]`).click();await page.waitForSelector('.editor-dialog textarea');await page.getByRole('button',{name:'A la papelera',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});await page.waitForFunction(n=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).order.length===n,before-1);}
   await goGroup(Math.ceil(count/6));await page.getByRole('button',{name:'Ver 12 notas · 1–12',exact:true}).waitFor();assert.equal(await page.locator('.sticky-note[data-note-id]').count(),count%6||6);
   console.log(`PASS real trash down to ${count}: empty group removed automatically`);
  }
  // Creation opens its populated page; deleting and Undo adjust it immediately.
  await page.getByRole('button',{name:'＋ Añadir nota',exact:true}).click();await page.waitForSelector('[data-pp-slot="13"]');assert.equal(await noteCount(),13);
  await page.locator('[data-pp-slot="13"]').click();await page.waitForSelector('.editor-dialog textarea');await page.locator('.editor-dialog textarea').fill('Nota trece recién creada, conservar');await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});
  await page.locator('[data-pp-slot="13"]').click();await page.waitForSelector('.editor-dialog textarea');await page.getByRole('button',{name:'A la papelera',exact:true}).click();await page.waitForSelector('.editor-dialog',{state:'detached'});await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).order.length===12);
  await page.getByRole('button',{name:undoName}).last().click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).order.length===13);await goGroup(3);assert.match(await page.locator('[data-pp-slot="13"]').innerText(),/Nota trece recién creada/);
  console.log('PASS create 13 → trash 12 → Undo 13: page updates, original text preserved');
  assert.deepEqual(errors,[]);
 }catch(e){console.log('device diagnostics',errors,await page.evaluate(()=>({body:document.body.className,frame:document.querySelector('.board-frame')?.className,sheets:[...document.styleSheets].map(s=>s.href),head:document.head.innerHTML.slice(-1500),notes:document.querySelectorAll('.sticky-note').length})));await page.screenshot({path:'test-results/devices-failure.png',fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
