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
