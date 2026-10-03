// Pure, shared validation for local persistence and the stationery editor.
export const FONT_IDS = ['sans','serif','mono','hand','rounded','book'];
export const PAPER_IDS = ['plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'];
export const PEN_IDS = ['graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk','charcoal','stamp','toothpaste','spray','airbrush','nailpolish'];
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
    if(['stamp','spray','charcoal','toothpaste'].includes(stroke.instrument)){drawMaterial(ctx,stroke,width,height,ink);ctx.restore();continue;}
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
