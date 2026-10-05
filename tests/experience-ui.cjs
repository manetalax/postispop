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
  assert.equal(await page.locator('h1').isVisible(),true,'The main heading is visible');
  assert.equal(await page.locator('.value-proposition').isVisible(),true);
  const firstPrompt=page.locator('.board-grid .note-cell:first-child .blank-note');
  await firstPrompt.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.board-grid .note-cell:first-child .blank-note')?.textContent==='CREAR NOTA 👈');
  assert.equal(await page.locator('.onboarding-card').isVisible(),false,'Guide card is replaced by the first-note CTA');
  assert.equal(await firstPrompt.innerText(),'CREAR NOTA 👈','First-note prompt is visible real text');
  for(const width of [360,390,412,768,1440]){
    await page.setViewportSize({width,height:844});
    await page.waitForFunction(()=>{const node=document.querySelector('.board-grid .note-cell:first-child .blank-note');return node&&node.clientHeight>0&&node.scrollHeight<=node.clientHeight+1&&node.scrollWidth<=node.clientWidth+1;});
    await page.locator('.sticky-note').first().click({trial:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(results,'welcome-mobile.png'),fullPage:true});
  assert.equal(metricsRequests.length,0,'Rejected analytics sends no events');
  await page.getByRole('button',{name:'Preferencias de medición',exact:true}).click();
  await page.getByRole('button',{name:'Aceptar medición',exact:true}).click();
  await page.waitForTimeout(100);
  assert.ok(metricsRequests.some(r=>r.p_event.event==='page_view'),'Consent starts measurement');
  await page.locator('.sticky-note').first().click();
  await page.locator('textarea').waitFor({state:'visible'});
  await page.reload();await page.waitForSelector('.pp-board-options');
  assert.equal(await page.locator('.onboarding-card').isVisible(),false,'Guide card stays hidden');
  assert.equal(await page.locator('.pp-learn').isVisible(),false);
  assert.equal(await page.locator('[aria-label="Promoción de estreno"]').isVisible(),false);
  assert.equal(await page.getByRole('link',{name:'? Ayuda',exact:true,includeHidden:true}).getAttribute('href'),'/ayuda.html');

  // Visit streak is automatic, idempotent today, and resets after a skipped day.
  await page.waitForSelector('.pp-streak-days .done');
  assert.equal(await page.locator('.pp-streak-days .done').count(),1);
  await page.reload();await page.waitForSelector('.pp-streak-days .done');
  assert.equal(await page.locator('.pp-streak-days .done').count(),1,'Reload must not count a second visit');
  for(const [offset,previous,expected] of [[1,2,3],[2,3,1],[1,5,1]]){
    await page.evaluate(({offset,previous})=>{const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const date=new Date(Date.parse(today+'T12:00:00Z')-offset*86400000).toISOString().slice(0,10);localStorage.setItem('pp:guest-visit-streak-v1',JSON.stringify({date,days:previous}));},{offset,previous});
    await page.reload();await page.waitForSelector('.pp-streak-days .done');
    assert.equal(await page.locator('.pp-streak-days .done').count(),expected,'Consecutive-day progression');
  }
  assert.match(await page.locator('.pp-streak-status').innerText(),/local/);
  const streakBox=await page.locator('.pp-visit-streak').boundingBox();assert.ok(streakBox.height<=64,'Streak stays compact on mobile');
  await page.locator('.sticky-note').first().click();
  await page.locator('textarea').fill('Mi nota persistente #estudio');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Mi nota persistente #estudio');
  await page.waitForTimeout(100);
  assert.ok(metricsRequests.some(r=>r.p_event.event==='note_edit'),'Successful note save records the real endpoint');
  assert.ok(!JSON.stringify(metricsRequests).includes('Mi nota persistente'),'Measurement excludes note content');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Preferencias de medición',exact:true}).click();
  await page.getByRole('button',{name:'Rechazar',exact:true}).click();
  const countAfterRejection=metricsRequests.length;
  await page.locator('.sticky-note').first().click();
  assert.equal(metricsRequests.length,countAfterRejection,'Revoking consent stops measurement');
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
  await page.waitForFunction(()=>document.querySelector('.pp-tools [role=status]')?.textContent.startsWith('1 notas'));
  assert.equal(await page.locator('.note-cell.pp-filtered').count(),(await page.locator('.sticky-note[data-note-id]').count())-1);
  await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).fill('');
  await page.waitForFunction(()=>document.querySelectorAll('.note-cell.pp-filtered').length===0);
  await page.getByRole('combobox',{name:'Filtrar por color'}).selectOption('1');
  await page.waitForFunction(()=>document.querySelectorAll('.note-cell.pp-filtered').length>0);
  await page.getByRole('combobox',{name:'Filtrar por color'}).selectOption('');
  await page.waitForFunction(()=>document.querySelectorAll('.note-cell.pp-filtered').length===0);
  await page.getByText('Opciones avanzadas',{exact:true}).click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar una copia',exact:true}).click();
  const download=await downloadPromise;const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(backup.notes[0].text,'Nota guardada sin Internet #estudio');assert.ok(!JSON.stringify(backup).includes('access_token'));
  await page.getByRole('button',{name:'Plantillas',exact:true}).click();
  await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Compras',exact:true}).click()]);await page.waitForSelector('.pp-board-options');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes.some(n=>n.text==='Alimentación\n#compras'));
  assert.match(await page.locator('.sticky-note').first().innerText(),/Nota guardada sin Internet/);
  await page.getByText('Opciones avanzadas',{exact:true}).click();
  const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar imagen',exact:true}).click();
  const png=await fs.readFile(await(await pngPromise).path());assert.equal(png.subarray(1,4).toString(),'PNG');await fs.writeFile(path.join(results,'export.png'),png);
  await page.getByText('Opciones avanzadas',{exact:true}).click();
  assert.equal(await page.locator('.pp-board-options').getAttribute('open'),null);
  assert.equal(await page.locator('.pp-board-options .pp-tools').isVisible(),false);
  assert.equal(await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).isVisible(),true);
  assert.equal(await page.locator('.board-frame').evaluate(board=>Boolean(board.compareDocumentPosition(document.querySelector('.pp-board-options'))&Node.DOCUMENT_POSITION_FOLLOWING)),true,'Advanced options follow the board alongside the new vault toolbar');
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
  await page.goto('https://postispop.com/tienda/');assert.equal(await page.locator('[data-product-card]').count(),4);
  for(const name of ['bloc-de-notas-online','pizarra-virtual','notas-adhesivas-online','pizarra-colaborativa','organizador-visual-de-tareas','notas-para-estudiar','pizarra-para-reuniones','lluvia-de-ideas-online']){
    await page.goto(`https://postispop.com/${name}.html`);assert.equal(await page.locator('h1').count(),1);await page.setViewportSize({width:360,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,name);
  }
  await page.goto('https://postispop.com/premios.html');
  await page.getByRole('button',{name:'Iniciar sesión para girar gratis',exact:true}).waitFor();
  assert.equal(await page.locator('#at-roulette-spin').isEnabled(),true,'Guest must have an actionable sign-in button');
  assert.match(await page.locator('#at-roulette-status').innerText(),/horario de Madrid/);
  assert.equal(await page.locator('#at-roulette-spin').getAttribute('data-action'),'login','Sign-in must never consume a spin');
  assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
  console.log('PASS: Spanish default, truthful save status, guest offline save and reload, first-note CTA instead of onboarding card, search, JSON export, non-destructive templates, 4 viewports, installation and downloads pages, shop and 8 guides.');
  await browser.close();
})().catch(async e=>{console.error('Browser errors:',observedErrors);if(reviewPage){try{console.error('Failure state:',await reviewPage.evaluate(()=>({url:location.href,body:document.body.innerText.slice(0,2200),notes:[...document.querySelectorAll('.sticky-note')].map(n=>({id:n.dataset.noteId,disabled:n.disabled})),dialogs:[...document.querySelectorAll('[role=dialog],dialog')].map(n=>n.className)})));}catch(error){console.error('Failure state unavailable:',error.message);}try{await reviewPage.screenshot({path:path.join(results,'failure.png'),fullPage:true});}catch(error){console.error('Failure screenshot unavailable:',error.message);}}console.error(e);process.exit(1)});
