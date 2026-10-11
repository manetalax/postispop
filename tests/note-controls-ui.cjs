/* Real card controls in isolated guest boards: no production data or writes. */
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const themes=['forest','cinnamon','sage','ocean','lavender','terracotta','graphite','midnight','rose','sand'];
const languages=['es','en','de','fr','pt','it','ja','ko'];
const papers=['plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'];
const colors=['#ffec86','#ffc5d2','#b9e0f8','#f9f0d7','#c5e7bd','#d9c8f3'];
function contrast(a,b){const l=c=>{let v=c.startsWith('#')?c.slice(1).match(/../g).map(n=>parseInt(n,16)):c.match(/[\d.]+/g).slice(0,3).map(Number);v=v.map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const x=l(a),y=l(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{const {normalizeStyle,paperColor}=await import('../style-model.js');
const browser=await chromium.launch(browserOptions());await fs.mkdir('test-results/note-controls',{recursive:true});
try{for(const width of [320,390,1366])for(const theme of themes){
const board=fixture(6);board.notes.forEach((n,i)=>{n.doodle=['','heart','idea','smile','cart','star','check','ticket'][(i+themes.indexOf(theme))%8];});const {context}=await isolatedContext(browser,{width,height:900},board);
await context.addInitScript(theme=>{localStorage.setItem('postispop-interface-theme',theme);localStorage.setItem('postispop:board-preferences:guest-board',JSON.stringify({favorites:['guest-note-0'],pinned:['guest-note-0']}));},theme);
const page=await context.newPage();await page.goto('https://postispop.com/');await ready(page);await page.locator('.pp-note-favorite').first().waitFor();
for(const lang of languages){
await page.evaluate(async lang=>{localStorage.setItem('pp:lang',lang);const {initBoardPreferences}=await import('/board-preferences.js');initBoardPreferences(document.querySelector('.board-frame'),'guest-board');},lang);
const controls=await page.locator('.pp-note-preference').evaluateAll(ns=>ns.map(n=>{const s=getComputedStyle(n);return{label:n.getAttribute('aria-label'),bg:s.backgroundColor,border:s.borderWidth,shadow:s.boxShadow,color:s.color,svg:!!n.querySelector('svg'),size:n.querySelector('svg')?.getBoundingClientRect().width};}));
assert.equal(controls.length,24);for(const c of controls){assert.ok(c.label);assert.equal(c.bg,'rgba(0, 0, 0, 0)');assert.equal(c.border,'0px');assert.equal(c.shadow,'none');if(c.svg)assert.ok(c.size>=28);for(const bg of colors)assert.ok(contrast(c.color,bg)>=4.5,`${theme}/${width}/${lang} ink on ${bg}`);}
}
// All twelve stationery papers on all six note colours, rendered through the real style module.
for(const paper of papers){const style=normalizeStyle({paper});await page.evaluate(async style=>{const b=JSON.parse(localStorage.getItem('postispop-guest-board-v1'));for(const n of b.notes)n.style=style;localStorage.setItem('postispop-guest-board-v1',JSON.stringify(b));window.dispatchEvent(new Event('storage'));},style);await page.waitForFunction(paper=>[...document.querySelectorAll('.sticky-note[data-note-id]')].every(n=>n.dataset.ppPaper===paper),paper);
if(paper!=='plain')assert.equal(await page.locator('.pp-styled-note').first().evaluate(n=>getComputedStyle(n).backgroundOrigin),'content-box','Decoration stays clear of controls');
for(const color of await page.locator('.pp-note-preference,.note-number,.pp-note-date').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).color)))assert.ok(contrast(color,paperColor(paper))>=4.5,`${paper}: ink contrast`);
}
const pin=page.locator('.pp-note-pin').first();await pin.click();await page.waitForFunction(()=>document.querySelector('.pp-note-pin').getAttribute('aria-pressed')==='false');await pin.click();await page.waitForFunction(()=>document.querySelector('.pp-note-pin').getAttribute('aria-pressed')==='true');
const star=page.locator('.pp-note-favorite').first();await star.hover();assert.equal(await star.evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)');await star.click();await page.waitForFunction(()=>document.querySelector('.pp-note-favorite').getAttribute('aria-pressed')==='false');await star.click();await page.waitForFunction(()=>document.querySelector('.pp-note-favorite').getAttribute('aria-pressed')==='true');
await page.locator('.pp-note-color').first().click();assert.equal(await page.locator('.pp-note-color-picker').first().isVisible(),true);await page.locator('.pp-note-symbol').first().click();assert.equal(await page.locator('.pp-note-symbol-picker').first().isVisible(),true);assert.equal(await page.locator('.pp-note-color-picker').first().isVisible(),false);await page.locator('.pp-note-symbol').first().click();assert.equal(await page.locator('.editor-dialog').count(),0);
await page.reload();await ready(page);await page.locator('.pp-note-favorite[aria-pressed="true"]').waitFor();
const dots=await page.locator('.pp-note-color-dot').evaluateAll(ns=>ns.map(n=>({width:n.getBoundingClientRect().width,ink:getComputedStyle(n).borderColor,bg:getComputedStyle(n).backgroundColor})));for(const d of dots){assert.equal(d.width,28);assert.ok(contrast(d.ink,d.bg)>=3);}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
await page.locator('.board-frame').scrollIntoViewIfNeeded();
if(theme==='ocean'||theme==='midnight')await page.screenshot({path:`test-results/note-controls/${theme}-${width}.png`});
console.log(`PASS ${theme} ${width}px: 8 languages, 12 papers, 6 colours, state/menu persistence`);await context.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
