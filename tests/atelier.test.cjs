const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
let catalog;
test.before(async()=>{catalog=await import('../design-catalog.js');});
test('catalog preserves the original reward promise and country IDs while adding professions',()=>{
  const {designs,thematicDesigns,countryDesigns,professionDesigns}=catalog;
  assert.equal(thematicDesigns.length,100);
  assert.equal(thematicDesigns.filter(d=>d.tier==='reward').length,50);
  assert.equal(thematicDesigns.filter(d=>d.tier==='premium').length,50);
  assert.equal(countryDesigns.length,195);
  assert.equal(professionDesigns.length,3);
  assert.equal(new Set(designs.map(d=>d.id)).size,298);
  for(const d of countryDesigns){assert.ok(['foundation','crafted'].includes(d.edition));assert.ok(fs.existsSync(new URL(`../assets/flags/${d.code.toLowerCase()}.svg`,`file://${__filename}`)));}
});
test('crafted previews and application backgrounds share paper art without sample notes on the board',()=>{
  const {designs,boardSvg,paperSvg,designTemplates}=catalog;
  for(const id of ['theme-046','theme-049','theme-060','theme-066','profession-firefighters','profession-police','profession-students']){
    const d=designs.find(d=>d.id===id),background=boardSvg(d),preview=boardSvg(d,{preview:true});
    assert.ok(d.edition==='crafted'&&d.art);
    assert.equal(designTemplates(d).length,6);
    assert.ok(!background.includes('filter="url(#paper-shadow)"'),'Background must not contain dummy notes');
    assert.equal(preview.match(/data-preview-note=/g).length,12);
    assert.equal(d.paper,'plain','Templates default to plain editable sticky notes');
    assert.match(preview,/url\(#paper\)/);
    assert.ok(!/https?:\/\/(?!www.w3.org)/.test(background),'Artwork must be local');
  }
});
test('new professions have useful templates and catalogue references resolve',()=>{
  const {designs,papers,packs,designTemplates}=catalog;
  for(const d of designs)assert.ok(papers.some(p=>p.id===d.paper),d.id+' has an available paper');
  for(const pack of packs){assert.ok(pack.designIds.length);for(const id of pack.designIds)assert.ok(designs.some(d=>d.id===id),id);}
  for(const id of ['profession-firefighters','profession-police'])assert.ok(designTemplates(designs.find(d=>d.id===id)).some(t=>/turno|guardia|relevo/i.test(t.title+' '+t.body)));
  assert.match(catalog.paperSvg('prescription'),/NO ES UNA RECETA MÉDICA/);
  assert.match(catalog.paperSvg('shift'),/MI CUADRANTE/);
});
test('every country embeds its real flag and declares its current cultural edition',async()=>{
  const {countryFlags}=await import('../assets/designs/country-flags.js');
  assert.equal(Object.keys(countryFlags).length,195);
  for(const d of catalog.countryDesigns){
    assert.ok(catalog.boardSvg(d,{preview:true}).includes(catalog.svgUrl(countryFlags[d.code]).replaceAll("'",'&apos;')));
    assert.match(catalog.boardSvg(d),d.edition==='crafted'?/EDICIÓN CULTURAL/:/EDICIÓN EN DESARROLLO/);
    if(d.edition==='crafted'){assert.ok(d.illustratedLandmark&&d.illustratedFood);assert.ok(d.landmark.verified&&d.food.verified);}
  }
});
test('store has no invented pricing or new payment endpoint',()=>{
  const source=fs.readFileSync(new URL('../atelier.js',`file://${__filename}`),'utf8');
  assert.ok(!/checkout|stripe|paypal|create-payment/.test(source));
  assert.ok(source.includes('drawStrokes'),'Pen samples reuse the editor drawing engine');
  assert.ok(source.includes('rights?.owner'),'Owner-only link is driven by server rights');
  assert.ok(source.includes("action.disabled = signedIn"),'No purchase is faked');
});

test('all 100 initial themes have their own developed compositions and six practical note templates',()=>{
  for(const design of catalog.thematicDesigns){
    assert.equal(design.edition,'crafted',design.id);
    assert.ok(design.art||design.composition,design.id+' has a drawing composition');
    assert.equal(design.noteTemplates?.length,6,design.id+' has its own six notes');
    for(const note of design.noteTemplates){assert.ok(note.title.trim());assert.ok(note.body.split('\n').length>=2);}
    assert.ok(!catalog.boardSvg(design).includes('undefined'));
  }
});
