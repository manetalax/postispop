/* Real controls in isolated browsers: no accounts, payments or production writes. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,ready,fixture}=require('./notes-first-ui.cjs');
const languages=['es','en','de','fr','pt','it','ja','ko'];
const palettes=['forest','cinnamon','sage','ocean','lavender','terracotta','graphite','midnight','rose','sand'];
(async()=>{const browser=await chromium.launch(browserOptions());try{
 for(const width of [320,390,1366])for(const lang of languages){
  const {context}=await isolatedContext(browser,{width,height:900},fixture(6));
  await context.addInitScript(lang=>localStorage.setItem('pp:lang',lang),lang);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://postispop.com/');await ready(page);await page.locator('.pp-note-color').first().waitFor();
  const search=page.locator('.pp-note-search input');
  for(const palette of palettes){
   await page.evaluate(value=>window.dispatchEvent(new StorageEvent('storage',{key:'postispop-interface-theme',newValue:value})),palette);
   for(const [triggerSelector,panelSelector,type] of [['.pp-board-options>summary','.pp-board-options','details'],['.pp-note-color','.pp-note-color-picker','picker'],['.pp-note-symbol','.pp-note-symbol-picker','picker']]){
    const trigger=page.locator(triggerSelector).first(),panel=page.locator(panelSelector).first();
    const open=()=>panel.evaluate((n,type)=>type==='details'?n.open:!n.hidden,type);
    await trigger.click();assert.equal(await open(),true);
    // Padding inside a menu must not dismiss it or select an option.
    const content=type==='details'?panel.locator('.pp-tools'):panel;
    const bounds=await content.boundingBox();await content.click({position:{x:bounds.width/2,y:3}});assert.equal(await open(),true);
    await page.mouse.click(1,250);assert.equal(await open(),false,`${lang}/${palette}/${width}: outside ${triggerSelector}`);
    await trigger.click();await page.keyboard.press('Escape');assert.equal(await open(),false);
    assert.equal(await trigger.evaluate(n=>n===document.activeElement),true,'Escape restores the trigger');
    if(type==='picker')assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   }
   const first=page.locator('.pp-note-color').first(),second=page.locator('.pp-note-color').nth(1);
   await first.click();await second.click();assert.equal(await page.locator('.pp-note-color-picker:not([hidden])').count(),1,'Only the new note picker remains open');
   await search.focus();assert.equal(await page.locator('.pp-note-picker:not([hidden])').count(),0,'Keyboard focus outside dismisses pickers');
  }
  const header=page.locator('.app-header'),toggle=page.locator('.pp-menu-toggle');
  await toggle.click();await header.locator('.pp-theme-picker legend').click();assert.ok(await header.evaluate(n=>n.classList.contains('pp-menu-open')));
  await page.keyboard.press('Escape');assert.equal(await header.evaluate(n=>n.classList.contains('pp-menu-open')),false);assert.equal(await toggle.evaluate(n=>n===document.activeElement),true);
  await toggle.click();await page.locator('.header-auth-login:visible').click();assert.equal(await header.evaluate(n=>n.classList.contains('pp-menu-open')),false,'Account action is outside the header submenu');await page.keyboard.press('Escape');
  await page.locator('.sticky-note[data-note-id]').first().click();await page.locator('.pp-editor-options>summary').waitFor();
  const editor=page.locator('.editor-dialog'),tools=editor.locator('.pp-editor-options'),summary=tools.locator('summary');
  await summary.click();await editor.locator('.dialog-heading').click();assert.equal(await tools.evaluate(n=>n.open),false,'A click elsewhere in the editor dismisses tools');
  await summary.click();await editor.locator('textarea').focus();assert.equal(await tools.evaluate(n=>n.open),false,'Writing focus dismisses editor tools');
  await summary.click();await page.keyboard.press('Escape');assert.equal(await tools.evaluate(n=>n.open),false);assert.ok(await editor.isVisible(),'Escape closes tools and keeps the note open');
  assert.equal(await summary.evaluate(n=>n===document.activeElement),true);await page.keyboard.press('Escape');await editor.waitFor({state:'hidden'});
  await page.locator('.pp-board-options>summary').click();
  const download=page.waitForEvent('download');await page.locator('.pp-board-options .pp-tools button').first().click();await download;
  assert.equal(await page.locator('.pp-board-options').evaluate(n=>n.open),false,'Export closes its menu');assert.equal(await page.locator('.pp-board-options>summary').evaluate(n=>n===document.activeElement),true,'Export returns focus to a visible control');
  await context.route('**/functions/v1/postispop-commerce/status',r=>r.fulfill({contentType:'application/json',body:'{"checkoutReady":true}'}));
  await page.goto('https://postispop.com/atelier.html?lang='+lang);const global=page.locator('.pp-global-theme-control');await global.locator('summary').click();await page.locator('.pricing-intro').click();assert.equal(await global.evaluate(n=>n.open),false);
  await global.locator('summary').click();await page.keyboard.press('Escape');assert.equal(await global.evaluate(n=>n.open),false);assert.equal(await global.locator('summary').evaluate(n=>n===document.activeElement),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(`PASS menus ${lang} ${width}px: 10 palettes, outside, inside, Escape, focus, switching, editor, export, shop`);await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
