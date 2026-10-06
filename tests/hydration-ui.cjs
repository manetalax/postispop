/* Regression: enhancements cannot mutate the SSR tree before React commits,
 * including save/resize signals and reload immediately after opening a note.
 */
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,ready,ROOT}=require('./notes-first-ui.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch(browserOptions());
  const {context}=await isolatedContext(browser,{width:390,height:844});
  let release;const paused=new Promise(resolve=>{release=resolve;});
  // Hold the React entry while real enhancement modules are allowed to load.
  const pauseRoute=async route=>{await paused;const url=new URL(route.request().url());const file=path.resolve(ROOT,'.'+url.pathname);await route.fulfill({body:await fs.readFile(file),contentType:'text/javascript'});};
  await context.route(/\/Board-[^/]+\.js(?:\?.*)?$/,pauseRoute);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/react|hydrat|minified/i.test(message.text()))errors.push(message.text());});
  try{
    await page.goto('https://postispop.com/',{waitUntil:'commit'});
    await page.locator('.board-frame.is-loading').waitFor();
    await page.evaluate(async()=>{await import('/experience.js?v=p0-20261004');});
    const before=await page.locator('.workspace-caption').innerHTML();
    await page.evaluate(()=>{
      window.dispatchEvent(new CustomEvent('postispop:save',{detail:{state:'saved',mode:'cloud',at:Date.now()}}));
      window.dispatchEvent(new Event('resize'));
    });
    assert.equal(await page.locator('.workspace-caption').innerHTML(),before,'Pre-hydration save/resize must preserve server DOM');
    assert.equal(await page.locator('.pp-board-options,.pp-menu-toggle').count(),0,'No enhancements before React readiness');
    release();await ready(page);await context.unroute(/\/Board-[^/]+\.js(?:\?.*)?$/,pauseRoute);
    // Match the observed failure: open, wait only for textarea, reload at once.
    for(let i=0;i<20;i++){
      for(const width of i===0?[360,390,412,768,1440,390]:[i%2?390:360])await page.setViewportSize({width,height:844});
      await page.locator('.sticky-note[data-note-id]:not([disabled])').first().click();
      await page.locator('.editor-dialog textarea').waitFor({state:'visible'});
      await page.reload();await ready(page);await page.locator('.pp-board-options').waitFor();
      assert.equal(await page.locator('.sticky-note[data-note-id]').count(),6);
      assert.deepEqual(errors,[],`React errors after reload ${i+1}`);
    }
    console.log('PASS: held React module + early save/resize leave SSR untouched; 20 immediate editor reloads, responsive changes, six notes and zero React errors.');
  }finally{release();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
