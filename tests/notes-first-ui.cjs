/* Real browser regression suite for the notes-first experience.
 * All requests are served from _site or aborted: this suite never contacts production.
 * Usage: node tests/notes-first-ui.cjs
 */
const { browserOptions } = require('./browser-options.cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const ROOT = path.resolve(process.env.POSTISPOP_SITE_ROOT || '_site');
const RESULTS = path.resolve('test-results/notes-first');
const KEY = 'postispop-guest-board-v1';
const VIEWPORTS = [[320,568],[390,844],[768,1024],[1366,768],[1440,900]];
const NOTES = '.sticky-note[data-note-id]:not([disabled])';
function fixture(count = 24) {
  const notes = Array.from({length:count}, (_, i) => ({id:`guest-note-${i}`,paper:i%6,text:`Nota ${i+1} · ${i===23?'aguamarina-objetivo':'Ideas y tareas'}\nPrioridad: preparar la propuesta.\nRevisar detalles y fechas.\nComprar materiales.\nLlamar a Ana.\nReservar tiempo para leer.\nConfirmar la reunión del jueves.`,marks:[],doodle:'',author:'guest',revision:1,created:Date.now(),updated:Date.now(),lockedUntil:0,editing:'',image:null,style:null,styleRevision:0,protectedEnvelope:null}));
  return {id:'guest-board',title:'Mi pizarra',revision:1,order:notes.map(n=>n.id),expires:null,role:'owner',owner:'guest',notes,members:[],trash:[]};
}
async function isolatedContext(browser, viewport, board) {
  const context = await browser.newContext({viewport,locale:'es-ES',serviceWorkers:'block',hasTouch:viewport.width<=700});
  const blocked = [],missing = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if(url.hostname !== 'postispop.com' || route.request().method() !== 'GET') {blocked.push(url.origin+url.pathname);return route.abort();}
    let file = path.resolve(ROOT, '.'+(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(ROOT+path.sep))return route.abort();
    try {
      if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
      const type = {'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'}[path.extname(file)] || 'application/octet-stream';
      await route.fulfill({body:await fs.readFile(file),contentType:type});
    } catch {missing.push(url.pathname);await route.fulfill({status:404,body:''});}
  });
  await context.addInitScript(({board,KEY})=>{
    localStorage.setItem('pp:analytics-consent-v2','no');
    if(board&&!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(board));
  },{board,KEY});
  return {context,blocked,missing};
}
async function ready(page) {
  await page.waitForSelector('.pp-notes-first');
  await page.waitForFunction(()=>document.querySelector('.pp-pagination')&&document.querySelectorAll('.sticky-note[data-note-id]:not([disabled])').length>0);
  await page.evaluate(()=>document.fonts.ready);
}
async function geometry(page) {
  return page.locator(NOTES).evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();const s=getComputedStyle(n);const text=n.querySelector('.note-text');return {id:n.dataset.noteId,x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,font:text?getComputedStyle(text).fontSize:null,padding:s.padding};}));
}
async function noOverflow(page,label) {
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+': horizontal overflow');
}
async function run() {
  await fs.mkdir(RESULTS,{recursive:true});
  const browser = await chromium.launch(browserOptions());
  const report = {createdAt:new Date().toISOString(),site:ROOT,results:[],limitations:['Authenticated cloud, purchases and physical Android devices are not simulated by this isolated local suite. Existing 24-note boards exercise premium-size paging without changing entitlements.']};
  const runCase = async (name, viewport, board, test) => {
    const {context,blocked,missing} = await isolatedContext(browser,viewport,board);
    const page = await context.newPage(),errors=[],consoleErrors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',message=>{if(message.type()==='error'){consoleErrors.push(message.text());if(/react|hydrat|minified|unhandled|uncaught/i.test(message.text()))errors.push(message.text());}});
    page.on('dialog',d=>{errors.push('Unexpected dialog: '+d.type());d.dismiss();});
    page.setDefaultTimeout(12000);
    let result={name,viewport,passed:false};
    try {await page.goto('https://postispop.com/');await ready(page);await test(page,result);assert.deepEqual(errors,[],'Browser exceptions');result.passed=true;console.log('PASS '+name);}
    catch(error){result.failure=error.message;result.stack=error.stack;console.error('FAIL '+name+': '+error.message);}
    finally {result.errors=errors;result.consoleErrors=consoleErrors;result.missingAssets=[...new Set(missing)];result.blockedOrigins=[...new Set(blocked.map(u=>new URL(u).origin))];result.screenshot=path.join(RESULTS,name+'.png');await page.screenshot({path:result.screenshot,fullPage:false}).catch(()=>{});report.results.push(result);await context.close();}
  };
  try {
    for(const [width,height] of VIEWPORTS) {
      await runCase(`free-${width}x${height}`,{width,height},null,async(page,result)=>{
        assert.equal(await page.locator(NOTES).count(),6,'A new free board has exactly six notes');
        await noOverflow(page,'Free board');
        const rects=await geometry(page);result.geometry=rects;
        const columns=new Set(rects.map(r=>Math.round(r.x))).size,rows=new Set(rects.map(r=>Math.round(r.y))).size;
        assert.equal(columns,width<=700?2:3,'Free columns');assert.equal(rows,width<=700?3:2,'Free rows');
        for(const r of rects){assert.ok(Math.abs(r.w-r.h)<=2,'Post-it must remain square');assert.ok(r.w >= (width>1000?220:width>700?200:125),'Post-it preview must use the available screen');}
        await page.locator(NOTES).last().scrollIntoViewIfNeeded();
        assert.equal(await page.locator(NOTES).last().isVisible(),true,'All six free notes remain reachable below the enlarged brand and instructions');
        const guide=page.locator('.pp-header-instructions details');
        await guide.locator('summary').click();
        await page.waitForTimeout(2500);
        assert.equal(await guide.getAttribute('open')!==null,true,'Instructions stay expanded until explicitly closed');
        await guide.locator('summary').click();
        assert.equal(await page.getByRole('button',{name:'Página siguiente',exact:true}).isVisible(),false,'Single page does not expose irrelevant paging');
        await page.getByRole('button',{name:'Añadir nota',exact:true}).click();
        await page.waitForSelector('.editor-dialog textarea');
        const input=page.locator('.editor-dialog textarea');
        assert.equal(await input.inputValue(),'','Add reuses an existing empty slot');
        await page.waitForFunction(()=>document.activeElement===document.querySelector('.editor-dialog textarea'));
        assert.equal(await input.evaluate(el=>document.activeElement===el),true,'Reused empty note is ready to type');
        const firstIdea='Primera idea guardada desde + · '+width;
        await input.fill(firstIdea);await page.keyboard.press('Escape');
        await page.waitForSelector('.editor-dialog',{state:'detached'});
        await page.waitForFunction(({KEY,firstIdea})=>JSON.parse(localStorage.getItem(KEY))?.notes.some(n=>n.text===firstIdea),{KEY,firstIdea});
        assert.equal(await page.locator(NOTES).count(),6,'Reusing an empty slot never creates a seventh note');
      });
      await runCase(`legacy24-${width}x${height}`,{width,height},fixture(),async(page,result)=>{
        const size=width<=700?6:12,pages=24/size,seen=new Set();
        const rects=await geometry(page);result.geometry=rects;
        for(let p=0;p<pages;p++){
          assert.equal(await page.locator(NOTES).count(),size,'Page note count');await noOverflow(page,'Page '+(p+1));
          for(const r of await geometry(page)){assert.ok(Math.abs(r.w-r.h)<=2,'Square premium post-it');assert.ok(!seen.has(r.id),'No repeated note on multiple pages');seen.add(r.id);}
          if(p<pages-1){await page.getByRole('button',{name:'Página siguiente',exact:true}).click();await page.waitForFunction(n=>document.querySelector('.board-frame').dataset.ppView===String(n),p+1);}
        }
        assert.equal(seen.size,24,'All legacy notes are reachable');
        assert.equal(await page.getByRole('button',{name:'Página siguiente',exact:true}).isDisabled(),true);
        await page.getByRole('button',{name:'Página anterior',exact:true}).click();
        await page.waitForFunction(n=>document.querySelector('.board-frame').dataset.ppView===String(n),pages-2);
        await page.getByRole('combobox',{name:'Ir a la página',exact:true}).selectOption('0');
        await page.waitForFunction(()=>document.querySelector('.board-frame').dataset.ppView==='0');
        const search=page.getByRole('searchbox',{name:'Buscar notas o etiquetas'});
        await search.fill('aguamarina-objetivo');
        await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===1);
        assert.match(await page.locator(NOTES).innerText(),/aguamarina-objetivo/,'Global search reaches last page');
        await page.locator(NOTES).click();await page.waitForSelector('.pp-editor-toolbar');
        assert.match(await page.locator('.editor-dialog textarea').inputValue(),/aguamarina-objetivo/,'Filtered result opens the correct note');
        await page.keyboard.press('Escape');await page.waitForSelector('.editor-dialog',{state:'detached'});
        await search.fill('nothing-matches-999');await page.waitForSelector('.pp-empty-search:visible');assert.equal(await page.locator(NOTES).count(),0);
        await search.fill('');await page.waitForFunction(n=>document.querySelectorAll('.sticky-note[data-note-id]').length===n,size);
        if(width<=700){
          await search.blur();await page.locator('.board-frame').scrollIntoViewIfNeeded();
          const rect=await page.locator('.board-frame').boundingBox();
          const cdp=await page.context().newCDPSession(page);
          const y=Math.min(rect.y+60,height-80),startX=width-25,endX=25;
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y}]});
          await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(startX+endX)/2,y:y+3}]});
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await page.waitForFunction(()=>document.querySelector('.board-frame').dataset.ppView==='1');
          assert.equal(await page.locator('.editor-dialog').count(),0,'Swipe does not accidentally open a note');
          await page.waitForFunction(()=>!document.querySelector('.board-frame').dataset.swiping);
          await page.getByRole('button',{name:'Página anterior',exact:true}).click();
          await page.waitForFunction(()=>document.querySelector('.board-frame').dataset.ppView==='0');
          await cdp.detach();
        }
        const saved=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);assert.equal(saved.notes.length,24,'Search and paging preserve all notes');
        assert.deepEqual(saved.notes.map(n=>n.text),fixture().notes.map(n=>n.text),'Search and paging do not modify data');
      });
    }
    await runCase('free-six-populated-limit',{width:390,height:844},fixture(6),async(page)=>{
      await page.getByRole('button',{name:'Añadir nota',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.pp-note-action-status')?.textContent.includes('6 notas'));
      assert.equal(await page.locator(NOTES).count(),6,'Six populated free notes cannot create a seventh');
      assert.equal(await page.locator('.editor-dialog').count(),0,'Full allowance does not open or replace an existing note');
      assert.deepEqual(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).notes.map(n=>n.text),KEY),fixture(6).notes.map(n=>n.text),'The full board is preserved');
    });
    for(const [width,height] of [[390,844],[1366,768]]) {
      await runCase(`editor-${width}x${height}`,{width,height},fixture(6),async(page,result)=>{
        await page.locator(NOTES).first().click();await page.waitForSelector('.pp-editor-toolbar');
        assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'text','Writing is the default');
        assert.equal(await page.locator('.editor-dialog textarea').evaluate(el=>document.activeElement===el),true,'Typing starts immediately');
        const sample='Texto guardado sin pulsar guardar · '+width;
        await page.locator('.editor-dialog textarea').fill(sample);
        await page.getByRole('button',{name:'Lápiz',exact:true}).click();
        assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'draw');
        const canvas=page.locator('.pp-drawing-canvas');const box=await canvas.boundingBox();assert.ok(box&&box.width>100&&box.height>70,'Drawing surface is usable');
        await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.45,{steps:12});await page.mouse.up();
        await page.getByRole('button',{name:'Deshacer trazo',exact:true}).click();
        await page.getByRole('button',{name:'Rehacer trazo',exact:true}).click();
        await page.getByRole('button',{name:'Escribir',exact:true}).click();
        assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'text');await noOverflow(page,'Editor');
        const inside=await page.locator('.pp-editor-toolbar').evaluate(toolbar=>{const t=toolbar.getBoundingClientRect(),p=toolbar.closest('.editor-dialog').getBoundingClientRect();return t.left>=p.left-1&&t.right<=p.right+1;});assert.equal(inside,true,'Tools stay inside the note');
        await page.keyboard.press('Escape');await page.waitForSelector('.editor-dialog',{state:'detached'});
        await page.waitForFunction(({KEY,sample})=>{const b=JSON.parse(localStorage.getItem(KEY));return b.notes[0].text===sample&&b.notes[0].style?.drawing?.strokes?.length===1;},{KEY,sample});
        await page.reload();await ready(page);assert.match(await page.locator(NOTES).first().innerText(),new RegExp(sample));
        await page.locator(NOTES).first().click();await page.waitForSelector('.pp-editor-toolbar');assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'text');
        await page.locator('.editor-dialog textarea').fill(sample+' · Atrás');await page.goBack();await page.waitForSelector('.editor-dialog',{state:'detached'});
        await page.waitForFunction(({KEY,sample})=>JSON.parse(localStorage.getItem(KEY)).notes[0].text===sample+' · Atrás',{KEY,sample});
        result.savedDrawingStrokes=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).notes[0].style.drawing.strokes.length,KEY);
      });
    }
  } finally {await browser.close();await fs.writeFile(path.join(RESULTS,'report.json'),JSON.stringify(report,null,2));}
  const failed=report.results.filter(r=>!r.passed);console.log(`${report.results.length-failed.length}/${report.results.length} scenarios passed. Report: ${path.join(RESULTS,'report.json')}`);
  if(failed.length)process.exitCode=1;
  return report;
}
module.exports={isolatedContext,fixture,ready,VIEWPORTS,ROOT,RESULTS};
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});
