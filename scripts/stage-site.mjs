import { mkdir,cp,readFile,writeFile,rm,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const out='_site';await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// Explicit allowlist: never ship API snapshots, source, tests, credentials or dependencies.
for(const file of ['index.html','manifest.json','manifest.webmanifest','robots.txt','CNAME','favicon.svg','favicon.ico','privacy.html','terms.html','legal.html','cookies.html','postispop-shop.js','commerce-ui.js','commerce.css','supabase-bridge.js','supabase-config.js','guest-board.js','guest-status.js','note-attachments.js','note-attachments.css'])await cp(file,`${out}/${file}`);
for(const dir of ['assets','_next','app','.well-known'])await cp(dir,`${out}/${dir}`,{recursive:true,filter:source=>!source.endsWith('Board-BrRAatyY.js')});
await cp('astro-dist',`${out}/tienda`,{recursive:true});
for(const entry of await readdir('content-dist'))if(entry!=='landing-fragment.html')await cp(`content-dist/${entry}`,`${out}/${entry}`,{recursive:true});
let html=await readFile(`${out}/index.html`,'utf8');
const landing=await readFile('content-dist/landing-fragment.html','utf8');
// Keep the recovered React server-component document and static HTML identical.
// Otherwise React replaces the server HTML during hydration and loses SEO content.
html=html.replace(/\.rsc\.push\(("(?:\\.|[^"\\])*")\)/g,(match,encoded)=>{
  const record=JSON.parse(encoded);
  if(!record.startsWith('2:'))return match;
  const tree=JSON.parse(record.slice(2));
  const walk=node=>{if(!Array.isArray(node))return;if(node[0]==='$'&&node[1]==='body')node[3].children.push(['$','div',null,{id:'pp-landing-wrapper',dangerouslySetInnerHTML:{__html:landing}}]);else for(const value of node){if(Array.isArray(value))walk(value);else if(value&&typeof value==='object'&&value.children)walk(value.children);}};
  walk(tree);return '.rsc.push('+JSON.stringify('2:'+JSON.stringify(tree)+'\n').replace(/</g,'\\u003c')+')';
});
html=html.replace('<script type="module" src="./_next/static/chunks/index-BsCJoNXv.js" id="_R_">','<div id="pp-landing-wrapper">'+landing+'</div><script type="module" src="./_next/static/chunks/index-BsCJoNXv.js" id="_R_">');
await writeFile(`${out}/index.html`,html);await writeFile(`${out}/.nojekyll`,'');
// Cache only explicit public application files. Never cache /api, Supabase, shared pages or query URLs.
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]))).flat();
const files=['/',...await walk(`${out}/app`),...await walk(`${out}/_next`),'/supabase-bridge.js?v=5','/guest-board.js','/commerce-ui.js?v=2','/commerce.css?v=2','/guest-status.js?v=2','/note-attachments.js?v=1','/note-attachments.css?v=1','/assets/postispop-logo.png','/assets/board-scene.webp','/assets/stationery-sprites.webp','/assets/pen.woff','/assets/quotes/es.json'].map(f=>f.startsWith(out)?f.slice(out.length):f);
const hash=createHash('sha256');for(const file of await walk(out)){hash.update(file.replace(out,''));hash.update(await readFile(file));}const version=hash.digest('hex').slice(0,12);
const sw=(await readFile('sw-template.js','utf8')).replace('__CACHE_VERSION__',version).replace('__PRECACHE__',JSON.stringify(files));await writeFile(`${out}/sw.js`,sw);
console.log(`Staged app, shop and public pages; SW ${version}; no captured API data.`);
