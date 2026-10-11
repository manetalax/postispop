const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');
(async()=>{const browser=await chromium.launch(browserOptions());try{
 const {context}=await isolatedContext(browser,{width:390,height:844},fixture(6));const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('https://postispop.com/');await ready(page);
 const colors=['rgb(255, 236, 134)','rgb(255, 197, 210)','rgb(185, 224, 248)','rgb(249, 240, 215)','rgb(197, 231, 189)','rgb(217, 200, 243)'];
 const {papers}=await import('../editor-catalog.js');
 for(let i=0;i<6;i++){
  await page.locator('.sticky-note[data-note-id]').nth(i).click();await page.locator('.pp-design-tools').waitFor();
  for(const {id}of papers){await page.locator('.pp-editor-options>summary').click();await page.locator('.pp-style-fields select').nth(1).selectOption(id);await page.keyboard.press('Escape');await page.locator('.pp-editor-toolbar button').nth(1).click();
   const actual=await page.locator('.pp-drawing-canvas').evaluate(n=>({color:getComputedStyle(n).backgroundColor,image:getComputedStyle(n).backgroundImage}));assert.equal(actual.color,colors[i],`${id}/${i}: selected note colour`);
   if(id==='plain')assert.equal(actual.image,'none');else{const svg=decodeURIComponent(actual.image.match(/data:image\/svg\+xml[^,]*,([^"\)]+)/)[1]);assert.equal(/<rect width="220" height="250" fill=/.test(svg),false,`${id}: no opaque sheet over the note`);}
  }
  await page.keyboard.press('Escape');await page.locator('.editor-dialog').waitFor({state:'hidden'});
 }
 assert.deepEqual(errors,[]);console.log('PASS drawing: 12 paper styles × 6 note colours; transparent patterns preserve the chosen paper colour.');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
