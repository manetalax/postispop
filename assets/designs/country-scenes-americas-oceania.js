// Original small vector studies of documented places. These are interpretive
// silhouettes, not architectural surveys or a complete portrait of a country.
// Heritage involving displacement, colonialism or sacred places retains the
// contextual notes in country-cultural-data; no invented rituals or lettering.
export {createAmericasFoods} from './country-foods-americas-oceania.js';

export function createAmericasLandmarks(h) {
  const {P,R,C,E,G,arch,windowRow,roof,waves,mountain}=h;
  const stone='#c4ad88', light='#dfd1ac', shade='#8c927a', green='#8da17d', darkGreen='#6f8c78', water='#91b6ac', clay='#b88c70';
  const ground=()=>P('M6 162q68-10 148 0','none',shade,1.5);
  const tree=(x,y,s=1)=>G(P('M0 0v-28m0 16-9-12m9 8 10-13','none',shade,2)+E(0,-35,15,20,green)+E(-11,-30,10,13,darkGreen)+E(12,-28,11,14,green),x,y,s);
  const palm=(x,y,s=1)=>G(P('M0 0q8-25 5-57','none',stone,4)+P('M5-57q-27-16-31 2 20-9 31-2m0 0q-9-32-22-24 19 9 22 24m0 0q16-29 29-16-21 2-29 16m0 0q29-7 29 9-17-12-29-9','none',darkGreen,3),x,y,s);
  const bird=(x,y,s=1)=>G(P('M-12 0Q-5-8 0 0 7-8 15-1','none',shade,1.8),x,y,s);
  const crenel=(x,y,n,step=12)=>P(`M${x} ${y}`+Array.from({length:n},()=>`v-5h${step/2}v5h${step/2}`).join(''));
  return {
    AG:{name:'Astillero naval de Antigua (Nelson’s Dockyard)',draw:()=>
      P('M4 136q49-7 77 1t74-2v28H4Z',water,'none')+
      R(8,74,93,59,stone)+roof(4,74,100,24,clay)+R(14,98,82,35,light)+
      [21,43,65,87].map(x=>P(`M${x} 96v37`,'none',shade,3)).join('')+P('M13 96h85M16 114h79')+
      windowRow(4,17,82,21,8,12)+R(111,114,36,7,stone)+
      P('M130 116V37m0 20-16 34h16m0-34 22 46h-22','none',shade,2)+
      P('M105 130h49l-8 12h-31Z',clay)+P('M7 153q27-5 57 0m36 4h48','none',shade,1.4)},
    BS:{name:'Escalinata de la Reina, Nassau',draw:()=>
      P('M6 155V35l21-16 21 4 10 128Zm99-3V28l26-14 23 21v120Z',stone)+
      P('M23 43v57m12-61-3 72m97-64-4 66m16-47v49','none',light,3)+
      P('M42 157 64 49h37l21 108Z',light)+
      Array.from({length:16},(_,i)=>{const y=57+i*6.2;return P(`M${62-i*1.2} ${y}h${40+i*2.4}`,'none',shade,1.7);}).join('')+
      P('M41 157 63 47m39 0 23 110','none',shade,3)+
      P('M5 34q9-23 24-15 3-17 22-7m59 13q14-23 32-12','none',darkGreen,5)+ground()},
    BB:{name:'Bridgetown y su guarnición histórica',draw:()=>
      R(11,102,138,44,clay)+P('M6 102 28 83h105l21 19Z',shade)+
      R(65,62,32,83,light)+P('M61 62 68 50h26l7 12Z',clay)+
      P('M66 50 81 19l15 31Z',shade)+R(77,10,7,14,light)+
      C(81,79,11,light)+P('M81 71v8l6 4')+arch(73,116,16,28)+
      [20,41,110,132].map(x=>arch(x,116,10,27)).join('')+
      P('M9 149h143M81 151v8m-63-7 36 7m89-7-36 7','none',shade,1.5)},
    BZ:{name:'Altun Ha',draw:()=>
      P('M4 150q11-28 29-24 28-27 55-8 43-20 67 31Z',green)+
      [0,1,2,3].map(i=>R(13+i*12,139-i*21,134-i*24,17,stone)).join('')+
      R(52,46,56,30,stone)+P('M46 46h68v-8H46Z',light)+R(69,52,19,24,shade)+
      P('M65 154 73 77h14l9 77Z',light)+Array.from({length:10},(_,i)=>P(`M${66+i*.8} ${148-i*7}h${29-i*1.5}`,'none',shade,1.4)).join('')+
      P('M24 127h29m54 0h29M37 105h22m44 0h20')+ground()},
    CU:{name:'Habana Vieja y sus fortificaciones',draw:()=>
      P('M5 127 21 91l45-13 23 13 58 10 7 40H5Z',stone)+
      P('M13 116 67 101l77 15M66 79v21m-49 37 50-18 84 17','none',shade,2)+
      P('M82 102 84 44h19l3 61Z',light)+E(94,45,14,5,stone)+R(86,30,17,14,light)+
      P('M81 30h26l-13-9Z',shade)+P('M94 21V12M91 48v24m7-24v24')+
      [29,52,121].map(x=>P(`M${x} 117v7h8v-7`,shade)).join('')+
      P('M7 147q37-11 71 0t77-1','none',water,4)+P('M10 159q22-6 43 0m35 1q25-7 62 0','none',shade,1.4)},
    DM:{name:'Parque nacional Morne Trois Pitons',draw:()=>
      mountain('M4 127 31 58l27 25 24-57 24 41 22-20 29 84Z')+
      P('M28 130q10-32 47-35 40-2 62 39l-42 19-51-3Z',stone)+
      E(80,134,46,14,water)+P('M48 133q24-7 62 1','none',light,3)+
      P('M71 115q-14-15-3-28m16 26q-9-17 4-29m11 34q14-10 5-22','none',light,3)+
      tree(18,157,.65)+tree(143,154,.7)+P('M34 157q37 9 91 0','none',shade,1.5)},
    DO:{name:'Ciudad Colonial de Santo Domingo',draw:()=>
      R(21,89,130,64,stone)+P('M16 88 38 67h44l20 21Z',light)+
      R(15,45,32,104,stone)+P('M12 45h38v-9H12Z',light)+
      arch(24,56,15,26)+arch(26,115,17,35)+R(20,33,22,6,shade)+
      R(63,93,51,58,light)+P('M58 94 87 70l31 24Z',stone)+arch(76,113,23,38)+
      C(87,101,6)+windowRow(2,125,108,13,6,23)+P('M6 157h148m-93 6h54','none',shade,1.7)},
    SV:{name:'Joya de Cerén',draw:()=>
      P('M7 119 68 76l86 31-47 50Z',light)+
      P('M16 116 64 84l68 24-31 29Z',stone)+
      P('M24 118V92l27-17 38 12v27l-13 8v-17l-17-6-19 13v15Z',clay)+
      P('M51 76v25m8-15 22 8M94 121V96l22 7v30l-18 10v-11l-13-4v13','none',shade,3)+
      P('M19 141 50 150l22-14m-48-1 33 12m63-35 27 6m-42 35 44-28','none',shade,1.3)+
      P('M9 72 75 30l76 40M20 66v63m117-65v67M74 32v45','none',shade,3)+
      P('M9 72 75 30l76 40-10 7-67-35-56 36Z',green)+ground()},
    GD:{name:'Fort George',draw:()=>
      P('M4 148 25 96l34-29 39 10 27 34 30 37Z',darkGreen)+
      P('M20 121V88l40-24 77 21v37l-51 21Z',stone)+
      P('M20 89 70 106l67-20M70 106v36M29 114l28 10m28-4 41-15','none',shade,2)+
      R(47,66,47,20,light)+P('M43 66 68 52l29 14Z',clay)+
      P('M81 89 117 82','none',shade,5)+C(86,94,5,shade)+
      P('M31 92v9m16-3v9m48-5v9m22-15v9')+
      P('M3 155q23-7 42-1m58 4 52-3','none',water,3)},
    GT:{name:'Parque Nacional Tikal',draw:()=>
      tree(17,150,.75)+tree(142,148,.8)+
      [0,1,2,3,4,5].map(i=>P(`M${25+i*6} ${144-i*14}h${111-i*12}v12H${25+i*6}Z`,stone)).join('')+
      R(61,40,39,21,stone)+P('M63 40V21h9V12h18v9h9v19Z',stone)+
      R(73,45,12,16,shade)+P('M63 157 75 64h11l13 93Z',light)+
      Array.from({length:11},(_,i)=>P(`M${64+i} ${153-i*8}h${34-i*2}`,'none',shade,1.3)).join('')+ground()},
    GY:{name:'Cataratas Kaieteur',draw:()=>
      P('M4 72 25 45l34 9 24-12 26 14 46-8v32l-39 3-18 19-27-5-26 47H4Z',darkGreen)+
      P('M5 88 46 80l35-12 32 12 40-3v78H5Z',stone)+
      P('M49 72h47l-5 25 3 53H40l14-53Z',water)+
      P('M58 80 53 139m15-60-1 64m14-62 4 62','none',light,4)+
      E(68,153,49,9,light,'none')+P('M15 161q54-14 134 0','none',water,3)+
      P('M10 99 38 91m70 1 28 3M12 125l17-7m79 3 37 6','none',shade,2)+bird(126,33,.65)},
    HT:{name:'Parque Histórico Nacional: Ciudadela, Sans Souci y Ramiers',draw:()=>
      mountain('M5 154 33 104l28-27 41 12 26 31 27 38Z')+
      P('M29 120V63l37-28 66 22v76l-63 16Z',stone)+
      P('M29 63 69 76l63-19M69 76v73M34 57l37-25 62 20v9L69 83 30 71Z',light)+
      P('M32 103 59 111m20-14 42-14m-44 34 44-16','none',shade,2)+
      [[39,82],[52,87],[83,81],[100,75],[117,69],[84,107],[104,100],[120,94]].map(([x,y])=>R(x,y,5,8,shade)).join('')+
      P('M22 148 68 161l72-17','none',shade,2)+ground()},
    HN:{name:'Sitio maya de Copán',draw:()=>
      [0,1,2].map(i=>R(12+i*10,145-i*14,137-i*20,12,stone)).join('')+
      P('M53 104V35l9-11h29l10 11v69Z',stone)+
      P('M60 41 68 32h16l9 9-4 16-8 8-13-8Z',light)+
      P('M67 44h7m7 0h7m-11 3v8m-7 3h15M62 68l15 8 17-9M63 78l14 7 16-7M62 89l16 7 15-8','none',shade,2)+
      P('M43 107h69v12H43Z',light)+R(113,58,25,63,stone)+roof(109,58,33,14,clay)+
      P('M74 123v29m10-29v29M16 163h139')+tree(23,109,.6)},
    JM:{name:'Montañas Blue y John Crow',draw:()=>
      P('M4 140 19 91l34-60 28 45 20-24 55 93Z',green)+
      P('M4 146 41 93l19 28 43-85 50 108Z',darkGreen)+
      P('M23 124q36-14 66-6t51-11M13 139q42-16 75-8t63-13','none',light,4)+
      P('M3 154q25-17 53-6 28-25 51-6 21-14 49 9Z',green)+
      tree(30,166,.7)+tree(127,165,.65)+bird(82,27,.7)},
    NI:{name:'Ruinas de León Viejo',draw:()=>
      mountain('M67 92 103 30l10-7 36 68Z')+
      P('M5 156V110l51-32 82 30v48Z',light)+
      P('M16 139V99l22-12 31 10v12l-30-8-12 7v30Zm23 8v-31l24-9 32 9v13l-31-10-14 8v18Zm60-2v-31l25 7v-17l17 6v44Z',clay)+
      P('M20 146 44 155l22-11 36 14 41-13M44 91v14m27 12v11m54 2v12','none',shade,2)+
      P('M5 164h151')},
    PA:{name:'Conjunto Monumental Histórico de Panamá Viejo',draw:()=>
      R(61,37,46,119,stone)+P('M57 37h54v-9H57Z',light)+
      P('M67 28V17h33v11M61 79h46M61 114h46')+
      arch(72,44,23,27)+arch(73,87,21,20)+arch(71,126,25,29)+
      P('M12 156v-39h32v10H25v29m88 0v-46h31v13h-16v33','none',stone,8)+
      P('M12 163h139M63 143h7m29-62h7m-43 28h8')+palm(31,111,.65)},
    PY:{name:'Misiones de La Santísima Trinidad de Paraná y Jesús de Tavarangue',draw:()=>
      P('M9 151V96h27V64h91v30h23v57Z',clay)+
      P('M36 65 81 29l46 35M53 62h58M62 63V48h38v15',stone)+
      arch(65,101,33,49)+[17,113,134].map(x=>arch(x,113,12,36)).join('')+
      C(82,80,10,light)+P('M43 75v69m14-50v52m51-52v52m14-72v20','none',light,3)+
      P('M4 158h153m-106 8h57M36 91h29m33 0h29','none',shade,1.8)},
    KN:{name:'Fortaleza de Brimstone Hill',draw:()=>
      P('M3 160 25 118l17-49 46-28 43 39 27 79Z',green)+
      P('M25 117 26 86l28-11 19 12 23-15 35 13 3 38-41 27-39-5Z',stone)+
      P('M27 86 55 100l18-13 19 14 39-16M54 100v44m39-43v48')+
      P('M43 86 61 58l42-4 22 28-31 12-20-10-16 8Z',light)+
      R(67,67,32,20,stone)+roof(63,66,40,13,shade)+
      [[33,109],[60,116],[102,113],[119,103]].map(([x,y])=>R(x,y,6,7,shade)).join('')+ground()},
    LC:{name:'Pitons',draw:()=>
      P('M4 145 22 111 41 41l13-17 17 75 24 46Z',darkGreen)+
      P('M70 147 92 92 106 39l13 21 21 64 16 25Z',green)+
      P('M42 48 34 108m21-57 9 57m43-64-8 57m20-32 11 44','none',light,1.3)+
      P('M4 145q62-17 150 0v16H4Z',water,'none')+
      P('M11 151q23-7 53 0m29 4q24-7 54 0','none',shade,1.5)+bird(81,40,.55)},
    VC:{name:'Fort Charlotte',draw:()=>
      P('M5 157 28 109l41-25 37 14 48 57Z',green)+
      P('M15 141 22 95l37-20 66 12 22 30-18 26-41-7-24 16Z',stone)+
      P('M22 96 62 107l23-9 54 16M63 107v44m24-53v37')+
      P('M21 93 60 72l66 12-1 9-65-12-35 20Z',light)+
      arch(101,113,14,26)+P('M35 118h9m30-4h8M7 164q63-10 145-2','none',shade,2)+
      P('M47 91 28 84m62 6 19-9','none',shade,4)+C(45,97,4,shade)+C(89,96,4,shade)},
    TT:{name:'Lago de asfalto de La Brea (Pitch Lake)',draw:()=>
      P('M5 143V70q20-16 46-4 28-18 55-1 25-14 49 4v74Z',green)+
      P('M6 151 17 103l39-18 51 4 44 23-5 40Z',shade)+
      P('M18 111 47 104l15 19-23 17-24-5Zm48-14 39 1 5 19-37 4Zm51 12 25 8-7 26-23-18ZM51 145l17-15 35 2 16 20Z','#777e70')+
      E(86,109,18,5,water,'none')+P('M35 124q13-5 21 0m63 10 18 7','none',water,3)+
      P('M17 156 48 147l20 11 31-12 44 11','none',light,1.4)+palm(30,100,.62)+palm(130,95,.5)},
    UY:{name:'Barrio histórico de Colonia del Sacramento',draw:()=>
      R(17,102,45,40,stone)+roof(12,102,55,22,clay)+R(105,114,39,31,light)+roof(101,114,47,18,clay)+
      R(70,83,29,62,stone)+P('M74 82V37h20v45Z',light)+E(84,37,13,5,shade)+
      R(77,23,15,14,light)+P('M74 23h21l-11-9Z',shade)+
      arch(28,120,14,22)+arch(79,120,13,25)+R(115,124,9,17,shade)+
      P('M59 145 41 169m55-24 20 23M61 157h40m-48 8h57M24 146l9 12m94-8 9 8','none',shade,1.4)},
    VE:{name:'Parque nacional Canaima',draw:()=>
      P('M4 139 20 88l7-50 68 1 18 66 41 34Z',clay)+
      P('M26 38 91 31l13 12-74 8Z',green)+
      P('M47 55v72m17-74 8 39m20-43 8 57M15 111l18-12','none',stone,3)+
      P('M74 47h9l-3 40 7 55-15 8 4-49Z',water,'none')+P('M79 56v38l4 35','none',light,3)+
      P('M4 151q25-32 49-16 20-20 40-5 31-19 62 20Z',darkGreen)+
      P('M76 148q-9 13 7 19','none',water,5)+ground()},
    SR:{name:'Reserva Natural de Surinam Central',draw:()=>
      P('M28 134Q22 50 73 31q42-11 57 98Z',stone)+
      P('M39 123Q39 61 72 38','none',light,3)+
      P('M88 42q25 32 30 72m-38-62 7 59','none',shade,1.5)+
      P('M3 140q12-35 32-21 17-35 39-13 14-15 35-1 31-12 47 34v20H3Z',darkGreen)+
      tree(25,165,.75)+tree(63,163,.52)+tree(136,166,.7)+
      P('M97 127q-29 8-8 21 25 7 9 22','none',water,5)+bird(30,40,.65)},
    FJ:{name:'Ciudad portuaria histórica de Levuka',draw:()=>
      P('M4 122V61l27-31 31 42 22-22 29 38 18-9 25 45Z',green)+
      [[10,98,37],[49,85,46],[101,104,42]].map(([x,y,w],i)=>R(x,y,w,43,light)+roof(x-3,y,w+6,15,i===1?shade:clay)+
        P(`M${x+3} ${y+19}h${w-6}m-${w-7} 0v23m${w/2-4}-23v23m${w/2-4}-23v23`,'none',shade,2)).join('')+
      R(64,64,17,22,stone)+P('M61 64 72 49l12 15Z',clay)+
      P('M5 145h151M7 153q34-9 64 0t83 0','none',water,3)+palm(132,105,.68)},
    KI:{name:'Área protegida de las Islas Fénix',draw:()=>
      [[37,76,.64],[118,62,.62],[95,130,.85]].map(([x,y,s])=>G(
        P('M-40 10q-8-36 23-48 36-16 56 16l-7 27-34 18-31-13Z',water,'none')+
        P('M-36 8q-7-31 23-40 28-12 48 13l-7 4q-17-21-39-11-21 6-19 30Z',light)+
        P('M-32 5q-4-25 21-33 24-10 42 10','none',green,4)+
        P('M-27 17 0 27l25-17 5 5L0 35l-31-12Z',light)+P('M-20 1h31','none',light,2),x,y,s)).join('')+
      bird(43,29,.8)+bird(132,23,.55)+P('M8 148h35m-20 11h31','none',water,2)+ground()},
    MH:{name:'Atolón Bikini',draw:()=>
      P('M13 102q9-51 64-60 48-4 68 43l-11 29-21 25-58 12-33-16Z',water,'none')+
      P('M16 100q6-44 57-55 47-5 70 37l-11 2q-25-35-57-28-39 8-48 40Z',light)+
      P('M23 97q7-39 51-46 39-7 62 28','none',green,5)+
      P('M142 96q-7 35-34 46l-45 13-5-9 46-13 27-40Z',light)+
      P('M23 111 35 132l-7 6-15-20Z',light)+
      P('M51 96q33-17 60-2M46 113q34-11 61-2','none',light,1.5)+
      P('M29 162h106','none',shade,1.3)},
    FM:{name:'Nan Madol',draw:()=>
      P('M6 150V88l30-23 112 15v70Z',darkGreen)+
      [0,1,2,3,4].map(i=>P(`M${12+i%2*3} ${143-i*15}h${136-i%2*6}v11H${12+i%2*3}Z`,shade)+
        P(`M${17+i%2*3} ${146-i*15}h${126-i%2*6}`,'none',stone,2)).join('')+
      P('M36 141V83h52v59Z',darkGreen)+
      [0,1,2,3,4].map(i=>E(20,138-i*15,7,5,stone)+E(137,138-i*15,7,5,stone)).join('')+
      P('M34 81h57v12H34Z',stone)+P('M7 156q26-8 54 0t88-1','none',water,4)+
      P('M17 167q31-6 58 0m27-3h39','none',shade,1.4)},
    NR:{name:'Laguna Buada',draw:()=>
      P('M4 114V69q27-34 58-10 30-26 55-4 17-9 39 17v48Z',green)+
      P('M6 116q28-39 74-29 45-10 73 28l-22 32-51 12-54-15Z',stone)+
      E(81,119,60,29,water)+P('M35 112q40-15 89 1m-82 18q34-9 75 0','none',light,2)+
      palm(22,133,.9)+palm(140,139,.83)+tree(55,93,.55)+
      P('M8 160q36-10 58-2m32-1 47 3','none',shade,1.5)},
    PW:{name:'Laguna meridional de las Islas Rocosas',draw:()=>
      P('M4 94q62-24 152 0v66H4Z',water,'none')+
      [[28,115,.7],[78,102,1],[127,132,.75]].map(([x,y,s])=>G(
        P('M-20 0q4-16 3-25h35l2 25Z',stone)+
        P('M-31-22q-4-35 29-39 35-1 34 39-28 13-63 0Z',darkGreen)+
        P('M-22-28q4-22 22-24 21 1 24 22','none',green,4)+
        P('M-13-4q12 5 26 0','none',shade,1.5),x,y,s)).join('')+
      P('M7 143q20-5 46 0m19 8q24-8 49-2M114 95h29','none',light,2)+bird(125,32,.6)},
    PG:{name:'Sitio agrícola temprano de Kuk',draw:()=>
      P('M4 99 33 57l19 15 34-42 39 43 30 23v28H4Z',green)+
      P('M5 157V104l70-22 80 25v49Z',darkGreen)+
      P('M14 149 44 104l23-7-23 57ZM55 155 80 93l21 7-16 56Z',light)+
      P('M98 157 112 104l24 7 8 42Z',stone)+
      P('M11 121 149 133M7 143 150 149','none',water,3)+
      [[27,115],[60,130],[88,114],[120,141]].map(([x,y])=>P(`M${x} ${y}v-16m0 9q-12-15-15-7 1 8 15 7m0-3q10-15 14-8-1 7-14 8`,'none',green,3)).join('')+ground()},
    WS:{name:'Museo Robert Louis Stevenson, Vailima',draw:()=>
      P('M5 150V90q31-57 67-21 41-28 83 18v63Z',green)+
      R(21,76,123,76,light)+P('M13 77 38 49h88l25 28Z',shade)+
      P('M18 111h128M24 143h117M27 104h111','none',stone,4)+
      [29,51,74,97,135].map(x=>P(`M${x} 78v73`,'none',light,4)+P(`M${x+2} 79v71`,'none',shade,1.2)).join('')+
      [37,62,86,110].map(x=>R(x,84,11,17,shade)+R(x,119,11,19,shade)).join('')+
      P('M69 152v8h33v-8m-37 11h42','none',stone,3)+palm(11,139,.68)+ground()},
    SB:{name:'Rennell Oriental',draw:()=>
      P('M4 151V77q22-22 45-10 28-27 53-10 26-17 53 9v85Z',green)+
      P('M14 126q-7-43 38-42 41-21 87 9l6 35-52 30-50-7Z',water)+
      [[50,119,1],[105,103,.68],[117,139,.58]].map(([x,y,s])=>G(
        P('M-16 0-13-20 9-28l14 11-6 18Z',stone)+P('M-20-18q1-20 19-16 18-10 26 11-22 8-45 5Z',darkGreen),x,y,s)).join('')+
      P('M23 135q24-6 43 2m12 9 25-2M63 104h20','none',light,2)+tree(25,108,.68)+tree(142,103,.55)},
    TO:{name:'Trilito Ha‘amonga ‘a Maui, Tongatapu',draw:()=>
      P('M5 157q75-31 150 0Z',green)+
      P('M32 150 37 56l28-5 1 99Zm66 0-3-97 29 5 7 92Z',stone)+
      P('M26 51 131 48l5 22-111 1Z',light)+P('M36 71h28m32 0h29M53 58V49m57 1v12')+
      P('M42 83v48m13-49 1 53m49-57 7 54m7-45 3 53','none',shade,1.4)+
      P('M6 165h148')+tree(143,130,.55)},
    TV:{name:'Área de conservación marina de Funafuti',draw:()=>
      P('M5 93q76-28 150 0v67H5Z',water,'none')+
      P('M6 82q36-27 72-16 36-13 77 10l-3 9q-38-19-73-8-37-10-67 17Z',light)+
      P('M13 83q30-19 64-11 39-10 70 6','none',green,5)+
      palm(31,77,.54)+
      P('M22 151v-31m0 11-9-10m9 19 12-11m87 20v-31m0 10-12-9m12 17 13-10','none',clay,4)+
      P('M52 112q14-13 27 0l11-6v13l-11-6q-13 15-27 0Z',light)+C(57,112,1.5,shade)+
      P('M67 141q8-9 17 0l8-4v9l-8-4q-8 10-17-1Z',stone)+
      P('M8 160q21-8 47-1m43 1h49','none',shade,1.4)},
    VU:{name:'Dominio del jefe Roi Mata',draw:()=>
      P('M5 131 16 77l20-36 27-4 20 33-3 61Z',stone)+
      P('M20 131V97q0-31 23-33 21 3 21 34v33Z',shade)+
      P('M12 72q4-36 26-40 25-9 40 28','none',green,6)+
      P('M79 141 92 119l10-43 15-21 13 26 10 36 16 22Z',darkGreen)+
      P('M94 142h61m-80 3q-31-12-68 2','none',light,3)+
      P('M5 154q38-8 72 0t77 0M16 165h31m59 0h38','none',water,3)+
      P('M28 90q9-10 19-2m-13 27 8-11','none',stone,1.5)},
  };
}
