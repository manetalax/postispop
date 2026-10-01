const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');const path=require('node:path');
let reviewPage;
const results=path.resolve(__dirname,'../test-results');
(async()=>{
  const root=path.resolve(__dirname,'../_site');
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({locale:'pt-BR',viewport:{width:390,height:844},acceptDownloads:true});
  const errors=[],missing=[];
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='postispop.com')return route.abort('internetdisconnected');
    let name=decodeURIComponent(url.pathname);if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return route.abort();
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.woff':'font/woff'};
    try{await route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:await fs.readFile(file)});}catch{missing.push(name);await route.fulfill({status:404,body:'Missing staged asset'});}
  });
  const page=reviewPage=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await fs.mkdir(results,{recursive:true});
  await page.goto('https://postispop.com/');await page.waitForSelector('.sticky-note:not([disabled])');await page.waitForSelector('.pp-tools');
  assert.equal(await page.locator('html').getAttribute('lang'),'es');
  assert.equal(await page.locator('h1').count(),1);
  assert.match(await page.title(),/Bloc de notas online gratis/);
  assert.match(await page.locator('.connection').innerText(),/dispositivo/);
  await page.getByRole('button',{name:'Probar sin registro',exact:true}).click();
  await page.locator('textarea').fill('Mi nota persistente #estudio');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Mi nota persistente #estudio');
  // A real offline flag used to prevent guest saves in the recovered component.
  await context.setOffline(true);
  await page.locator('textarea').fill('Nota guardada sin Internet #estudio');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Nota guardada sin Internet #estudio');
  await context.setOffline(false);await page.reload();await page.waitForSelector('.pp-tools');
  assert.match(await page.locator('.sticky-note').first().innerText(),/Nota guardada sin Internet/);
  assert.equal(await page.locator('.onboarding-card').count(),0);
  await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).fill('#estudio');
  await page.waitForFunction(()=>document.querySelector('.pp-tools [role=status]')?.textContent.startsWith('1 notas'));
  assert.equal(await page.locator('.note-cell.pp-filtered').count(),11);
  await page.getByRole('searchbox',{name:'Buscar notas o etiquetas'}).fill('');
  await page.waitForFunction(()=>document.querySelectorAll('.note-cell.pp-filtered').length===0);
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Copia JSON',exact:true}).click();
  const download=await downloadPromise;const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(backup.notes[0].text,'Nota guardada sin Internet #estudio');assert.ok(!JSON.stringify(backup).includes('access_token'));
  await page.getByRole('button',{name:'Plantillas',exact:true}).click();
  await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Compras',exact:true}).click()]);await page.waitForSelector('.pp-tools');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes.some(n=>n.text==='Alimentación\n#compras'));
  assert.match(await page.locator('.sticky-note').first().innerText(),/Nota guardada sin Internet/);
  const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'PNG',exact:true}).click();
  const png=await fs.readFile(await(await pngPromise).path());assert.equal(png.subarray(1,4).toString(),'PNG');await fs.writeFile(path.join(results,'export.png'),png);
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`Root overflow at ${width}`);
    await page.screenshot({path:path.join(root,`../test-results/home-${width}.png`),fullPage:true});
  }
  await page.goto('https://postispop.com/tienda/');assert.equal(await page.locator('[data-product-card]').count(),4);
  for(const name of ['bloc-de-notas-online','pizarra-virtual','notas-adhesivas-online','pizarra-colaborativa','organizador-visual-de-tareas','notas-para-estudiar','pizarra-para-reuniones','lluvia-de-ideas-online']){
    await page.goto(`https://postispop.com/${name}.html`);assert.equal(await page.locator('h1').count(),1);await page.setViewportSize({width:360,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,name);
  }
  assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
  console.log('PASS: Spanish default, truthful save status, guest offline save and reload, onboarding dismissal, search, JSON export, non-destructive templates, 4 viewports, shop and 8 guides.');
  await browser.close();
})().catch(async e=>{if(reviewPage)await reviewPage.screenshot({path:path.join(results,'failure.png'),fullPage:true}).catch(()=>{});console.error(e);process.exit(1)});
