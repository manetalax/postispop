import {countryOutlines} from './country-outlines.js';
import {countryCulturalData} from './country-cultural-data.js';
import {createAsiaLandmarks,createAsiaFoods} from './country-scenes-asia.js';
import {middleEastLandmarks} from './country-scenes-middleeast.js';
import {createAfricaLandmarks} from './country-scenes-africa.js';
import {middleEastFoods} from './country-foods-middleeast.js';
import {europeanFoods} from './country-foods-europe.js';
import {africanFoods} from './country-foods-africa.js';
import {createEuropeLandmarks,createEuropeFoods} from './country-scenes-europe-extra.js';
import {createAmericasLandmarks,createAmericasFoods} from './country-scenes-americas-oceania.js';

// Original vector studies, drawn for PostisPop. They are examples of places and
// dishes, never a claim that one image describes an entire population.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const P=(d,fill='none',stroke='currentColor',w=2)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const R=(x,y,w,h,fill='none',stroke='currentColor',rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const C=(x,y,r,fill='none',stroke='currentColor')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const E=(x,y,rx,ry,fill='none',stroke='currentColor')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const G=(svg,x=0,y=0,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
const arch=(x,y,w=12,h=22)=>P(`M${x} ${y+h}V${y+w/2}a${w/2} ${w/2} 0 0 1 ${w} 0v${h-w/2}`);
const windowRow=(count,x,y,step=18,w=8,h=16)=>Array.from({length:count},(_,i)=>arch(x+i*step,y,w,h)).join('');
const roof=(x,y,w,h=14,fill='#d29370')=>P(`M${x} ${y}l${w/2}-${h} ${w/2} ${h}Z`,fill);
const waves=(y=134)=>[0,9,18].map(n=>P(`M8 ${y+n}q18-8 36 0t36 0 36 0 36 0`,'none','currentColor',1.3)).join('');
const mountain=(d,snow)=>P(d,'#668782')+(snow?P(snow,'#e7e9d7'): '');
const dome=(x,y,r)=>P(`M${x-r} ${y}q0-${r*1.55} ${r}-${r*1.8} ${r} ${r*.25} ${r} ${r*1.8}Z`,'#a6b694')+P(`M${x} ${y-r*1.8}v-10`);
const mill=(x,y,s=1)=>G(P('M-8 0h16l4 48H-12Z','#c4ad81')+P('M0 2v-32m0 32h32M0 2v32M0 2h-32')+P('M4-28h9V-2H4ZM4 6h26v9H4ZM-4 7v24h-9V7ZM-7-2h-24v-9h24Z','#c0c8ae')+C(0,2,3,'#d6b784'),x,y,s);
const drawingHelpers={P,R,C,E,G,arch,windowRow,roof,waves,mountain,dome};
const extraLandmarks={...createAsiaLandmarks(drawingHelpers),...middleEastLandmarks,...createAfricaLandmarks(drawingHelpers),...createEuropeLandmarks(drawingHelpers),...createAmericasLandmarks(drawingHelpers)},extraFoods={...createAsiaFoods(drawingHelpers),...middleEastFoods,...europeanFoods,...africanFoods,...createEuropeFoods(drawingHelpers),...createAmericasFoods(drawingHelpers)};

const landmarks={
  alhambra:()=>P('M8 134h144V76h-20V51h-27V68H68V43H36v34H8Z','#c79774')+P('M8 76h16m12-33h7v-7h10v7h8v-7h7m37 15h7v-7h11v7h9')+windowRow(3,42,82,31,12,27)+P('M14 144h132M45 134v-20h70v20')+E(80,147,35,5,'#83aaa6')+P('M80 143v-15m-8 9q8-12 16 0'),
  colosseum:()=>P('M13 126V68q50-45 133-16v74q-53 31-133 0Z','#c7af8d')+P('M13 68q61 28 133-16M13 89q57 27 133-17M13 110q56 27 133-19M20 59V43l28-13 2 26')+windowRow(7,20,76,18,9,15)+windowRow(7,20,100,18,9,15)+windowRow(4,59,48,20,9,13)+P('M9 136q73 32 142-6'),
  montsaintmichel:()=>P('M5 139 31 119l17-37 17-9 7-36 11-23 6 43 10 10 9 36 22 14 25 22Z','#94a492')+P('M35 121V92h24V75h49v29h22v28Z','#bfaf91')+R(70,57,22,58,'#c9b894')+P('M69 57 81 35l13 22ZM81 35V10M42 106h13m43 10h18')+windowRow(4,48,112,17,7,15)+waves(141),
  fuji:()=>mountain('M4 129 68 49l17-16 23 44 48 54Z','M51 71 68 49l17-16 23 44-19-9-10 13-10-13Z')+P('M5 132q49-18 81 0t68 0','#8cafae')+waves(139)+C(128,35,16,'#cd9680','none'),
  giza:()=>P('M8 125 68 39l57 86Z','#d2b278')+P('M68 39v86h57Z','#ae8d5f')+P('M96 125 128 71l28 54Z','#dabe88')+P('M128 71v54h28Z','#b59867')+P('M5 137q58-15 95 0t58-1')+C(25,35,14,'#d0a968','none'),
  stonehenge:()=>P('M8 145q64-25 144 0','#718e74')+R(25,53,16,74,'#aaa999')+R(59,44,16,79,'#b7b4a1')+R(105,52,17,77,'#a3a595')+R(32,35,49,15,'#c0bba5')+R(87,37,45,16,'#b5b29f')+R(88,55,11,52,'#878e80')+P('M16 130h126M35 58l-2 57m80-54 2 59'),
  cologne:()=>P('M18 143V72l7-47 8 47V56h12v18l8-49 8 48v70ZM99 143V73l8-48 8 49V56h12v16l8-47 7 47v71Z','#8b9487')+P('M56 143V81l24-23 24 23v62Z','#a2aa97')+P('M25 26V10m28 16V10m54 16V10m28 16V10')+C(80,94,13)+arch(69,115,22,28)+windowRow(2,25,89,20,7,36)+windowRow(2,108,89,20,7,36),
  kinderdijk:()=>P('M2 136q63-16 156 0','#83a0a0')+waves(141)+mill(45,58,.95)+mill(121,83,.58)+P('M5 128q80-23 149 0'),
  jungfrau:()=>mountain('M2 139 38 62l25 30 33-69 61 116Z','M77 63 96 23l29 46-20-7-10 13-9-14Z')+mountain('M14 142 63 78l43 64Z','M46 100 63 78l17 25-16-9Z')+P('M31 151q58-15 112-4'),
  salzburg:()=>P('M4 133 32 88h96l29 45Z','#79957d')+R(29,54,103,38,'#c8c0a5')+R(39,41,15,52,'#d1c5aa')+R(105,44,16,49,'#c3b89e')+roof(37,41,20,11)+roof(103,44,20,11)+windowRow(5,47,63,17,7,15)+[13,44,76,111].map((x,i)=>R(x,113+i%2*6,27,32,'#ba987b')+roof(x-3,113+i%2*6,33,13)).join(''),
  grandplace:()=>[12,44,77,111].map((x,i)=>P(`M${x} 142V${84-i%2*15}l6-7v-7h7v-8h7v8h7v7l6 7v58Z`,['#bbad88','#ac9273','#c3b492','#a7a18d'][i])+windowRow(2,x+7,97-i%2*11,13,6,17)+windowRow(2,x+7,119,13,6,16)).join('')+P('M83 62V32l8-24 8 24v46')+C(91,50,5),
  prague:()=>P('M5 124h149v18H5Z','#a49b81')+[12,44,76,108].map(x=>arch(x,125,23,22)).join('')+R(20,62,25,57,'#b3a27e')+roof(15,62,35,19)+R(107,42,22,78,'#9ba392')+roof(102,42,32,30)+P('M119 12V2')+waves(148),
  budapest:()=>R(13,92,134,51,'#bca586')+R(61,74,39,70,'#d1b993')+dome(80,74,20)+P('M17 92 23 68l7 24m98 0 7-24 7 24M80 38V15')+windowRow(7,21,105,18,9,28)+P('M5 151h150'),
  krakow:()=>R(13,87,131,56,'#c6aa86')+P('M13 87h10V75h13v12h12V70h14v17h13V75h13v12h13V70h14v17h13V75h16v12')+windowRow(6,20,104,20,12,39)+R(99,27,18,48,'#b99576')+P('M96 27 108 4l12 23Z','#758f80'),
  skellig:()=>P('M5 147 36 111l17-50 23-37 20 42 38 33 24 49Z','#6f877a')+P('M22 146 44 128l-3-10 18-3-4-13 17-4-4-13 15-4')+P('M84 115q3-33 24-33 20 4 19 33Z','#b5b39e')+arch(101,98,12,17)+waves(151),
  geiranger:()=>P('M0 145V19l34 14 24 49 15 33 19-24 27-65 41-15v134Z','#728b7c')+P('M0 150 54 134l19-19 19-24-6 29 25 21 49 9Z','#a3c0b3')+P('M32 42q-5 25 7 33t-1 34m82-67q13 22 3 40t5 44','none','#d5dfca',3),
  drottningholm:()=>R(15,80,132,63,'#c7b68c')+R(58,63,47,80,'#d7c699')+roof(9,80,54,20,'#788a80')+roof(101,80,51,20,'#788a80')+roof(56,63,51,20,'#788a80')+R(75,28,13,22,'#c5b58f')+dome(81,28,8)+windowRow(8,22,96,16,6,17)+windowRow(8,22,123,16,6,17),
  suomenlinna:()=>P('M6 111 36 89l22 12 23-22 30 21 35-7 10 28-27 24-38-8-26 17-27-23-26 7Z','#99a581')+P('M20 113 39 101l24 15 20-23 29 20 30-9-9 27-42-6-24 16-28-26Z','#bcb398')+R(64,68,21,29,'#bfae89')+roof(60,68,29,14)+waves(144),
  kronborg:()=>R(19,82,124,61,'#baa989')+roof(14,82,134,29,'#6d8d82')+R(101,41,20,80,'#c5b394')+P('M97 41h28l-5-11-4-21h-9l-5 21Z','#6e9588')+R(38,60,15,67,'#b7a181')+roof(33,60,25,24,'#78958b')+windowRow(7,24,106,17,7,19),
  thingvellir:()=>P('M4 145V70l32-27 26 19-10 19 12 32-8 32Z','#7c8773')+P('M71 145 76 119 66 87 95 58l61 28v59Z','#98a189')+P('M57 146 64 112 52 82l10-20 7 25 9 31-7 28Z','#c0cbbb')+P('M12 153h142M8 86l23-15m65 19 44 19'),
  dubrovnik:()=>P('M5 125 28 79l107-3 21 60-44 14-61-7Z','#b9ae8b')+P('M15 124 35 92l93-3 16 39-37 13-51-7Z','#d8c5a0')+[37,60,83,106].map((x,i)=>R(x,100-i%2*13,20,27,'#d3b591')+roof(x-2,100-i%2*13,24,12,'#b8745d')).join('')+P('M19 104l-3-11 9-9 8 6m99 10 5-14 12 5 2 18')+waves(151),
  goreme:()=>[15,47,85,123].map((x,i)=>P(`M${x} 143l${8+i%2*5}-${65+i%3*20}h8l17 ${65+i%3*20}Z`,'#c2aa88')+P(`M${x+3} ${78-i%3*20}l13-19 14 19Z`,'#967e68')+arch(x+13,114,8,16)).join(''),
  kremlin:()=>R(7,121,146,25,'#ba8b70')+P('M7 121h7v-8h9v8h9v-8h9v8h9v-8h9v8h10v-8h10v8h10v-8h10v8h10v-8h10v8h10v-8h10v8h12')+R(23,69,22,53,'#bb8d73')+roof(19,69,30,42,'#708b7b')+R(81,88,22,34,'#c2ab86')+dome(92,85,13)+R(112,80,21,44,'#b99778')+dome(123,78,14)+C(34,84,7,'#e4cf9e'),
  sophia:()=>R(28,80,107,64,'#d4c7a5')+[41,81,121].map((x,i)=>R(x-9,60-i%2*25,18,44,'#c4bd9b')+dome(x,57-i%2*25,i===1?16:12)).join('')+windowRow(5,37,103,19,9,28)+P('M20 146h122'),
  danubedelta:()=>waves(92)+waves(120)+[15,29,134,146].map(x=>P(`M${x} 145V65m0 44-8-13m8 1 8-12`)+E(x,57,3,12,'#b9a574')).join('')+P('M54 73q14-12 25 0 14-14 29-2m-36 36q-4-17 6-21 11-4 13 3l20 4-20 6-2 11Z','#d3d3b7'),
  greatwall:()=>mountain('M0 148 35 79l27 27 39-74 59 87v29Z')+P('M5 139 41 114l25-2 28-43 35 26 26 3v15l-27-2-32-23-24 39-28 1-36 25Z','#c6b28c')+R(36,93,16,24,'#c9b894')+R(90,46,18,28,'#c8b18b')+R(136,82,17,24,'#b7a57f')+P('M36 93v-7h5v7h6v-7h5M90 46v-8h6v8h6v-8h6'),
  tajmahal:()=>R(39,80,82,64,'#d6cfb7')+dome(80,77,25)+[18,133].map(x=>R(x,66,9,78,'#d1c9b2')+dome(x+4.5,66,7)+P(`M${x-2} 90h13m-13 25h13`)).join('')+arch(66,102,28,42)+windowRow(2,45,111,58,10,23)+E(80,151,49,4,'#8aa9a4'),
  changdeokgung:()=>R(25,85,112,58,'#b68d70')+P('M11 84q28 4 38-20h68q14 21 32 20-12 14-138 0Z','#768577')+P('M39 56q21-2 28-17h30q10 18 27 17-26 12-85 0Z','#768577')+R(57,56,53,21,'#c09b78')+windowRow(6,34,106,17,8,34)+P('M18 146h129'),
  ayutthaya:()=>[29,70,116].map((x,i)=>P(`M${x-12} 144v-18h5v-25h5V${65-i%2*27}l8-${29+i%2*10} 9 ${29+i%2*10}v36h5v25h6v18Z`,'#b79c7c')).join('')+P('M7 149h147M67 77h23m-25 13h28m-26 13h26'),
  angkor:()=>P('M10 146v-32h20V98h98v16h22v32Z','#a4a48b')+[39,81,120].map((x,i)=>P(`M${x-13} 116V${70-i%2*28}h4v-11h5v-14h8v14h5v11h4v${46+i%2*28}Z`,'#bbb395')).join('')+windowRow(7,19,122,18,10,22)+P('M4 152h151'),
  borobudur:()=>[0,1,2,3].map(i=>P(`M${12+i*13} ${143-i*18}h${137-i*26}v10H${12+i*13}Z`,'#9ea18b')).join('')+[35,65,97,127].map(x=>P(`M${x-7} 85q0-18 7-23 7 5 7 23Z`,'#b6b69d')+P(`M${x} 61V50`)).join('')+P('M70 61q0-27 12-37 13 10 13 37Z','#adb099')+P('M82 24V13'),
  halong:()=>P('M12 144V93l10-8 4-34 13-14 18 11 6 55 5 42Z','#668d7f')+P('M93 144V89l9-5 6-53 14-10 16 29 3 47 14 23v24Z','#819e87')+P('M58 130 75 117l12 15-6 12H61Z','#c3b594')+P('M73 118V82l17 35H73')+waves(144),
  botanic:()=>P('M18 143 23 86h116l8 57Z','#9ca987')+P('M14 85 82 43l64 42Z','#c3b18e')+P('M24 93h113M35 94v48m31-48v48m31-48v48m29-48v48')+P('M2 152q78-14 155 0')+G(flower(),115,43,.6),
  georgetown:()=>[9,47,85,123].map((x,i)=>R(x,75+(i%2)*12,29,69-(i%2)*12,['#d1b590','#bdab83','#c3a695','#aabaad'][i])+roof(x-2,75+(i%2)*12,33,13)+arch(x+7,110,15,33)+windowRow(2,x+5,88+(i%2)*6,13,6,12)).join('')+P('M4 149h153'),
  sagarmatha:()=>mountain('M4 145 29 101l13 9 33-81 27 26 12 37 43 53Z','M56 76 75 29l27 26 12 37-22-10-7 11-9-29-9 16Z')+P('M33 145 79 94l43 51Z','#91a99a')+P('M10 152h143'),
  tigersnest:()=>P('M25 152 33 88l22-8 12-48 42-20 9 87 20 52Z','#8b9981')+R(28,70,48,26,'#d5c9a6')+roof(23,70,59,14,'#ab806a')+R(61,47,49,34,'#dbcba8')+roof(55,47,59,17,'#ad8267')+R(77,103,39,25,'#cfbf99')+roof(71,103,51,14,'#a98069')+P('M76 83h13v19m-26-49v25m17-25v25m16-25v25'),
  grandcanyon:()=>P('M0 35h42l14 18v31l17 24-8 49H0Z','#bb8f73')+P('M94 155 92 110l18-15 9-27 39-17v103Z','#a77f69')+P('M0 53h48M0 76h55M0 104h66m45-21h47m-60 32h60')+P('M65 155 78 124l-5-16 19 2-4 28 13 17Z','#86aaa5'),
  rockies:()=>mountain('M2 110 34 40l20 31 34-53 66 97Z','M66 52 88 18l31 45-22-9-11 10-10-15Z')+P('M5 111q78-13 150 0v42H5Z','#87ada5')+waves(127)+P('M18 134v-28m-7 10 7-17 8 17m-13 8 5-12 6 12'),
  chichenitza:()=>[0,1,2,3,4].map(i=>R(13+i*12,135-i*15,134-i*24,14,'#b5ac86')).join('')+R(62,44,35,20,'#c0b58e')+roof(58,44,43,9,'#b0a483')+P('M67 148 75 65h10l9 83Z','#d3c59e')+Array.from({length:9},(_,i)=>P(`M${68+i*.65} ${141-i*8}h${24-i*1.3}`)).join(''),
  rio:()=>P('M0 149 36 76l27 15 19-46 33 52 43 17v35Z','#799b7f')+P('M71 50 79 30h7l8 20h-12v33h-8V50Z','#c8c9b0')+P('M55 43h48v7H55Z','#c8c9b0')+C(80,25,6,'#c8c9b0')+P('M6 147q59-24 152-3','#8cafa7')+waves(151),
  glaciers:()=>P('M3 145V75l18-20 15 18 17-17 23 28 20-21 21 23 15-17 24 16v60Z','#a9c3b6')+P('M3 145V99l20-15 12 23 20-12 20 12 22-10 21 21 17-18 21 10v35Z','#c5d5c2')+P('M22 85v45m32-34-9 47m31-36 3 26m18-35 6 34m15-13-8 27m26-43 1 38')+waves(148),
  machupicchu:()=>mountain('M1 134 31 78l18 17 38-77 32 54 41 70Z')+P('M25 145 40 123h69l33 22Z','#b5b394')+[0,1,2].map(i=>P(`M${32+i*10} ${138-i*10}h${99-i*20}`)).join('')+R(56,100,24,21,'#c5b995')+P('M53 100 68 87l16 13Z','#999f84')+R(91,107,22,20,'#c7ba95')+P('M88 107 102 95l15 12Z','#969b83'),
  rapanui:()=>[20,69,117].map((x,i)=>G(P('M0 126V67l6-7V24l10-9 16 4 4 19-2 43 5 46Z','#a19b80')+P('M9 42h19m-12 3-2 17 9-2m-14 17 19 1M6 82l25 3'),x,12+i%2*8,.82)).join('')+P('M5 150q74-12 150 0','#81a080'),
  uyuni:()=>P('M0 82 33 69l32 9 40-31 55 36v69H0Z','#c6d2be')+P('M0 95h160M28 151l13-39 47-6 27 42m-75-36-37-8m85 2 43-11m-16 53 42-20M7 145l21 6 38-16 49 13M12 122l26-3m78 3 31-9')+C(126,35,13,'#d3bf8c','none'),
  coffeelandscape:()=>P('M0 126q40-96 81-39 29-68 79 6v62H0Z','#8ca17c')+P('M0 144q60-37 160-6M4 132q52-35 151-5M9 120q38-32 116-14M22 105q29-30 77-9')+R(89,69,42,31,'#dfcaa1')+roof(83,69,54,17,'#b58b6d')+R(105,82,10,18,'#827c67'),
  guanacaste:()=>mountain('M0 143 35 94l15 9 31-54 64 82 15 11Z')+P('M80 49q11-17 9-33m-2 19q19-8 13-25','none','#c9cbb2',3)+[16,44,122,145].map(x=>P(`M${x} 147v-39`)+E(x,100,14,18,'#7e9b7c')).join(''),
  galapagos:()=>P('M0 145 29 123l42 8 40-20 49 30v16H0Z','#879784')+E(75,111,43,27,'#a6ac88')+P('M34 107 43 96l27-12 26 5 22 20-25 11-32-1Z')+P('M44 130v18h13v-18m41 0v18h13v-18M115 108l20-14 15 6-3 14-30 9Z','#a6ac88')+C(142,102,2,'currentColor'),
  opera:()=>P('M6 145h148v-19H6Z','#b9b69b')+P('M16 126Q19 71 70 34 54 91 54 126Z','#d7d5b9')+P('M51 126Q55 57 111 21 93 87 90 126Z','#e1dac1')+P('M88 126q23-54 63-55-20 25-26 55Z','#c2cbbb')+P('M26 116 64 47m1 69 37-80m-3 82 41-36')+waves(147),
  tongariro:()=>mountain('M0 139 30 89l23 17 26-71 33 72 48 32Z','M67 69 79 35l15 38-14-8Z')+P('M36 131q40-17 73 0l-19 21H54Z','#8ab6a2')+P('M54 126q18-9 37 0')+C(127,35,12,'#d1bd8d','none'),
  tablemountain:()=>P('M0 141 20 94l17-28h69l21 25 33 50Z','#839e86')+P('M37 66h69l10 18H29Z','#b5b899')+P('M35 84v27m22-25v36m20-36-2 41m23-44 4 26')+P('M0 146q64-16 160-1','#8faeaa')+waves(151),
  aitbenhaddou:()=>[13,45,80,115].map((x,i)=>R(x,64-i%2*17,30,80+i%2*17,'#bd9275')+P(`M${x} ${64-i%2*17}v-7h7v7h8v-7h8v7h7`)+windowRow(2,x+6,84-i%2*12,15,6,15)+windowRow(2,x+6,110,15,6,15)).join('')+P('M6 151h148'),
  eljem:()=>P('M9 135V71q71-33 141 0v63q-71 21-141 1Z','#c8b08a')+P('M9 88q71 25 141-1M9 108q70 27 141-1')+windowRow(7,18,76,18,10,17)+windowRow(7,18,100,18,10,18)+windowRow(7,18,123,18,10,14),
  mountkenya:()=>mountain('M0 143 32 95l24 11 17-58 8-18 12 48 17 21 50 44Z','M64 86 73 48l8-18 12 48-14-5-7 19Z')+[26,128].map(x=>P(`M${x} 150v-28`)+E(x,119,23,8,'#8f9f79')).join(''),
  kilimanjaro:()=>mountain('M0 138 25 107l27-27 20-17 41 1 22 26 25 49Z','M50 82 72 63l41 1 20 24-31-7-15 9-16-9Z')+P('M0 145h160')+P('M29 144v-20')+E(29,120,24,7,'#98a17d'),
  lalibela:()=>P('M8 146V65l23-21h101l20 23v79Z','#b4947a')+P('M50 124V97H28V71h23V51h48v20h26v26H99v27Z','#c4a487')+P('M51 71h48m-48 26h48M64 51v73m22-73v73')+P('M15 138h26m71 0h32'),
  goree:()=>[13,57,104].map((x,i)=>R(x,75+(i%2)*12,40,63-(i%2)*12,['#c8977b','#bd8d73','#d0b18e'][i])+roof(x-3,75+(i%2)*12,46,14,'#947e67')+windowRow(2,x+7,91+(i%2)*5,19,7,16)+arch(x+15,117,12,21)).join('')+waves(145),
  parthenon:()=>P('M7 75 80 38l74 37Z','#d1c3a3')+P('M18 69 80 49l62 20Z','#adad92')+R(10,76,140,10,'#d2c7aa')+[22,43,64,85,106,127].map(x=>R(x,87,10,48,'#cec4a6')+P(`M${x-3} 88h16m-16 45h16`)).join('')+P('M9 139h141v8H9ZM4 150h152'),
  belem:()=>R(62,38,61,97,'#d0c2a3')+R(12,111,134,32,'#b9b798')+[63,112].map(x=>R(x,29,13,33,'#c9bf9f')+dome(x+6,26,9)).join('')+windowRow(3,71,71,17,8,20)+windowRow(3,71,104,17,8,20)+P('M62 54h61M11 111l14-15 13 15m94 0 12-15 11 15M13 143h139')+waves(148),
  tiwanaku:()=>R(13,48,136,97,'#a5a994')+R(57,96,49,49,'#506e69')+R(9,37,144,24,'#b8b598')+P('M25 70h112M25 85h112M17 137h36m59 0h33')+G(P('M0 0h16v16H0ZM8-5v-7m-12 9-7-4m31 4 7-4M-3 22h23M8 17v9')+C(8,8,3),72,41,.65),
  iguacu:()=>P('M0 81q25-15 47 0t54-9 59 6v28q-40-12-75 8-39-9-85 10Z','#73977b')+P('M8 88q30 5 48 0v54H12ZM74 92q18-20 32-6v48H77ZM124 84l29 2v64h-27Z','#d0d9c0')+P('M19 94v42m13-43v33m13-36v42m38-37v30m12-36v38m42-39v47','none','#8eafa3',2)+P('M3 148q41-18 67 0t48-8 42 5','#a5c3ad')+waves(149),
  cartagena:()=>P('M4 142v-28l21-26h81l42 26v28Z','#bba886')+P('M14 115h122v27H14Z','#c6b898')+R(58,66,45,52,'#d1b991')+R(75,35,19,40,'#cdb08a')+dome(84,35,13)+R(24,88,26,24,'#d2bc96')+roof(20,88,34,14)+windowRow(3,26,119,42,10,22)+P('M5 149h148'),
  cocosisland:()=>P('M0 143 15 101l19-16 22 5 30-52 21 34 23-8 30 77Z','#6f967c')+P('M83 47q-6 17 0 32-13 19-5 40','none','#bfd7bc',5)+P('M10 143q55-22 145 0','#8db7ab')+waves(149)+[27,126].map(x=>P(`M${x} 113v-25`)+E(x,83,17,12,'#86a57f')).join(''),
  bulguksa:()=>R(30,79,103,36,'#c0a683')+P('M17 77q20 4 30-18h74q10 18 26 18-36 11-130 0Z','#7c8d7d')+P('M40 115h77v8H40Zm7 8h64v9H47Zm-8 10h80v10H39Z','#c1bea1')+P('M51 116V83m23 33V83m24 33V83m23 32V82')+R(12,113,18,29,'#a8ac93')+P('M9 113h24m-20-7h16m-11 0V91h6v15')+P('M7 148h146'),
  kinabalu:()=>mountain('M0 145 23 113l20-61 13 27 20-53 11 30 8-8 23 50 15-12 27 58Z','M65 59 76 26l11 30 8-8 12 26-22-10-9 15Z')+P('M23 146 46 95l21 44m25-21 18-27 16 45')+P('M2 151q60-13 156 0'),
  kathmandu:()=>R(53,81,56,63,'#b79c7d')+P('M26 84q33-7 34-20h41q3 15 34 20-39 11-109 0Z','#987c66')+R(62,52,38,20,'#bc9f7d')+P('M38 53q28-3 33-17h20q4 14 28 17-27 10-81 0Z','#997b65')+R(74,25,14,15,'#c4a782')+P('M61 25 80 10l20 15Z','#92785f')+windowRow(3,62,97,16,8,30)+P('M39 145h86v7H39Z'),
};

function flower(){return Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-16" rx="10" ry="18" transform="rotate(${i*72})" fill="#c1a1a5" stroke="currentColor" stroke-width="1.5"/>`).join('')+C(0,0,7,'#d7bd83');}
const landmarkMap={ES:'alhambra',IT:'colosseum',FR:'montsaintmichel',JP:'fuji',EG:'giza',GB:'stonehenge',DE:'cologne',GR:'parthenon',PT:'belem',NL:'kinderdijk',CH:'jungfrau',AT:'salzburg',BE:'grandplace',CZ:'prague',HU:'budapest',PL:'krakow',IE:'skellig',NO:'geiranger',SE:'drottningholm',FI:'suomenlinna',DK:'kronborg',IS:'thingvellir',HR:'dubrovnik',TR:'goreme',RU:'kremlin',UA:'sophia',RO:'danubedelta',CN:'greatwall',IN:'tajmahal',KR:'bulguksa',TH:'ayutthaya',KH:'angkor',ID:'borobudur',VN:'halong',SG:'botanic',MY:'kinabalu',NP:'kathmandu',BT:'tigersnest',US:'grandcanyon',CA:'rockies',MX:'chichenitza',BR:'iguacu',AR:'glaciers',PE:'machupicchu',CL:'rapanui',BO:'tiwanaku',CO:'cartagena',CR:'cocosisland',EC:'galapagos',AU:'opera',NZ:'tongariro',ZA:'tablemountain',MA:'aitbenhaddou',TN:'eljem',KE:'mountkenya',TZ:'kilimanjaro',ET:'lalibela',SN:'goree'};

const foods={
  paella:()=>E(80,84,61,35,'#cdb66f')+E(80,84,51,26,'#d9c484')+P('M19 79H5v15h17m119-15h14v15h-17')+[43,64,86,105,117].map((x,i)=>P(`M${x} ${73+i%2*19}q8-13 15-2-6 15-15 2Z`,i%2?'#9c7569':'#6e8173')).join('')+P('M38 91l61-14m-41-14 32 39','none','#bd7760',3),
  pizza:()=>C(80,82,56,'#c8a376')+C(80,82,47,'#c1886d')+P('M33 83 103 42l26 58-67 23Z','#dbc292','none')+[0,1,2,3,4].map((n)=>C(51+n%3*28,62+Math.floor(n/3)*41,8,'#ded0ac','none')).join('')+P('M76 76q12-22 18-9-8 16-18 9Zm-31 24q12-22 18-9-8 16-18 9Z','#819b72','none'),
  baguette:()=>P('M27 118Q-2 95 37 48q62-63 92-12 16 22-14 51-54 49-88 31Z','#c7a175')+P('m41 77 20 9m-7-29 20 9m-5-29 20 9m-2-24 17 9','none','#e2c696',6),
  onigiri:()=>P('M25 119Q13 110 26 90L67 29q12-15 24 0l44 64q17 27-4 29Z','#d9d7bd')+P('M59 124V88h44v36Z','#627969')+E(78,70,8,4,'#b57868','none'),
  koshari:()=>E(80,88,59,25,'#cdbb95')+P('M21 89q11 51 59 51t59-51','#b19b7c')+E(80,86,51,20,'#a58a69')+Array.from({length:15},(_,i)=>P(`M${39+i%5*19} ${77+Math.floor(i/5)*8}q6-5 11 1`,'none',i%3?'#d3bd90':'#b27361',3)).join('')+P('M68 77q10-16 21-1l10 12-28 7Z','#b37c67','none'),
  pastel:()=>E(80,108,44,20,'#c0a078')+P('M36 94 45 124q36 23 71 0l10-30Z','#c7a477')+E(80,92,47,24,'#d9c38c')+E(80,91,36,17,'#e1cb8f')+P('M56 83q6-9 15 0m13 9q7-11 15-1m-21 11h10','none','#a47b5c',4),
  tagine:()=>E(80,122,62,19,'#ac8e6c')+P('M26 121 72 43h16l47 78Z','#c4a079')+R(72,33,16,12,'#c4a079','currentColor',3)+P('M43 103h74M55 84h51')+P('M34 130q45 12 93 0'),
  tacos:()=>E(80,119,64,20,'#bbb59d')+[30,68,102].map(x=>P(`M${x-12} 111q-4-52 20-53 26 3 15 52Z`,'#d5bd85')+P(`M${x-7} 88q15-21 26 0`,'none','#7f9675',8)+P(`M${x-3} 91q13-15 21 1`,'none','#ba8169',5)).join(''),
  feijoada:()=>E(79,104,68,34,'#d4ccb1')+P('M77 82q35-29 56 18-25 35-57 12Z','#e4ddc0','none')+E(52,104,34,21,'#716f5b')+Array.from({length:7},(_,i)=>E(33+i%3*17,96+Math.floor(i/3)*10,5,3,'#95816a','none')).join('')+P('M77 116q16-7 29 8','none','#7d9674',7),
  empanadas:()=>E(80,127,68,18,'#c7c4a9')+[36,79,116].map((x,i)=>P(`M${x-25} ${113-i%2*20}q25-52 50 0Z`,'#c5a177')+P(`M${x-23} ${113-i%2*20}q25-38 46 0`,'none','#e0c18e',3)).join(''),
  ceviche:()=>E(80,103,65,33,'#c7d0bc')+E(80,99,52,24,'#d8d2b1')+[35,61,85,112].map((x,i)=>R(x,91+i%2*9,17,12,'#ddceb6','none',3)).join('')+P('M47 87q12-19 29-3M80 118q14-20 29-5m-48-10q12-15 23-2','none','#ac8b9a',3)+P('M41 105q12-9 15 3m50-16q12-9 15 3','none','#829c74',3),
  dumplings:()=>E(80,121,65,22,'#bdc5ad')+[31,73,113].map((x,i)=>P(`M${x-15} ${108-i%2*24}q22-43 43 0Z`,'#d9ceaa')+P(`M${x-5} ${102-i%2*24}l3-12m6 10v-13m7 14 4-12`)).join(''),
  thali:()=>E(80,98,67,46,'#afbaa5')+[[49,77],[109,78],[80,117]].map(([x,y],i)=>E(x,y,21,17,['#b69a70','#a58f68','#c1a974'][i])+E(x,y-2,16,10,['#b7a074','#8e9d73','#c7b88c'][i])).join('')+E(79,50,21,15,'#d4c6a0'),
  baklava:()=>E(80,123,61,18,'#bfc5ac')+[29,65,101].map((x,i)=>P(`M${x} ${98-i%2*21}l20-15 26 14-20 19Z`,'#c6b181')+P(`M${x} ${98-i%2*21}v15l26 15 20-16v-15`,'#aa956c')+P(`M${x+3} ${106-i%2*21}l23 14 18-14`)).join(''),
  coffee:()=>E(79,127,57,13,'#b7bda6')+P('M42 66h66v37q-5 42-33 28-28 8-33-28Z','#d5cbb0')+E(75,68,34,12,'#817665')+P('M108 74h12q25 6 9 26-5 10-20 2M61 46q-12-9 0-16m28 16q-12-9 0-16'),
  moussaka:()=>E(80,127,61,17,'#bec5aa')+P('M29 100 92 69l40 22-62 35Z','#d5c292')+P('M29 100v25l40 24 63-36V91l-62 35Z','#a68e71')+P('M30 110 69 137l62-35','none','#d4b18a',5)+P('M30 120 69 145l62-35','none','#7f8170',4),
  couscous:()=>E(80,95,65,30,'#b3a688')+P('M15 98q16 44 65 42 54 0 65-42','#baa582')+E(80,90,57,23,'#d2bd88')+[35,61,84,111].map((x,i)=>P(`M${x} ${81+i%2*14}l17 7-4 8-17-6Z`,i%2?'#839875':'#bb8d69','none')).join('')+Array.from({length:14},(_,i)=>C(31+(i*17)%99,77+(i*13)%26,1.4,'#ae9c74','none')).join(''),
  flatbread:()=>E(80,96,64,28,'#c9ae7c')+E(80,94,53,20,'#d5bf8e')+P('M38 99q8-8 15 0m11-12q8-8 15 0m10 15q8-8 15 0m7-16q8-8 15 0','none','#ab916c',3),
  cheeseBread:()=>E(80,128,66,19,'#c7c9ad')+[[41,110],[78,87],[116,108]].map(([x,y])=>C(x,y,23,'#d2b986')+P(`M${x-13} ${y-8}q12-11 24 0`,'none','#e4d0a0',4)+P(`M${x-4} ${y+10}h5`,'none','#b49b73',3)).join(''),
  arepas:()=>E(80,131,66,16,'#c3c6aa')+E(58,106,39,25,'#c9b17f')+E(58,101,39,21,'#d8c28d')+E(104,82,32,23,'#c9b17f')+E(104,77,32,20,'#dbc78f')+P('M38 101q20-13 39 0m8-24q18-9 39 0','none','#bb9d6d',3),
  tamales:()=>E(80,128,66,18,'#c5c8ac')+[31,83].map((x,i)=>P(`M${x} ${118-i*15}l8-66 28-9 19 64-21 17Z`,'#aeb190')+P(`M${x+8} ${55-i*5}l14 62m-5-66 11 64m-6-68 15 60`,'none','#7f957e',1.4)+P(`M${x-1} ${98-i*10}l49-11`,'none','#d3c396',3)).join(''),
  poutine:()=>P('M20 91h122l-15 48H35Z','#b8b397')+E(81,89,62,19,'#d1c18c')+Array.from({length:9},(_,i)=>R(29+i*11,76+(i%3)*7,7,26,'#ccb07c','none',2)).join('')+[41,66,98,120].map((x,i)=>P(`M${x} ${85+i%2*9}l12-4 8 10-15 6Z`,'#e1d8b8','none')).join('')+P('M37 107q42-28 89-3','none','#947e63',6),
  fondue:()=>P('M28 81h104v28q-2 30-52 30-50 0-52-30Z','#b59779')+E(80,82,52,17,'#d6c391')+P('M132 90h19v14h-20M55 139l-10 16m59-16 10 16M81 115 118 39')+R(109,29,20,18,'#d7c296')+P('M75 150q7-18 14 0Z','#c39c74'),
  strudel:()=>E(80,130,67,17,'#c5c8ac')+P('M20 97 62 64l68 33-37 36Z','#c6a779')+P('M20 97v23l72 25 38-24V97l-37 36Z','#d9c18f')+P('M92 134q17-30 32-23m-30 17q7-6 14-3','none','#987d62',4)+P('M43 86l60 27M56 76l60 26','none','#e0cda2',5),
  nasi:()=>E(80,111,68,32,'#c2cbb0')+P('M36 109q3-53 43-48 37 3 44 48Z','#b9a97c')+E(83,92,32,21,'#e0d3ab')+C(87,87,11,'#c7ac68','none')+P('M26 119l19-19m72 22 21-22','none','#88a079',5),
  nasilemak:()=>P('M16 132 27 64l87-32 34 103Z','#7d9b7a')+P('M39 118q0-63 39-60 35 0 43 60Z','#ddd9bc')+E(110,107,22,12,'#ae7e66')+E(43,98,20,13,'#c7cbb0')+C(43,95,8,'#c8b374','none')+P('M79 122l-15 21m22-21-7 23'),
  kaya:()=>E(80,130,69,16,'#c5c8ad')+[25,74].map((x,i)=>P(`M${x} ${111-i*22}v-32q-6-20 12-20h24q18 0 12 20v32Z`,'#c6a477')+P(`M${x+4} ${99-i*22}h43`,'none','#88a17c',7)).join('')+E(128,124,17,11,'#dad5b8')+C(128,123,6,'#c9b171','none'),
  pho:()=>E(80,87,63,24,'#bdc3a9')+P('M17 88q10 54 63 54 51 0 63-54','#bcc5ac')+E(80,84,55,17,'#b7a583')+P('M37 83q9-13 19 0t21 0 23 0 26 0M45 92q9-13 19 0t21 0 23 0','none','#dbd0ae',3)+P('M81 74 132 20m-41 55 52-53','none','#ad9170',3)+P('M46 75q5-19 17-7m44 19q7-17 17-5','none','#789777',4),
  kimchi:()=>E(80,126,64,17,'#c7cab0')+[29,57,85,109].map((x,i)=>P(`M${x} 111q-17-40 5-62 22 16 21 50l-15 23Z`,'#bb8d70')+P(`M${x+7} 57q-12 24 7 51`,'none','#d6c19c',5)+P(`M${x-1} 78l12 6m-9 9 13 5`,'none','#9ba57d',3)).join(''),
  tomyum:()=>E(80,89,63,25,'#bec3a8')+P('M17 90q12 51 63 51t63-51','#b8c0a6')+E(80,86,56,17,'#ba9a73')+P('M42 84q-3-22 19-20 16 9 0 22l-10-2 12-10','none','#d6b398',7)+P('M85 94q-3-22 19-20 16 9 0 22l-10-2 12-10','none','#d6b398',7)+P('M60 81l52-13m-19 15 14 20','none','#88a17b',4),
  borscht:()=>E(80,89,64,24,'#bdc6ad')+P('M16 90q16 53 64 53t64-53','#bfc8b0')+E(80,86,56,17,'#a97f79')+P('M65 83q16-21 30 0l-14 12Z','#dbd3b2','none')+P('M40 85l19 6m47-17 16 12m-33-4 15 11','none','#749575',3),
  ceebu:()=>E(80,107,68,31,'#bcc4a8')+E(80,103,60,23,'#bea780')+P('M33 105q44-34 73 0-35 30-73 0Z','#879a7c')+P('M106 105l27-20v36Z','#879a7c')+C(43,101,2,'currentColor')+P('M62 91 76 115m-1-28 14 25')+P('M36 82l22-7m46 54 22-9','none','#ba865f',7),
};
const foodMap={ES:'paella',IT:'pizza',FR:'baguette',JP:'onigiri',EG:'koshari',PT:'pastel',GR:'moussaka',MA:'couscous',DZ:'couscous',TN:'couscous',MR:'couscous',MX:'tamales',BR:'cheeseBread',AR:'empanadas',PE:'ceviche',TR:'flatbread',AZ:'flatbread',IR:'flatbread',KZ:'flatbread',KG:'flatbread',CO:'arepas',CA:'poutine',CH:'fondue',AT:'strudel',ID:'nasi',MY:'nasilemak',SG:'kaya',VN:'pho',KR:'kimchi',TH:'tomyum',UA:'borscht',SN:'ceebu'};

const expectedLandmarkNames={"ES":"Alhambra de Granada","IT":"Coliseo de Roma","FR":"Mont-Saint-Michel","JP":"Monte Fuji","EG":"Pirámides de Guiza","GB":"Stonehenge","DE":"Catedral de Colonia","GR":"Acrópolis de Atenas","PT":"Torre de Belém","NL":"Molinos de Kinderdijk-Elshout","CH":"Alpes suizos Jungfrau-Aletsch","AT":"Centro histórico de Salzburgo","BE":"Grand-Place de Bruselas","CZ":"Centro histórico de Praga","HU":"Budapest y las orillas del Danubio","PL":"Centro histórico de Cracovia","IE":"Sceilg Mhichíl (Skellig Michael)","NO":"Fiordos Geirangerfjord y Nærøyfjord","SE":"Palacio y jardines de Drottningholm","FI":"Fortaleza de Suomenlinna","DK":"Castillo de Kronborg","IS":"Parque nacional de Þingvellir","HR":"Ciudad vieja de Dubrovnik","TR":"Göreme y paisajes rocosos de Capadocia","RU":"Kremlin y Plaza Roja de Moscú","UA":"Catedral de Santa Sofía de Kyiv","RO":"Delta del Danubio","CN":"Gran Muralla","IN":"Taj Mahal","KR":"Templo Bulguksa","TH":"Ciudad histórica de Ayutthaya","KH":"Angkor","ID":"Conjunto de templos de Borobudur","VN":"Bahía de Ha Long y archipiélago de Cat Ba","SG":"Jardín Botánico de Singapur","MY":"Parque de Kinabalu","NP":"Valle de Katmandú","BT":"Paro Taktsang","US":"Gran Cañón","CA":"Parques de las Montañas Rocosas canadienses","MX":"Chichén Itzá","BR":"Parque nacional de Iguaçu","AR":"Parque nacional Los Glaciares","PE":"Machu Picchu","CL":"Parque nacional Rapa Nui","BO":"Tiwanaku","CO":"Puerto y fortificaciones de Cartagena","CR":"Parque nacional Isla del Coco","EC":"Islas Galápagos","AU":"Ópera de Sídney","NZ":"Parque nacional de Tongariro","ZA":"Áreas protegidas de la Región Floral del Cabo","MA":"Ksar de Ait Ben Haddou","TN":"Anfiteatro de El Jem","KE":"Monte Kenia","TZ":"Parque nacional del Kilimanjaro","ET":"Iglesias excavadas en la roca de Lalibela","SN":"Isla de Gorée"};
const expectedFoodNames={"ES":"Paella valenciana","IT":"Pizza napolitana","FR":"Baguette","JP":"Onigiri","EG":"Koshary","PT":"Pastel de nata","GR":"Moussaka","MA":"Cuscús","DZ":"Cuscús","TN":"Cuscús","MR":"Cuscús","MX":"Tamales","BR":"Pão de queijo","AR":"Empanadas","PE":"Ceviche peruano","TR":"Pan plano tradicional","AZ":"Pan plano tradicional","IR":"Pan plano tradicional","KZ":"Pan plano tradicional","KG":"Pan plano tradicional","CO":"Arepas","CA":"Poutine","CH":"Fondue de queso","AT":"Apfelstrudel vienés","ID":"Nasi goreng","MY":"Nasi lemak","SG":"Kaya toast","VN":"Phở","KR":"Kimchi","TH":"Tomyum Kung","UA":"Borscht ucraniano","SN":"Ceebu jën"};

export const countrySceneProfiles=Object.fromEntries(Object.entries(countryOutlines).map(([code,outline])=>{
  const data=countryCulturalData[code]||{},landmarkId=landmarkMap[code],foodId=foodMap[code];
  const hasLandmark=Boolean(data.landmark?.verified&&((landmarkId&&data.landmark.name===expectedLandmarkNames[code])||extraLandmarks[code]?.name===data.landmark.name)),hasFood=Boolean(data.food?.verified&&((foodId&&data.food.name===expectedFoodNames[code])||extraFoods[code]?.name===data.food.name));
  return [code,{edition:hasLandmark&&hasFood?'crafted':'foundation',illustratedLandmark:hasLandmark,illustratedFood:hasFood,geographicSilhouette:true,details:[hasLandmark?data.landmark.name:'Silueta geográfica ornamental',hasFood?data.food.name:'Cuaderno de descubrimientos','Papelería de viaje'],landmark:hasLandmark?data.landmark:null,food:hasFood?data.food:null,notes:data.notes||'Edición en desarrollo; no representa todas las culturas del país.',region:outline.region}];
}));

// All note rectangles (x63..649, y114..438) remain unobstructed. The country
// silhouette, landmark and dish are placed in the margins and lower rail.
export function countryScene(design,width=720,height=500) {
  const code=String(design?.code||'').toUpperCase(),outline=countryOutlines[code],profile=countrySceneProfiles[code];if(!outline||!profile)return '';
  const ink=/^#[0-9a-f]{6}$/i.test(design.accent||'')?design.accent:'#e8c98c',paper='#d9d1b5';
  let art=`<g data-country-scene="${code}" color="${esc(ink)}" opacity=".9">`;
  art+=R(20,123,35,111,'none',ink,5)+P('M27 136h20m-20 5h20M27 217h20m-20 5h20','none',ink,.7);
  art+=`<svg x="22" y="155" width="31" height="49" viewBox="0 0 100 100" role="img" aria-label="${esc('Silueta ornamental parcial de '+outline.name)}"><path d="${outline.path}" fill="${esc(ink)}" fill-opacity=".2" stroke="${esc(ink)}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  if(profile.illustratedLandmark){art+=`<svg x="652" y="204" width="48" height="125" viewBox="0 0 160 180" role="img" aria-label="${esc(profile.landmark.name)}"><g color="${esc(ink)}" stroke-linecap="round" stroke-linejoin="round">${extraLandmarks[code]?.name===profile.landmark.name?extraLandmarks[code].draw():landmarks[landmarkMap[code]]()}</g></svg>`;}
  else art+=P('M666 211h23v80h-23Zm0 14h23m-23 13h23m-23 13h23m-23 13h23m-23 13h23','none',ink,.9);
  art+=`<path d="M23 463h${profile.illustratedFood?'558':'668'}" fill="none" stroke="${esc(ink)}" stroke-opacity=".45"/>`;
  if(profile.illustratedFood)art+=`<svg x="592" y="443" width="75" height="44" viewBox="0 0 160 160" role="img" aria-label="${esc(profile.food.name)}"><g color="${esc(ink)}">${extraFoods[code]?.name===profile.food.name?extraFoods[code].draw():foods[foodMap[code]]()}</g></svg>`;
  // A second, larger geographic engraving in the bottom margin differentiates
  // even the initial editions, without presenting unverified cultural motifs.
  art+=`<svg x="290" y="443" width="105" height="39" viewBox="0 0 100 100" aria-hidden="true"><path d="${outline.path}" fill="${esc(paper)}" fill-opacity=".16" stroke="${esc(ink)}" stroke-opacity=".65" stroke-width="1.3"/></svg>`;
  art+=P('M27 280v80m0-74h8m-8 15h5m-5 15h8m-8 15h5m-5 15h8','none',ink,.9);
  art+='</g>';
  const w=Number.isFinite(Number(width))&&Number(width)>0?Number(width):720,h=Number.isFinite(Number(height))&&Number(height)>0?Number(height):500;
  return w===720&&h===500?art:`<g transform="scale(${w/720} ${h/500})">${art}</g>`;
}

export const countryArtCoverage=Object.freeze({geographicSilhouettes:Object.keys(countryOutlines).length,landmarkDrawings:Object.keys(landmarks).length+Object.keys(extraLandmarks).length,dishDrawings:Object.keys(foods).length+Object.keys(extraFoods).length,verifiedIllustratedLandmarks:Object.values(countrySceneProfiles).filter(p=>p.illustratedLandmark).length,verifiedIllustratedDishes:Object.values(countrySceneProfiles).filter(p=>p.illustratedFood).length,finishedEditions:Object.values(countrySceneProfiles).filter(p=>p.edition==='crafted').length});
