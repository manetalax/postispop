import {countryMiniatures} from './country-scenes.js';
import {countryFlags} from './country-flags.js';
export const patternVersion='arcade-cultural-v1';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const path=(d,fill='none',stroke='#8869b3',w=1.4)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect=(x,y,w,h,fill,r=5,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const group=(s,x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${s}</g>`;
const flagsvg=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const leaf=(x,y,angle,color='url(#leaf)')=>`<g transform="translate(${x} ${y}) rotate(${angle})">${path('M0 0Q-13-15 0-28Q11-10 0 0Z',color,'#b5b896',.3)}${path('M0-3V-24','none','#d9d4b1',.55)}</g>`;
function sprig(x,y,scale=1,color){return group(path('M1 30Q9 6 30-14','none','#b99d65',1.4)+leaf(7,20,-55,color)+leaf(14,10,40,color)+leaf(22,0,-30,color)+leaf(30,-9,35,color),x,y,scale);}
function flower(x,y,color='#ba94e0',scale=1){return group(`<g filter="url(#object-shadow)">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-7" rx="4.5" ry="7" fill="${color}" transform="rotate(${a})"/>`).join('')}${circle(0,0,3,'url(#gold)')}</g>`,x,y,scale);}
const scroll=()=>path('M0 15Q20 15 25 2Q29-9 38-2Q43 3 37 6Q32 8 33 3M25 2Q32 14 48 13','none','#a580cc',1.4);
function fan(){let s='';for(let i=0;i<9;i++){const a=(-64+i*16)*Math.PI/180,x=39*Math.sin(a),y=-39*Math.cos(a);s+=path(`M0 0L${x} ${y}`,'none',i%2?'#f0c071':'#aa394e',6);s+=path(`M0 0L${x} ${y}`,'none','#eac478',.7);}return `<g filter="url(#object-shadow)">${s}${circle(0,0,3,'url(#gold)')}</g>`;}
function special(kind){
 if(kind==='vinyl')return circle(24,24,22,'#252436')+circle(24,24,16,'#39334c')+circle(24,24,10,'#211e30')+circle(24,24,5,'url(#coral)')+circle(24,24,1.5,'url(#gold)')+path('M7 20Q10 7 23 7M8 24Q9 13 17 10','none','#827b99',1);
 if(kind==='radio')return rect(1,14,46,29,'url(#gold)',5)+circle(15,28,9,'#292739')+path('M9 25H21M9 29H21M11 33H19','none','#aaa1b7',1)+rect(29,19,12,7,'#292739',2)+circle(32,34,3,'url(#lilac)')+circle(41,34,3,'url(#lilac)')+path('M7 14L29 1','none','#d4c4a1',2);
 if(kind==='guitar')return path('M11 27Q2 32 7 42Q17 53 26 43L33 31Q35 20 25 23L18 17L10 22Z','url(#gold)','#efcd8a',.8)+path('M23 29L39 5','none','#725347',6)+circle(18,32,5,'#49333c')+path('M16 40L40 4','none','#fff3bc',1)+rect(36,1,9,9,'url(#gold)',2);
 if(kind==='piano')return rect(2,5,43,38,'#312844',4,'#b398c9')+[0,1,2,3,4,5,6].map(i=>rect(5+i*5.5,9,5,29,'#eee2d6',1)).join('')+[0,1,3,4,5].map(i=>rect(9+i*5.5,9,3,17,'#282336',1)).join('');
 if(kind==='stage')return rect(3,5,41,36,'#352448',4,'#c49adb')+path('M4 7L18 8L12 27L4 35ZM43 7L29 8L35 27L43 35Z','url(#lilac)','#e1b5e5',.4)+path('M19 35H30M25 12V34','none','#eac79a',2)+circle(25,11,3,'url(#gold)');
 if(kind==='rap')return rect(8,7,31,38,'#684c70',4,'#c797be')+rect(11,1,25,10,'url(#lilac)',3)+rect(15,19,16,16,'url(#gold)',3)+path('M21 8L16 1','none','#ede0fa',2);
 if(kind==='firefighters')return rect(1,26,46,7,'url(#coral)',3)+path('M7 27V20C7-2 39-2 39 20V27Z','url(#coral)','#ff9c83',.7)+path('M23 2V26','none','#ffe78b',2)+path('M17 12L23 9L29 12V21L23 26L17 21Z','url(#gold)','#d79c47',.8);
 if(kind==='military')return path('M6 32V24C6-4 43-4 43 24V32Z','url(#leaf)','#b3b795',.7)+rect(2,30,45,7,'url(#leaf)',3)+path('M24 9L27 15L34 15L29 20L31 27L24 23L18 27L19 20L14 15L21 15Z','url(#gold)','#dfc67d',.6);
 if(kind==='christmas')return path('M24 1L7 22H15L3 35H19V43H29V35H46L33 22H41Z','url(#leaf)','#a4ba7a',.7)+[circle(20,14,2,'url(#coral)'),circle(32,27,2,'url(#gold)'),circle(14,30,2,'url(#coral)')].join('');
 if(kind==='kpop')return `<g transform="rotate(30 24 24)">${rect(19,18,10,28,'url(#lilac)',4)}${circle(24,12,12,'url(#lilac)')}${path('M14 8H34M13 12H35M14 16H34','none','#e8cffd',.8)}</g>`+circle(42,32,2,'url(#gold)');
 if(kind==='travel')return rect(4,12,39,32,'url(#gold)',6,'#f0d9a2')+path('M17 12V5H30V12M14 15V40M34 15V40','none','#966a51',2)+rect(20,22,13,10,'url(#lilac)',2);
 return '';
}
export function themeKind(d){const music={'theme-051':'radio','theme-052':'vinyl','theme-053':'guitar','theme-054':'piano','theme-055':'stage','theme-056':'guitar','theme-057':'rap','theme-058':'stage','theme-060':'piano'};if(music[d.id])return music[d.id];if(d.id==='profession-firefighters')return 'firefighters';if(d.id==='theme-050')return 'military';if(d.id==='theme-093')return 'christmas';if(d.id==='theme-059')return 'kpop';if(d.category==='Viajes')return 'travel';return d.motif||'book';}
export function selectorTitle(d){return d?.code?d.title:d?.id==='profession-firefighters'?'Bomberos':d?.id==='theme-050'?'Ejército':d?.id==='theme-093'?'Navidad':d?.id==='theme-059'?'K-pop':d?.title?.split(' · ')[0]||'Mi pizarra';}
export function badgeSvg(d,glyph){return special(themeKind(d))||glyph(d.motif||'book',0,0,1,'#d5b4f0');}
export const definitions=`<defs>
<linearGradient id="panel" x2=".8" y2="1"><stop stop-color="#201832"/><stop offset="1" stop-color="#101022"/></linearGradient>
<linearGradient id="paper" x2=".8" y2="1"><stop stop-color="#fff298"/><stop offset=".45" stop-color="#ffe97c"/><stop offset="1" stop-color="#f7d661"/></linearGradient>
<linearGradient id="fold" x2="1" y2="1"><stop stop-color="#fff8b3"/><stop offset=".45" stop-color="#f1cc51"/><stop offset="1" stop-color="#b48328"/></linearGradient>
<linearGradient id="gold" x2=".6" y2="1"><stop stop-color="#fff0b7"/><stop offset=".5" stop-color="#cfaa61"/><stop offset="1" stop-color="#80613c"/></linearGradient>
<linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#c0cd7a"/><stop offset=".45" stop-color="#728444"/><stop offset="1" stop-color="#30432c"/></linearGradient>
<linearGradient id="lilac" x2=".5" y2="1"><stop stop-color="#eee1ff"/><stop offset=".5" stop-color="#b68bda"/><stop offset="1" stop-color="#715398"/></linearGradient>
<radialGradient id="coral" cx=".3" cy=".2" r=".8"><stop stop-color="#ff817b"/><stop offset=".6" stop-color="#ee4347"/><stop offset="1" stop-color="#9f232c"/></radialGradient>
<radialGradient id="blue" cx=".3" cy=".2" r=".8"><stop stop-color="#477ce2"/><stop offset=".6" stop-color="#19429a"/><stop offset="1" stop-color="#101c50"/></radialGradient>
<filter id="object-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity=".55"/></filter>
<filter id="paper-shadow" x="-15%" y="-15%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".65"/></filter>
<filter id="miniature"><feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#000" flood-opacity=".5"/><feSpecularLighting in="SourceAlpha" surfaceScale="1.5" specularConstant=".2" specularExponent="10" lighting-color="#fff2ce" result="light"><feDistantLight azimuth="225" elevation="50"/></feSpecularLighting><feComposite in="light" in2="SourceAlpha" operator="in"/><feBlend in2="SourceGraphic" mode="screen"/></filter>
</defs>`;
function secondary(kind,glyph){
 if(kind==='firefighters')return rect(2,16,45,22,'url(#coral)',3)+rect(28,7,17,26,'url(#coral)',3)+rect(30,10,12,10,'#b8c7d6',2)+path('M1 10H28M1 6H28M6 6V10M13 6V10M21 6V10','none','#d5cde3',2)+circle(11,39,6,'#242235')+circle(37,39,6,'#242235')+circle(11,39,2,'#a59aae')+circle(37,39,2,'#a59aae');
 if(kind==='military')return path('M24 1L43 8V25Q38 40 24 46Q10 40 5 25V8Z','url(#leaf)','#e1c78d',2)+path('M24 10L28 21L38 21L30 28L33 38L24 32L15 38L18 28L10 21L20 21Z','url(#gold)','#b88e53',.5);
 if(kind==='christmas')return rect(5,12,38,30,'url(#coral)',3)+rect(1,9,46,9,'url(#coral)',3)+rect(20,9,8,33,'url(#gold)',1)+path('M24 11Q1-5 8 2Q16-7 24 11Q43-7 43 2Q47 11 24 11','none','#f5d28f',3);
 if(kind==='kpop')return path('M17 25L11 10L23 1L37 8L35 23L25 29Z','url(#lilac)','#eaceff',1)+rect(22,27,8,20,'url(#lilac)',3)+path('M23 10Q17 4 18 13L25 21L31 12Q33 3 23 10','url(#coral)','#efc6ee',.5);
 if(kind==='travel')return circle(24,24,22,'url(#gold)')+circle(24,24,18,'#292437')+path('M24 7L29 24L24 40L19 24Z','url(#lilac)','#ead4fb',.4)+path('M7 24H41','none','#dec38e',1);
 return '';
}
function ornamentContent(d,glyph,rail){
 const code=d.code,kind=themeKind(d),top=rail==='top';let s='';
 if(d.id==='default-arcade')return group(scroll(),32,20)+group(scroll(),300,20)+path('M101 28H285','none','#80629e',1);
 if(code){const m=countryMiniatures(d);s+=sprig(18,37,.8)+sprig(328,43,.7);
  if(code==='ES'){s+=group(fan(),83,41,.8)+flower(51,33,'#c64858',.6);}
  else if(code==='JP'){s+=flower(31,14,'#f0aaca',.9)+flower(69,29,'#efb4d6',.65)+flower(98,12,'#d897bd',.5);}
  else if(code==='FR'){s+=sprig(60,40,.6,'url(#lilac)')+flower(30,15,'#b898de',.6);}
  else if(m.food)s+=`<svg x="58" y="0" width="64" height="50" viewBox="0 0 160 160" color="#e9cc8d" filter="url(#miniature)">${m.food}</svg>`;
  if(top&&m.landmark)s+=`<svg x="282" y="-3" width="87" height="56" viewBox="0 0 160 180" color="#d9c19c" filter="url(#miniature)">${m.landmark}</svg>`;
  if(!top){if(code==='ES')s+=group(fan(),190,41,.7);else if(m.landmark)s+=`<svg x="167" y="3" width="57" height="43" viewBox="0 0 160 180" color="#b79bd5" filter="url(#miniature)">${m.landmark}</svg>`;else s+=`<svg x="168" y="6" width="52" height="37" viewBox="0 0 100 100"><path d="${esc(m.outline)}" fill="url(#gold)" stroke="#cfb688" stroke-width="1"/></svg>`;}
 }else{
  const primary=special(kind)||glyph(d.motif||'book',0,0,1,'#dcc0ee');
  s+=`<g filter="url(#object-shadow)">${group(primary,22,1,.9)}${group(secondary(kind,glyph)||primary,319,4,.8)}</g>`;
  const colors={Tecnología:'#8eb5d3',Cocina:'#c5b583',Viajes:'#af9ece',Naturaleza:'#8faa6a',Historia:'#c5a471',Música:'#c79edc',Profesiones:'#a6b8c1',Deporte:'#b1b887','Arte y ocio':'#c9a6c5','Creencias y celebraciones':'#cbb0d8'};
  const color=colors[d.category]||'#bba0d8';
  s+=sprig(64,37,.6,color)+flower(87,27,color,.55)+group(scroll(),100,23,.65)+group(scroll(),265,23,.65);
  if(!top)s+=group(primary,174,4,.65);
 }
 const lineColor='#80629e';s+=path(top?'M124 26H270': 'M91 28H159M228 28H294','none',lineColor,1.1);
 return s;
}
export function ornamentSvg(d,glyph,rail='top'){return `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="52" viewBox="0 0 390 52"><title>${esc(d.title)} · ${rail==='top'?'marco superior':'marco inferior'}</title>${definitions}${ornamentContent(d,glyph,rail)}</svg>`;}
const uiIcon=(name,x,y)=>{const paths={share:'M9 16L22 8M9 20L22 27',shop:'M6 16V29H28V16M3 15L7 7H27L31 15M13 29V20H22V29',settings:'M5 10H28M5 23H28'};let s=path(paths[name],'none','#d5b8ec',1.8);if(name==='share')s+=circle(7,18,3,'#d5b8ec')+circle(25,6,3,'#d5b8ec')+circle(25,29,3,'#d5b8ec');if(name==='settings')s+=circle(13,10,3,'#d5b8ec')+circle(22,23,3,'#d5b8ec');return group(s,x,y);};
function mascot(){return `<g transform="rotate(-9 15 16)" filter="url(#object-shadow)">${rect(0,3,30,30,'url(#paper)',4)}${circle(11,15,1.5,'#18336f')}${circle(21,15,1.5,'#18336f')}${path('M10 22Q15 30 23 20','none','#18336f',2.4)}${circle(20,3,4,'url(#coral)')}</g>`;}
export function arcadeBoardSvg(d,{preview=false}={},glyph){
 const title=selectorTitle(d);let s=`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="760" viewBox="0 0 420 760"><title>${esc(d.title)}</title><desc>${esc(d.kind==='country'?(d.edition==='crafted'?'EDICIÓN CULTURAL':'EDICIÓN EN DESARROLLO'):d.details.join(' · '))}</desc>${definitions}`;
 s+=rect(0,0,420,760,'#101023',0);
 if(preview){s+=rect(8,8,404,53,'url(#panel)',13,'#705391')+group(mascot(),19,20,.9)+`<text x="51" y="43" fill="url(#lilac)" font-family="sans-serif" font-weight="850" font-size="23">PostisPop</text>`;
 s+=rect(174,16,113,36,'url(#panel)',9,'#76569a');
 if(d.code&&countryFlags[d.code])s+=`<image href="${esc(flagsvg(countryFlags[d.code]))}" x="182" y="26" width="22" height="16"/>`;
 else s+=group(badgeSvg(d,glyph),181,24,.38);
 s+=`<text x="209" y="39" fill="#e4d6f3" font-family="sans-serif" font-size="${title.length>14?8.5:title.length>9?11:14}" font-weight="650">${esc(title.length>22?title.slice(0,21)+'…':title)}</text>`+path('M275 31L279 35L283 31','none','#d5b8ec',1.4);
 for(const [i,name] of ['share','shop','settings'].entries()){s+=rect(294+i*38,16,33,36,'url(#panel)',8,'#705391')+uiIcon(name,295+i*38,17);}
 }
 s+=rect(8,preview?70:0,404,preview?680:760,'url(#panel)',17,'#705391');
 if(!preview)return s+'</svg>';
 s+=group(ornamentContent(d,glyph,'top'),15,77);
 s+=rect(15,124,390,564,'#111024',15,'#674b87');
 const notes=['Compra pan','Ideas','Llamar a mamá','Leer','Viaje','Cita','Música','Paseo'];
 for(let i=0;i<12;i++){const x=23+i%3*128,y=135+Math.floor(i/3)*137;
 s+=`<g data-preview-note="${i+1}" transform="translate(${x} ${y})" filter="url(#paper-shadow)">${rect(0,4,117,121,'#bd8d39',7)}${path('M8 0H108Q117 0 117 9V101Q114 117 98 121H8Q0 121 0 112V9Q0 0 8 0Z','url(#paper)','none')}${path('M98 121Q99 102 117 101Q114 117 98 121Z','url(#fold)','none')}${rect(6,8,17,14,'#d7b95155',4)}<text x="11" y="19" font-size="10" font-family="sans-serif" fill="#b09752">${i+1}</text>${rect(51,-1,11,8,i%2?'#152959':'#bd2834',5)}${circle(57,-2,8,i%2?'url(#blue)':'url(#coral)')}`;
 if(i<8){const parts=notes[i].split(' ');s+=`<text x="58" y="${parts.length>1?53:66}" text-anchor="middle" fill="#19366c" font-family="cursive" font-style="italic" font-size="${parts.length>2?15:19}">${parts.map((t,j)=>`<tspan x="58" dy="${j?23:0}">${esc(t)}</tspan>`).join('')}</text>`;}
 s+='</g>';}
 return s+group(ornamentContent(d,glyph,'bottom'),15,696)+'</svg>';
}
