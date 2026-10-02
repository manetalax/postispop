const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {gzipSync}=require('node:zlib');

test('Quote optimization preserves all 8,000 original quotes and rewrites initial references',async()=>{
  const {extractQuotes,optimizeQuotes}=await import('../scripts/optimize-quotes.mjs');
  const source=await fs.readFile('_next/static/chunks/Board-BrRAatyY.js','utf8');
  const original=extractQuotes(source).languages;
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'postispop-quotes-'));
  try{
    const output=pathToFileURL(directory+'/');
    await fs.mkdir(new URL('_next/static/chunks/',output),{recursive:true});
    await fs.writeFile(new URL('_next/static/chunks/Board-BrRAatyY.js',output),source);
    await fs.writeFile(new URL('index.html',output),'<link rel="modulepreload" href="/_next/static/chunks/Board-BrRAatyY.js">');
    await fs.writeFile(new URL('_next/static/chunks/index-BsCJoNXv.js',output),'import "./Board-BrRAatyY.js";');
    const sizes=await optimizeQuotes(output);
    assert.equal(sizes.languages,8);
    assert.ok(sizes.after<sizes.before*0.15,'Initial editor chunk should lose the eager quote catalogs');
    const names=await fs.readdir(new URL('assets/quotes/',output));
    assert.equal(names.length,8);
    for(const name of names){
      const code=await fs.readFile(new URL('assets/quotes/'+name,output),'utf8');
      const data=JSON.parse(code.slice(code.indexOf('export default ')+15).trim().replace(/;$/,''));
      assert.equal(JSON.stringify(data),JSON.stringify(original[name.split('.')[0]]));
    }
    const html=await fs.readFile(new URL('index.html',output),'utf8');
    assert.match(html,/_next\/static\/chunks-quotes-[a-f0-9]{12}\//);
    assert.doesNotMatch(html,/_next\/static\/chunks\//);
    const entry=await fs.readFile(new URL(sizes.directory+'index-BsCJoNXv.js',output),'utf8');
    assert.equal(entry,'import "./Board-BrRAatyY.js";');
    assert.equal(await fs.readFile(new URL('_next/static/chunks/Board-BrRAatyY.js',output),'utf8'),source,'Previously cached graph remains intact');
    const optimized=await fs.readFile(new URL(sizes.directory+'Board-BrRAatyY.js',output),'utf8');
    const {spawnSync}=require('node:child_process');
    assert.equal(spawnSync(process.execPath,['--check','--input-type=module'],{input:optimized,encoding:'utf8'}).status,0,'Generated editor module parses');
    assert.ok(gzipSync(optimized).length<gzipSync(source).length*0.2);
  }finally{await fs.rm(directory,{recursive:true,force:true});}
});

test('Quote optimizer refuses unexpected recovered component versions',async()=>{
  const {extractQuotes,transformQuotes}=await import('../scripts/optimize-quotes.mjs');
  assert.throws(()=>extractQuotes(''),/changed/);
  const source=await fs.readFile('_next/static/chunks/Board-BrRAatyY.js','utf8');
  assert.throws(()=>transformQuotes(source.replace('pd.languages[e][t]','pd.languages.other'),{}),/component changed/);
});

test('Legal documents keep their complete static content and native navigation',async()=>{
  const {repairLegalPage}=await import('../scripts/repair-static-pages.mjs');
  for(const name of ['privacy','terms','legal','cookies']){
    const original=await fs.readFile(name+'.html','utf8');
    const repaired=repairLegalPage(original);
    const content=html=>[...html.matchAll(/<(?:h[1-6]|p)\b[^>]*>[\s\S]*?<\/(?:h[1-6]|p)>/g)].map(m=>m[0].replace(/<[^>]*>/g,''));
    assert.deepEqual(content(repaired),content(original));
    assert.doesNotMatch(repaired,/<script\b(?![^>]*application\/ld\+json)/i);
    assert.doesNotMatch(repaired,/rel=["']modulepreload/);
    assert.match(repaired,/href="\/"/);
    assert.match(repaired,/href="\/privacy\.html"/);
  }
});
