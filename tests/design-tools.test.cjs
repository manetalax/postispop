const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const model=import('../style-model.js');

test('Sketch data rejects malformed coordinates, oversized payloads and active CSS values',async()=>{
  const {normalizeStyle}=await model;
  const drawing={version:1,selectedInstrument:'brush',strokes:[{instrument:'brush',color:'#26548a',width:9,points:[{x:.2,y:.3,p:.4},{x:.8,y:.7,p:.9}]}]};
  const result=normalizeStyle({drawing,ink:'#ABCDEF'});drawing.strokes[0].points[0].x=.9;
  assert.equal(result.drawing.strokes[0].points[0].x,.2);assert.equal(result.ink,'#abcdef');
  for(const bad of [{font:'serif;display:none'},{paper:'url(https://example.com)'},{italic:'false'},{size:NaN},{ink:'currentColor'},{drawing:{version:1,selectedInstrument:'ballpoint',strokes:Array(121).fill(result.drawing.strokes[0])}}])assert.throws(()=>normalizeStyle(bad),/INVALID_STYLE/);
  for(const p of [{x:-.1,y:.2,p:.4},{x:.1,y:1.01,p:.4},{x:.1,y:.2,p:2},{x:.1,y:.2,p:null}])assert.throws(()=>normalizeStyle({drawing:{version:1,selectedInstrument:'brush',strokes:[{...result.drawing.strokes[0],points:[p]}]}}),/INVALID_STYLE/);
});

test('All instruments produce distinct drawing records; brush width reacts to stylus pressure',async()=>{
  const {drawStrokes,PEN_IDS}=await model;
  function render(instrument,pressure=.5){const records=[],ctx={lineWidth:1,globalAlpha:1,lineCap:'round',save(){},restore(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},arc(){records.push(['grain',...arguments,this.globalAlpha])},fill(){},fillRect(){records.push([...arguments,this.fillStyle])},setLineDash(v){records.push(v)},stroke(){records.push([this.lineWidth,this.globalAlpha,this.lineCap,this.strokeStyle])}};
    const widths={graphite:2,ballpoint:2,roller:3,gel:4,fountain:5,fineliner:1,brush:9,marker:14,crayon:8,chalk:6,charcoal:10,stamp:12,toothpaste:18,spray:16,airbrush:24,nailpolish:12,brow:5,mascara:9,eyeliner:3,lipstick:14,eyeshadow:18,correction_tape:14,correction_fluid:10,paintbrush:20,roller_paint:28,sponge:22,watercolor:18,blood:7};
    drawStrokes(ctx,{strokes:[{instrument,color:'#222222',width:widths[instrument],points:[{x:.1,y:.2,p:pressure},{x:.8,y:.9,p:pressure}]}]},640,400);return records;}
  assert.equal(new Set(PEN_IDS.map(id=>JSON.stringify(render(id)))).size,PEN_IDS.length);
  assert.notDeepEqual(render('brush',.1),render('brush',.9));
});

test('Six typefaces ship as local font files with their redistribution notices',()=>{
  const css=fs.readFileSync('fonts.css','utf8'),paths=[...css.matchAll(/url\('\.\/(assets\/fonts\/[^']+)'\)/g)].map(m=>m[1]);assert.equal(paths.length,6);
  for(const file of paths)assert.ok(fs.statSync(file).size>10000,file);
  for(const name of ['DejaVu-LICENSE.txt','caveat-OFL.txt','nunito-OFL.txt','lora-OFL.txt'])assert.ok(fs.readFileSync('assets/fonts/'+name,'utf8').includes('License')||fs.readFileSync('assets/fonts/'+name,'utf8').includes('LICENSE'));
  assert.ok(!css.includes('https://'));
});

test('Stroke eraser hits sparse segments and single points, scales with the canvas and chooses the top stroke',async()=>{
  const {strokeAt}=await import('../design-tools.js');
  const line={instrument:'ballpoint',color:'#163b62',width:2,points:[{x:.1,y:.5,p:.5},{x:.9,y:.5,p:.5}]};
  const point={instrument:'brush',color:'#163b62',width:9,points:[{x:.5,y:.2,p:.5}]};
  const strokes=[line,point];
  const before=JSON.stringify(strokes);
  assert.equal(strokeAt(strokes,{x:.5,y:.5}),0,'a sparse segment is erasable between its samples');
  assert.equal(strokeAt(strokes,{x:.5,y:.2}),1,'a one-point mark is erasable');
  assert.equal(strokeAt(strokes,{x:.5,y:.9}),-1,'unrelated strokes are left alone');
  assert.equal(strokeAt([line,line],{x:.5,y:.5}),1,'erase the newest stroke first');
  assert.equal(strokeAt(strokes,{x:.5,y:.5},280,175),0,'phone geometry uses the same normalized data');
  assert.equal(JSON.stringify(strokes),before,'hit testing never mutates saved geometry');
});

test('Inside-note toolbar defaults to writing; drawing, erasing, undo, redo and background saves survive reopening',{timeout:30000},async()=>{
  const {chromium}=require('playwright');
  const {browserOptions}=require('./browser-options.cjs');
  const path=require('node:path');
  const browser=await chromium.launch(browserOptions());
  const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  page.setDefaultTimeout(5000);
  const errors=[],requested=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requested.push(new URL(request.url()).pathname));
  const fixture=`<!doctype html><html lang="es" data-pp-ready="true"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/design-tools.css"><style>*{box-sizing:border-box}body{margin:0;padding:14px}.edit-paper{position:relative;padding:10px;background:#ffe991}.rich-paper-input textarea{width:100%;min-height:200px}.board-frame{height:40px}.editor-dialog{width:100%}</style></head><body><div class="board-frame"><button class="sticky-note" data-note-id="guest-note-0">Nota</button></div><div class="editor-dialog" role="dialog"><div class="dialog-heading">Nota 1</div><div class="edit-paper"><div class="rich-paper-input"><textarea aria-label="Nota"></textarea></div><section class="capture-editor"><div class="capture-actions"><button>Añadir foto</button></div></section><div class="note-customization"><button>Color de la nota</button></div><div class="pen-tray"><button>Dictar</button></div><div class="editor-actions"><button aria-label="Eliminar">Eliminar</button></div><section class="pp-attachments">Archivos adjuntos</section></div></div><script type="module">import{guestRequest}from'/guest-board.js';window.fetch=async(path,init)=>{if(window.failStyleSave)return new Response(JSON.stringify({error:'CONFLICT'}),{status:409});return new Response(JSON.stringify(guestRequest(path.replace('/api/',''),init.method,init.body?JSON.parse(init.body):undefined)),{headers:{'Content-Type':'application/json'}})};await import('/design-tools.js');</script></body></html>`;
  await page.route('https://editor.test/**',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/')return route.fulfill({body:fixture,contentType:'text/html'});
    const file=path.resolve(process.cwd(),'.'+url.pathname);
    if(!file.startsWith(process.cwd()+path.sep))return route.abort();
    try{return route.fulfill({body:fs.readFileSync(file),contentType:({'.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:''});}
  });
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.style);
  const flush=()=>page.evaluate(async()=>{const waits=[];window.dispatchEvent(new CustomEvent('postispop:editor-flush',{detail:{waits}}));return Promise.all(waits);});
  try{
    await page.goto('https://editor.test/');await page.waitForSelector('.pp-design-tools');
    assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'text');
    assert.equal(await page.getByRole('button',{name:'Escribir',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.pp-note-drawing').isVisible(),false);
    assert.equal(await page.locator('a[href*="atelier"],.pp-template-selector').count(),0);
    for(const selector of ['.note-customization','.pen-tray','.pp-attachments','.capture-actions'])assert.equal(await page.locator(selector).isVisible(),false,selector+' is secondary by default');
    await page.getByRole('button',{name:'Más opciones de la nota',exact:true}).click();
    for(const selector of ['.note-customization','.pen-tray','.pp-attachments','.capture-actions'])assert.equal(await page.locator(selector).isVisible(),true,selector+' remains accessible');
    await page.getByRole('button',{name:'Más opciones de la nota',exact:true}).click();
    await page.getByRole('button',{name:'Lápiz',exact:true}).click();
    const canvas=page.locator('.pp-drawing-canvas'),box=await canvas.boundingBox();
    await page.mouse.move(box.x+box.width*.2,box.y+box.height*.5);await page.mouse.down();
    await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5,{steps:8});await page.mouse.up();
    assert.deepEqual(await flush(),[true]);
    assert.equal((await stored()).drawing.strokes.length,1);
    assert.equal((await stored()).drawing.strokes[0].instrument,'graphite');
    await page.getByRole('button',{name:'Borrar trazos',exact:true}).click();
    await canvas.click({position:{x:box.width*.5,y:box.height*.5}});await flush();
    assert.equal((await stored()).drawing.strokes.length,0);
    await page.getByRole('button',{name:'Deshacer trazo',exact:true}).click();await flush();
    assert.equal((await stored()).drawing.strokes.length,1);
    await page.getByRole('button',{name:'Rehacer trazo',exact:true}).click();await flush();
    assert.equal((await stored()).drawing.strokes.length,0);
    await page.getByRole('button',{name:'Deshacer trazo',exact:true}).click();
    await page.evaluate(()=>window.dispatchEvent(new Event('postispop:native-background')));
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).notes[0].style.drawing.strokes.length===1);
    await page.getByRole('button',{name:'Escribir',exact:true}).click();
    assert.equal(await page.locator('textarea').evaluate(node=>node===document.activeElement),true);
    await page.locator('.pp-editor-options>summary').click();await page.getByRole('button',{name:'Cursiva',exact:true}).click();await flush();
    assert.equal((await stored()).italic,true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.reload();await page.waitForSelector('.pp-design-tools');
    assert.equal(await page.locator('.edit-paper').getAttribute('data-pp-edit-mode'),'text');
    assert.equal(await canvas.isVisible(),true,'saved drawing is visible as a compact preview in writing mode');
    assert.equal((await stored()).drawing.strokes.length,1);
    await page.evaluate(()=>{window.failStyleSave=true;});
    await page.locator('.pp-editor-options>summary').click();await page.getByRole('button',{name:'Subrayado',exact:true}).click();
    assert.deepEqual(await flush(),[false],'failed persistence blocks coordinated close');
    assert.equal(await page.locator('.pp-style-status').getAttribute('data-state'),'error');
    assert.equal((await stored()).underline,false,'rejected save does not claim to be persisted');
    await page.evaluate(()=>{window.failStyleSave=false;});await page.getByRole('button',{name:'Reintentar guardar',exact:true}).click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1')).notes[0].style.underline===true);
    assert.deepEqual(errors,[]);
    assert.ok(requested.includes('/editor-catalog.js'));
    assert.deepEqual(requested.filter(name=>/design-catalog|country-|theme-profiles|arcade-pattern/.test(name)),[],'opening an editor must not load the decorative catalog or country assets');
  }finally{await browser.close();}
});


test('Lightweight editor catalog supports every saved paper and instrument without importing storefront artwork',async()=>{
  const {fonts,instruments,papers,paperSvg}=await import('../editor-catalog.js');
  const {FONT_IDS,PEN_IDS,PAPER_IDS}=await model;
  assert.deepEqual(fonts.map(item=>item.id),FONT_IDS);
  assert.deepEqual(instruments.map(item=>item.id),PEN_IDS);
  assert.deepEqual(papers.map(item=>item.id),PAPER_IDS);
  for(const paper of papers){
    const svg=paperSvg(paper.id);
    assert.match(svg,/^<svg/);
    assert.ok(!svg.includes('undefined'),paper.id);
    assert.ok(!/<(?:image|script|foreignObject)\b/.test(svg),paper.id+' stays self contained');
  }
  assert.ok(fs.statSync('editor-catalog.js').size<10000,'core stationery stays below 10 KB');
});
