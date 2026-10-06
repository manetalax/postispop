// Isolated browser regression for complete PNGs and acknowledged native saves.
// Use POSTISPOP_TEST_SOURCE=1 before packaging to overlay only board-tools.js.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');
const KEY='postispop-guest-board-v1';
const COLORS=[[255,236,134,255],[255,197,210,255],[185,224,248,255],[249,240,215,255],[197,231,189,255],[217,200,243,255]];

async function openBoard(browser,board){
  const {context}=await isolatedContext(browser,{width:390,height:844},board),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
  if(process.env.POSTISPOP_TEST_SOURCE==='1')await page.route('**/board-tools.js*',route=>route.fulfill({contentType:'text/javascript',path:path.resolve('board-tools.js')}));
  await page.addInitScript(()=>{
    window.pngText=[];window.pngCanvases=[];window.revokedDownloads=[];window.savedNativeDownloads=[];
    // Chromium has no Android file picker. Keep the packaged mobile-entry.js
    // bridge real and simulate only its native WebMessage transport/receipt.
    window.PostisPopFiles={postMessage(value){
      const payload=JSON.parse(value);window.savedNativeDownloads.push(payload);
      queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({id:payload.id,status:'saved'})}));
    }};
    const fill=CanvasRenderingContext2D.prototype.fillText,encode=HTMLCanvasElement.prototype.toBlob,revoke=URL.revokeObjectURL;
    CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
      if(this.canvas.width===1600)window.pngText.push({text,x,y,height:this.canvas.height});
      return fill.call(this,text,x,y,...rest);
    };
    HTMLCanvasElement.prototype.toBlob=function(...args){window.pngCanvases.push(this);return encode.apply(this,args);};
    URL.revokeObjectURL=function(url){window.revokedDownloads.push(url);return revoke.call(this,url);};
  });
  await page.goto('https://postispop.com/');await ready(page);await page.locator('.pp-board-options>summary').click();
  return {context,page,errors};
}
async function exportImage(page){
  if(await page.evaluate(()=>window.__postispopNative===true)){
    const downloads=[],listener=download=>downloads.push(download);page.on('download',listener);
    try{
      await page.getByRole('button',{name:'Descargar imagen',exact:true}).click();
      await page.waitForFunction(()=>window.savedNativeDownloads.length===1&&document.querySelector('.pp-search-status')?.textContent.startsWith('PNG descargado:'));
      const saved=await page.evaluate(()=>window.savedNativeDownloads[0]);
      assert.equal(saved.filename,'PostisPop-pizarra.png');assert.match(saved.dataUrl,/^data:image\/png;base64,/);
      assert.equal(downloads.length,0,'The packaged Android bridge must use the native save transport');
      return Buffer.from(saved.dataUrl.slice(saved.dataUrl.indexOf(',')+1),'base64');
    }finally{page.off('download',listener);}
  }
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar imagen',exact:true}).click();
  const download=await pending;assert.equal(download.suggestedFilename(),'PostisPop-pizarra.png');
  return fs.readFile(await download.path());
}

test('PNG contains every note across pages, including the final card and drawing, without exposing protected text',{timeout:60000},async()=>{
  const browser=await chromium.launch(browserOptions());
  try{
    for(const count of [6,24,100]){
      const board=fixture(count),last=board.notes.at(-1),secret='NO-EXPORTAR-TEXTO-CIFRADO';
      board.notes[0].text=secret;board.notes[0].protectedEnvelope={encrypted:true};
      last.text='Última nota completa';last.style={drawing:{version:1,selectedInstrument:'ballpoint',strokes:[{instrument:'ballpoint',color:'#ff0000',width:20,points:[{x:.1,y:.5,p:.5},{x:.9,y:.5,p:.5}]}]}};
      const {context,page,errors}=await openBoard(browser,board);
      try{
        const before=await page.evaluate(KEY=>localStorage.getItem(KEY),KEY),png=await exportImage(page);
        assert.equal(png.subarray(1,4).toString(),'PNG');
        const pixels=await page.evaluate(async({base64,count})=>{
          const image=await createImageBitmap(new Blob([Uint8Array.from(atob(base64),char=>char.charCodeAt(0))],{type:'image/png'}));
          const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');
          const x=50+((count-1)%4)*385,y=100+Math.floor((count-1)/4)*342;
          const pixel=(px,py)=>{ctx.clearRect(0,0,1,1);ctx.drawImage(image,px,py,1,1,0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
          const result={width:image.width,height:image.height,cardBottom:y+315,card:pixel(x+10,y+300),drawing:pixel(x+180,y+237),background:pixel(image.width-5,image.height-5)};image.close();return result;
        },{base64:png.toString('base64'),count});
        assert.equal(pixels.width,1600);assert.ok(pixels.height>pixels.cardBottom+25,'The final card and footer must fit inside the saved image');
        assert.ok(pixels.width*pixels.height*4<56000000,'100-note image backing store stays below 56 MB');
        assert.deepEqual(pixels.card,COLORS[(count-1)%6],'Decoded PNG retains the bottom of the final card');
        assert.deepEqual(pixels.drawing,[255,0,0,255],'Decoded PNG contains the final note drawing');
        assert.deepEqual(pixels.background,[246,242,233,255],'Expanded canvas has an opaque background');
        const labels=await page.evaluate(()=>window.pngText);
        assert.equal(labels.filter(item=>/^NOTA \d+$/.test(item.text)).length,count);
        assert.ok(labels.some(item=>item.text==='Última nota completa'&&item.y<item.height));
        assert.ok(labels.some(item=>item.text==='Nota protegida'));
        assert.ok(!labels.some(item=>item.text.includes(secret)),'Protected plaintext is never drawn');
        assert.match(await page.locator('.pp-search-status').textContent(),new RegExp('PNG descargado: '+count+' notas'));
        assert.equal(await page.evaluate(KEY=>localStorage.getItem(KEY),KEY),before,'Export does not modify the board');
        assert.equal(await page.evaluate(()=>window.pngCanvases.every(canvas=>canvas.width===0&&canvas.height===0)),true,'Release encoded image buffers');
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser.close();}
});

test('PNG failure or unsupported size reports an error without a partial download',{timeout:30000},async()=>{
  const browser=await chromium.launch(browserOptions());
  try{
    for(const count of [6,101]){
      const {context,page,errors}=await openBoard(browser,fixture(count)),downloads=[];
      page.on('download',download=>downloads.push(download));
      try{
        if(count===6)await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=function(callback){window.pngCanvases.push(this);queueMicrotask(()=>callback(null));};});
        await page.getByRole('button',{name:'Descargar imagen',exact:true}).click();
        const expected=count===6?'No se pudo generar la imagen':'La imagen admite hasta 100 notas';
        await page.waitForFunction(expected=>document.querySelector('.pp-search-status')?.textContent.includes(expected),expected);
        assert.equal(downloads.length,0);assert.equal(await page.getByRole('button',{name:'Descargar imagen',exact:true}).isDisabled(),false);
        assert.equal(await page.evaluate(()=>window.savedNativeDownloads.length),0,'No partial image reaches the native transport');
        assert.equal(await page.evaluate(()=>window.pngCanvases.every(canvas=>canvas.width===0&&canvas.height===0)),true);
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser.close();}
});

test('JSON and PNG wait for native saving, preserve blob until completion, and distinguish saved/canceled/failed',{timeout:60000},async()=>{
  const browser=await chromium.launch(browserOptions());
  try{
    for(const buttonName of ['Guardar una copia','Descargar imagen']){
      const {context,page,errors}=await openBoard(browser,fixture(6)),downloads=[];
      page.on('download',download=>downloads.push(download));
      try{
        await page.evaluate(()=>{
          window.__postispopNative=true;window.nativeCalls=[];
          window.__postispopSaveDownload=(url,name)=>new Promise((resolve,reject)=>{window.nativeCalls.push({url,name,resolve,reject});});
        });
        const button=page.getByRole('button',{name:buttonName,exact:true});
        for(const outcome of ['saved','canceled','failed']){
          await button.click();await page.waitForFunction(()=>window.nativeCalls.length>0);
          const pending=await page.evaluate(async()=>{
            const call=window.nativeCalls[0],blob=await(await fetch(call.url)).blob();
            return {name:call.name,type:blob.type,bytes:blob.size,revoked:window.revokedDownloads.includes(call.url),status:document.querySelector('.pp-search-status').textContent};
          });
          assert.equal(pending.name,buttonName==='Guardar una copia'?'PostisPop-copia.json':'PostisPop-pizarra.png');
          assert.equal(pending.type,buttonName==='Guardar una copia'?'application/json':'image/png');assert.ok(pending.bytes>0);
          assert.equal(pending.revoked,false);assert.equal(await button.isDisabled(),true);assert.doesNotMatch(pending.status,/descargad[oa]/i);
          await page.evaluate(outcome=>{
            const call=window.nativeCalls.shift();window.lastNativeURL=call.url;
            if(outcome==='failed')call.reject(Object.assign(new Error('Android permite guardar archivos de hasta 10 MB. Utiliza la versión web para archivos mayores. Tus notas se conservan.'),{code:'NATIVE_DOWNLOAD_TOO_LARGE'}));
            else call.resolve(outcome==='saved');
          },outcome);
          const expected=outcome==='saved'?(buttonName==='Guardar una copia'?'Copia completa descargada':'PNG descargado'):outcome==='canceled'?'Descarga cancelada':'hasta 10 MB';
          await page.waitForFunction(expected=>document.querySelector('.pp-search-status')?.textContent.includes(expected),expected);
          assert.equal(await button.isDisabled(),false);assert.equal(await page.evaluate(()=>window.revokedDownloads.includes(window.lastNativeURL)),true);
        }
        assert.equal(downloads.length,0,'Native saves never start duplicate anchor downloads');assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{await browser.close();}
});
