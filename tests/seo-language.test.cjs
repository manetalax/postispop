const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');

test('all eight supported language links select the matching board language',async()=>{
  const {SEO_LANGUAGES,resolveBoardLanguage}=await import('../seo-language.js');
  assert.deepEqual(SEO_LANGUAGES.map(item=>item.code),['es','en','de','fr','pt','it','ja','ko']);
  for(const {code,href} of SEO_LANGUAGES){
    assert.equal(resolveBoardLanguage('?lang='+code,'fr'),code);
    assert.equal(resolveBoardLanguage('',code),code);
    assert.equal(href,code==='es'?'/':'/'+code+'/');
  }
});

test('unsupported or injected language values cannot replace a valid preference',async()=>{
  const {resolveBoardLanguage}=await import('../seo-language.js');
  for(const value of ['ru','EN','en-US','__proto__','constructor','<script>','https://outside.test/','']){
    assert.equal(resolveBoardLanguage('?lang='+encodeURIComponent(value),'de'),'de');
    assert.equal(resolveBoardLanguage('?lang='+encodeURIComponent(value),'also-invalid'),'es');
  }
});

test('board language reads only its preference and never writes notes or cookies',async()=>{
  const {readBoardLanguage}=await import('../seo-language.js');
  const previous=global.window,reads=[];
  try{
    global.window={location:{search:'?lang=ja'},localStorage:{getItem:key=>{reads.push(key);return 'fr';},setItem:()=>assert.fail('Language selection must not write storage')}};
    assert.equal(readBoardLanguage(),'ja');
    assert.deepEqual(reads,['pp:lang']);
    global.window.localStorage.getItem=()=>{throw Error('Storage disabled');};
    assert.equal(readBoardLanguage(),'ja');
    global.window.location.search='';
    assert.equal(readBoardLanguage(),'es');
  }finally{if(previous===undefined)delete global.window;else global.window=previous;}
});

test('consuming a language entry preserves unrelated parameters, hash and history state',async()=>{
  const {consumeBoardLanguageQuery}=await import('../seo-language.js');
  const previous=global.window,calls=[],state={route:'existing'};
  try{
    global.window={location:{href:'https://postispop.com/?lang=en&action=create-note&text=Idea#board'},history:{state,replaceState:(...args)=>calls.push(args)}};
    consumeBoardLanguageQuery();
    assert.deepEqual(calls,[[state,'','/?action=create-note&text=Idea#board']]);
    for(const href of ['https://postispop.com/en/?lang=fr','https://postispop.com/?lang=invalid']){
      global.window.location.href=href;consumeBoardLanguageQuery();
    }
    assert.equal(calls.length,1,'Static language pages and unknown query values are not redirected');
  }finally{if(previous===undefined)delete global.window;else global.window=previous;}
});

test('recovered React keeps its SSR language and applies all eight choices after mounting',async()=>{
  const {transformBoardLayout}=await import('../scripts/board-layout-transform.mjs');
  const original=await fs.readFile(path.join(__dirname,'../_next/static/chunks/Board-BrRAatyY.js'),'utf8');
  const transformed=transformBoardLayout(original);
  assert.match(transformed,/\[t,n\]=\(0,u\.useState\)\(`es`\)/,'The hydration state must remain Spanish');
  assert.match(transformed,/return n\(ppBoardLanguage\(\)\),ppConsumeBoardLanguage\(\),i\(Pd\(`store-theme`,`neutral`\)\),Rt\(\)/);
  assert.ok(transformed.includes('Object.entries($u).map'));
  assert.ok(!transformed.includes('Object.entries($u).filter(([e])=>e===`es`)'));
  assert.ok(transformed.includes('Fd(`lang`,t)'),'React remains the only preference writer');
  assert.throws(()=>transformBoardLayout(original.replace('return n(`es`),i(Pd(`store-theme`,`neutral`)),Rt()','changed-language-effect')),/Board layout integration changed/);
});
