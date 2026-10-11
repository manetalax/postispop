const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,fixture,ready}=require('./notes-first-ui.cjs');

test('Board, complete note links, WhatsApp and individual attachments use explicit share actions',async()=>{
  const browser=await chromium.launch(browserOptions());
  try{
    const {context,blocked,missing}=await isolatedContext(browser,{width:390,height:844},fixture(6));
    await context.route('https://htfyjefmviwlgmfqrwue.supabase.co/functions/v1/postispop-note-share/*',route=>route.fulfill({json:{token:new URL(route.request().url()).pathname.split('/').at(-1),expiresInDays:7}}));
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('https://postispop.com/');await ready(page);
    await page.getByRole('button',{name:'Menú'}).click();
    const shareButton=page.locator('.pp-share-board-link:visible');
    await shareButton.waitFor();assert.equal(await shareButton.isEnabled(),true);
    await page.evaluate(()=>{
      window.__shared=[];window.__whatsapp='';
      Object.defineProperty(window,'__postispopNativeShare',{configurable:false,get:()=>undefined,set:()=>{}});
      Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
      Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shared.push({title:data.title,text:data.text,files:(data.files||[]).map(file=>({name:file.name,type:file.type,size:file.size}))})});
      window.open=url=>{window.__whatsapp=String(url);return {};};
    });
    await shareButton.click();
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
    await page.locator('.pp-note-share-dialog input').waitFor();await page.getByRole('button',{name:'Compartir por otras aplicaciones',exact:true}).click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.text?.includes('https://postispop.com/nota-compartida.html#')));
    await page.locator('.pp-note-share-dialog').getByRole('button',{name:'Cerrar',exact:true}).click();
    await page.locator('.pp-note-whatsapp').click();await page.locator('.pp-note-share-dialog input').waitFor();await page.locator('.pp-note-share-dialog').getByRole('button',{name:'WhatsApp',exact:true}).click();
    await page.waitForFunction(()=>window.__shared.filter(item=>item.files?.[0]?.name==='PostisPop-nota.png').length===2);
    assert.equal(await page.evaluate(()=>window.__whatsapp),'');
    await page.locator('.pp-note-share-dialog').getByRole('button',{name:'Cerrar',exact:true}).click();

    await page.locator('.pp-file-action input').setInputFiles({name:'adjunto.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7 share test')});
    await page.locator('.pp-attachment-share').waitFor();await page.locator('.pp-attachment-share').click();
    await page.waitForFunction(()=>window.__shared.some(item=>item.files?.[0]?.name==='adjunto.pdf'));
    assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);assert.deepEqual(missing,[]);
  }finally{await browser.close();}
});
