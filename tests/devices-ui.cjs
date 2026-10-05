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
  const sizes=[[320,568],[360,640],[390,844],[412,850],[768,1024],[1024,768],[1440,900],[844,390]];
  for(const [width,height] of sizes){
   await page.setViewportSize({width,height});await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');
   await page.waitForFunction(()=>document.querySelector('.pp-designed-board'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow '+width);
   assert.equal(await page.locator('.sticky-note').count(),12);
   const rects=await page.locator('.sticky-note').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
   for(let i=0;i<rects.length;i++){
    assert.ok(rects[i].w>=44&&rects[i].h>=44,'Touch target '+width+' note '+(i+1));
    for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];assert.ok(a.x+a.w<=b.x+1||b.x+b.w<=a.x+1||a.y+a.h<=b.y+1||b.y+b.h<=a.y+1,'Overlapping notes '+width+' '+i+' '+j);}
   }
   for(let i=0;i<11;i++){
    await page.locator('.sticky-note').nth(i).click({timeout:5000});
    const text=`Nota ${i+1} en ${width}`;
    await page.locator('.editor-dialog textarea').fill(text);
    await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click({timeout:5000});
    await page.waitForSelector('.editor-dialog',{state:'detached',timeout:5000});
    await page.waitForFunction(({i,text})=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[i]?.text===text,{i,text});
   }
   for(const mode of ['button','Escape','outside']){
    console.log('Checking quote dismissal',width,mode);
    await page.locator('.daily-quote .sticky-note').click({timeout:5000});
    await page.waitForSelector('.pp-quote-close');
    await page.waitForFunction(()=>{const r=document.querySelector('.daily-quote .sticky-note').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});
    if(mode==='button')await page.getByRole('button',{name:'Cerrar frase del día',exact:true}).click();
    if(mode==='Escape')await page.keyboard.press('Escape');
    if(mode==='outside')await page.mouse.click(2,2);
    await page.waitForSelector('.quote-expanded',{state:'detached'});
    await page.locator('.sticky-note').first().click({timeout:5000});await page.waitForSelector('.editor-dialog textarea');await page.keyboard.press('Escape');await page.waitForSelector('.editor-dialog',{state:'detached'});
   }
   await page.reload();await page.waitForSelector('.sticky-note:not([disabled])');
   assert.match(await page.locator('.sticky-note').nth(10).innerText(),new RegExp('Nota 11 en '+width));
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:`test-results/devices-${width}-${height}.png`});
   console.log(`PASS ${width}x${height}: all 12 targets, 11 saved editors and quote dismissal`);
  }
  assert.deepEqual(errors,[]);
 }catch(e){await page.screenshot({path:'test-results/devices-failure.png',fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
