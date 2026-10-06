const {browserOptions}=require('./browser-options.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');const path=require('node:path');
let reviewPage;
const results=path.resolve(process.env.POSTISPOP_TEST_RESULTS||path.resolve(__dirname,'../test-results'));
let observedErrors=[];
(async()=>{
  const root=path.resolve(__dirname,'../_site');
  const browser=await chromium.launch(browserOptions());
  // This suite serves only staged files through route(); workers can bypass routing and hit production.
  const context=await browser.newContext({locale:'pt-BR',viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
  const errors=observedErrors,missing=[],metricsRequests=[];
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/rest/v1/rpc/postispop_record_usage'){metricsRequests.push(route.request().postDataJSON());return route.fulfill({status:200,contentType:'application/json',body:'{"accepted":true}'});}
    if(url.hostname!=='postispop.com')return route.abort('internetdisconnected');
    let name=decodeURIComponent(url.pathname);if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return route.abort();
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.woff':'font/woff'};
    try{await route.fulfill({status:200,headers:{'x-postispop-test-source':'staged'},contentType:types[path.extname(file)]||'application/octet-stream',body:await fs.readFile(file)});}catch{missing.push(name);await route.fulfill({status:404,body:'Missing staged asset'});}
  });
  await context.addInitScript(()=>{if(localStorage.getItem('pp:analytics-consent-v2')===null)localStorage.setItem('pp:analytics-consent-v2','no');});
  const page=reviewPage=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await fs.mkdir(results,{recursive:true});
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');await page.waitForSelector('.pp-board-options');
  assert.equal(await page.locator('html').getAttribute('lang'),'es');
  assert.equal(await page.locator('h1').count(),1);
  assert.match(await page.title(),/Bloc de notas online gratis/);
  assert.match(await page.locator('.connection').innerText(),/dispositivo/);
  assert.ok((await page.locator('h1').textContent()).trim(),'The page keeps its semantic heading');
  assert.equal(await page.locator('.board-frame').isVisible(),true);
  assert.equal(await page.locator('.sticky-note').count(),6,'Free shows six notes');
  const firstPrompt=page.locator('.board-grid .note-cell:first-child .blank-note');
  await firstPrompt.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.board-grid .note-cell:first-child .blank-note')?.textContent==='Escribe aquí');
  assert.equal(await page.locator('.onboarding-card').isVisible(),false,'Guide card is replaced by the first-note CTA');
  assert.equal(await firstPrompt.innerText(),'Escribe aquí','First-note prompt is visible real text');
  for(const width of [360,390,412,768,1440]){
    await page.setViewportSize({width,height:844});
    await page.waitForFunction(()=>{const node=document.querySelector('.board-grid .note-cell:first-child .blank-note');return node&&node.clientHeight>0&&node.scrollHeight<=node.clientHeight+1&&node.scrollWidth<=node.clientWidth+1;});
    await page.locator('.sticky-note').first().click({trial:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(results,'welcome-mobile.png'),fullPage:true});
  assert.equal(metricsRequests.length,0,'Rejected analytics sends no events');
  assert.equal(await page.locator('script[src*="site-metrics"]').count(),0,'The notes workspace does not load network analytics');
  await page.locator('.sticky-note').first().click();
  await page.locator('textarea').waitFor({state:'visible'});
  await page.reload();await page.waitForSelector('.pp-board-options');
  assert.equal(await page.locator('.onboarding-card').isVisible(),false,'Guide card stays hidden');
  assert.equal(await page.locator('.pp-learn').isVisible(),false);
  assert.equal(await page.locator('[aria-label="Promoción de estreno"]').isVisible(),false);
  assert.equal(await page.getByRole('link',{name:'Ayuda',exact:true,includeHidden:true}).getAttribute('href'),'/ayuda.html');

  assert.equal(await page.locator('.pp-visit-streak').count(),0,'No reward or streak noise on the notes board');
  await page.locator('.sticky-note').first().click();
  await page.locator('textarea').fill('Mi nota persistente #estudio');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Mi nota persistente #estudio');
  await page.waitForTimeout(100);
  assert.equal(metricsRequests.length,0,'Saving a local note makes no analytics request');
  assert.ok(!JSON.stringify(metricsRequests).includes('Mi nota persistente'),'Measurement excludes note content');
  await page.keyboard.press('Escape');
  await page.locator('.sticky-note').first().click();
  assert.equal(metricsRequests.length,0,'Opening an editor does not enable measurement');
  // A real offline flag used to prevent guest saves in the recovered component.
  await context.setOffline(true);
  await page.locator('textarea').fill('Nota guardada sin Internet #estudio');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Nota guardada sin Internet #estudio');
  await context.setOffline(false);await page.reload();await page.waitForSelector('.pp-board-options');
  assert.match(await page.locator('.sticky-note').first().innerText(),/Nota guardada sin Internet/);
  assert.equal(await page.locator('.onboarding-card').isVisible(),false);
  assert.equal(await page.locator('.pp-board-options').getAttribute('open'),null);
  assert.equal(await page.getByRole('button',{name:'Guardar una copia',exact:true}).isVisible(),false);
  assert.equal(await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).isVisible(),true);
  await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).fill('#estudio');
  await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===1);
  assert.match(await page.locator('.sticky-note').innerText(),/Nota guardada sin Internet/);
  await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).fill('');
  await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===6);
  await page.getByRole('combobox',{name:'Filtrar por color'}).selectOption('1');
  await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===1);
  await page.getByRole('combobox',{name:'Filtrar por color'}).selectOption('');
  await page.waitForFunction(()=>document.querySelectorAll('.sticky-note[data-note-id]').length===6);
  await page.getByLabel('Opciones avanzadas',{exact:true}).click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar una copia',exact:true}).click();
  const download=await downloadPromise;const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(backup.notes[0].text,'Nota guardada sin Internet #estudio');assert.ok(!JSON.stringify(backup).includes('access_token'));
  // Restore a valid copy without overwriting the current note, then refuse an
  // unsafe copy before any write. These are real local import/export modules.
  const openImport=async()=>{
    await page.getByRole('button',{name:'Restaurar una copia',exact:true}).click();
    return page.getByRole('dialog',{name:'Restaurar una copia de seguridad',exact:true});
  };
  let importDialog=await openImport();
  await importDialog.locator('input[type=file]').setInputFiles({name:'ideas.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'postispop',version:1,notes:[{text:'Idea recuperada #archivo',paper:2}]}))});
  await page.waitForFunction(()=>document.querySelector('.pp-feature-dialog [role=status]')?.textContent.includes('1 notas con contenido'));
  await Promise.all([page.waitForNavigation(),importDialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click()]);
  await page.waitForSelector('.pp-board-options');
  assert.match(await page.locator('.sticky-note').first().innerText(),/Nota guardada sin Internet/);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).notes.filter(n=>n.text==='Idea recuperada #archivo').length),1);
  await page.getByLabel('Opciones avanzadas',{exact:true}).click();
  const beforeInvalid=await page.evaluate(()=>localStorage.getItem('postispop-guest-board-v1'));
  importDialog=await openImport();
  await importDialog.locator('input[type=file]').setInputFiles({name:'unsafe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({notes:[{text:'No importar',image:{url:'javascript:alert(1)'}}]}))});
  await page.waitForFunction(()=>document.querySelector('.pp-feature-dialog [role=status]')?.textContent.includes('No se ha importado ninguna nota'));
  assert.equal(await importDialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).isDisabled(),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('postispop-guest-board-v1')),beforeInvalid);
  await importDialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.locator('dialog.pp-feature-dialog').waitFor({state:'detached'});
  assert.equal(await page.getByRole('button',{name:'Restaurar una copia',exact:true}).evaluate(node=>node===document.activeElement),true,'Closing the import dialog returns keyboard focus');
  const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar imagen',exact:true}).click();
  const png=await fs.readFile(await(await pngPromise).path());assert.equal(png.subarray(1,4).toString(),'PNG');await fs.writeFile(path.join(results,'export.png'),png);
  await page.getByLabel('Opciones avanzadas',{exact:true}).click();
  assert.equal(await page.locator('.pp-board-options').getAttribute('open'),null);
  assert.equal(await page.locator('.pp-board-options .pp-tools').isVisible(),false);
  assert.equal(await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).isVisible(),true);
  assert.equal(await page.locator('.pp-board-options').evaluate(node=>Boolean(node.closest('.pp-note-search'))),true,'Advanced options stay in the compact search toolbar');
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`Root overflow at ${width}`);
    await page.screenshot({path:path.join(results,`home-${width}.png`),fullPage:true});
  }
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');
  await page.locator('.sticky-note').first().click();
  const longText='https://example.com/'+ 'palabramuylarga'.repeat(35)+'\n'+ 'Texto en su nota. '.repeat(80);
  await page.locator('textarea').fill(longText);
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.locator('.rich-paper-input textarea').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,`Editor wraps at ${width}`);
    assert.equal(await page.locator('.rich-paper-mirror').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,`Mirror wraps at ${width}`);
  }
  await page.waitForFunction(text=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text===text,longText);
  await page.reload();await page.waitForSelector('.sticky-note:not([disabled])');
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.locator('.sticky-note .note-text').first().evaluate(el=>{const text=el.getBoundingClientRect(),paper=el.closest('.sticky-note').getBoundingClientRect();return text.left>=paper.left-1&&text.right<=paper.right+1&&text.top>=paper.top-1&&text.bottom<=paper.bottom+1;}),true,`Note text stays on paper at ${width}`);
  }
  const installResponse=await page.goto('https://postispop.com/instalar.html');
  assert.equal(installResponse.status(),200,'Installation guide is present in the staged build');
  assert.equal(installResponse.headers()['x-postispop-test-source'],'staged','Installation guide comes from staged files, never production');
  assert.equal(await page.locator('h1').innerText(),'Tus ideas, también en tu dispositivo.');
  assert.equal(await page.locator('#install').isVisible(),false);
  await page.evaluate(()=>document.documentElement.dataset.colorScheme='dark');
  assert.equal(await page.locator('article').first().evaluate(el=>getComputedStyle(el).backgroundColor!==getComputedStyle(el).color),true,'Installation cards remain readable in dark mode');
  await page.evaluate(()=>document.documentElement.dataset.colorScheme='light');
  const downloadsResponse=await page.goto('https://postispop.com/descargas/');
  assert.equal(downloadsResponse.status(),200,'Downloads page is present in the staged build');
  assert.equal(downloadsResponse.headers()['x-postispop-test-source'],'staged');
  assert.equal(await page.locator('h1').innerText(),'Descargas');
  assert.equal(await page.locator('[data-platform]').count(),7);
  assert.equal(await page.getByRole('link',{name:'Ver cómo instalar',exact:true}).getAttribute('href'),'/instalar.html');
  await page.goto('https://postispop.com/tienda/');await page.waitForURL('**/atelier.html');await page.waitForSelector('.payment-options');
  for(const price of ['2,95','9,95','59,95'])assert.ok((await page.locator('.plans').innerText()).includes(price));
  assert.equal(await page.locator('.payment-options button:disabled').count(),3,'All billing choices are coming soon');
  assert.equal(await page.locator('a[href*="checkout"],a[href*="stripe"]').count(),0,'No payment destination is linked');
  for(const name of ['bloc-de-notas-online','pizarra-virtual','notas-adhesivas-online','pizarra-colaborativa','organizador-visual-de-tareas','notas-para-estudiar','pizarra-para-reuniones','lluvia-de-ideas-online']){
    await page.goto(`https://postispop.com/${name}.html`);assert.equal(await page.locator('h1').count(),1);await page.setViewportSize({width:360,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,name);
  }
  assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
  assert.equal(metricsRequests.length,0,'Rejected measurement remains silent across saves, imports and navigation');
  console.log('PASS: Spanish default, truthful save status, guest offline save and reload, first-note CTA instead of onboarding card, search/color filters, JSON and PNG export, safe non-destructive import, focus restoration, 4 viewports, installation/downloads, coming-soon Premium and 8 guides.');
  await browser.close();
})().catch(async e=>{console.error('Browser errors:',observedErrors);if(reviewPage){try{console.error('Failure state:',await reviewPage.evaluate(()=>({url:location.href,body:document.body.innerText.slice(0,2200),notes:[...document.querySelectorAll('.sticky-note')].map(n=>({id:n.dataset.noteId,disabled:n.disabled})),dialogs:[...document.querySelectorAll('[role=dialog],dialog')].map(n=>n.className)})));}catch(error){console.error('Failure state unavailable:',error.message);}try{await reviewPage.screenshot({path:path.join(results,'failure.png'),fullPage:true});}catch(error){console.error('Failure screenshot unavailable:',error.message);}}console.error(e);process.exit(1)});
