/* Isolated regression: every palette, mobile/desktop, and reopening the editor. */
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve('_site');
const themes=['forest','cinnamon','sage','ocean','lavender','terracotta','graphite','midnight','rose','sand'];
function contrast(a,b){const l=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};let x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{const browser=await chromium.launch(browserOptions());try{
for(const width of [320,390,1366])for(const theme of themes){
const context=await browser.newContext({viewport:{width,height:900},locale:'es-ES',serviceWorkers:'block'});
await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='postispop.com'||route.request().method()!=='GET')return route.abort();try{const file=path.resolve(ROOT,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(ROOT+path.sep))return route.abort();const ext=path.extname(file);await route.fulfill({body:await fs.readFile(file),contentType:{'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json'}[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:''});}});
await context.addInitScript(theme=>{localStorage.setItem('postispop-interface-theme',theme);localStorage.setItem('pp:analytics-consent-v2','no');},theme);
const page=await context.newPage();await page.goto('https://postispop.com/');await page.locator('.sticky-note[data-note-id]').first().waitFor();
for(let opened=0;opened<2;opened++){
await page.locator('.sticky-note[data-note-id]').first().click();await page.locator('.pp-vault-note-action').waitFor();await page.waitForFunction(()=>document.querySelector('.editor-dialog').getAnimations().every(a=>a.playState!=='running'));
const result=await page.evaluate(()=>{const e=document.querySelector('.editor-dialog');const controls=[...e.querySelectorAll('.dialog-heading button,.pp-editor-toolbar>button:not(:disabled),.pp-editor-options>summary,.editor-actions button:not(:disabled),.pp-attachment-action')];const style=n=>{let s=getComputedStyle(n),r=n.getBoundingClientRect();return {name:n.getAttribute('aria-label')||n.textContent.trim(),color:s.color,bg:s.backgroundColor,w:r.width,h:r.height};};return {controls:controls.map(style),labels:[...e.querySelectorAll('.pp-attachment-action span')].map(n=>({color:getComputedStyle(n).color,bg:getComputedStyle(n.parentElement).backgroundColor})),heading:[...e.querySelectorAll('.dialog-heading button')].map(style),attachments:[...e.querySelectorAll('.pp-attachment-actions>.pp-attachment-action')].map(style),overflow:e.scrollWidth>e.clientWidth+1,textarea:style(e.querySelector('textarea')),paper:style(e.querySelector('.rich-paper-input')),ink:getComputedStyle(e.querySelector('.rich-paper-mirror')).color,toolbarOverflow:e.querySelector('.pp-editor-toolbar').scrollWidth>e.querySelector('.pp-editor-toolbar').clientWidth+1};});
assert.equal(result.overflow,false,`${theme}/${width} editor overflow`);assert.equal(result.toolbarOverflow,false,`${theme}/${width} toolbar overflow`);
for(const c of [...result.controls,...result.labels])assert.ok(contrast(c.color,c.bg)>=4.5,`${theme}/${width}: ${c.name} contrast ${contrast(c.color,c.bg)}`);
assert.deepEqual(result.heading.map(c=>[c.w,c.h]),[[42,42],[42,42]]);
assert.ok(result.attachments.every(c=>Math.abs(c.h-result.attachments[0].h)<1),`${theme}/${width} attachment sizes ${JSON.stringify(result.attachments)}`);
assert.equal(result.textarea.bg,"rgba(0, 0, 0, 0)");assert.equal(result.textarea.color,"rgba(0, 0, 0, 0)");
assert.ok(contrast(result.ink,result.paper.bg)>=4.5,`${theme}/${width} saved ink contrast`);
if(theme==='midnight'&&width===390&&opened===1){await fs.mkdir('test-results/editor-themes',{recursive:true});await page.screenshot({path:'test-results/editor-themes/midnight-mobile.png'});}
await page.getByRole('button',{name:'Volver a la pizarra',exact:true}).click();await page.locator('.editor-dialog').waitFor({state:'hidden'});
}console.log(`PASS ${theme} ${width}px, reopened`);await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
