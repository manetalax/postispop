// Pure, shared validation for local persistence and the stationery editor.
export const FONT_IDS = ['sans','serif','mono','hand','rounded','book'];
export const PAPER_IDS = ['plain','ruled','grid','dots','journal','papyrus','washi','music','prescription','blueprint','shift','study'];
export const PEN_IDS = ['graphite','ballpoint','roller','gel','fountain','fineliner','brush','marker','crayon','chalk'];
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
export function drawStrokes(ctx,drawing,width,height) {
  const opacity={graphite:.64,ballpoint:1,roller:.91,gel:1,fountain:.91,fineliner:1,brush:.86,marker:.27,crayon:.58,chalk:.57};
  ctx.clearRect(0,0,width,height);
  for(const stroke of drawing?.strokes||[]) {
    const pts=stroke.points,base=stroke.width*width/640;
    ctx.save();ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;
    ctx.lineCap=stroke.instrument==='marker'?'square':'round';ctx.lineJoin='round';ctx.globalAlpha=opacity[stroke.instrument]??1;
    if(stroke.instrument==='chalk')ctx.setLineDash([base*.6,base*.35]);
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
