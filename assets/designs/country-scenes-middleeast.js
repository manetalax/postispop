// Original interpretive drawings of the named places, not measured elevations.
// Sources and cultural context live in country-cultural-data.js.
const P=(d,fill='none',stroke='currentColor',w=1.8)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const R=(x,y,w,h,fill='none',rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="currentColor" stroke-width="1.7"/>`;
const C=(x,y,r,fill='none')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/>`;
const E=(x,y,rx,ry,fill='none')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/>`;
const A=(x,y,w,h)=>P(`M${x} ${y+h}V${y+w/2}a${w/2} ${w/2} 0 0 1 ${w} 0v${h-w/2}`);
const G=(svg,x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
const ground=()=>P('M5 155q69-9 150 0');
const column=(x,y,h)=>R(x,y,7,h,'#d1bf97')+P(`M${x-3} ${y}h13m-11 3h9m-11 ${h-3}h13`)+P(`M${x+3.5} ${y+7}v${Math.max(0,h-15)}`,'none','#8a8974',1);
const palm=(x,y,s=1)=>G(P('M0 0q5-29 0-56','none','currentColor',3)+P('M0-56q-18-23-29-4 17-8 29 4M0-56q19-24 31-5-17-8-31 5M0-56q-25-5-28 12 18-12 28-12M0-56q23-7 30 12-19-12-30-12','#8ca17c'),x,y,s);
const battlement=(x,y,count,step=12)=>P(`M${x} ${y}`+Array.from({length:count},()=>`v-6h${step/2}v6h${step/2}`).join(''));

export const middleEastLandmarks={
 JO:{name:'Petra',draw:()=>
  P('M3 150V30l14-20 13 18 9 3h79l9-17 19 19 11-14v131Z','#c4ad81')+
  P('M15 43 11 117m14-91 4 89m114-74-8 90M31 148V53h97v95Z','#d1bf97')+
  R(39,104,81,42,'#c4ad81')+P('M35 105h90v-7H35ZM39 87l20-18 20 18Zm42 0 20-18 20 18Z','#d1bf97')+
  [44,61,92,109].map(x=>column(x,107,35)).join('')+R(73,116,17,30,'#8a8974')+
  [42,60,95,113].map(x=>column(x,63,33)).join('')+
  P('M38 59h86M39 59l18-18 17 18m15 0 18-18 17 18')+
  E(81,50,13,5,'#d1bf97')+R(70,50,22,46,'#d1bf97')+
  P('M66 48 81 32l15 16ZM81 32v-8')+C(81,22,4,'#c4ad81')+
  A(76,65,10,27)+P('M28 149h105v6H28Z','#d1bf97')},
 SA:{name:'Yacimiento arqueológico de Hegra',draw:()=>
  P('M5 150 8 65l13-33 23-16 40 6 30-7 26 18 15 43v74Z','#c4ad81')+
  P('M24 145V57h111v88Z','#d1bf97')+
  P('M28 57h20V43h17V30h29v13h17v14h19M25 65h110M29 71h102M32 79h96')+
  R(44,82,71,62,'#c4ad81')+[48,103].map(x=>column(x,85,56)).join('')+
  P('M53 111h53l-27-20Z','#d1bf97')+R(66,111,28,34,'#8a8974')+
  P('M60 113h39M17 74l-4 50m129-68 5 53M19 151h122')},
 IR:{name:'Persépolis',draw:()=>
  P('M7 150v-11h146v11Z','#c4ad81')+P('M12 138v-8h39v-8h33v-7h69v23Z','#d1bf97')+
  [27,69,111].map((x,i)=>column(x,35+i*8,83-i*9)+R(x-6,28+i*8,19,8,'#c4ad81')+
   P(`M${x-6} ${28+i*8}q-8-4-4-11l8 2 5 8 4-8 8-2q5 8-3 11`,'#d1bf97')).join('')+
  R(13,83,30,37,'#c4ad81')+R(100,90,41,29,'#c4ad81')+
  P('M17 120v-22m10 22v-22m10 22v-22M14 140h130m-107-3v-8m45 7v-14')+ground()},
 IQ:{name:'Babilonia',draw:()=>
  P('M9 147V97h22V73h31v16h34V65h34v32h23v50Z','#c4ad81')+
  battlement(31,73,3,10)+battlement(96,65,3,11)+battlement(62,89,3,11)+
  R(53,109,50,38,'#d1bf97')+A(65,111,26,36)+
  [88,101,134].map(y=>P(`M13 ${y}h35m62 0h27`,'none','#8a8974',1)).join('')+
  P('M15 99v10m11-19v8m9 4v8m78-31v9m13 10v10m12 24v13')+
  palm(143,103,.52)+P('M5 155q59-21 151 0')},
 IL:{name:'Masada',draw:()=>
  P('M4 148 23 111l13-36 28-20 59 4 23 43 11 47Z','#c4ad81')+
  P('M33 81 49 55l50-8 32 21-5 18-48 9Z','#d1bf97')+
  R(59,49,18,12,'#c4ad81')+R(85,48,25,15,'#c4ad81')+
  P('M30 88 49 79l10 3 14-9 34 7 20-7M39 107l13 15-13 12 19 12')+
  P('M65 95l-3 39m29-43 10 47m23-54 10 33','none','#8a8974',1.4)+
  P('M11 155h141')},
 PS:{name:'Paisaje cultural de Battir',draw:()=>
  P('M3 116 34 92l15-31 32-15 28 10 49 52v45H3Z','#8ca17c')+
  [0,1,2,3,4].map(i=>P(`M${10+i*9} ${143-i*15}q${53-i*7}-${29-i*4} ${139-i*20}-${i*5}v7q-${57-i*7}-${11-i} -${139-i*20} 0Z`,'#d1bf97')).join('')+
  P('M91 55q-5 18 4 27l-14 21 9 15-12 14 13 17','none','#84a9a1',3)+
  [31,57,117].map((x,i)=>P(`M${x} ${100+i%2*29}v-14`)+E(x,80+i%2*29,9,10,'#8ca17c')).join('')+
  R(69,42,19,17,'#c4ad81')+R(90,44,22,18,'#c4ad81')+P('M4 157h151')},
 LB:{name:'Baalbek',draw:()=>
  P('M8 151v-9h144v9Z','#c4ad81')+R(18,130,125,11,'#d1bf97')+
  [24,44,64,84,104,124].map(x=>column(x,46,83)+R(x-4,39,15,7,'#d1bf97')+
   P(`M${x-6} 39q-2-7 4-6l5 4 4-4q7-1 4 6`)).join('')+
  R(18,27,124,11,'#c4ad81')+P('M17 25h128m-125 13h122M28 143v8m103-8v8')+
  P('M3 159h155')},
 OM:{name:'Fuerte de Bahla',draw:()=>
  P('M4 147 20 126l22-15h87l26 36Z','#8ca17c')+
  R(29,71,105,67,'#c4ad81')+R(60,41,36,95,'#d1bf97')+
  P('M11 137V66q15-7 28 0v72ZM116 137V80q17-9 30 0v57Z','#c4ad81')+
  battlement(12,65,3,8)+battlement(60,41,4,9)+battlement(117,79,3,9)+
  A(64,108,25,28)+[72,86].map(x=>R(x,65,3,11,'#8a8974')).join('')+
  P('M18 88h3v12m7 11h3v12m94-28h3v11M42 87h10m50 15h10M5 152h148')},
 BH:{name:"Qal'at al-Bahrain",draw:()=>
  P('M6 145 17 105l27-15h78l30 29-9 27Z','#c4ad81')+
  P('M18 111V77l17-11 17 13v33ZM112 114V80l16-11 17 13v45Z','#d1bf97')+
  R(48,83,70,48,'#c4ad81')+P('M51 84 81 66l34 17M18 91l18-9 15 7m62 8 15-9 16 9')+
  A(70,104,17,27)+P('M61 95h7m27 0h7M28 105v10m104-2v12M9 144l34-12h77l29 10')+
  P('M3 155q33-10 68-1t86-1','none','#84a9a1',2)},
 QA:{name:'Yacimiento arqueológico de Al Zubarah',draw:()=>
  P('M2 151 16 119l31-15 105 11v37Z','#d1bf97')+
  P('M12 141v-29l22-8h39v24h-8v-15H38l-15 7v21Zm68-4v-31h46v8H89v23Z','#c4ad81')+
  P('M15 145h53v-9H42v-11m31 14h54v-19m-24-6v20m25-7 18 7v14H83')+
  [29,52,96,133].map((x,i)=>R(x,67+i%2*10,9,29,'#c4ad81')).join('')+
  P('M21 96 47 82l34 8 36-17 31 9','none','#8a8974',1.5)+
  P('M5 159h151')},
 KW:{name:'Torres de Kuwait',draw:()=>
  P('M45 151 49 28h4l5 123Zm58 0 4-132h4l3 132ZM130 151l2-137h3l3 137Z','#d1bf97')+
  C(52,92,24,'#84a9a1')+C(52,51,12,'#c4ad81')+C(110,75,21,'#84a9a1')+
  P('M30 86q21 10 43 0M30 98q21 10 44 0m18-28q18 8 36 0m-36 11q18 8 36 0')+
  P('M41 76q-8 17 1 33m20-33q9 17-1 33m39-50q-7 16 1 29m18-29q7 15-1 30','none','#d1bf97',1.2)+
  P('M9 159h141')},
 AE:{name:'Sitios culturales de Al Ain',draw:()=>
  palm(30,150,1.3)+palm(135,145,1.18)+palm(111,118,.83)+
  P('M51 142V102l10-17h30l10 17v40Z','#c4ad81')+
  P('M52 104q24-24 48 0M54 117h44m-44 12h44')+A(69,115,12,28)+
  P('M38 155q5-28 17-42m47 32q-15 3-13 13','none','#84a9a1',3)+
  P('M5 163q67-11 150 0')},
 SY:{name:'Palmira',draw:()=>
  [23,50,81,116].map((x,i)=>column(x,42+i*12,95-i*12)+R(x-4,35+i*12,15,7,'#d1bf97')).join('')+
  P('M13 147h135M14 152h137M28 36h28m30 39h22')+
  P('M63 144l3-9 17-6 9 9-6 6Zm47-1 13-8 15 6-1 7Z','#c4ad81')+
  P('M3 133 11 121l9 6m-5-71 16-3m38 6h14','none','#8a8974',1.3)+ground()},
 YE:{name:'Ciudad vieja de Saná',draw:()=>
  [10,43,78,116].map((x,i)=>{
   const top=40+i%2*21;
   return R(x,top,29,111-i%2*21,'#c4ad81')+battlement(x,top,3,9.5)+
    [0,1,2].map(j=>P(`M${x+2} ${top+23+j*27}h25`,'none','#f2e4c7',3)+
     [6,18].map(dx=>G(A(x+dx,top+5+j*27,6,13),0,0)).join('')).join('')+
    P(`M${x+3} ${top+2}v${106-i%2*21}m23-${106-i%2*21}v${106-i%2*21}`,'none','#f2e4c7',1.5);
  }).join('')+ground()},
};
