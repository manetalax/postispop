/* Isolated real editor, using current source UI modules over staged app assets.
 * Creation-success fixture exercises navigation after an authorized API response;
 * entitlement verification remains covered by offline-bridge/database tests. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');
const KEY='postispop-guest-board-v1';
(async()=>{
 const browser=await chromium.launch(browserOptions());
 async function run(name,board,work){
  const {context}=await isolatedContext(browser,{width:1366,height:900},board),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
  for(const file of ['board-layout.js','board-tools.js','backup-import.js'])await page.route('**/'+file+'*',route=>route.fulfill({contentType:'text/javascript',path:path.resolve(file)}));
  try{await page.goto('https://postispop.com/');await ready(page);await work(page);assert.deepEqual(errors,[]);console.log('PASS '+name);}catch(error){console.error(await page.evaluate(()=>({status:document.querySelector('.pp-note-action-status')?.textContent,view:document.querySelector('.board-frame')?.dataset.ppView,data:document.querySelector('.pp-daily-quote-data')?.dataset,cards:[...document.querySelectorAll('.sticky-note[data-note-id]')].map(n=>n.dataset.noteId),dialogs:[...document.querySelectorAll('[role=dialog]')].map(n=>n.textContent.slice(0,200))})));throw error;}finally{await context.close();}
 }
 try{
  await run('Six empty papers: plus opens writing immediately and saves without creating a seventh',null,async page=>{
   await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.waitForSelector('.pp-editor-toolbar');
   const text=page.locator('.editor-dialog textarea');assert.equal(await text.evaluate(el=>document.activeElement===el),true);await text.fill('Creada desde el botón más');await page.keyboard.press('Escape');
   await page.waitForFunction(KEY=>{const board=JSON.parse(localStorage.getItem(KEY));return board?.notes[0].text==='Creada desde el botón más';},KEY);
   assert.equal(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).notes.length,KEY),6);
  });
  await run('Six occupied free papers: plus preserves notes and explains the limit',fixture(6),async page=>{
   await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.pp-note-action-status')?.textContent.trim().length>0);
   assert.match(await page.locator('.pp-note-action-status').innerText(),/6 notas/);
   assert.equal(await page.locator('.editor-dialog').count(),0);assert.equal(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).notes.length,KEY),6);
  });
  const later=fixture(24);later.notes[17].text='';
  await run('Plus clears search and color, navigates to an empty paper on a later page',later,async page=>{
   const search=page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}),color=page.getByLabel('Filtrar por color',{exact:true});
   await search.fill('aguamarina-objetivo');await color.selectOption('5');await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===1);
   await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.waitForSelector('.pp-editor-toolbar');
   assert.equal(await page.locator('.pp-note-search input[type=search]').inputValue(),'');assert.equal(await page.locator('.pp-note-search select[aria-label="Filtrar por color"]').inputValue(),'');assert.equal(await page.locator('.editor-dialog textarea').inputValue(),'');
   assert.equal(await page.locator('.board-frame').getAttribute('data-pp-view'),'1');await page.locator('.editor-dialog textarea').fill('Hueco correcto');await page.keyboard.press('Escape');
   await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).notes[17].text==='Hueco correcto',KEY);
  });
  const protectedSlot=fixture(6);protectedSlot.notes[0].text='';protectedSlot.notes[1].text='';
  await run('Plus excludes an attachment-only paper',protectedSlot,async page=>{
   await page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('postispop-note-attachments',1);request.onupgradeneeded=()=>{const s=request.result.createObjectStore('attachments',{keyPath:'key'});s.createIndex('noteId','noteId');};request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('attachments','readwrite');tx.objectStore('attachments').put({key:'guest-note-0::fixture',noteId:'guest-note-0',id:'fixture',kind:'link',name:'Documento',url:'https://example.test/doc',created:1});tx.oncomplete=()=>{db.close();resolve();};};}));
   await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.waitForSelector('.pp-editor-toolbar');await page.locator('.editor-dialog textarea').fill('Segundo papel');await page.keyboard.press('Escape');
   await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).notes[1].text==='Segundo papel',KEY);assert.equal(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).notes[0].text,KEY),'');
  });
  await run('An authorized create response opens its new note on the correct page',fixture(12),async page=>{
   await page.evaluate(KEY=>{const delegate=window.fetch.bind(window);window.fetch=async(input,init)=>{if(input==='/api/board/guest-board/notes'&&init?.method==='POST'){const board=JSON.parse(localStorage.getItem(KEY)),note={...board.notes[0],id:'guest-note-24',text:'',marks:[],doodle:'',image:null,style:null,revision:1};board.notes.push(note);board.order.push(note.id);board.revision++;localStorage.setItem(KEY,JSON.stringify(board));return Response.json(board);}return delegate(input,init);};},KEY);
   await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.waitForSelector('.pp-editor-toolbar');
   assert.equal(await page.locator('.board-frame').getAttribute('data-pp-view'),'1');assert.equal(await page.locator('.editor-dialog textarea').inputValue(),'');await page.locator('.editor-dialog textarea').fill('Nueva nota autorizada');await page.keyboard.press('Escape');
   await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).notes.find(note=>note.id==='guest-note-24')?.text==='Nueva nota autorizada',KEY);
  });
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
