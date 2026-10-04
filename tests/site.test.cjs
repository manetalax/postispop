const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('Sitemap URLs are unique, public and point to complete Spanish documents',()=>{
 const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,urls.length);assert.equal(urls.length,21);
 for(const url of urls){assert.ok(!/\/(api|share|invite|favoritos|buscar)\//.test(url));if(url.includes('/tienda/'))continue;const pathname=new URL(url).pathname;const file=pathname==='/'?'index.html':pathname.slice(1);const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/<title>/g)||[]).length,1,file);assert.equal((html.match(/<meta name="description"/g)||[]).length,1,file);assert.equal((html.match(/<h1\b/g)||[]).length,1,file);assert.ok(html.includes('lang="es"'),file);assert.ok(html.includes(`rel="canonical" href="${url}"`),file);}
});
test('Install manifest references real PNG icons with required sizes',()=>{
 const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');
 for(const size of [192,512]){const icon=manifest.icons.find(i=>i.sizes===`${size}x${size}`);assert.ok(icon);const data=fs.readFileSync(icon.src.slice(1));assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);}
 assert.deepEqual(manifest,JSON.parse(fs.readFileSync('manifest.json','utf8')));
});
test('Static app and recovered component both include the same trusted welcome content',()=>{
 const content=fs.readFileSync('experience-content.js','utf8');const html=fs.readFileSync('index.html','utf8');for(const match of content.matchAll(/export const \w+ = `([\s\S]*?)`;/g))assert.ok(html.includes(match[1]));
 const bundle=fs.readFileSync('_next/static/chunks/Board-BrRAatyY.js','utf8');assert.ok(bundle.includes('experience-content.js'));assert.ok(bundle.includes('G.current.data?.id!==`guest-board`'));assert.ok(!html.includes('/cdn-cgi/challenge-platform/'));
});
