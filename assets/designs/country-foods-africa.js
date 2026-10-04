// Original PostisPop food studies, paired by exact name with the sourced catalogue.
// Serving arrangements are illustrative examples, not universal national recipes.
// Related preparations retain their visual relationship across borders.
const P=(d,fill='none',stroke='currentColor',w=1.7)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const C=(x,y,r,fill='none',stroke='currentColor')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
const E=(x,y,rx,ry,fill='none',stroke='currentColor')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
const R=(x,y,w,h,fill='none',rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="currentColor" stroke-width="1.7"/>`;
const G=(s,x=0,y=0,z=1)=>`<g transform="translate(${x} ${y}) scale(${z})">${s}</g>`;
const cream='#d5c391',brown='#b28e6d',green='#8ba17b',dark='#71816c',light='#e2d6b5',red='#aa7d68';
const plate=(y=119)=>E(80,y,71,28,'#acb49a')+E(80,y-3,62,22,'#ccd0b2');
const flecks=(n,x,y,w,h,col=brown)=>Array.from({length:n},(_,i)=>P(`M${x+i*17%w} ${y+i*11%h}l2 1`,'none',col,1.3)).join('');
const grains=(n,x,y,w,h,col=light)=>Array.from({length:n},(_,i)=>{
  const dx=i*19%w,dy=i*13%h;
  return (dx/w*2-1)**2+(dy/h*2-1)**2<.96?P(`M${x+dx} ${y+dy}l3-1.5`,'none',col,1.8):'';
}).join('');
const bowl=(contents,col='#aab79d')=>P('M18 85q7 52 62 56 55-4 62-56Z',col)+E(80,85,62,25,col)+contents+P('M54 137h52');
const ovalStew=(col=green)=>E(80,84,55,18,col);
const mound=(x,y,s=1,col=light)=>G(P('M-29 0q-3-46 29-49Q33-45 32 0q-29 16-61 0Z',col)+P('M-18-28q7-12 17-12','none','#efe1bc',2.8),x,y,s);
const leaf=(x,y,s=1,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`+P('M0 10Q-20-2-2-18 19-8 0 10Z',green)+P('M0 8V-10m0 10-7-6m7 0 6-6','none',dark,1.3)+'</g>';
const chopped=(n,x,y,w,h)=>Array.from({length:n},(_,i)=>P(`M${x+i*19%w} ${y+i*13%h}q5-5 8 0l-4 4Z`,i%3?green:dark,'none')).join('');
const bean=(x,y,s=1)=>G(P('M-7 0q-3-8 4-10 11 0 10 10-2 9-10 9-6-1-4-9Z',brown)+P('M0-5q-4 5 1 9','none','#d2b490',1.2),x,y,s);
const meat=(x,y,s=1)=>G(P('M-13-8 1-16 17-4l-4 22-24 2-8-13Z',brown)+P('M-10-5 8 8m-8-19 11 8','none','#876a53',2),x,y,s);
const fish=(x,y,s=1)=>G(P('M-37 0q31-28 61 0-30 29-61 0Z','#bdb89b')+P('M23 0 42-17v34Z',brown)+C(-23,-2,2,'currentColor')+P('M-14-13q12 12 0 27M0-10l8 10-8 11'),x,y,s);
const chicken=(x,y,s=1)=>G(P('M-21-4q-5-27 20-29 24-2 29 20l-10 23-20 12-23-10Z',brown)+P('M18 8l20 19-7 8-21-19Z',light)+C(38,32,6,light)+C(31,37,5,light)+P('M-18-10q17-12 31 0m-31 9q14-10 22-2','none','#896c52',2.7),x,y,s);
const rice=(x=80,y=105,s=1,col=cream)=>G(P('M-42 5q1-39 41-40 37 0 42 40Z',col)+grains(32,-34,-25,68,28),x,y,s);
const bread=(x,y,s=1)=>G(E(0,0,50,29,cream)+E(0,-2,43,23,'#cbb58a')+flecks(30,-34,-17,68,32,'#9b8768'),x,y,s);
const roll=(x,y,s=1,col=cream)=>G(P('M-30-11 18-30q19-6 23 8l-4 21-46 21Z',col)+E(-14,13,16,11,light)+P('M-22 12q9-12 18-1-7 13-17 4','none',brown,2)+P('M-18-7 24-23','none','#eddfb6',2),x,y,s);
const spoon=(x=132,y=104)=>P(`M${x} ${y}l15-49`,'none',brown,5)+E(x+17,y-59,5,12,cream);
const greensSide=()=>E(119,114,24,12,green)+chopped(12,102,104,30,17);
const injera=()=>plate()+bread(79,97,1.2)+roll(47,124,.75)+roll(82,121,.75)+roll(116,117,.75)+
  E(61,75,19,10,green)+chopped(8,47,69,24,11)+E(99,81,17,11,red)+meat(100,78,.55);
const kisra=()=>plate()+P('M25 104 91 65l45 40-66 32Z',cream)+P('M25 111 70 143l65-32v-7l-65 33-45-33Z',brown)+
  P('M32 108 92 76m-51 39 60-32m-49 39 59-31','none','#e3d3a7',2)+flecks(23,51,94,50,25);

export const africanFoods={
  AO:{name:'Funge',draw:()=>plate()+mound(72,113,1.25)+P('M43 103q22 17 51 1','none','#c5b391',2)+E(127,119,18,12,red)+P('M121 115l10 4')},
  BJ:{name:'Amiwô',draw:()=>plate()+mound(71,117,1.16,red)+P('M47 102q16-16 40-3','none','#c59773',3)+chicken(120,100,.5)+P('M28 127h31','none',green,4)},
  BW:{name:'Seswaa',draw:()=>plate()+mound(42,117,.72)+E(100,111,41,22,brown)+
    Array.from({length:22},(_,i)=>P(`M${70+i*11%62} ${97+i*7%29}l${9+i%5}-${4+i%3}`,'none',i%2?'#816951':'#d4b38c',2.4)).join('')},
  BF:{name:'Tô',draw:()=>plate()+mound(56,117,.88)+mound(93,121,.75)+G(bowl(ovalStew(green)+chopped(10,44,78,70,15)),82,67,.43)},
  BI:{name:'Ibiharage',draw:()=>plate()+E(80,105,55,24,brown)+
    [[39,105],[56,91],[77,108],[99,93],[121,108],[61,118],[104,120],[78,88]].map(([x,y])=>bean(x,y,.85)).join('')+
    P('M34 117q12 13 23 10m44-24q13-12 24-7','none',green,2.5)},
  CV:{name:'Cachupa',draw:()=>bowl(ovalStew(brown)+
    [[41,77],[80,75],[111,82],[70,95]].map(([x,y])=>bean(x,y,.6)).join('')+
    [[55,87],[95,92],[99,72],[48,93],[124,89]].map(([x,y])=>E(x,y,4,3,cream)).join('')+
    P('M62 71l12 7-6 8-11-8Z',green)+P('M105 93l13-4 5 9-14 3Z',red))+spoon()},
  CM:{name:'Ndolé',draw:()=>plate()+E(81,108,57,26,green)+chopped(28,32,88,95,39)+
    P('M49 108q-12-20 7-22 19 8 3 22l-5-8','none',brown,6)+P('M89 124q-12-20 7-22 19 8 3 22l-5-8','none',brown,6)+meat(113,101,.65)},
  CF:{name:'Kanda ti nyma',draw:()=>plate()+E(80,112,58,25,red)+
    [[43,107],[78,96],[113,107],[74,125]].map(([x,y])=>C(x,y,16,brown)+flecks(9,x-10,y-9,21,18,'#856b52')).join('')+
    P('M32 122q18 7 28-1m41-32 14 2','none',green,3)},
  TD:{name:'Boule',draw:()=>plate()+mound(76,117,1.31,cream)+P('M43 121q35 21 69-1')+
    G(bowl(ovalStew(red)+meat(70,82,.55)),83,77,.4)},
  // Cake equivalence/ingredients: Marmiton, 8 March 2026; UNESCO verifies the name.
  KM:{name:'Mkatre wa djungu',draw:()=>plate()+P('M26 87q52-35 108 0v27q-52 37-108 0Z',brown)+
    E(80,86,54,24,'#a98463')+P('M81 87 130 98l-28 17-21-8Z',cream)+
    P('M81 87v20m21 8v22l28-18V98M102 137l-21-14v-16Z','#c3a37b')+flecks(20,42,76,71,18,'#715d49')},
  CG:{name:'Saka-saka',draw:()=>plate()+E(83,110,58,25,dark)+chopped(31,33,91,97,33)+
    P('M39 112q33-29 70-7M54 129q31-28 72-10','none',green,4)+mound(35,105,.47)},
  CD:{name:'Pondu',draw:()=>bowl(ovalStew(dark)+chopped(25,31,73,95,25)+
    P('M44 84q26-13 50-1t34 0','none',green,3)+P('M34 91l16-4m57-9 16 7','none',brown,4))+mound(30,144,.39)},
  CI:{name:'Attiéké',draw:()=>plate()+rice(63,111,.91,cream)+flecks(50,29,83,68,31,'#b7a172')+
    fish(112,118,.51)+C(119,80,10,red)+C(139,97,8,green)+P('M119 72v16m-8-8h16','none',light,1.4)},
  DJ:{name:'Lahoh',draw:()=>plate()+bread(80,115,1.13)+bread(78,106,1.07)+bread(78,96,1.03)+
    P('M30 94q8-28 45-26l-9 52Z',light)+flecks(16,38,81,27,22)},
  GQ:{name:'Pepesup',draw:()=>bowl(ovalStew(brown)+fish(83,85,.66)+
    P('M35 86q-3-13 8-16m61 20q15-4 22 5','none',green,3)+C(114,70,5,red))+
    P('M18 96H7v17h19m116-17h10v17h-18')},
  ER:{name:'Injera',draw:injera},
  SZ:{name:'Pap',draw:()=>plate()+mound(64,114,1.18)+meat(124,110,.75)+P('M36 120q25 13 49 0','none','#baaa86',2)+greensSide()},
  GA:{name:'Nyembwe',draw:()=>bowl(ovalStew('#b29265')+chicken(76,78,.78)+
    P('M37 89q8-9 17-3m45 8q14-10 24-4','none',green,3))},
  GM:{name:'Domoda',draw:()=>plate()+rice(42,119,.6)+E(105,107,41,26,brown)+
    meat(90,101,.6)+meat(114,115,.6)+R(120,94,13,9,red,2)+P('M80 120l11 6m12-38 12 5','none',cream,3)},
  GH:{name:'Banku con salsa de okra',draw:()=>plate()+mound(52,118,.99)+E(111,116,32,19,dark)+
    [[96,112],[118,107],[129,121],[104,128]].map(([x,y])=>P(`M${x-6} ${y}l3-6 7 1 3 6-6 5Z`,green)+C(x,y,1.5,cream,'none')).join('')},
  GN:{name:'Konkoé',draw:()=>bowl(ovalStew(red)+fish(78,84,.67)+
    P('M37 75h14v8H37Zm63 14h15v10h-15Z',cream)+chopped(8,46,77,80,20))+spoon(130,115)},
  GW:{name:'Caldo de mancarra',draw:()=>bowl(ovalStew(brown)+chicken(76,79,.7)+
    P('M38 88q18-10 29 2m29 4q14-10 27-2','none',cream,4))+
    G(rice(0,0,.45),28,141)},
  LS:{name:'Motoho',draw:()=>P('M33 58h90l-7 77q-35 18-76 0Z',brown)+E(78,59,45,17,'#af8d79')+
    E(78,58,36,11,'#b89884')+P('M51 58q22-13 52 0m-46 4q20 8 36-1','none','#d4bca1',2.5)+
    P('M124 74h11q20 20-15 30M62 36q-10-9 0-19m28 19q-10-9 0-19')},
  LR:{name:'Dumboy',draw:()=>plate()+mound(57,121,.91)+mound(108,117,.76)+
    P('M35 104q17-13 29-6m30 7q12-11 23-6','none','#bca784',2.1)+E(80,140,17,6,red)},
  LY:{name:'Bazin',draw:()=>plate()+E(80,111,59,27,red)+mound(80,103,1.02,cream)+
    [[30,113],[127,109]].map(([x,y])=>E(x,y,12,15,light)+E(x,y,6,8,cream)).join('')+
    meat(54,129,.61)+meat(110,131,.55)},
  MG:{name:'Romazava',draw:()=>bowl(ovalStew(brown)+meat(52,82,.64)+meat(95,78,.58)+
    leaf(78,86,.65,30)+leaf(116,89,.61,-30)+leaf(42,94,.55,-20))+P('M34 85l14 3m41 2 14 3','none',green,3)},
  MW:{name:'Nsima',draw:()=>plate()+[49,83,115].map((x,i)=>G(P('M-19 0q-15-24 9-34 26-3 28 22L7 10Z',light)+
    P('M-15-12q11-9 24-6','none','#c3af88',2),x,119-i%2*14)).join('')},
  ML:{name:'Tigadeguena',draw:()=>bowl(ovalStew(brown)+[[47,85],[78,76],[110,88]].map(([x,y])=>meat(x,y,.65)).join('')+
    P('M46 97q21-11 40 0m8-15q15-6 29 2','none',cream,3))+spoon(131,118)},
  MU:{name:'Dholl puri',draw:()=>plate()+P('M22 111q-7-55 49-62 50-3 62 31l-65 44Z',cream)+
    P('M24 110 68 124l65-44v10l-65 43-44-16Z',brown)+P('M52 127q-4-37 34-43l39 34-46 22Z',cream)+
    flecks(25,39,73,65,35,'#a28a66')+P('M73 126q15-14 31-5','none',green,3)},
  MZ:{name:'Matapa',draw:()=>plate()+E(99,111,46,28,green)+chopped(21,60,93,74,34)+rice(35,116,.54)+
    P('M108 113q-13-13-2-22 18-5 19 10-1 10-9 8','none',brown,5)+flecks(14,81,97,37,22,cream)},
  NA:{name:'Kapana',draw:()=>P('M14 81h133l-11 62H27Z','#758574')+P('M13 81h135v9H13Z',brown)+
    [31,50,69,88,107,126].map(x=>P(`M${x} 89l-6 42`,'none','#d4c5a0',2)).join('')+
    [[39,70],[71,81],[109,66],[118,105],[53,111]].map(([x,y],i)=>G(meat(0,0,.79),x,y)).join('')+
    P('M25 144v10m108-10v10M36 46q-8-9 0-19m53 15q-8-9 0-19')},
  NE:{name:'Dambou',draw:()=>plate()+rice(80,111,1.17,green)+grains(42,36,80,84,38,cream)+
    chopped(17,36,88,84,30)+leaf(127,72,.69,25)},
  NG:{name:'Arroz jollof nigeriano',draw:()=>plate()+rice(80,111,1.24,red)+grains(37,39,86,80,30,'#ceaa7a')+
    P('M36 100q22-12 39-3m14 11q17-12 36-3','none','#a1795b',2.4)+C(125,120,10,red)+P('M118 120h13','none',cream,1.6)},
  RW:{name:'Isombe',draw:()=>plate()+E(73,114,55,25,green)+chopped(30,28,96,90,32)+
    flecks(21,36,102,72,21,cream)+mound(123,109,.55)+P('M40 115q27-14 49-1','none',dark,3)},
  ST:{name:'Calulu',draw:()=>bowl(ovalStew(green)+fish(78,86,.67)+
    P('M45 79l8-11 9 8-10 8Z',red)+P('M107 78l9-9 10 10-10 7Z',red)+
    leaf(98,94,.6,35)+P('M35 88l10 6','none',cream,3))},
  SC:{name:'Ladob',draw:()=>bowl(ovalStew(light)+
    [[45,83],[73,75],[104,90]].map(([x,y],i)=>P(`M${x-10} ${y-5}q11-10 22 2l-2 9-23-3Z`,cream)+P(`M${x-3} ${y-4}l7 10`,'none',brown,1.2)).join('')+
    P('M34 90q17 8 35 1m12-9q21-8 42 1','none','#f0e5c4',2.5))+spoon()},
  SL:{name:'Guiso de hojas de yuca',draw:()=>bowl(ovalStew(dark)+chopped(27,32,72,97,29)+
    fish(89,86,.45)+P('M36 86l21 7m31-17 14 3','none',green,3))+G(rice(0,0,.45),35,140)},
  SO:{name:'Canjeero',draw:()=>plate()+bread(83,115,1.12)+bread(76,103,1.05)+
    P('M35 99q-5-39 49-29 16 2 31 14L53 116Z',light)+flecks(25,44,77,56,30)},
  SS:{name:'Kisra',draw:kisra},
  SD:{name:'Kisra',draw:kisra},
  TG:{name:'Fufu togolés',draw:()=>plate()+mound(54,115,.95)+mound(105,119,.86)+
    P('M38 112q9-6 18-4m37 7q12-6 21-4','none','#c1ab85',2)+E(81,141,24,6,red)},
  UG:{name:'Rolex',draw:()=>plate()+P('M27 106 101 59q20-10 29 9 10 17-5 28l-69 42Z',cream)+
    P('M37 101 111 61m-60 55 74-44','none',brown,3)+E(44,122,20,16,light)+
    E(43,121,13,10,cream)+P('M34 119q9-13 18 1l-6 9Z',green)+P('M33 126l17-8','none',red,4)+
    P('M57 121q34-11 70-31','none','#ead8aa',2)},
  ZM:{name:'Nshima',draw:()=>plate()+mound(66,115,1.15)+G(P('M-18 0q-7-24 10-29 22-2 22 19L8 8Z',light),113,125)+
    P('M44 97q22-16 40-1','none','#beac88',2)},
  ZW:{name:'Sadza',draw:()=>plate()+mound(65,115,1.18,cream)+flecks(28,40,79,47,34,'#b29b76')+
    greensSide()+P('M33 121q20 10 44 0','none','#a99471',1.7)},
  ZA:{name:'Bobotie',draw:()=>P('M20 72h119v65H20Z',brown)+R(13,78,7,41,'#b5ba9d',3)+R(139,78,8,41,'#b5ba9d',3)+
    P('M20 72 39 52h119l-19 20Z',cream)+P('M139 72 158 52v64l-19 21Z','#9d8060')+
    P('M20 90h119','none',cream,11)+flecks(37,28,107,98,24,'#7b6853')+
    leaf(77,61,.53,-65)+leaf(111,64,.52,60)+P('M21 137h119')},
  KE:{name:'Ugali con sukuma wiki',draw:()=>plate()+mound(54,118,1.01)+E(114,117,33,20,green)+
    Array.from({length:12},(_,i)=>P(`M${88+i*11%46} ${106+i*7%21}q8-9 16-2`,'none',dark,2.7)).join('')},
  TZ:{name:'Ugali',draw:()=>plate()+P('M35 118 44 65q33-11 69 0l18 53q-41 25-96 0Z',light)+
    E(78,65,34,10,'#d9cdaa')+P('M44 79q34 17 71-1m-73 15q33 13 77 0','none','#c2b38d',1.8)},
  ET:{name:'Injera',draw:injera},
};
