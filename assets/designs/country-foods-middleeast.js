// Original illustrations of individual food traditions documented in the
// cultural catalogue. Shared dishes intentionally retain their shared identity.
const P=(d,fill='none',stroke='currentColor',w=1.8)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const C=(x,y,r,fill='none',stroke='currentColor')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
const E=(x,y,rx,ry,fill='none',stroke='currentColor')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
const plate=()=>E(80,117,72,29,'#bec8b0')+E(80,113,61,22,'#d5d5b9');
const flecks=(count,x,y,w,h,color='#9f8568')=>Array.from({length:count},(_,i)=>P(`M${x+(i*17)%w} ${y+(i*11)%h}l3 1`,'none',color,1.4)).join('');
const breadHalf=(x,y,s=1,herbs=false)=>`<g transform="translate(${x} ${y}) scale(${s})">`+
 P('M-41 8q-4-60 44-62 38 5 38 62Z','#c4ad81')+
 P('M-38 4q-1-48 40-51 32 5 35 51','none','#e6cb98',2.8)+
 flecks(13,-26,-30,51,29,herbs?'#748c67':'#987e5e')+'</g>';
const bowl=(inside,fill='#c4ad81')=>P('M15 87q9 56 65 58 56-2 66-58Z',fill)+E(80,87,65,25,'#d1bf97')+inside;
const rice=()=>E(80,104,62,32,'#d1bf97')+flecks(39,30,82,102,39,'#e6d9ac');
const chicken=(x=0,y=0,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">`+P('M43 89q-17-23 2-43 23-20 44 0l14 23 25 16-9 18-29-16-21 17q-17 2-26-15Z','#b99972')+P('M122 90l18 8-4 8-19-10Z','#dfd3b0')+C(143,98,5,'#e5dab8')+C(141,106,5,'#e5dab8')+P('M49 60l29 17m-30-4 19 12m-4-35 27 17','none','#a3845e',3)+P('M51 49q13-6 20-1','none','#dac493',4)+'</g>';
const harees=()=>bowl(E(80,86,55,18,'#d1bf97')+P('M42 85q29-16 66-2m-52 9q25 14 45-2','none','#b89b6a',4)+flecks(24,38,76,81,18,'#b6a27a'))+P('M131 99 148 42','none','#9b8467',7)+E(150,35,5,15,'#b69d76');
const machboos=()=>plate()+rice()+chicken(-9,-10,.95)+C(127,117,12,'#b37d64')+P('M116 116h22m-10-10v22','none','#d1bf97',1.2)+P('M25 98q5-12 12-5','none','#8ca17c',4);

export const middleEastFoods={
 AZ:{name:'Gutab de carne',draw:()=>plate()+breadHalf(57,112,.95)+`<g transform="translate(102 99) rotate(22)">${breadHalf(0,0,.78)}</g>`+flecks(13,53,106,45,15,'#a8756c')},
 BH:{name:'Balaleet',draw:()=>plate()+E(80,93,58,32,'#c4ad81')+
  Array.from({length:9},(_,i)=>P(`M${27+i*7} ${86+i%3*8}q-5-15 12-12t10 22 12-21`,'none','#dac389',2)).join('')+
  P('M40 83q6-27 52-18 33 4 37 21-54 22-89-3Z','#ddc781')+P('M52 76q31 17 63 0','none','#b69a6f',2)},
 IR:{name:'Kelane del Kurdistán iraní',draw:()=>plate()+breadHalf(72,125,1.1,true)+
  P('M39 121q29-9 65-1','none','#8ca17c',4)+E(125,122,14,9,'#d9d6b8')+P('M122 116v10m-5-8 11 5','none','#8ca17c',2)},
 IQ:{name:'Masgouf',draw:()=>plate()+
  P('M78 41q-25-15-40 19-30 35-6 64l45 2 45-2q30-25 0-64-16-30-38-19Z','#c4ad81')+
  P('M80 41v84m0-61L49 51m31 29L36 68m44 29L32 89m48 26L35 108m45-44 27-14m-27 30 41-11m-41 28 46-9m-46 27 43-6','none','#936f55',3)+
  P('M65 125 51 144h51l-14-19Z','#b99972')+C(60,44,3,'#425349')+C(97,44,3,'#425349')+
  P('M35 83q-3 11 0 17m89-32 4 18','none','#d1bf97',4)},
 IL:{name:'Shakshuka de berenjena',draw:()=>
  E(80,100,62,34,'#b4866b')+E(80,96,55,25,'#b89772')+
  P('M18 96H5v16h15m122-16h13v16h-14')+
  [[53,86],[94,86],[80,111]].map(([x,y])=>E(x,y,16,11,'#e3d8b8')+C(x+2,y,6,'#c4ad81')).join('')+
  [[31,103],[115,108],[79,74]].map(([x,y])=>P(`M${x} ${y}q8-9 16 0-6 11-16 0Z`,'#8d8085')).join('')+
  P('M38 91l8 3m69 4 9-3m-64 29 12-2','none','#8ca17c',3)},
 JO:{name:'Mansaf',draw:()=>plate()+rice()+
  P('M37 107 46 73l23-4 17 22-10 20Zm52 0-3-22 15-16 25 10-5 31Z','#b4936d')+
  P('M48 81q22-11 30 18l-16-5-9 14m42-24q20-10 21 12','none','#ded2ac',6)+
  [[49,111],[98,111],[117,100],[78,120],[35,95]].map(([x,y])=>E(x,y,3,6,'#c4ad81')).join('')+
  flecks(12,37,105,81,17,'#8ca17c')},
 KZ:{name:'Baursak',draw:()=>plate()+
  [[36,111],[70,114],[111,112],[53,88],[91,87],[75,64]].map(([x,y],i)=>E(x,y,18,15,i%2?'#c4ad81':'#d1bf97')+P(`M${x-9} ${y-5}q9-6 18 0`,'none','#e4cb9a',3)).join('')},
 KW:{name:'Machboos',draw:machboos},
 KG:{name:'Boorsok',draw:()=>plate()+
  [[23,102],[56,108],[94,104],[45,79],[84,74],[64,54]].map(([x,y],i)=>P(`M${x} ${y}l24-5 10 17-25 9-11-6Z`,i%2?'#c4ad81':'#d1bf97')+P(`M${x+6} ${y+2}l15-3`,'none','#e6cf9c',3)).join('')},
 LB:{name:"Man'ouché",draw:()=>plate()+E(80,91,61,36,'#c4ad81')+E(80,91,51,27,'#98a27c')+
  flecks(38,38,71,87,38,'#627b61')+flecks(17,45,74,69,32,'#d1bf97')+
  P('M100 115q21-5 34-21l-8 33-33-4Z','#d1bf97')},
 OM:{name:'Harees',draw:harees},
 PS:{name:'Musakhan',draw:()=>plate()+E(80,99,64,36,'#c4ad81')+
  Array.from({length:12},(_,i)=>P(`M${30+i%4*27} ${82+Math.floor(i/4)*17}q-6-12 8-12 13 3 2 12`,'none','#a87c7b',3)).join('')+
  chicken(2,-22,.93)+flecks(18,43,73,71,42,'#947466')+E(47,118,3,5,'#d1bf97')+E(112,113,3,5,'#d1bf97')},
 QA:{name:'Machboos',draw:machboos},
 SA:{name:'Harees',draw:harees},
 SY:{name:'Kibbeh',draw:()=>plate()+
  [[41,100,-25],[80,73,10],[117,106,27]].map(([x,y,a])=>`<g transform="translate(${x} ${y}) rotate(${a})">`+
   P('M0-32Q-36 0 0 32 36 0 0-32Z','#b19370')+flecks(15,-10,-16,20,33,'#d1bf97')+'</g>').join('')+
  P('M60 129q21-21 40 0','none','#8ca17c',4)},
 TR:{name:'Simit',draw:()=>plate()+E(80,88,56,38,'#c4ad81')+E(80,88,32,18,'#d5d5b9')+
  Array.from({length:24},(_,i)=>{const a=i*Math.PI/12,x=80+45*Math.cos(a),y=88+29*Math.sin(a);return P(`M${x.toFixed(1)} ${y.toFixed(1)}l2-3`,'none','#f0d9a7',2);}).join('')+
  P('M39 67q-5 18 9 26m8-40q-9 12 0 19m45-17q-13 9-5 15m26-5q-18 6-15 17m13 15q-13-6-18 7m-5 14q-2-16-17-16m-20 13q7-15-8-21','none','#af9065',1.5)},
 AE:{name:'Harees',draw:harees},
 YE:{name:'Saltah',draw:()=>bowl(E(80,86,57,20,'#8ca17c')+
  Array.from({length:14},(_,i)=>E(37+i%5*19,76+Math.floor(i/5)*8,7,4,'#a2b48a','none')).join('')+
  P('M40 90q20-12 37 0t39-5','none','#c4ad81',3),'#778675')+
  P('M15 91H6v21h15m125-21h8v21h-14')},
};
