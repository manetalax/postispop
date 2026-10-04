const test=require('node:test'),assert=require('node:assert/strict');
let c;test.before(async()=>{c=await import('../design-catalog.js');});
test('all 298 collections use one approved twelve-note pattern with individual cultural artwork',()=>{
 const images=new Set(),positions=new Set();
 assert.equal(c.designs.length,298);
 for(const d of c.designs){
  const preview=c.boardSvg(d,{preview:true});images.add(preview);
  assert.equal(d.visualPattern,'arcade-cultural-v1');assert.equal(d.background,'#101023');
  assert.equal(preview.match(/data-preview-note=/g)?.length,12,d.id);
  positions.add([...preview.matchAll(/data-preview-note="\d+" transform="([^"]+)"/g)].map(m=>m[1]).join('|'));
  assert.match(preview,/width="420" height="760"/);assert.doesNotMatch(preview,/undefined|NaN|<script|onload=/);
  assert.doesNotMatch(c.boardSvg(d),/data-preview-note=/,'Live background must never contain fake notes');
  assert.match(c.frameOrnament(d),/viewBox="0 0 390 52"/);assert.match(c.frameOrnament(d,'bottom'),/marco inferior/);
  if(d.code)assert.match(preview,/data:image\/svg\+xml/,'Country selector embeds a real local flag');
 }
 assert.equal(images.size,298);assert.equal(positions.size,1,'All template note spacing is identical');
});
test('named approved themes have legible selector names and local badges',()=>{
 for(const [id,name]of [['country-es','España'],['country-fr','Francia'],['profession-firefighters','Bomberos'],['theme-050','Ejército'],['theme-093','Navidad'],['theme-059','K-pop']]){
  const d=c.designs.find(d=>d.id===id);assert.equal(c.selectorTitle(d),name);assert.match(c.designBadge(d),/^data:image\/svg\+xml/);
 }
});
