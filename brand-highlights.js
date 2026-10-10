import {readBoardLanguage} from './seo-language.js';
import {whenReactReady} from './ui-ready.js';

const copy={
  es:{summary:'Tus ideas a la vista',feature:'Escribe, dibuja, graba audio, haz fotos, guarda capturas, graba vídeo y adjunta cualquier archivo.',donation:'Usa pocos megas, ya que el precio de la suscripción apenas nos ayuda a pagar los servidores. Si te gusta y quieres hacer una donación, envíala por PayPal a muchisimoamorparati@gmail.com o por Bizum al +34 692 225 392 (España).',label:'Información sobre PostisPop'},
  en:{summary:'Your ideas, in view',feature:'Write, draw, record audio, take photos, save screenshots, record video, and attach any file.',donation:'Please use data sparingly, as subscription prices barely cover our server costs. If you enjoy the app and would like to donate, send your donation via PayPal to muchisimoamorparati@gmail.com or by Bizum to +34 692 225 392 (Spain).',label:'About PostisPop'},
  de:{summary:'Alle Ideen im Blick',feature:'Schreibe, zeichne, nimm Audio auf, mache Fotos, speichere Screenshots, filme und füge beliebige Dateien an.',donation:'Bitte gehe sparsam mit Daten um, da die Abo-Preise kaum zur Deckung der Serverkosten beitragen. Wenn dir die App gefällt und du spenden möchtest, sende deine Spende per PayPal an muchisimoamorparati@gmail.com oder per Bizum an +34 692 225 392 (Spanien).',label:'Über PostisPop'},
  fr:{summary:'Toutes vos idées en un coup d’œil',feature:'Écrivez, dessinez, enregistrez de l’audio, prenez des photos, gardez des captures d’écran, filmez et joignez tout type de fichier.',donation:'Merci de limiter votre consommation de données : le prix de l’abonnement couvre à peine nos frais de serveurs. Si l’application vous plaît et que vous souhaitez faire un don, vous pouvez l’envoyer par PayPal à muchisimoamorparati@gmail.com ou par Bizum au +34 692 225 392 (Espagne).',label:'À propos de PostisPop'},
  pt:{summary:'As suas ideias à vista',feature:'Escreva, desenhe, grave áudio, tire fotografias, guarde capturas de ecrã, grave vídeo e anexe qualquer ficheiro.',donation:'Pedimos que use poucos dados, pois o preço da subscrição mal ajuda a pagar os servidores. Se gosta da aplicação e quiser fazer um donativo, envie-o por PayPal para muchisimoamorparati@gmail.com ou por Bizum para +34 692 225 392 (Espanha).',label:'Sobre o PostisPop'},
  it:{summary:'Le tue idee, a colpo d’occhio',feature:'Scrivi, disegna, registra audio, scatta foto, salva screenshot, registra video e allega qualsiasi file.',donation:'Ti chiediamo di usare pochi dati: il prezzo dell’abbonamento copre a malapena i costi dei server. Se l’app ti piace e vuoi fare una donazione, inviala con PayPal a muchisimoamorparati@gmail.com oppure con Bizum al +34 692 225 392 (Spagna).',label:'Informazioni su PostisPop'},
  ja:{summary:'アイデアをひと目で',feature:'文章や絵を作成し、音声を録音し、写真やスクリーンショットを保存し、動画を撮影して、あらゆる種類のファイルを添付できます。',donation:'サブスクリプション料金だけではサーバー費用をまかなうのが難しいため、データ通信量を控えめにご利用ください。アプリを気に入って寄付をご希望の場合は、PayPal（muchisimoamorparati@gmail.com）またはBizum（スペイン +34 692 225 392）でお送りください。',label:'PostisPopについて'},
  ko:{summary:'아이디어를 한눈에',feature:'글쓰기, 그리기, 오디오 녹음, 사진 촬영, 스크린샷 저장, 동영상 녹화와 모든 종류의 파일 첨부를 지원합니다.',donation:'구독료만으로는 서버 비용을 충당하기 어려우니 데이터 사용량을 아껴 주세요. 앱이 마음에 들어 후원하고 싶다면 PayPal(muchisimoamorparati@gmail.com) 또는 Bizum(스페인 +34 692 225 392)으로 보내 주세요.',label:'PostisPop 소개'}
};

function renderInstructions(){
  const header=document.querySelector('.postispop .app-header');
  const source=document.querySelector('#pp-learn .pp-seo-about');
  if(!header||!source)return;
  let host=document.querySelector('.pp-header-instructions');
  if(!host){host=document.createElement('section');host.className='pp-header-instructions';}
  if(header.nextElementSibling!==host)header.after(host);
  const lang=readBoardLanguage();
  if(host.dataset.language===lang&&host.children.length)return;
  const wasOpen=host.querySelector('details')?.open||false;
  const clone=source.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  host.replaceChildren(clone);
  const titles={es:'Tus ideas a la vista, una cada vez',en:'Your ideas in view, one at a time',de:'Deine Ideen im Blick, eine nach der anderen',fr:'Vos idées sous les yeux, une à la fois',pt:'As suas ideias à vista, uma de cada vez',it:'Le tue idee in vista, una alla volta',ja:'アイデアをひとつずつ、目の前に',ko:'아이디어를 하나씩 한눈에'};
  const summary=host.querySelector('summary');
  if(summary)summary.textContent=titles[lang]||titles.es;
  const detail=host.querySelector('details');
  if(detail)detail.open=wasOpen;
  host.dataset.language=lang;
}
function render(){
  renderInstructions();
  const board=document.querySelector('.postispop .board-frame');
  if(!board)return;
  const lang=readBoardLanguage(),strings=copy[lang]||copy.es;
  let card=document.querySelector('.pp-brand-highlights');
  if(!card){card=document.createElement('aside');card.className='pp-brand-highlights';}
  card.setAttribute('aria-label',strings.label);
  const pager=board.querySelector('.pp-pagination');
  if(pager){if(pager.nextElementSibling!==card)pager.after(card);}
  else board.querySelector('.board-grid')?.after(card);
  if(card.dataset.language===lang)return;

  const details=document.createElement('details');
  details.className='pp-brand-highlights-disclosure';
  const summary=document.createElement('summary');
  summary.textContent=strings.summary;
  const content=document.createElement('div');
  content.className='pp-brand-highlights-content';
  const feature=document.createElement('p');feature.textContent=strings.feature;
  const donation=document.createElement('p');donation.textContent=strings.donation;
  content.append(feature,donation);
  details.append(summary,content);
  const wasOpen=card.querySelector('details')?.open||false;
  details.open=wasOpen;
  card.replaceChildren(details);
  card.dataset.language=lang;
}

whenReactReady(()=>{
  render();
  let scheduled=false;
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;render();});
  };
  // React owns the board subtree. Watch only direct board-frame children so
  // inserting the disclosure's own contents cannot feed back into this observer.
  const frame=document.querySelector('.postispop .board-frame');
  if(frame)new MutationObserver(schedule).observe(frame,{childList:true});
  const learn=document.querySelector('#pp-learn');
  if(learn)new MutationObserver(schedule).observe(learn,{childList:true,subtree:true});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('storage',event=>{if(event.key==='pp:lang')render();});
});
