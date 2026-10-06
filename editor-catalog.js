// Lightweight stationery primitives used by the note editor.
// No themes, country art, storefront data or network dependencies.

export const fonts = [{id:'sans',name:'Editorial',css:'system-ui,-apple-system,sans-serif'},{id:'serif',name:'Clásica',css:'"PP Clasica",serif'},{id:'mono',name:'Máquina de escribir',css:'"PP Maquina",monospace'},{id:'hand',name:'Manuscrita',css:'"PP Manuscrita",cursive'},{id:'rounded',name:'Redondeada',css:'"PP Redondeada",sans-serif'},{id:'book',name:'Libro',css:'"PP Libro",serif'}];
export const instruments = [{id:'graphite',name:'Lápiz de grafito',width:2,opacity:.6},{id:'ballpoint',name:'Bolígrafo',width:2,opacity:1},{id:'roller',name:'Roller de tinta líquida',width:3,opacity:.95},{id:'gel',name:'Bolígrafo de gel',width:4,opacity:1},{id:'fountain',name:'Pluma estilográfica',width:5,opacity:.9},{id:'fineliner',name:'Rotulador fino',width:1,opacity:1},{id:'brush',name:'Pincel de caligrafía',width:9,opacity:.85},{id:'marker',name:'Marcador',width:14,opacity:.3},{id:'crayon',name:'Cera',width:8,opacity:.55},{id:'chalk',name:'Tizas de colores',width:8,opacity:.7},{id:'charcoal',name:'Carboncillo',width:10,opacity:.7},{id:'stamp',name:'Sello de tinta',width:12,opacity:1},{id:'toothpaste',name:'Pasta tricolor',width:18,opacity:1},{id:'spray',name:'Spray de grafiti',width:16,opacity:.6},{id:'airbrush',name:'Pistola de pintura',width:24,opacity:.3},{id:'nailpolish',name:'Pintauñas',width:12,opacity:1},{id:'brow',name:'Lápiz de cejas',width:5,opacity:.6},{id:'mascara',name:'Máscara de pestañas',width:9,opacity:.85},{id:'eyeliner',name:'Delineador',width:3,opacity:1},{id:'lipstick',name:'Pintalabios',width:14,opacity:.88},{id:'eyeshadow',name:'Sombra de ojos',width:18,opacity:.3},{id:'correction_tape',name:'Corrector de cinta',width:14,opacity:1},{id:'correction_fluid',name:'Corrector líquido',width:10,opacity:1},{id:'paintbrush',name:'Brocha de pintura',width:20,opacity:1},{id:'roller_paint',name:'Rodillo',width:28,opacity:1},{id:'sponge',name:'Esponja',width:22,opacity:.6},{id:'watercolor',name:'Acuarela',width:18,opacity:.3},{id:'blood',name:'Sangre · tinta artística',width:7,opacity:1}];
export const papers = [{id:'plain',name:'Liso'},{id:'ruled',name:'Cuaderno rayado'},{id:'grid',name:'Cuadriculado'},{id:'dots',name:'Punteado'},{id:'journal',name:'Diario de viaje'},{id:'papyrus',name:'Papiro'},{id:'washi',name:'Washi'},{id:'music',name:'Pentagrama'},{id:'prescription',name:'Hoja tipo receta'},{id:'blueprint',name:'Plano técnico'},{id:'shift',name:'Cuadrante de turnos'},{id:'study',name:'Ficha de estudio'}];
export const palettes = [{id:'chalk',name:'Tizas de colores',colors:['#ffffff','#f3d65c','#e97c99','#6daee0','#78bd91','#b794d4']},{id:'classic',name:'Clásica',colors:['#163b62','#883647','#415946','#4d3b68','#6b482c','#222222']},{id:'jewel',name:'Piedras preciosas',colors:['#065f46','#1e3a8a','#701a75','#9f1239','#713f12','#334155']},{id:'earth',name:'Tierra',colors:['#6b4226','#5b622c','#923f26','#315750','#624552','#4d483f']},{id:'studio',name:'Estudio',colors:['#1649bb','#9b1663','#7b352c','#315845','#663ba0','#222835']}];
export const svgUrl=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
const treble='<path d="M28 9c-21 16-20 30-5 34 16 4 18-18 3-17-11 1-10 15 2 15M26 3c-3 1-6 8-3 18l9 31c3 13-13 12-13 5" fill="none" stroke="currentColor" stroke-width="2.5"/>';
const line=(d,stroke,width=1,opacity=1)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`;
function paperContent(type){
  const ink=type==='blueprint'?'#5a899a':'#556a72';
  const fill={papyrus:'#eacb92',washi:'#f5f0df',blueprint:'#e4f0f5',prescription:'#f4fbf8',shift:'#fcf8e9',study:'#fbf7ef'}[type]||'#fffaf0';
  let art=`<rect width="220" height="250" fill="${fill}"/>`;
  if(type==='papyrus'){
    for(let n=1;n<250;n+=4)art+=line(`M0 ${n}q60 ${n%7-3} 120 0t120 0`,'#967747',.7,.18);
    for(let n=2;n<220;n+=8)art+=line(`M${n} 0q${n%5-2} 130 0 250`,'#ba995f',.7,.2);
    art+='<path d="M3 6 14 4l6 3 8-3 15 3 15-3 9 2 20-2 16 3 19-3 13 2 17-3 15 4 12-2 20 1 19-2M3 243l14 2 17-3 15 3 19-2 24 2 13-3 15 3 21-2 13 3 16-3 24 2 23-2" fill="none" stroke="#af8b53" stroke-width="2"/>';
  }
  if(type==='washi'){
    for(let y=0;y<250;y+=11)for(let x=0;x<220;x+=19)art+=line(`M${x} ${y}l${4+(x%5)} 2`,'#b7b69b',.65,.24);
    art+='<path d="M0 15c11 0 12-15 25-15M198 250c1-14 22-12 22-26" fill="none" stroke="#c98582" stroke-width="4" opacity=".4"/>';
  }
  if(['ruled','journal','prescription','study'].includes(type))for(let y=type==='prescription'?82:50;y<240;y+=23)art+=line(`M14 ${y}h192`,ink,.65,.3);
  if(['grid','blueprint'].includes(type))for(let n=0;n<250;n+=20)art+=line(`M${n} 0v250M0 ${n}h250`,ink,.65,.35);
  if(type==='dots')for(let y=15;y<250;y+=20)for(let x=15;x<220;x+=20)art+=`<circle cx="${x}" cy="${y}" r=".9" fill="${ink}" opacity=".4"/>`;
  if(type==='journal'){art+=line('M28 0v250','#b86c5c',.7,.35);art+='<rect x="142" y="12" width="62" height="19" rx="3" fill="none" stroke="#99866e" stroke-dasharray="2 2"/><text x="152" y="25" font-family="sans-serif" font-size="8" fill="#81715d">MI VIAJE</text>';}
  if(type==='music'){
    for(let b=0;b<3;b++)for(let n=0;n<5;n++)art+=line(`M14 ${65+b*65+n*6}h192`,ink,.75,.6);
    art+=`<g color="#36515a" transform="translate(9 59) scale(.48)">${treble}</g>`;
  }
  if(type==='prescription')art+='<path d="M14 13h5v5h5v5h-5v5h-5v-5H9v-5h5Z" fill="#338176"/><text x="30" y="23" font-size="9" font-family="sans-serif" fill="#29675e">APUNTES PERSONALES</text><path d="M12 34h196" stroke="#62a397"/><text x="14" y="48" font-size="7" font-family="sans-serif" fill="#486c64">FECHA: __________</text><text x="14" y="240" font-size="6.5" font-family="sans-serif" fill="#486c64">PAPEL CREATIVO · NO ES UNA RECETA MÉDICA</text>';
  if(type==='shift'){
    art+='<rect x="12" y="12" width="196" height="27" fill="#e7e4d6"/><text x="20" y="30" font-size="10" font-family="sans-serif" fill="#314352">MI CUADRANTE</text>';
    for(let n=0;n<8;n++)art+=line(`M${12+n*28} 56v175`,ink,.6,.4);
    for(let n=0;n<6;n++)art+=line(`M12 ${56+n*24}h196`,ink,.6,.4);
    ['L','M','X','J','V','S','D'].forEach((day,n)=>{art+=`<text x="${22+n*28}" y="69" font-size="8" font-family="sans-serif" fill="#314352">${day}</text>`;});
    art+='<text x="14" y="200" font-size="8" font-family="sans-serif" fill="#314352">RECORDATORIOS</text>'+line('M14 214h192m-192 18h192',ink,.65,.3);
  }
  if(type==='study')art+='<path d="M58 39v194" stroke="#ac8272" opacity=".5"/><rect x="12" y="12" width="196" height="24" rx="3" fill="#e7ecdf"/><text x="20" y="28" font-size="9" font-family="sans-serif" fill="#445b50">TEMA · IDEAS · REPASO</text>';
  return art;
}
export function paperSvg(type='plain'){return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="250" viewBox="0 0 220 250">${paperContent(type)}</svg>`;}
