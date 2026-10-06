const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
const {browserOptions}=require('./browser-options.cjs');

test('Real guest UI downloads and restores attachments offline without replacing a slot that already holds a local file',{timeout:30000},async()=>{
  const {chromium}=require('playwright'),browser=await chromium.launch(browserOptions());
  const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),page=await context.newPage();
  // Exercise the actual distribution after staging, including its React-ready
  // bootstrap. Android runs this same flow against its packaged local payload.
  const base=path.resolve(process.env.POSTISPOP_TEST_ROOT||'_site'),errors=[];
  page.setDefaultTimeout(10000);
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff'};
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());if(url.hostname!=='postispop.com')return route.abort();
    const pathname=url.pathname==='/'?'/index.html':url.pathname;
    const file=path.resolve(base,'.'+pathname);
    try{await route.fulfill({body:await fs.readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:''});}
  });
  await context.addInitScript(()=>localStorage.setItem('pp:analytics-consent-v2','no'));
  page.on('pageerror',error=>errors.push(error.message));
  try{
    const response=await page.goto('https://postispop.com/');assert.equal(response.status(),200,'the staged app must exist; run stage-site or package-mobile before this integration test');await page.waitForSelector('.sticky-note:not([disabled])');
    await page.locator('.sticky-note').first().click();await page.locator('.editor-dialog textarea').fill('Nota con archivo de prueba');
    await page.getByRole('button',{name:'Más opciones de la nota',exact:true}).click();
    const fileBytes=Buffer.from([37,80,68,70,45,49,46,52,10,0,255,128,64]);
    await page.locator('.pp-file-action input').setInputFiles({name:'Archivo.pdf',mimeType:'application/pdf',buffer:fileBytes});
    await page.waitForSelector('.pp-attachment-card');await page.keyboard.press('Escape');await page.waitForSelector('.editor-dialog',{state:'detached'});
    const ready=page.waitForEvent('download');await page.keyboard.press('Control+Shift+E');const exported=await ready,backupText=await fs.readFile(await exported.path(),'utf8');
    const backup=JSON.parse(backupText);assert.equal(backup.version,2);assert.equal(backup.notes[0].attachments[0].name,'Archivo.pdf');
    await page.evaluate(async()=>{
      localStorage.clear();localStorage.setItem('pp:analytics-consent-v2','no');
      await new Promise((resolve,reject)=>{const request=indexedDB.deleteDatabase('postispop-note-attachments');request.onsuccess=resolve;request.onerror=request.onblocked=()=>reject(Error('Unable to reset fixture'));});
    });
    await page.reload();await page.waitForSelector('.sticky-note:not([disabled])');await context.setOffline(true);
    await page.evaluate(async()=>{
      const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('postispop-note-attachments',1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('attachments',{keyPath:'key'});store.createIndex('noteId','noteId');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      await new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readwrite');tx.objectStore('attachments').put({key:'guest-note-0::existing',id:'existing',noteId:'guest-note-0',kind:'file',name:'Conservar.pdf',type:'application/pdf',size:3,created:1,blob:new Blob([new Uint8Array([5,6,7])])});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
    });
    await page.locator('.pp-board-options>summary').click();await page.getByRole('button',{name:'Restaurar una copia',exact:true}).click();
    await page.locator('.pp-feature-dialog input[type=file]').setInputFiles({name:'Copia.json',mimeType:'application/json',buffer:Buffer.from(backupText)});
    await page.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click();
    await page.waitForSelector('.pp-feature-dialog',{state:'detached'});await page.waitForSelector('.sticky-note:not([disabled])');
    const content=await page.evaluate(async()=>{
      const board=JSON.parse(localStorage.getItem('postispop-guest-board-v1'));
      const db=await new Promise(resolve=>{const request=indexedDB.open('postispop-note-attachments',1);request.onsuccess=()=>resolve(request.result);});
      const rows=await new Promise(resolve=>{const request=db.transaction('attachments','readonly').objectStore('attachments').getAll();request.onsuccess=()=>resolve(request.result);});db.close();
      return {text:board.notes[1].text,empty:board.notes[0].text,rows:await Promise.all(rows.map(async row=>({noteId:row.noteId,name:row.name,bytes:[...new Uint8Array(await row.blob.arrayBuffer())]}))),localState:JSON.stringify(board)};
    });
    assert.equal(content.text,'Nota con archivo de prueba');assert.equal(content.empty,'');assert.equal(content.rows.length,2);
    assert.deepEqual(content.rows.find(row=>row.name==='Archivo.pdf').bytes,[...fileBytes]);assert.equal(content.rows.find(row=>row.name==='Archivo.pdf').noteId,'guest-note-1');
    assert.deepEqual(content.rows.find(row=>row.name==='Conservar.pdf').bytes,[5,6,7]);assert.equal(content.localState.includes(backup.notes[0].attachments[0].data),false,'binary bodies stay in IndexedDB rather than leaking into note/localStorage records');
    const recovery=await page.evaluate(async payload=>{
      const boardKey='postispop-guest-board-v1',originalSet=Storage.prototype.setItem,before=localStorage.getItem(boardKey);
      const request=()=>fetch('/api/board/guest-board/import',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
      const readRows=async()=>{const db=await new Promise(resolve=>{const request=indexedDB.open('postispop-note-attachments',1);request.onsuccess=()=>resolve(request.result);});const rows=await new Promise(resolve=>{const request=db.transaction('attachments','readonly').objectStore('attachments').getAll();request.onsuccess=()=>resolve(request.result);});db.close();return rows;};
      Storage.prototype.setItem=function(key,value){if(key===boardKey)throw new DOMException('quota','QuotaExceededError');return originalSet.call(this,key,value);};
      let failed;try{const response=await request();failed={status:response.status,data:await response.json()};}finally{Storage.prototype.setItem=originalSet;}
      const unchanged=localStorage.getItem(boardKey)===before,rowsAfterQuota=(await readRows()).length;
      // Simulate interruption after the note commit but before finishing the
      // import ticket. The retry must return that commit, not add another note.
      Storage.prototype.setItem=function(key,value){if(key.startsWith('pp:import-request:')&&JSON.parse(value).finishedAt)throw new DOMException('interrupted','QuotaExceededError');return originalSet.call(this,key,value);};
      try{await request();}finally{Storage.prototype.setItem=originalSet;}
      const retry=await request(),after=JSON.parse(localStorage.getItem(boardKey));
      return {failed,unchanged,rowsAfterQuota,retryStatus:retry.status,rowsAfterRetry:(await readRows()).length,copies:after.notes.filter(note=>note.text==='Nota con archivo de prueba').length};
    },backupText);
    assert.equal(recovery.failed.data.error,'LOCAL_STORAGE_FULL');assert.equal(recovery.unchanged,true);assert.equal(recovery.rowsAfterQuota,2,'failed guest note commit rolls back staged files');
    assert.equal(recovery.retryStatus,200);assert.equal(recovery.rowsAfterRetry,3);assert.equal(recovery.copies,2,'the interrupted import retry must not create a third copy');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
