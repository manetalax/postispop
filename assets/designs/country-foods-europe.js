// Original food studies for the country collection. Each drawing returns SVG
// contents for a 160 × 160 viewBox. No external images, IDs, fonts or scripts.
// These are specific culinary examples, not claims of national exclusivity.
const gold = '#c4ad81', leaf = '#8ca17c', cream = '#d1bf97';
const pale = '#eee6d3', toast = '#aa896b', sauce = '#b58d73', berry = '#968779';
const P = (d, fill = 'none', width = 1.8) => `<path d="${d}" fill="${fill}" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const E = (x, y, rx, ry, fill = 'none', width = 1.8) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="currentColor" stroke-width="${width}"/>`;
const C = (x, y, r, fill = 'none', width = 1.8) => E(x, y, r, r, fill, width);
const R = (x, y, w, h, fill = 'none', radius = 0, width = 1.8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="currentColor" stroke-width="${width}"/>`;
const G = (body, transform) => `<g transform="${transform}">${body}</g>`;
const plate = () => E(80, 104, 66, 34, pale) + E(80, 102, 55, 25, 'none', 1);
const steam = () => P('M63 39q-6-7 0-14m18 9q-6-7 0-14m17 19q-6-7 0-14', 'none', 1.3);
const herb = (x, y) => G(P('M0 11V-9m0 9-7-5m7 0 7-5', 'none', 1.2) + P('M-1 2Q-14 1-10-7-2-7-1 2Zm2-4Q3-12 11-9 13-2 1-2Z', leaf, 1), `translate(${x} ${y})`);
const grains = (points, fill = pale) => points.map(([x, y, rotation = 0]) => G(E(0, 0, 1.7, 4, fill, 0), `translate(${x} ${y}) rotate(${rotation})`)).join('');

function brusselsWaffle() {
  const pockets = Array.from({length: 4}, (_, row) => Array.from({length: 5}, (_, col) => R(35 + col * 17, 45 + row * 19, 11, 12, toast, 1.5, 1.1)).join('')).join('');
  return E(80, 124, 61, 17, pale) + G(
    P('M28 38h103v82q0 6-6 6H34q-6 0-6-6Z', toast) + R(28, 32, 103, 86, gold, 6) + pockets +
    P('M34 38h90M33 112h93', 'none', 1) + P('M95 33q1-12 10-11 2-10 9-7 7 2 5 10 10 3 7 13Z', pale),
    'rotate(-8 80 80)');
}

function zagorjeStrukli() {
  const roll = (x, y) => G(P('M0 0q11-6 26-1l9 27q-12 8-28 1Z', cream) + E(20, 27, 14, 6, pale) + P('M12 27q8-6 16 0-7 5-12 0', 'none', 1.2) + P('M2 2q7 6 13 1t12 2', pale, 1.2) + E(12, 8, 3, 1.5, gold, 0), `translate(${x} ${y})`);
  return P('M23 80H9v16h17m108-16h16v16h-16', cream) + P('M22 85q4 45 58 47 54-2 58-47Z', gold) +
    E(80, 85, 59, 29, pale) + E(80, 85, 49, 21, cream, 1) +
    roll(40, 61) + roll(73, 59) + roll(103, 67) + roll(51, 83) + roll(84, 85) + herb(121, 54);
}

function svickova() {
  const dumpling = (x, y) => G(E(0, 0, 12, 20, pale) + P('M-5-11q6-4 10 0M-6 2h3m7 9h2', 'none', 1.1), `translate(${x} ${y}) rotate(-28)`);
  return plate() + P('M46 85q11-17 37-11 24-13 41 4 19 16-2 29-27 14-63 5-20-3-13-27Z', cream, 1) +
    P('M64 66q24-9 49 10l-7 17q-26-10-48-4Z', toast) + P('M58 89q27-6 48 4v8q-25-12-48-5Z', sauce, 1) +
    P('M75 78q18-5 28 5m-32 4q13-4 25 5', 'none', 1.1) + dumpling(39, 83) + dumpling(47, 103) + dumpling(60, 116) +
    C(117, 88, 12, gold) + C(117, 88, 8, pale, 1) + P('M117 80v16m-8-8h16', 'none', 1) +
    P('M105 93q3-9 7-6 1-10 7-7 5 2 3 9 9 6 1 10Z', pale) + [0, 1, 2, 3].map(i => C(113 + i % 2 * 7, 97 + Math.floor(i / 2) * 5, 3, berry, 1)).join('');
}

function smorrebrod() {
  return E(80, 119, 63, 18, pale) +
    P('M23 79 107 47l32 39-84 42-32-15Z', toast) + P('M23 79 107 47l32 39-84 28Z', cream) +
    P('M31 78q10-15 20-8 10-18 22-9 12-14 20-5 16-11 20 1l12 26-71 24Z', leaf) +
    P('M40 82q19-23 34-20l41 15q-21 2-29 19Z', pale) + P('M44 83q30-6 43 10m-30-17 36 11', 'none', 1.1) +
    G(E(0, 0, 14, 21, pale) + E(0, 3, 8, 10, gold, 1), 'translate(94 65) rotate(45)') +
    G(E(0, 0, 9, 17, leaf) + E(0, 0, 5, 12, pale, 1) + P('M0-8v16', 'none', 1), 'translate(120 84) rotate(28)') +
    herb(64, 60) + P('M48 121l4 3m15-6 4 1m18-10 4 1m19-10 4 1', 'none', 1);
}

function karelianPasty() {
  const pasty = () => P('M0-40q11 2 15 12l8 8-1 12 4 10-5 10 1 11-8 8Q8 43 0 44q-12-5-15-14l-8-9 1-10-4-10 5-12-1-10 9-9Q-9-39 0-40Z', toast) +
    P('M0-31q12 2 13 18l5 12-4 13Q13 29 0 34q-14-8-13-23l-4-12 5-15Q-11-30 0-31Z', pale) +
    P('M-14-28-5-24m-16 9 9 4m-13 9 9 2m-7 11 9-2m-7 15 10-5m27-43-8 5m14 10-8 3m11 10-9 2m6 11-8-2m4 14-7-6', 'none', 1.1) +
    grains([[-2,-21,35],[5,-10,-35],[-4,-4,15],[3,5,35],[-4,13,-25],[2,23,65]]);
  return E(80, 123, 62, 19, pale) + G(pasty(), 'translate(107 73) rotate(35) scale(.85)') + G(pasty(), 'translate(64 87) rotate(-35)');
}

function currywurst() {
  const slice = (x, y, angle) => G(P('M-10-13q10-6 20 0l-1 17q-9 8-18 0Z', toast) + E(0, 3, 9, 5, cream, 1) + P('M-6-10q5 5 12 0', sauce, 2), `translate(${x} ${y}) rotate(${angle})`);
  return P('M14 86 31 68l110 15 5 31-118 21Z', pale) + P('M14 86l16 9 111-12m-111 12-2 40', 'none', 1.2) +
    P('M36 85q-9-18 6-24 5-3 13 0l-3 24q-11 8-16 0Z', toast) +
    slice(63, 83, -12) + slice(83, 84, 2) + slice(104, 82, 10) + slice(122, 78, 22) +
    P('M36 68q12-8 22 2t21 0 21 3 22-7', sauce, 5) +
    [[41,65],[51,72],[66,65],[82,69],[97,75],[111,64],[120,71]].map(([x,y])=>C(x,y,1.2,gold,0)).join('') +
    P('M109 49 119 21l6 2-10 28m3-27 1-9m4 10 2-9', pale, 1.4);
}

function goulash() {
  const cube = (x, y) => G(P('M-8-5 3-9l10 8-5 13-16-4Z', toast) + P('M-8-5 2 2l11-3M2 2 0 9', 'none', 1), `translate(${x} ${y})`);
  return steam() + P('M27 77H10v21h21m98-21h21v21h-21', gold) + P('M26 78q2 50 54 52 54-2 54-52Z', gold) +
    E(80, 78, 54, 27, pale) + E(80, 79, 46, 21, sauce, 1) +
    cube(59, 71) + cube(89, 87) + cube(111, 68) + P('M71 58 83 59l-1 13-15-3Z', cream, 1) +
    P('M41 85q6-10 14-5l-1 11Z', cream, 1) + E(105, 90, 8, 3, gold, 1) + herb(88, 62) + P('M52 116q26 12 52 0', 'none', 1);
}

function skyr() {
  return P('M123 78 136 33q3-9 9-6 4 2 0 11l-16 43Z', cream, 1.4) + E(80, 130, 31, 6, gold, 1) +
    P('M23 78q4 49 57 53 53-4 57-53Z', cream) + E(80, 77, 57, 24, pale) +
    P('M37 77q8-25 33-24 15-20 31-8-13-3-15 5 23 0 29 14 21 10 4 20-40 16-82-7Z', pale) +
    P('M48 73q17-13 41-4-11-1-18 5 24-6 39 4', 'none', 1.2) +
    [[52,79],[63,88],[116,78],[109,91],[122,89]].map(([x,y])=>C(x,y,5.5,berry,1)+P(`M${x-2} ${y-1}h4m-2-2v4`, 'none', .8)).join('') +
    P('M94 60q2-13 15-9-4 11-15 9Zm1-1q-12-1-12-10 13-2 12 10Z', leaf, 1.1);
}

function irishStew() {
  const potato = (x,y,r=0) => G(P('M-12 2q-1-14 12-15 15 4 12 18-10 10-24-3Z', pale) + P('M-7-4 0-7m3 10 3 1', 'none', 1), `translate(${x} ${y}) rotate(${r})`);
  return P('M24 82q-22-10-19 9 4 12 24 8m104-17q22-10 19 9-4 12-24 8', gold) +
    P('M23 88q3 40 57 42 52-1 58-42Z', gold) + E(80, 84, 59, 29, pale) + E(80, 85, 50, 21, toast, 1) +
    potato(48,74,-20) + potato(108,85,35) + potato(76,99,15) +
    P('M66 58 85 57l11 11-7 17-26-7Z', sauce) + P('M73 63 83 72l10-4', 'none', 1) +
    G(R(-5,-20,10,36,gold,4)+P('M-4-10h6m-6 10h5m-5 9h7','none',1), 'translate(46 99) rotate(-50)') +
    G(R(-4,-15,8,27,gold,3)+P('M-3-4h5m-5 10h4','none',1), 'translate(120 68) rotate(36)') + herb(96,53) + herb(104,110);
}

function stroopwafel() {
  const lattice = (x,y,rx,ry) => E(x,y,rx,ry,gold) + Array.from({length:7},(_,i)=>{
    const dx=(i-3)*10, reach=Math.sqrt(1-(dx/rx)**2)*ry;
    return P(`M${x+dx} ${y-reach}v${2*reach}`,'none',1.2);
  }).join('') + Array.from({length:5},(_,i)=>{
    const dy=(i-2)*9, reach=Math.sqrt(1-(dy/ry)**2)*rx;
    return P(`M${x-reach} ${y+dy}h${2*reach}`,'none',1.2);
  }).join('');
  return E(80,126,61,16,pale) + E(70,102,47,28,toast) + E(70,98,47,28,cream) + lattice(70,94,47,28) +
    G(E(0,4,43,28,toast)+lattice(0,0,43,28), 'translate(100 61) rotate(-22)') +
    P('M47 122q12 4 22 3m30-41 18-5', 'none', 1);
}

function farikal() {
  const cabbage = () => P('M-20 14Q-28-17-7-32 14-26 23 10L0 25Z', leaf) +
    P('M-7-30 0 25m-3-15-17-17m18 3 18-15M-4 0-17-18m16 17 8-19m-3 38 13-9', 'none', 1.2);
  return P('M19 90q7 39 61 42 55-3 61-42Z',cream) + E(80,89,61,28,pale) +
    G(cabbage(),'translate(53 79) rotate(-32)') + G(cabbage(),'translate(110 79) rotate(24)') +
    P('M61 100q-5-22 11-28 18-4 28 9 16 11 2 24-20 12-41-5Z',toast) +
    P('M82 87 71 68q-8 3-10-3-2-6 5-8-1-8 6-8 7 1 5 8l14 25Z',pale,1.3) +
    P('M70 98q10-8 23-3','none',1.2) + [[47,110],[63,110],[104,114],[121,97],[91,65],[72,84]].map(([x,y])=>C(x,y,2.1,berry,1)).join('');
}

function pierogi() {
  const dumpling = () => P('M-24 8Q-24-19 0-20 25-17 25 8 0 27-24 8Z',cream) +
    P('M-24 8q5-5 6 2 6-4 7 3 5-4 8 2 4-5 8 0 3-6 8-3 2-7 7-4 0-7 5-7',pale,1.3) +
    P('M-14 0q8-15 22-8','none',1.1);
  return plate() + G(dumpling(),'translate(51 75) rotate(-24) scale(.8)') + G(dumpling(),'translate(101 72) rotate(22) scale(.8)') +
    G(dumpling(),'translate(47 104) rotate(12) scale(.8)') + G(dumpling(),'translate(96 101) rotate(-15) scale(.9)') +
    P('M75 61q1-10 8-8 8 1 3 8m-12 55q1-8 8-7',gold,1.3) + herb(127,102);
}

function sarmale() {
  const roll = (x,y,angle) => G(P('M-24-11q23-10 46 0 8 12 0 24-24 9-46-2-7-10 0-22Z',leaf) +
    P('M-17-13q9 12 0 26m28-27q-9 13 0 28M-6-14 4 13m-7-6 10-5m-11-1 8-5', 'none',1.2), `translate(${x} ${y}) rotate(${angle})`);
  return plate() + P('M28 109q-1-30 20-34 25-1 27 29-18 16-47 5Z',gold) +
    P('M33 101q17 6 35-2','none',1) + roll(101,77,-16) + roll(107,106,-12) + roll(69,99,66) +
    P('M102 63q1-9 6-8 1-10 7-7 4 2 2 8 8 6-1 10Z',pale) + P('M32 120q16 7 22 1',sauce,3);
}

function echpochmak() {
  return E(80,126,63,18,pale) + P('M23 111 65 34q5-8 13-2l63 79q5 10-6 13H31q-12 0-8-13Z',toast) +
    P('M27 104 66 36q5-9 13-1l58 70q5 10-5 14H35q-12-3-8-15Z',gold) +
    P('M34 105 70 43l58 63Z',cream,1) + P('M70 42 77 81m-42 24 37-16m55 17L86 88', 'none',3) +
    P('M69 50l7 3m-5 7 7 4m-5 7 7 4m-39 26 7 2m1-7 7 2m3-8 7 2m25-1 3 7m6-2 4 7m6-3 4 8','none',1.2) +
    P('M73 80 84 81l4 9-9 6-10-7Z',toast) + C(78,87,3.3,berry,1);
}

function swedishMeatballs() {
  return plate() + P('M31 85q2-13 12-13-3-13 9-16 9-2 13 7 15-5 18 7 12 8 6 20-29 19-58-5Z',pale) +
    P('M43 80q9-6 20-3m-16-8q9-4 18 0m-7 15 15-1','none',1.2) +
    P('M58 107q-5-23 30-27 44-8 45 15 0 24-44 26Z',sauce,1) +
    [[74,98],[93,87],[115,94],[93,112],[116,113]].map(([x,y])=>C(x,y,10,toast)+P(`M${x-4} ${y-4}q4-3 8 0`,'none',1)).join('') +
    [[129,69,-22],[119,58,10],[109,65,32]].map(([x,y,r])=>G(E(0,0,8,13,leaf)+E(0,0,4,9,pale,1),`translate(${x} ${y}) rotate(${r})`)).join('') +
    [[38,103],[47,109],[34,113],[44,120],[55,116]].map(([x,y])=>C(x,y,4,berry,1)).join('');
}

function fishAndChips() {
  const chip = (x,y,angle,h=38) => G(R(-4,-h/2,8,h,gold,1.5)+P(`M1 ${-h/2+3}v${h-6}`,'none',.8),`translate(${x} ${y}) rotate(${angle})`);
  return P('M14 91 34 58l108 29-17 47-78 4Z',pale) + P('M14 91 47 138l2-29 76 25','none',1.2) +
    chip(103,72,28) + chip(127,83,42) + chip(116,98,21) + chip(91,99,-16) + chip(110,115,64) + chip(132,104,23,28) +
    P('M29 94q-11-11-3-20l10-5q0-12 13-14l15 6q20 0 31 22 1 8-5 13l-11 6-16-2-14 7-11-5Z',gold) +
    P('M33 80q6-8 12-6m10-4 8 4m-21 14 9 3m11-10q9 0 16 8m-20 6 9-2', 'none',1.5) +
    P('M37 52 57 30q12 16 9 30Z',gold) + P('M42 50 56 36l7 19ZM56 36l-4 17','none',1) +
    [0,1,2].map(i=>C(31+i*13,117+i%2*5,1.5,toast,0)).join('');
}

export const europeanFoods = {
  BE: {name: 'Gofre de Bruselas', draw: brusselsWaffle},
  HR: {name: 'Štrukli de Zagorje', draw: zagorjeStrukli},
  CZ: {name: 'Svíčková na smetaně', draw: svickova},
  DK: {name: 'Smørrebrød', draw: smorrebrod},
  FI: {name: 'Pastel de Carelia (karjalanpiirakka)', draw: karelianPasty},
  DE: {name: 'Currywurst', draw: currywurst},
  HU: {name: 'Sopa goulash (gulyás)', draw: goulash},
  IS: {name: 'Skyr', draw: skyr},
  IE: {name: 'Estofado irlandés (Irish stew)', draw: irishStew},
  NL: {name: 'Stroopwafel', draw: stroopwafel},
  NO: {name: 'Fårikål', draw: farikal},
  PL: {name: 'Pierogi', draw: pierogi},
  RO: {name: 'Sarmale', draw: sarmale},
  RU: {name: 'Echpochmak de Tartaristán', draw: echpochmak},
  SE: {name: 'Albóndigas suecas (köttbullar)', draw: swedishMeatballs},
  GB: {name: 'Fish and chips', draw: fishAndChips},
};
