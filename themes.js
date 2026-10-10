// Shared persistent interface palettes. Note paper and personal ink stay user-controlled.
(()=> {
 const palettes=[["forest",["#1e2924","#2b3b31","#edf1e5","#c5d2bf","#c3d5b8","#23372d","#34493c","#52614f","#638564","#ffe58e"]],["cinnamon",["#fbf9f5","#ffffff","#3d3027","#716250","#825437","#ffffff","#f1e7d9","#dfd0bd","#e5d3bd","#f8dfb0"]],["sage",["#f3f2eb","#fffef9","#293e37","#5b6b60","#315d50","#ffffff","#e9eedf","#d2dbc9","#c6d9ba","#ffe789"]],["ocean",["#f1f6fa","#ffffff","#233d50","#536a7a","#245d83","#ffffff","#e2edf5","#c9dbe8","#b9d3e6","#d3e8f7"]],["lavender",["#f5f2fa","#ffffff","#3d3155","#6a5c7f","#684695","#ffffff","#ebe3f4","#d7cbe6","#d0bde9","#eddbff"]],["terracotta",["#fbf4ef","#fffdf9","#4c3028","#7a5d50","#a44e36","#ffffff","#f4e0d4","#e6c9b9","#e8bfa9","#ffd6ac"]],["graphite",["#202226","#2c2f34","#f0f1f3","#b9bdc6","#d3d8e0","#252a31","#33373e","#50565f","#6a7582","#d4dbe3"]],["midnight",["#131d30","#1c2b42","#e8effb","#b4c5dd","#abc9fb","#182f53","#233958","#3e5575","#496b9e","#c5dcff"]],["rose",["#fbf3f5","#fffdfd","#503440","#775b67","#9e496a","#ffffff","#f4e1e8","#e6cbd7","#e6bdce","#f9d6e5"]],["sand",["#f7f3e9","#fffdf7","#443b29","#6f6248","#806124","#ffffff","#eee5ce","#ddd0af","#d9c79a","#f4dea1"]]];
 const labels={"es":["Colores de la web","Bosque","Blanco y canela","Salvia y crema","Océano","Lavanda","Terracota","Grafito","Azul medianoche","Rosa empolvado","Arena y oro"],"en":["Website colours","Forest","White and cinnamon","Sage and cream","Ocean","Lavender","Terracotta","Graphite","Midnight blue","Dusty rose","Sand and gold"],"de":["Website-Farben","Wald","Weiß und Zimt","Salbei und Creme","Ozean","Lavendel","Terrakotta","Graphit","Mitternachtsblau","Altrosa","Sand und Gold"],"fr":["Couleurs du site","Forêt","Blanc et cannelle","Sauge et crème","Océan","Lavande","Terre cuite","Graphite","Bleu nuit","Rose poudré","Sable et or"],"pt":["Cores do site","Floresta","Branco e canela","Sálvia e creme","Oceano","Lavanda","Terracota","Grafite","Azul meia-noite","Rosa suave","Areia e ouro"],"it":["Colori del sito","Foresta","Bianco e cannella","Salvia e crema","Oceano","Lavanda","Terracotta","Grafite","Blu notte","Rosa cipria","Sabbia e oro"],"ja":["サイトの色","森","白とシナモン","セージとクリーム","海","ラベンダー","テラコッタ","グラファイト","ミッドナイトブルー","くすみピンク","砂とゴールド"],"ko":["웹사이트 색상","숲","화이트와 시나몬","세이지와 크림","바다","라벤더","테라코타","그래파이트","미드나이트 블루","더스티 로즈","샌드와 골드"]};
 const key='postispop-interface-theme',root=document.documentElement;
 const dark=new Set(['forest','graphite','midnight']);
 const vars=['bg','surface','text','muted','accent','on-accent','accent-soft','border','illustration','paper-accent'];
 let selected;
 try{selected=localStorage.getItem(key);}catch{}
 if(!palettes.some(([id])=>id===selected)){
  let scheme;try{scheme=localStorage.getItem('postispop-color-scheme');}catch{}
  selected=(scheme==='dark'||(!scheme&&matchMedia('(prefers-color-scheme:dark)').matches))?'forest':'sage';
 }
 function apply(id,persist=false){
  const palette=palettes.find(([name])=>name===id);if(!palette)return;
  selected=id;root.dataset.ppTheme=id;root.dataset.colorScheme=dark.has(id)?'dark':'light';
  palette[1].forEach((value,i)=>root.style.setProperty('--pp-'+vars[i],value));
  root.style.setProperty('--pp-focus',palette[1][4]);root.style.setProperty('--wpo-bg',palette[1][0]);root.style.setProperty('--wpo-text',palette[1][2]);
  root.style.colorScheme=dark.has(id)?'dark':'light';
  if(persist)try{localStorage.setItem(key,id);localStorage.setItem('postispop-color-scheme',dark.has(id)?'dark':'light');}catch{}
  document.querySelectorAll('[data-pp-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ppThemeChoice===id)));
 }
 apply(selected);
 function language(){
  const requested=new URLSearchParams(location.search).get('lang');if(labels[requested])return requested;
  const pageLang=location.pathname.split('/')[1];if(labels[pageLang])return pageLang;
  let saved;try{saved=localStorage.getItem('pp:lang');}catch{}
  return labels[saved]?saved:labels[root.lang]?root.lang:'es';
 }
 function picker(){
  const field=document.createElement('fieldset');field.className='pp-theme-picker';
  const legend=document.createElement('legend');field.append(legend);
  const grid=document.createElement('div');grid.className='pp-theme-grid';
  for(const [id,values] of palettes){const b=document.createElement('button');b.type='button';b.dataset.ppThemeChoice=id;b.style.setProperty('--swatch-base',values[0]);b.style.setProperty('--swatch-accent',values[4]);b.addEventListener('click',()=>apply(id,true));grid.append(b);}
  field.append(grid);return field;
 }
 function mount(){
  if(document.querySelector('.postispop')&&root.dataset.ppReady!=='true')return;
  const controls=document.querySelector('.postispop .app-header .top-controls');
  if(controls){
   let p=controls.querySelector('.pp-theme-picker');if(!p){p=picker();controls.append(p);}
   const links=document.querySelector('.pp-app-links');if(links&&links.parentElement!==controls)controls.append(links);
  }else if(!document.querySelector('.postispop')&&!document.querySelector('.pp-global-theme-control')){
   const box=document.createElement('details');box.className='pp-global-theme-control';const summary=document.createElement('summary');box.append(summary,picker());
   const host=document.querySelector('.pricing-header,.legal-header,body > header')||document.querySelector('footer')||document.body;host.append(box);
  }
  const lang=language(),t=labels[lang];
  for(const field of document.querySelectorAll('.pp-theme-picker')){
   if(field.dataset.language===lang)continue;field.dataset.language=lang;field.querySelector('legend').textContent=t[0];
   const buttons=field.querySelectorAll('button');buttons.forEach((b,i)=>{b.title=t[i+1];b.setAttribute('aria-label',t[i+1]);b.setAttribute('aria-pressed',String(b.dataset.ppThemeChoice===selected));});
  }
  for(const summary of document.querySelectorAll('.pp-global-theme-control > summary'))if(summary.textContent!==t[0])summary.textContent=t[0];
  // An old day/night initialiser must not override an explicitly chosen palette.
  const scheme=dark.has(selected)?'dark':'light';if(root.dataset.colorScheme!==scheme)root.dataset.colorScheme=scheme;
 }
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}
 window.addEventListener('postispop:ui-ready',schedule);
 function boot(){mount();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['lang','data-color-scheme']});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.addEventListener('storage',e=>{if(e.key===key){apply(e.newValue||'sage');schedule();}if(e.key==='pp:lang')schedule();});
})();