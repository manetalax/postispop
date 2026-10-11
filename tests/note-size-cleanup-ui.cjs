const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');
test('Opening the board removes an existing oversized local note and its files',async()=>{
 const browser=await chromium.launch(browserOptions());try{
 const {context}=await isolatedContext(browser,{width:390,height:844},fixture(6));const page=await context.newPage();await page.goto('https://postispop.com/');await ready(page);
 await page.evaluate(async()=>{const {readAttachmentRows}=await import('/backup-import.js');await readAttachmentRows('guest-note-0');const db=await new Promise(resolve=>{const r=indexedDB.open('postispop-note-attachments',1);r.onsuccess=()=>resolve(r.result);});await new Promise(resolve=>{const tx=db.transaction('attachments','readwrite');tx.objectStore('attachments').put({key:'guest-note-0::big',noteId:'guest-note-0',kind:'file',name:'big.bin',size:10000001,blob:new Blob([new Uint8Array(10000001)])});tx.oncomplete=resolve;});db.close();});
 await page.reload();await ready(page);await page.waitForFunction(()=>!JSON.parse(localStorage.getItem('postispop-guest-board-v1')).notes.some(n=>n.id==='guest-note-0'));
 assert.equal(await page.locator('.sticky-note').count(),5);
 const rows=await page.evaluate(async()=>{const {readAttachmentRows}=await import('/backup-import.js');return (await readAttachmentRows('guest-note-0')).length;});assert.equal(rows,0);
 await context.close();}finally{await browser.close();}
});
