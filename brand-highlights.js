import {readBoardLanguage} from './seo-language.js';
import {whenReactReady} from './ui-ready.js';

const copy={
  es:['Escribe, dibuja, graba audio, haz fotos, guarda capturas, graba vídeo y adjunta cualquier archivo.','La cámara comprime las fotos hasta 128 KB y graba vídeo a 360p/15 fps, con un objetivo de menos de 5 MB por 5 minutos.'],
  en:['Write, draw, record audio, take photos, save screenshots, record video and attach any file.','The camera compresses photos to 128 KB and records 360p/15 fps video, targeting under 5 MB per 5 minutes.'],
  de:['Schreibe, zeichne, nimm Audio auf, mache Fotos, speichere Screenshots, filme und füge Dateien an.','Die Kamera komprimiert Fotos auf 128 KB und nimmt Videos mit 360p/15 fps auf; Ziel sind weniger als 5 MB pro 5 Minuten.'],
  fr:['Écrivez, dessinez, enregistrez de l’audio, prenez des photos, gardez des captures, filmez et joignez tout fichier.','La caméra compresse les photos à 128 Ko et filme en 360p/15 ips, avec un objectif inférieur à 5 Mo pour 5 minutes.'],
  pt:['Escreva, desenhe, grave áudio, tire fotografias, guarde capturas, grave vídeos e anexe qualquer ficheiro.','A câmara comprime fotografias para 128 KB e grava vídeo a 360p/15 fps, com objetivo inferior a 5 MB por 5 minutos.'],
  it:['Scrivi, disegna, registra audio, scatta foto, salva screenshot, registra video e allega qualsiasi file.','La fotocamera comprime le foto a 128 KB e registra video a 360p/15 fps, con l’obiettivo di restare sotto 5 MB per 5 minuti.'],
  ja:['書く、描く、音声を録音する、写真を撮る、スクリーンショットを保存する、動画を撮影する、ファイルを添付する。','写真は128 KBに圧縮し、動画は360p/15 fpsで撮影します。5分あたり5 MB未満を目標とします。'],
  ko:['글쓰기, 그리기, 오디오 녹음, 사진 촬영, 스크린샷 저장, 동영상 촬영, 모든 파일 첨부를 지원합니다.','사진은 128KB로 압축하고 동영상은 360p/15fps로 녹화하며, 5분당 5MB 미만을 목표로 합니다.']
};

function render(){
  const header=document.querySelector('.postispop .app-header');
  const board=document.querySelector('.postispop .board-frame');
  if(!header||!board)return;
  const [feature,limit]=copy[readBoardLanguage()]||copy.es;
  let card=document.querySelector('.pp-brand-highlights');
  if(!card){card=document.createElement('aside');card.className='pp-brand-highlights';card.setAttribute('aria-label','PostIsPop');}
  if(card.previousElementSibling!==board)board.after(card);
  if(card.textContent===feature+limit)return;
  card.replaceChildren();
  const title=document.createElement('strong');title.textContent=feature;
  const detail=document.createElement('small');detail.textContent=limit;
  card.append(title,detail);
}

whenReactReady(()=>{
  render();
  new MutationObserver(render).observe(document.body,{childList:true,subtree:true});
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('storage',event=>{if(event.key==='pp:lang')render();});
});
