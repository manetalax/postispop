const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'../android/app/src/main/assets/www');
 const b=await chromium.launch({headless:true,executablePath:process.env.POSTISPOP_CHROME,args:['--no-sandbox']});
 const c=await b.newContext({locale:'es-ES',viewport:{width:412,height:850}});const p=await c.newPage();
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await c.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.hostname!=='postispop.com') return route.abort('internetdisconnected');
  let name=decodeURIComponent(u.pathname);if(name.endsWith('/'))name+='index.html';
  const file=path.join(root,name);const ext=path.extname(file);
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif'};
  try {await route.fulfill({status:200,contentType:types[ext]||'application/octet-stream',body:await fs.readFile(file)});}catch{await route.fulfill({status:404,body:'not bundled'});}
 });
 await p.goto('https://postispop.com/');
 await p.waitForSelector('.sticky-note:not([disabled])',{timeout:30000});
 console.log('Local UI ready:',await p.locator('.sticky-note').count(),'notes');
 await p.locator('.sticky-note').first().click();
 await p.locator('textarea').fill('Nota Android local sin Internet');
 await p.waitForFunction(()=>JSON.parse(localStorage.getItem('postispop-guest-board-v1'))?.notes[0]?.text==='Nota Android local sin Internet');
 await p.reload();
 await p.waitForSelector('.sticky-note:not([disabled])');
 if (!(await p.locator('.sticky-note').first().innerText()).includes('Nota Android local sin Internet')) throw Error('Local note lost on reload');
 await p.goto('https://postispop.com/tienda/');
 await p.waitForSelector('[data-product-card]');
 if(await p.locator('[data-product-card]').count()!==4)throw Error('Missing bundled products');
 await p.goto('https://postispop.com/tienda/buscar/');
 await p.locator('#site-search').fill('reloj');
 await p.locator('button[type=submit]').click();
 await p.waitForFunction(()=>document.querySelector('[data-search-status]')?.textContent.includes('resultado'),null,{timeout:10000});
 console.log('PASS: bundled UI startup, offline guest edit/reload, four local products and offline search');
 if(errors.length)throw Error(errors.join('\n'));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
