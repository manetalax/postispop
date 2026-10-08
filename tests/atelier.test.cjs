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
test('public offer explains the trial and exposes all four Stripe-backed Premium choices',()=>{
  const html=fs.readFileSync(new URL('../atelier.html',`file://${__filename}`),'utf8');
  assert.match(html,/Empieza con 6 notas/);
  assert.match(html,/30 días para usar todas las notas/);
  assert.match(html,/bloqueadas durante 30 días y luego se eliminan/);
  for(const amount of ['2,95','5,95','19,95','59,95']) assert.ok(html.includes(amount));
  assert.deepEqual([...html.matchAll(/data-buy="(premium-[^"]+)"/g)].map(m=>m[1]),['premium-monthly','premium-quarterly','premium-yearly','premium-lifetime']);
  assert.equal((html.match(/data-buy=/g)||[]).length,4);
  assert.ok(html.includes('atelier-checkout.js'));
  assert.ok(!/at-grid|at-cart|at-roulette/.test(html));
  assert.ok(!/\b0,95\b|\b9,95\b/.test(html));
});

test('legacy commerce URLs retire their offers without breaking inbound links',()=>{
  const redirect=fs.readFileSync('src/layouts/Layout.astro','utf8');
  assert.match(redirect,/noindex, follow/);
  assert.match(redirect,/http-equiv="refresh"/);
  assert.match(redirect,/href=\{destination\}/);
  assert.ok(!/schema.org\/InStock|checkoutUrl|wishlist/.test(redirect));
  const rewards=fs.readFileSync('premios.html','utf8');
  assert.match(rewards,/noindex, follow/);
  assert.match(rewards,/content="0; url=\/"/);
  assert.ok(!/roulette|ruleta|premio|<button|<script/.test(rewards));
});

test('current product rules configure the trial, protected retention and one Premium entitlement',()=>{
  const rules=JSON.parse(fs.readFileSync('product-rules.json','utf8'));
  assert.equal(rules.notes.free_limit,6);
  assert.equal(rules.notes.free_trial_days,30);
  assert.equal(rules.notes.free_trial_note_limit,null);
  assert.equal(rules.notes.free_notes_expire,true);
  assert.equal(rules.billing.checkout_enabled,true);
  assert.equal(rules.billing.legacy_entitlements_preserved,true);
  assert.deepEqual([rules.billing.monthly_cents,rules.billing.quarterly_cents,rules.billing.annual_cents,rules.billing.lifetime_cents],[295,595,1995,5995]);
  assert.equal(rules.public_catalogue.individual_tool_sales,false);
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
