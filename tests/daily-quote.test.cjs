const {test}=require('node:test'),assert=require('node:assert/strict');
test('Quote uses 6, then 12, returns to empty 6 and never overwrites a filled note',async()=>{
 const {quoteLocation}=await import('../daily-quote-model.js');const n=Array(12).fill(false);
 assert.equal(quoteLocation(n,null),6);n[5]=true;assert.equal(quoteLocation(n,null),12);n[11]=true;assert.equal(quoteLocation(n,null),null);n[5]=false;assert.equal(quoteLocation(n,null),6);
 n.fill(true);assert.equal(quoteLocation(n,null),'ask');assert.equal(quoteLocation(n,'declined'),null);assert.equal(quoteLocation(n,'banner'),'banner');n.fill(false);assert.equal(quoteLocation(n,'banner'),'banner');
});
test('Recovered editor integration preserves a quote as an unsaved draft until actual input',async()=>{
 const fs=require('node:fs/promises'),{transformBoardLayout}=await import('../scripts/board-layout-transform.mjs');
 const source=await fs.readFile('_next/static/chunks/Board-BrRAatyY.js','utf8');const result=transformBoardLayout(source);
 assert.doesNotMatch(result,/xn.indexOf\(e\)===11&&hd/);assert.match(result,/ppQuoteDraft/);assert.match(result,/data-pp-slot/);assert.throws(()=>transformBoardLayout('changed'),/changed/);
});

test('Quote follows active slots when papers are removed',async()=>{const {quoteLocation}=await import('../daily-quote-model.js');assert.equal(quoteLocation(Array(5).fill(false),null),null);assert.equal(quoteLocation(Array(6).fill(false),null),6);assert.equal(quoteLocation(Array(11).fill(false),null),6);assert.equal(quoteLocation(Array(11).fill(true),null),null);});
