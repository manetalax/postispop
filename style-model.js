// Pure, shared validation for local persistence and the stationery editor.
export const FONT_IDS = ['sans','serif','mono','hand','rounded','book'];
export const PAPER_IDS = ['plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'];
export const PEN_IDS = ['graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor','blood'];
const fail = () => { throw new Error('INVALID_STYLE'); };
const number = (n,min,max) => typeof n==='number' && Number.isFinite(n) && n>=min && n<=max;
const color = value => typeof value==='string' && /^#[\da-f]{6}$/i.test(value);
export function normalizeStyle(value={}) {
  if(!value || typeof value!=='object' || Array.isArray(value)) fail();
  const result={font:value.font??'sans',size:value.size??20,italic:value.italic??false,underline:value.underline??false,ink:value.ink??'#163b62',paper:value.paper??'plain'};
  if(!FONT_IDS.includes(result.font)||!PAPER_IDS.includes(result.paper)||!number(result.size,12,36)||typeof result.italic!=='boolean'||typeof result.underline!=='boolean'||!color(result.ink))fail();
  const drawing=value.drawing??{version:1,selectedInstrument:'ballpoint',strokes:[]};
  if(!drawing||typeof drawing!=='object'||Array.isArray(drawing)||drawing.version!==1||!PEN_IDS.includes(drawing.selectedInstrument)||!Array.isArray(drawing.strokes)||drawing.strokes.length>120)fail();
  let count=0;
  const strokes=drawing.strokes.map(stroke=>{
    if(!stroke||!PEN_IDS.includes(stroke.instrument)||!color(stroke.color)||!number(stroke.width,.5,28)||!Array.isArray(stroke.points)||!stroke.points.length)fail();
    count+=stroke.points.length;if(count>16000)fail();
    return {instrument:stroke.instrument,color:stroke.color.toLowerCase(),width:stroke.width,points:stroke.points.map(p=>{
      if(!p||!number(p.x,0,1)||!number(p.y,0,1)||!number(p.p,0,1))fail();
      return {x:p.x,y:p.y,p:p.p};
    })};
  });
  result.ink=result.ink.toLowerCase();result.drawing={version:1,selectedInstrument:drawing.selectedInstrument,strokes};
  if(JSON.stringify(result).length>150000)fail();
  return result;
}

// Normalised geometry survives resizing. Physical pressure is optional: mouse
// input supplies 0.5; stylus pressure changes the brush and fountain nib widths.
export function drawStrokes(ctx,drawing,width,height,background) {
  const opacity={graphite:.64,ballpoint:1,roller:.91,gel:1,fountain:.91,fineliner:1,brush:.86,marker:.27,crayon:.58,chalk:.57};
  ctx.clearRect(0,0,width,height);
  for(const stroke of drawing?.strokes||[]) {
    const pts=stroke.points,base=stroke.width*width/640;
    const ink=background?readableInk(stroke.color,background):stroke.color;
    ctx.save();ctx.strokeStyle=ink;ctx.fillStyle=ink;
    ctx.lineCap=stroke.instrument==='marker'?'square':'round';ctx.lineJoin='round';ctx.globalAlpha=opacity[stroke.instrument]??1;
    if(['stamp','spray','charcoal','toothpaste','airbrush','chalk','nailpolish','brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor','blood'].includes(stroke.instrument)){drawMaterial(ctx,stroke,width,height,ink);ctx.restore();continue;}
    if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x*width,pts[0].y*height,base/2,0,Math.PI*2);ctx.fill();}
    for(let i=1;i<pts.length;i++) {
      const a=pts[i-1],b=pts[i],pressure=(a.p+b.p)/2;
      const dx=(b.x-a.x)*width,dy=(b.y-a.y)*height;
      ctx.lineWidth=base*(stroke.instrument==='brush'?.25+pressure*1.65:stroke.instrument==='fountain'?.3+Math.abs(Math.sin(Math.atan2(dy,dx)-Math.PI/4))*.9:1);
      ctx.beginPath();ctx.moveTo(a.x*width,a.y*height);ctx.lineTo(b.x*width,b.y*height);ctx.stroke();
      if(stroke.instrument==='graphite'||stroke.instrument==='crayon') {
        // A stable, sparse grain; redrawing does not alter the saved sketch.
        const grain=stroke.instrument==='crayon'?4:2;ctx.save();ctx.globalAlpha=.18;
        for(let j=0;j<grain;j++){const offset=((i*13+j*7)%11-5)/5*base;ctx.beginPath();ctx.arc((a.x+b.x)*width/2+offset,(a.y+b.y)*height/2-offset*.6,Math.max(.35,base*.08),0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
    }
    ctx.restore();
  }
}

// Contrast uses linear-light luminance; callers supply the actual paper colour.
export function contrastRatio(a,b) {
  const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function readableInk(ink,background) {
  if(!color(background))return ink;
  if(contrastRatio(ink,background)>=4.5)return ink;
  const target=contrastRatio('#151515',background)>=contrastRatio('#ffffff',background)?'#151515':'#ffffff';
  const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
  const from=rgb(ink),to=rgb(target);
  for(let step=1;step<=20;step++){
    const adjusted='#'+from.map((v,i)=>Math.round(v+(to[i]-v)*step/20).toString(16).padStart(2,'0')).join('');
    if(contrastRatio(adjusted,background)>=4.5)return adjusted;
  }
  return target;
}
export function paperColor(id) {
  return {papyrus:'#eacb92',washi:'#f5f0df',blueprint:'#e4f0f5',prescription:'#f4fbf8',shift:'#fcf8e9',study:'#fbf7ef'}[id]||'#fffaf0';
}
function drawMaterial(ctx,stroke,width,height,ink) {
  const base=stroke.width*width/640;
  // Seeded from stored geometry: no changing texture on resize or reopen.
  let seed=2166136261;
  for(const p of stroke.points)for(const n of [p.x,p.y,p.p])seed=Math.imul(seed^Math.round(n*100000),16777619);
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const samples=[];
  for(let i=0;i<stroke.points.length;i++){
    const b=stroke.points[i],a=stroke.points[Math.max(0,i-1)],dx=(b.x-a.x)*width,dy=(b.y-a.y)*height;
    const count=Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(.5,base*.18)));
    for(let j=i?1:0;j<=count;j++){const t=j/count;samples.push({x:(a.x+(b.x-a.x)*t)*width,y:(a.y+(b.y-a.y)*t)*height,p:a.p+(b.p-a.p)*t});}
  }
  const dot=(x,y,r,alpha)=>{ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,Math.max(.2,r),0,Math.PI*2);ctx.fill();};
  if(stroke.instrument==='blood'){
    ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=.96;
    for(let i=0;i<samples.length;i++){
      const p=samples[i],a=samples[Math.max(0,i-1)];ctx.lineWidth=base*(.65+p.p*.55);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();
      if(i%19===0)dot(p.x,p.y,base*(.32+random()*.22),.92);
    }
    const end=samples.at(-1);dot(end.x,end.y,base*.52,.95);
    return;
  }
  if(['correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor'].includes(stroke.instrument)){
    const tape=stroke.instrument==='correction_tape',fluid=stroke.instrument==='correction_fluid';
    const path=(size,colour,alpha,offset=0)=>{ctx.strokeStyle=colour;ctx.fillStyle=colour;ctx.globalAlpha=alpha;ctx.lineWidth=size;ctx.lineCap=tape?'butt':'round';ctx.lineJoin='round';ctx.beginPath();samples.forEach((p,i)=>i?ctx.lineTo(p.x+offset,p.y+offset):ctx.moveTo(p.x+offset,p.y+offset));ctx.stroke();if(stroke.points.length===1){if(tape)ctx.fillRect(samples[0].x-size/2,samples[0].y-size/2,size,size);else dot(samples[0].x+offset,samples[0].y+offset,size/2,alpha);}};
    if(tape||fluid){path(base+Math.max(1,base*.08),'#a4a4a4',.65);path(base,'#ffffff',1);return;}
    if(stroke.instrument==='watercolor'){
      path(base*1.25,ink,.1);path(base,ink,.14);
      ctx.fillStyle=ink;for(const p of samples)if(random()<.25)dot(p.x+(random()-.5)*base,p.y+(random()-.5)*base,base*.045,.18);
      return;
    }
    if(stroke.instrument==='sponge'){
      ctx.fillStyle=ink;for(let i=0;i<samples.length;i+=2){const p=samples[i];for(let j=0;j<14;j++){const a=random()*Math.PI*2,r=Math.sqrt(random())*base*.65;dot(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,base*(.03+random()*.08),.18+random()*.35);}}
      return;
    }
    path(base,ink,.92);
    if(stroke.instrument==='paintbrush')for(let j=-3;j<=3;j++)path(base*.03,'#ffffff',.16,j*base*.12);
    else {ctx.fillStyle='#ffffff';for(let i=0;i<samples.length;i+=3){const p=samples[i];for(let j=0;j<5;j++)dot(p.x+(random()-.5)*base,p.y+(random()-.5)*base,base*.025,.18);}}
    return;
  }
  if(['brow','mascara','eyeliner','lipstick','eyeshadow','correction_tape','correction_fluid','paintbrush','roller_paint','sponge','watercolor'].includes(stroke.instrument)){
    ctx.fillStyle=ink;ctx.strokeStyle=ink;
    if(stroke.instrument==='eyeshadow'){
      for(const p of samples)for(let j=0;j<22;j++){
        const angle=random()*Math.PI*2,r=Math.sqrt(random())*base;
        dot(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r,base*.035,.07+random()*.13);
      }
      return;
    }
    if(stroke.instrument==='brow'||stroke.instrument==='mascara'){
      const mascara=stroke.instrument==='mascara';
      for(let i=0;i<samples.length;i+=mascara?3:2){const p=samples[i];
        for(let j=0;j<(mascara?6:3);j++){
          const offset=(j-(mascara?2.5:1))*base*.18;
          ctx.globalAlpha=mascara?.85:.55;ctx.lineWidth=base*(mascara?.1:.055);ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(p.x+offset,p.y-base*.28);ctx.lineTo(p.x+offset+base*.25,p.y+base*.28);ctx.stroke();
        }
      }
      return;
    }
    const lipstick=stroke.instrument==='lipstick';
    ctx.globalAlpha=lipstick?.88:1;ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=0;i<samples.length;i++){const p=samples[i],a=samples[Math.max(0,i-1)];
      ctx.lineWidth=base*(lipstick?1:.3+p.p*.8);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();
      if(stroke.points.length===1)dot(p.x,p.y,ctx.lineWidth/2,lipstick?.88:1);
      if(lipstick&&i%3===0){ctx.fillStyle='#ffffff';dot(p.x-base*.2,p.y-base*.2,base*.06,.16);ctx.fillStyle=ink;}
    }
    return;
  }
  if(stroke.instrument==='nailpolish'){
    const layer=(offset,size,colour,alpha)=>{
      ctx.strokeStyle=colour;ctx.fillStyle=colour;ctx.globalAlpha=alpha;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      samples.forEach((p,i)=>i?ctx.lineTo(p.x+offset,p.y+offset):ctx.moveTo(p.x+offset,p.y+offset));ctx.stroke();
      if(stroke.points.length===1)dot(samples[0].x+offset,samples[0].y+offset,size/2,alpha);
    };
    layer(base*.08,base*1.08,'#18202a',.2);
    layer(0,base,ink,1);
    for(const offset of [-.28,-.12,.09,.26])layer(base*offset,base*.025,'#ffffff',.15);
    layer(-base*.2,base*.11,'#ffffff',.5);
    return;
  }
  if(stroke.instrument==='airbrush'){
    ctx.fillStyle=ink;
    for(const p of samples){
      const radius=base*(.65+p.p*.65);
      // Nested translucent discs produce a soft edge and accumulate pigment.
      for(let ring=12;ring>=1;ring--)dot(p.x,p.y,radius*ring/12,.012);
    }
    return;
  }
  if(stroke.instrument==='toothpaste'){
    const path=(offset,size,colour,alpha)=>{ctx.strokeStyle=colour;ctx.fillStyle=colour;ctx.globalAlpha=alpha;ctx.lineWidth=size;ctx.lineCap='round';ctx.beginPath();samples.forEach((p,i)=>i?ctx.lineTo(p.x+offset,p.y+offset):ctx.moveTo(p.x+offset,p.y+offset));ctx.stroke();if(stroke.points.length===1)dot(samples[0].x+offset,samples[0].y+offset,size/2,alpha);};
    path(base*.12,base*1.1,'#152536',.22);
    path(0,base,'#f3f6ee',1);
    path(-base*.19,base*.23,'#bc243e',.95);
    path(base*.19,base*.23,'#167da8',.95);
    path(-base*.31,base*.08,'#ffffff',.8);
    return;
  }
  ctx.fillStyle=ink;
  for(const p of samples){
    const spray=stroke.instrument==='spray',stamp=stroke.instrument==='stamp',chalk=stroke.instrument==='chalk';
    const radius=base*(spray?1.35:.5)*(.7+p.p*.6),count=spray?14:stamp?8:chalk?18:12;
    for(let j=0;j<count;j++){
      const angle=random()*Math.PI*2,r=Math.sqrt(random())*radius;
      if(stamp&&random()<.32)continue;
      dot(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r,base*(spray?.025:stamp?.075:chalk?.045:.055),spray?.12+random()*.25:stamp?.65+random()*.35:.18+random()*.4);
    }
  }
}
