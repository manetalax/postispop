// Original culinary illustrations. SVG interiors use a 160 × 160 viewBox.
// Recipes are examples; shared foods do not imply exclusive national origins.
// KI, FM, PW, SB and TV depict the documented crop, not an invented recipe.
export function createAmericasFoods(h) {
  const {P, R, C, E} = h;
  const cream='#d5c392', pale='#eee6d3', gold='#c4ad81', olive='#8ca17c', clay='#b58d73', brown='#96765e', stone='#bbc7ad';
  const p=(d,f='none',strokeOrWidth='currentColor',w=1.8)=>typeof strokeOrWidth==='number'?P(d,f,'currentColor',strokeOrWidth):P(d,f,strokeOrWidth,w);
  const e=(x,y,rx,ry,f='none')=>E(x,y,rx,ry,f);
  const c=(x,y,r,f='none')=>C(x,y,r,f);
  const r=(x,y,w,ht,f='none',rx=0)=>R(x,y,w,ht,f,'currentColor',rx);
  const t=(svg,x=0,y=0,angle=0,scale=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${svg}</g>`;
  const plate=()=>e(80,111,67,29,pale)+e(80,108,56,21);
  const bowl=(fill=pale)=>p('M24 82q4 46 56 49 52-3 56-49Z',cream)+e(80,82,56,24,pale)+e(80,81,48,18,fill);
  const pot=(fill=clay)=>p('M24 77H9v19h19m108-19h15v19h-19',gold)+p('M25 80v24q7 28 55 29 50-2 56-29V80Z',clay)+e(80,79,56,25,pale)+e(80,79,47,18,fill);
  const steam=()=>p('M60 38q-6-8 0-16m20 12q-6-8 0-16m20 20q-6-8 0-16','none',1.3);
  const grains=(pts,fill=pale)=>pts.map(([x,y,angle=0])=>t(E(0,0,1.7,4,fill,'none'),x,y,angle)).join('');
  const dots=(pts,fill=clay,size=1.6)=>pts.map(([x,y])=>C(x,y,size,fill,'none')).join('');
  const herb=(x,y,scale=1)=>t(p('M0 12V-8m0 7-6-5m6 1 6-5','none',1.1)+p('M-1 1q-11 0-9-8 8-1 9 8Zm2-3q1-9 9-8 1 8-9 8Z',olive,1),x,y,0,scale);
  const bean=(x,y,angle=0)=>t(p('M-6-2q1-9 8-6 8 3 4 10-1 4-5 2 0-6-4-2-5 1-3-4Z',brown,1),x,y,angle);
  const beans=pts=>pts.map(([x,y,angle=0])=>bean(x,y,angle)).join('');
  const rice=(x,y,scale=1)=>t(p('M-28 12q2-33 27-34 28 1 31 34-31 15-58 0Z',pale)+grains([[-15,4,60],[-3,-11,30],[12,-3,-40],[19,8,50],[-2,10,-40]],cream),x,y,0,scale);
  const cube=(x,y,fill=brown,scale=1)=>t(p('M-9-7 4-10l9 8-5 13-17-5Z',fill)+p('M-9-7 2 1l11-3M2 1 0 9','none',1),x,y,0,scale);
  const wedge=(x,y,angle=0,scale=1)=>t(p('M-16 12-5-17Q12-19 20-7L9 15Z',pale)+p('M-5-17 9 15','none',1),x,y,angle,scale);
  const leaf=(x,y,angle=0,scale=1)=>t(p('M0-42Q36-31 28 1 22 27 0 43-29 18-28-6-31-35 0-42Z',olive)+p('M0-37V39m0-26-17-12m17-1 20-14M0-12-18-11M0-24 13-7','none',1),x,y,angle,scale);
  const bananaLeaf=()=>p('M13 108 38 46l111 36-15 60-95-6Z',olive)+p('M27 107 136 99m-101 8 10-47m8 45 13-38m5 36 15-30m5 29 13-22m5 21 12-15m-76 22 6 26m13-29 8 29m14-32 7 29m15-32 8 25','none',1);
  const fish=(x,y,angle=0,scale=1)=>t(p('M-35 0q28-30 59-3l18-11-4 15 5 14-19-8Q-5 29-35 0Z',stone)+p('M-14-13q12 13 0 28M-6-16 5-25l13 15m-20 32 14 7 7-14M-11 2h28','none',1.2)+c(-24,-2,1.8,brown),x,y,angle,scale);
  const fillet=(x,y,angle=0,scale=1)=>t(p('M-27 7Q-26-20-7-18 4-10 28-11 22 17-27 7Z',cream)+p('M-17-10-8 8m2-19 10 16m2-15 8 10','none',1.2),x,y,angle,scale);
  const onion=(x,y,angle=0)=>t(e(0,0,13,8,pale)+e(0,0,8,4),x,y,angle);
  const corn=(x,y,angle=0,scale=1)=>t(r(-10,-19,20,38,gold,6)+[-1,0,1].map(i=>p(`M${i*6} -14v29`,'none',.8)).join('')+[-10,-3,4,11].map(v=>p(`M-8 ${v}h16`,'none',.8)).join(''),x,y,angle,scale);
  const lime=(x,y,scale=1)=>t(p('M-17 10 0-14 18 10Q0 21-17 10Z',olive)+p('M-12 9 0-8 12 9ZM0-8V12','none',1),x,y,0,scale);
  const banana=(x,y,angle=0,fill=cream,scale=1)=>t(p('M-12-28q-13 32 11 54 9 7 14 0-21-20-18-50Z',fill)+p('M-8-21q-6 28 14 43','none',1),x,y,angle,scale);
  const coconut=(x,y,scale=1)=>t(p('M-21-4q-3 29 21 32 25-5 24-30Z',brown)+e(1,-4,23,13,pale)+e(1,-4,16,7,cream),x,y,0,scale);
  const spoon=(x,y,angle=30)=>t(e(0,0,6,10,pale)+p('M-2 9v39q2 6 4 0V9Z',cream,1.3),x,y,angle);
  const tuber=(x,y,angle=0,scale=1)=>t(p('M-9-30q20-9 29 11 8 16-6 38L1 37q-12-4-20-27-8-19 1-33Z',brown)+p('M-13-20q14 5 28-1m-33 11q19 9 37 1m-37 12q18 9 34 1m-29 13q12 7 22 0m-16 10 9 2','none',1)+p('M-13-14-10-4m41 14 6 3m-38 10-6 5M1 37l-4 9','none',1),x,y,angle,scale);

  function ducana(){
    return plate()+t(bananaLeaf(),-4,-15,-9,.82)+p('M44 69 100 53l23 43-60 21-24-19Z',cream)+p('M44 69 66 88l57 8m-57-8-3 29','none',1.2)+dots([[55,75],[71,99],[92,68],[101,88],[82,81]],brown,1.6)+p('M33 105q-9 9-6 24l30-12Z',olive);
  }
  function conchSalad(){
    const cubes=[[47,78],[66,69],[86,78],[105,71],[119,87],[63,93],[91,99]];
    return bowl(pale)+cubes.map(([x,y],i)=>t(p('M-6-5 4-7l5 9-10 4-6-4Z',i%3===0?clay:pale,1.2),x,y)).join('')+
      p('M45 96l6-7m28-6 6-9m19 18 7-3m-42-29 7 4','none',olive,2)+lime(116,53,.8)+herb(40,62,.8)+
      t(p('M-23 11-8-8l3-10 8 4 8-8 4 12 14 1-5 9 7 10-17 7-10 12-10-8Z',cream)+p('M-9 3q11-15 22-1-1 14-15 10 8-10 11-4','none',1.4)+p('M15-6q-4 13 11 14','none',1),36,125,-15,.65);
  }
  function coucou(){
    return plate()+p('M24 104q1-36 23-41 28-1 30 39-20 18-53 2Z',gold)+p('M33 94q15 4 30-1','none',1.1)+
      dots([[39,83],[53,74],[62,94]],olive,2)+fillet(101,89,-24,.9)+fillet(104,110,-19,.85)+p('M81 107q28 21 53 2',clay,3)+herb(119,63,.8);
  }
  function belizeRice(){
    return plate()+rice(77,92,1.4)+beans([[47,94,-25],[61,76,30],[80,93],[99,78,-20],[112,98,35],[72,110,50],[93,110]])+
      grains([[57,99,30],[72,86,-45],[87,72,45],[100,101,25],[80,104,-30]],cream)+p('M37 121h86','none',1);
  }
  function ajiaco(){
    return steam()+pot(cream)+corn(50,69,-20,.7)+wedge(78,68,20,.7)+cube(108,80,clay,.8)+
      banana(77,89,65,pale,.65)+p('M102 58q14 0 13 10-10 9-18 1Z',gold)+herb(47,99,.8)+p('M59 114q19 6 40 0','none',1);
  }
  function callaloo(){
    return spoon(126,63,-25)+p('M22 84q5 44 58 47 53-3 58-47Z',stone)+e(80,84,58,24,pale)+e(80,83,48,17,olive)+
      p('M39 82q16-11 33-2t45 1m-65 9q27 10 51-1','none',1.3)+p('M68 76q10-19 22-9-3 16-22 9Z',olive)+
      p('M71 75 85 69','none',1)+dots([[42,81],[58,91],[94,80],[110,88]],brown,1.4);
  }
  function bandera(){
    return plate()+rice(47,86,1)+p('M66 98q-10-23 8-26 22-9 35 5 8 20-11 32-18 8-32-11Z',clay)+
      beans([[75,83],[93,82,25],[76,98,-20],[92,101,40]])+cube(119,108,brown,.95)+cube(119,80,clay,.75)+
      p('M20 111q4-13 14-8l15 16-22 4Z',olive)+onion(29,110,25);
  }
  function pupusas(){
    const disk=(x,y,s)=>t(e(0,4,35,19,cream)+e(0,0,35,18,gold)+p('M-21-3q6-5 11 0m13-7 10 3m-2 15 11-4m-24 0 6 3','none',brown,3),x,y,0,s);
    return plate()+disk(57,80,1)+disk(90,106,1.05)+e(121,66,21,11,clay)+p('M109 65q11-4 24 0','none',1)+
      p('M27 113q-2-12 9-14 7-7 14 1-3 12-23 13Z',olive)+p('M29 109l12-8m-7 12 12-9','none',1);
  }
  function oilDown(){
    return pot(gold)+wedge(47,79,-30,.85)+wedge(109,72,28,.85)+cube(77,73,clay,.8)+
      t(p('M-6-17q6-4 12 1l-3 33q-5 5-10 0Z',pale)+p('M-1-11v20','none',1),78,92,-55)+
      p('M100 94q-12-7-12 6 5 11 18 2 11 7 15-3-2-13-13-8Z',olive)+p('M95 99h19','none',1)+herb(51,55,.7);
  }
  function pepian(){
    return plate()+e(77,98,49,23,clay)+p('M55 105q-15-13-1-27 13-8 24-4l18 19-8 15Z',brown)+
      p('M82 88 103 63q-6-8-1-11 5-4 9 3 6-4 9 1 2 7-6 9L94 94Z',cream)+
      wedge(112,107,12,.7)+p('M39 98q3-21 9-31m-4 12 6 1','none',olive,4)+
      dots([[49,96],[65,87],[83,104],[106,92],[77,79],[93,112]],gold,1.5)+rice(36,76,.63);
  }
  function pepperpot(){
    return pot(brown)+cube(54,75,clay,.9)+cube(82,90,brown,1)+cube(110,72,clay,.8)+
      p('M69 56 102 64l-2 5-33-6Z',toastColor())+p('M72 59 98 66','none',1)+
      p('M43 91q-13-11-17-2 6 11 17 2Z',clay)+herb(114,90,.7)+
      t(p('M-18 13q-8-28 9-34 15-6 22 14l-4 20Z',gold)+p('M-10-4 18 3','none',1.5),29,118,-30,.6);
  }
  function toastColor(){return '#ae8f69';}
  function joumou(){
    return bowl(gold)+wedge(55,71,-15,.8)+cube(97,82,clay,.8)+p('M54 95q4-16 14-8t17-4m2-18q7 15 18 5','none',pale,3)+
      c(114,88,6,clay)+p('M112 83v9m-4-5h9','none',1)+herb(73,61,.85)+
      p('M24 133q-10-25-4-41 17-2 26 9l-9 32Z',gold)+p('M19 107 39 116m-19 1 16 7','none',1);
  }
  function baleadas(){
    return plate()+p('M23 88q0-40 42-40 42 1 43 42Z',cream)+p('M25 86q40-17 83 3l-12 24H35Z',brown)+
      p('M35 85q7 3 14-1t15 1 16 0 16 2','none',pale,5)+
      p('M24 88q9 37 43 37 35 0 42-35-41 9-85-2Z',gold)+p('M43 107h7m15 10h8m12-14 6-1','none',brown,2.5)+
      t(p('M-21 10q5-34 26-30 20 8 19 30Z',cream)+p('M-15 7q18-11 35 0',brown,4),121,90,25,.7);
  }
  function ackee(){
    const arils=[[36,88],[59,71],[78,92],[105,77],[119,101],[53,109]];
    return plate()+p('M28 101q-6-14 9-19 8-17 26-12 17-9 30 3 22-3 33 17 10 22-22 31-41 10-76-20Z',cream)+arils.map(([x,y],i)=>t(p('M-11 1q-3-10 5-11 4-7 11-1 9 1 7 8 7 7-3 11-12 7-20-7Z',gold),x,y,i*24,.72)).join('')+
      [[45,79],[87,75],[105,101],[74,116]].map(([x,y])=>t(p('M-9-3 2-6l10 4-8 8-12-2Z',pale,1.2)+p('M-6-1 6 2','none',.8),x,y)).join('')+
      onion(88,104,-15)+p('M32 98l15 3m15-17 4 7m45-19 12 9','none',olive,3)+dots([[66,102],[101,90],[39,111]],clay,3);
  }
  function nacatamal(){
    return bananaLeaf()+p('M42 75 85 58l38 25-2 34-55 12-28-24Z',gold)+p('M42 75 71 97l52-14m-52 14-5 32',cream)+
      p('M55 83 83 69l24 16-34 7Z',pale)+cube(81,80,clay,.55)+dots([[65,83],[92,76]],olive,2)+
      p('M20 102 41 108l27 31-32-9Z',olive)+p('M133 99 144 88l-4 42-34 10Z',olive);
  }
  function sancocho(){
    return steam()+bowl(cream)+p('M50 88q-10-16 2-27 12-7 23 6l-5 18Z',clay)+p('M67 69 87 48q-5-6 1-9 6-2 7 5 8-1 9 5-3 6-10 3L78 76Z',pale)+
      wedge(107,79,45,.8)+wedge(72,94,-40,.6)+herb(103,59,.85)+
      p('M40 86q13 3 21 0m21 7 17 1','none',1);
  }
  function chipa(){
    const ring=(x,y,angle,scale)=>t(e(0,4,30,25,gold)+p('M-30 0a30 23 0 1 1 60 0 30 23 0 1 1-60 0Zm18 0a12 9 0 1 0 24 0 12 9 0 1 0-24 0Z',cream)+p('M-24-5-17-9m29 23 6-4m-2-24 5 4','none',brown,2),x,y,angle,scale);
    return plate()+ring(59,81,-20,1)+ring(102,101,17,1)+ring(110,60,22,.65);
  }
  function goatWater(){
    return p('M35 78H14v19h24m84-19h23v19h-23',brown)+p('M35 76v34q0 25 45 26 44-1 44-26V76Z',gold)+e(80,76,45,23,pale)+e(80,76,38,17,clay)+
      cube(62,70,brown,.72)+cube(92,82,brown,.8)+p('M96 62q-8-7-4-11 6-5 10 2l8 4-4 7Z',pale)+
      p('M48 81q4-9 10-4m15 8q5-8 10-2m18-7 6-1','none',pale,2.5)+herb(72,58,.65)+steam();
  }
  function greenFig(){
    return plate()+banana(46,82,-44,pale,1)+banana(69,92,-39,pale,.97)+banana(92,96,-38,pale,.9)+
      p('M100 68q7-11 19-4l10 12-8 10-22-3Z',cream)+[[103,71],[116,78],[98,84],[129,90]].map(([x,y])=>p(`M${x-6} ${y-2}l12 4-10 3Z`,pale,1)).join('')+
      onion(119,105,12)+herb(126,60,.75);
  }
  function breadfruitJackfish(){
    return plate()+wedge(44,90,-35,1)+wedge(72,113,-65,.9)+fish(107,80,-34,.8)+
      p('M27 91q9 13 18 21m17-6 4 17','none',olive,4)+dots([[40,84],[42,95],[64,112]],brown,1.2)+lime(127,123,.65);
  }
  function doubles(){
    return p('M14 86 62 51l86 38-30 46-82-1Z',pale)+p('M23 97q-8-34 25-42 41-3 43 25 0 28-35 33Z',gold)+
      p('M63 107q-11-26 19-40 37-10 54 17 6 30-29 40-30 6-44-17Z',cream)+
      [[49,78],[61,69],[71,81],[46,92],[63,95],[85,86],[99,95],[116,94],[109,111],[87,108],[77,99]].map(([x,y])=>c(x,y,5,gold)+p(`M${x} ${y-2}l2 3`,'none',.8)).join('')+
      p('M43 91q31-13 65 13','none',olive,3)+p('M69 91q16 13 50 14','none',clay,3);
  }
  function chivito(){
    return plate()+p('M29 106q5 30 49 29 48 1 52-29Z',gold)+p('M28 104q16-12 40-4t62-1l-2 15q-52 14-99-2Z',brown)+
      p('M29 94 48 86l16 6 15-8 19 8 15-7 19 12-2 9-102 1Z',olive)+
      p('M29 89 130 87l-18 18-25-11-25 12Z',cream)+e(81,82,49,13,clay)+
      p('M29 77q2-36 47-38 47-3 54 36-46 18-101 2Z',gold)+p('M49 56h3m12-8h4m18 3h4m12 9h3','none',pale,2)+
      p('M66 86q-10-7-6-15 9-10 25-3 17 3 12 13-12 10-31 5Z',pale)+e(79,75,8,6,gold);
  }
  function arepa(){
    return plate()+e(66,92,42,25,gold)+p('M24 86q0-37 41-38 43-1 44 37-39 22-85 1Z',cream)+
      p('M36 81q9-8 14-3m30-10 10 6m-24-16 7 1','none',brown,3)+
      t(p('M-29 9q1-34 28-35 27 2 28 35-27 16-56 0Z',gold)+p('M-26 9q24-13 53 0l-6 11-39 1Z',olive)+p('M-27 15q22 29 53 0','none',cream,8),110,108,-19,.9);
  }
  function pom(){
    return p('M19 90 112 56l32 36-6 40-92 13-25-23Z',clay)+p('M19 90 112 56l32 36-96 28Z',gold)+
      p('M26 89 109 65l24 26-85 20Z',cream)+p('M69 103 119 87v37l-52 11Z',gold)+
      p('M71 115 117 99v16l-47 12Z',clay)+cube(91,111,brown,.5)+p('M35 86l11 3m10-13 12 3m12-12 11 4m7 13 10 3m-38 11 9 1','none',brown,2)+
      p('M23 98 45 129m80-28 9 28','none',1.2);
  }
  function kokoda(){
    return p('M26 83q1 49 54 52 54-4 56-52Z',brown)+e(80,83,55,27,pale)+e(80,82,45,18,pale)+
      [[45,80],[60,68],[81,82],[104,72],[114,91],[62,95],[96,98]].map(([x,y],i)=>cube(x,y,i%3===0?clay:pale,.48)).join('')+
      p('M35 97 49 119m-21-13 5 7m74-5 5 18m11-27 9 12','none',1)+herb(86,59,.8)+lime(125,59,.8);
  }
  function babai(){
    return leaf(50,48,-35,.75)+p('M62 54 81 74m-17-36 15 37',olive,4)+
      tuber(82,101,-24,1.02)+p('M61 130 48 139m35-4 5 12m13-21 14 7','none',1.1)+
      t(e(0,0,18,25,pale)+dots([[-7,-7],[3,-14],[7,1],[-4,12],[5,17]],cream,1.4),120,117,20,.75);
  }
  function bwiro(){
    // A documented preserved-breadfruit preparation served in leaves; the
    // illustration makes no claim that all households use the same wrapping.
    return leaf(75,89,-66,1.15)+p('M32 99q9-28 36-36 23-8 52 19l-8 30-60 10Z',cream)+
      p('M42 92q16-12 35-9t32 6m-62 13q25-11 51-2','none',1.2)+
      p('M31 100 67 124l-35 9-15-22Z',olive)+p('M121 79 143 86l-5 42-32-18Z',olive)+
      dots([[54,82],[70,101],[91,80],[97,106]],gold,1.3);
  }
  function karat(){
    const fruit=(x,y,angle,scale=1)=>t(p('M-7-25q-14-2-16 13-5 30 17 43 13 6 19-6 11-21 2-42L5-26Z',clay)+p('M-12-14q-7 20 7 38M3-20q10 27 4 43','none',1.1),x,y,angle,scale);
    return p('M70 34 63 20l12-4 12 22Z',olive)+fruit(52,77,29)+fruit(91,68,-10)+
      t(p('M-14-24q-12 16-5 40 9 17 25 9 13-11 9-34L6-27Z',gold)+p('M-11-19q-4 25 7 40','none',1.2)+
      p('M-18-4q-8 5-9 25 13-4 16-16m30-8q16 8 18 24-16-4-19-16Z',clay),111,111,-42,.9);
  }
  function coconutFish(){
    return plate()+p('M30 88q45-24 95-1l7 27q-49 20-103-5Z',pale)+fillet(74,90,8,1.7)+
      p('M42 85q24 4 48-4m-38 14q24 7 44 0','none',pale,4)+coconut(126,63,.75)+herb(40,66,.8);
  }
  function palauTaro(){
    return leaf(110,50,31,.73)+p('M105 75 76 88',olive,4)+tuber(64,100,34,1)+tuber(112,111,-20,.7)+
      t(e(0,0,18,23,pale)+p('M-8-8l3 2m8-9 2 4m-8 9 2 3m9 4-3 2m-7 9h4','none',clay,1.2),35,124,-18,.7);
  }
  function mumu(){
    return p('M14 104 41 50l109 43-19 48-97-4Z',olive)+p('M19 107q53 14 113 25m-95-71 80 65','none',1)+
      wedge(42,91,-12,.8)+wedge(103,115,20,.9)+cube(75,82,clay,1.05)+corn(116,80,34,.7)+
      p('M38 122q-8-21 3-22 16 4 17 23Z',pale)+p('M78 112q5-17 20-15-2 19-20 15Z',olive)+
      p('M18 104 35 137l24-5m76-28 10 24-21 11','none',1.2);
  }
  function palusami(){
    return plate()+p('M39 119q-19-15-4-32-13-18 7-24 2-19 22-10 18-12 31 4 23-4 24 17 20 13 5 31-3 20-32 21Z',olive)+
      p('M43 88q13-22 29-13 16-13 32 1 15 13 1 29-32 18-62-17Z',pale)+
      p('M41 59q11 11 20 17m47-16-19 14m34 19-18 8m-62 0-10 16m39-4-5 14','none',1.2)+
      p('M57 89q18 5 35-4','none',1.1);
  }
  function cassava(){
    const root=(x,y,angle,scale)=>t(p('M-10-34q19-6 20 13 0 30-9 57-10 13-17-1-3-25-2-57Z',brown)+p('M-8-20 6-16m-15 7 15 4m-15 7 13 3m-11 10 9 3m-8 10 6 1','none',1),x,y,angle,scale);
    return root(62,83,48,1.2)+root(105,86,30,1.05)+t(p('M-15-11 15-11v33h-30Z',brown)+e(0,-11,15,10,pale)+p('M0-18v14m-7-7 14 1','none',1),103,126,-16,.9)+
      p('M44 48 35 27m7 13-20-4m19 2 3-18','none',olive,3);
  }
  function luPulu(){
    return bananaLeaf()+p('M40 110 37 76l15-17 21 5 23-9 24 17 4 38-19 15-46 2Z',olive)+
      p('M48 85q10-18 32-12 25-6 32 18 5 21-30 25-34-3-34-31Z',pale)+
      [[63,89],[80,81],[98,88],[88,102],[66,105]].map(([x,y])=>cube(x,y,clay,.5)).join('')+
      onion(83,95,30)+p('M47 68 58 84m49-18-8 12m23 29-13-5m-55 17-7 6','none',1.1);
  }
  function pulaka(){
    return tuber(63,98,-52,1.24)+p('M80 63 116 35',olive,4)+leaf(123,37,53,.53)+
      t(e(0,2,23,27,brown)+e(0,-2,21,24,pale)+dots([[-9,-11],[6,-14],[-6,3],[10,5],[1,16]],cream,1.5),113,114,34,.9)+
      p('M30 97 17 102m15 7-11 10m21 2-7 14','none',1.1);
  }
  function laplap(){
    return bananaLeaf()+p('M31 83q46-38 99 3v24q-41 26-97-1Z',gold)+
      p('M31 83q46-38 99 3-45 26-99 0Z',pale)+p('M80 61v34l34 24M80 95l-27 25','none',1.4)+
      p('M45 80q8-4 13-2m41 2 8 2m-34-11 10 2','none',cream,3)+p('M41 102q20 7 37 3','none',1.1);
  }
  function chowder(){
    return p('M26 81q-2 48 53 49 50-2 50-49Z',stone)+p('M130 86q24-5 18 18-8 15-21 7','none',3)+
      e(78,80,53,23,pale)+e(78,80,45,16,pale)+[[48,75],[67,87],[95,75],[105,90]].map(([x,y])=>cube(x,y,cream,.4)).join('')+
      p('M48 84q5-11 12-3 4 9-12 3Zm31-12q6-10 13-3 4 8-13 3Z',clay,1.2)+
      [[51,61],[109,59],[93,99]].map(([x,y])=>t(r(-7,-7,14,14,pale,2)+dots([[-3,-3],[3,-3],[-3,3],[3,3]],brown,1),x,y,15)).join('')+herb(76,68,.5);
  }
  function lamington(){
    const cake=(x,y,scale)=>t(p('M-27-10 4-25l31 13v34L3 38-30 23Z',brown)+p('M-27-10 3 3l32-15M3 3v35','none',1.2)+
      grains([[-19,-10,50],[-6,-17,80],[13,-12,-35],[26,-9,40],[-21,3,-20],[-13,18,55],[-1,8,30],[12,17,65],[26,10,-25],[7,29,10]],pale),x,y,0,scale);
    return plate()+cake(57,79,1)+cake(111,102,.83)+cake(107,58,.62);
  }
  function hangi(){
    // A basket of cooked food expresses the documented earth-oven method;
    // no ceremonial objects or invented ritual imagery are added.
    return p('M16 77 119 54l28 43-21 42-100-9Z',stone)+p('M16 77 47 110l100-13m-100 13-21 20','none',1.5)+
      p('M26 87 132 68m-97 28 103-15m-89 28 94-16m-83 20 74 17M40 72l18 32m1-36 18 32m2-36 18 32m2-36 18 33','none',1)+
      wedge(53,83,-35,.85)+cube(88,75,clay,1)+p('M97 102q3-26 24-28 14 5 5 19-12 18-29 9Z',gold)+
      p('M44 100q4-13 14-10 2-11 13-6 16 15-3 29Z',olive)+p('M53 97 64 107','none',1.1)+steam();
  }
  function cornPie(){
    return p('M23 85H10v15h19m103-15h18v15h-19',clay)+p('M22 86q2 46 58 48 56-2 58-48Z',clay)+
      e(80,84,58,27,brown)+e(80,81,51,22,gold)+p('M45 78q10-7 22-2m18-7 16 3m-42 17 18 4m23-9 13 3','none',brown,3)+
      p('M93 91 124 78v40l-31 13Z',gold)+p('M96 110 121 98v16l-25 10Z',brown)+cube(107,111,clay,.35)+corn(33,50,-28,.65);
  }
  function saltena(){
    return plate()+p('M28 103q-6-21 22-44 15-11 29-9 34 4 55 40 5 12-8 20-65 26-98-7Z',gold)+
      p('M32 95q27-43 56-36 25 6 41 36','none',brown,2.8)+
      p('M34 91q0-8 7-7 0-9 8-8 1-10 9-8 5-10 12-6 7-9 14-2 9-4 13 3 9-1 12 7 9 2 11 11','none',cream,3)+
      p('M47 103q21 9 51 0m9-13 6 6','none',1.2);
  }
  function galloPinto(){
    return plate()+rice(63,92,1.3)+beans([[36,90],[49,75,35],[71,82,-20],[88,95,30],[54,107],[75,112,-40]])+
      p('M87 74q-4-13 9-17 13-15 29-3 14 4 6 21-18 15-44-1Z',pale)+e(111,63,12,9,gold)+
      p('M101 112q4-16 18-12 13 11 3 24-19 4-21-12Z',gold)+p('M108 110l10 8m-6-13 9 8','none',brown,2)+herb(35,68,.6);
  }
  function encebollado(){
    return bowl(clay)+fillet(74,82,-13,.85)+wedge(47,85,-35,.6)+wedge(110,93,18,.65)+
      onion(65,70,-20)+onion(92,70,15)+onion(86,90,-17)+onion(110,80,-15)+herb(77,53,.85)+lime(126,112,.7)+
      p('M36 82q4 11 15 12','none',pale,2);
  }

  return {
    AG:{name:'Ducana',draw:ducana},
    BS:{name:'Ensalada de caracola (conch salad)',draw:conchSalad},
    BB:{name:'Cou-cou con pez volador',draw:coucou},
    BZ:{name:'Arroz y frijoles beliceños',draw:belizeRice},
    CU:{name:'Ajiaco cubano',draw:ajiaco},
    DM:{name:'Sopa callaloo',draw:callaloo},
    DO:{name:'La bandera dominicana',draw:bandera},
    SV:{name:'Pupusas',draw:pupusas},
    GD:{name:'Oil down',draw:oilDown},
    GT:{name:'Pepián',draw:pepian},
    GY:{name:'Pepperpot guyanés',draw:pepperpot},
    HT:{name:'Sopa joumou',draw:joumou},
    HN:{name:'Baleadas',draw:baleadas},
    JM:{name:'Ackee con pescado salado',draw:ackee},
    NI:{name:'Nacatamal',draw:nacatamal},
    PA:{name:'Sancocho panameño',draw:sancocho},
    PY:{name:'Chipa',draw:chipa},
    KN:{name:'Goat water',draw:goatWater},
    LC:{name:'Plátano verde con pescado salado',draw:greenFig},
    VC:{name:'Fruta del pan con jackfish',draw:breadfruitJackfish},
    TT:{name:'Doubles',draw:doubles},
    UY:{name:'Chivito',draw:chivito},
    VE:{name:'Arepa venezolana',draw:arepa},
    SR:{name:'Pom',draw:pom},
    FJ:{name:'Kokoda',draw:kokoda},
    KI:{name:'Babai (taro gigante de pantano)',draw:babai},
    MH:{name:'Bwiro',draw:bwiro},
    FM:{name:'Banana Karat de Pohnpei',draw:karat},
    NR:{name:'Pescado con coco',draw:coconutFish},
    PW:{name:'Taro de Palaos',draw:palauTaro},
    PG:{name:'Mumu',draw:mumu},
    WS:{name:'Palusami',draw:palusami},
    SB:{name:'Yuca de las Islas Salomón',draw:cassava},
    TO:{name:'Lu pulu',draw:luPulu},
    TV:{name:'Pulaka',draw:pulaka},
    VU:{name:'Laplap',draw:laplap},
    US:{name:'Clam chowder de Massachusetts',draw:chowder},
    AU:{name:'Lamington',draw:lamington},
    NZ:{name:'Hāngī',draw:hangi},
    CL:{name:'Pastel de choclo',draw:cornPie},
    BO:{name:'Salteña',draw:saltena},
    CR:{name:'Gallo pinto costarricense',draw:galloPinto},
    EC:{name:'Encebollado',draw:encebollado},
  };
}
