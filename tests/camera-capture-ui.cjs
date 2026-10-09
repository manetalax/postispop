const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');

test('Camera captures a photo under 128 KB and records 640x480 at 15 fps within the 6 MB media cap',async()=>{
  const browser=await chromium.launch(browserOptions({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']}));
  try{
    const {context}=await isolatedContext(browser,{width:390,height:844},fixture(6));
    await context.grantPermissions(['camera','microphone'],{origin:'https://postispop.com'});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('https://postispop.com/');await ready(page);
    await page.locator('.sticky-note[data-note-id]').first().click();
    await page.waitForSelector('.editor-dialog');
    await page.getByRole('button',{name:'Más opciones de la nota',exact:true}).click();
    await page.locator('.pp-camera-open').click();
    await page.waitForFunction(()=>{const v=document.querySelector('.pp-camera-preview');return v?.videoWidth>0&&v?.videoHeight>0;});
    const cameraSettings=await page.evaluate(()=>document.querySelector('.pp-camera-preview').srcObject.getVideoTracks()[0].getSettings());
    assert.equal(cameraSettings.width,640,'camera stream requests 640px width');assert.equal(cameraSettings.height,480,'camera stream requests 480px height');assert.equal(cameraSettings.frameRate,15,'camera stream requests 15 fps');
    await page.locator('.pp-camera-photo').click();
    await page.waitForFunction(()=>document.querySelector('.pp-camera-status')?.textContent.includes('KB'));
    await page.locator('.pp-attachments-list .pp-attachment-card').first().waitFor();
    const image=await page.evaluate(async()=>{
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('postispop-note-attachments',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const rows=await new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readonly'),r=tx.objectStore('attachments').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return rows.find(row=>row.type?.startsWith('image/'));
    });
    assert.ok(image,'camera photo is saved to the note');assert.ok(image.size<=128*1024,'camera photo stays within 128 KB');
    assert.match(image.type,/^image\/(webp|jpeg)$/,'camera photo uses a compressed browser image format');
    await page.locator('.pp-camera-record').click();await page.locator('.pp-camera-stop').waitFor({state:'visible'});
    await page.waitForTimeout(1600);await page.locator('.pp-camera-stop').click();
    await page.locator('.pp-attachments-list .pp-attachment-card').nth(1).waitFor();
    const video=await page.evaluate(async()=>{
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('postispop-note-attachments',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const rows=await new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readonly'),r=tx.objectStore('attachments').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return rows.find(row=>row.type?.startsWith('video/'));
    });
    assert.ok(video,'camera video is saved to the note');assert.ok(video.size<=6_000_000,'camera video remains within the 6 decimal MB media cap');
    const recordedBytes=await page.evaluate(async()=>{
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('postispop-note-attachments',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const rows=await new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readonly'),r=tx.objectStore('attachments').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();const row=rows.find(item=>item.type?.startsWith('video/'));return Array.from(new Uint8Array(await row.blob.arrayBuffer()));
    });
    await page.evaluate(()=>{
      window.__compressionProgress=[];
      window.__compressionProgressObserver=new MutationObserver(()=>{const label=document.querySelector('.pp-progress-label')?.textContent;if(label?.includes('Comprimiendo'))window.__compressionProgress.push(label);});
      window.__compressionProgressObserver.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});
    });
    await page.locator('.pp-video-action input').setInputFiles({name:'video-importado.webm',mimeType:video.type,buffer:Buffer.from(recordedBytes)});
    await page.waitForFunction(()=>document.querySelectorAll('.pp-attachments-list .pp-attachment-card').length>=3);
    const compressionProgress=await page.evaluate(()=>{window.__compressionProgressObserver.disconnect();return window.__compressionProgress;});
    assert.ok(compressionProgress.length>0,'video import displays live compression percentage');
    assert.deepEqual(errors,[],'camera flow has no uncaught browser errors');
    await page.locator('.pp-camera-close').click();
  }finally{await browser.close();}
});
