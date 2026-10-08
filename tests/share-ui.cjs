const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');

test('Board, note text, WhatsApp and individual attachments use explicit share actions',async()=>{
  const browser=await chromium.launch(browserOptions());
  try{
    const {context,blocked,missing}=await isolatedContext(browser,{width:390,height:844},fixture(6));
    await context.addInitScript(()=>{
      window.__shared=[];window.__whatsapp='';
      Object.defineProperty(window,'__postispopNativeShare',{configurable:false,get:()=>undefined,set:()=>{}});
      Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
      Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shared.push({title:data.title,text:data.text,files:(data.files||[]).map(file=>({name:file.name,type:file.type,size:file.size}))})});
      window.open=url=>{window.__whatsapp=String(url);return {};};
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('https://postispop.com/');await ready(page);
    await page.getByRole('button',{name:'Menú'}).click();
    const shareButton=page.locator('.group-button,.header-share').first();
    await shareButton.waitFor({state:'attached'});assert.equal(await shareButton.isEnabled(),true);
    await shareButton.evaluate(button=>button.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
    await page.getByRole('dialog').waitFor();
    await page.getByRole('button',{name:'Compartir copia completa'}).click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.files?.[0]?.name==='PostisPop-copia.json'));
    await page.getByRole('button',{name:'Compartir imagen resumida'}).click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.files?.[0]?.name==='PostisPop-pizarra.png'));
    await page.getByRole('button',{name:'Cerrar'}).click();

    await page.locator('.sticky-note[data-note-id]').first().click();
    await page.locator('.editor-dialog textarea').fill('Texto que decido compartir');
    await page.getByRole('button',{name:'Más opciones de la nota',exact:true}).click();
    await page.locator('.pp-note-share').click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.text==='Texto que decido compartir'));
    await page.locator('.pp-note-whatsapp').click();
    await page.waitForFunction(()=>window.__whatsapp.startsWith('https://wa.me/?text='));
    const decoded=decodeURIComponent(new URL(await page.evaluate(()=>window.__whatsapp)).searchParams.get('text'));
    assert.match(decoded,/Texto que decido compartir/);

    await page.locator('.pp-file-action input').setInputFiles({name:'adjunto.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7 share test')});
    await page.locator('.pp-attachment-share').waitFor();await page.locator('.pp-attachment-share').click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.files?.[0]?.name==='adjunto.pdf'));
    assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);assert.deepEqual(missing,[]);
  }finally{await browser.close();}
});
