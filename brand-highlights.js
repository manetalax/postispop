import {readBoardLanguage} from './seo-language.js';
import {whenReactReady} from './ui-ready.js';

const copy={
  es:['Escribe, dibuja, graba audio, guarda capturas, añade vídeo y adjunta cualquier tipo de archivo.','Intentamos reducir todos los adjuntos para ahorrar espacio. Límite final: 5 MB por archivo. Priorizamos la calidad de imagen, audio y vídeo.'],
  en:['Write, draw, record audio, save screenshots, add video and attach any file type.','We try to shrink every attachment to save space. Final limit: 5 MB per file. We prioritize image, audio and video quality.'],
  de:['Schreibe, zeichne, nimm Audio auf, speichere Screenshots, füge Videos hinzu und hänge Dateien aller Art an.','Wir versuchen, alle Anhänge zu verkleinern. Endgültiges Limit: 5 MB pro Datei. Bild-, Audio- und Videoqualität hat Vorrang.'],
  fr:['Écrivez, dessinez, enregistrez de l’audio, gardez des captures d’écran, ajoutez des vidéos et joignez tout type de fichier.','Nous essayons de réduire toutes les pièces jointes pour économiser de l’espace. Limite finale : 5 Mo par fichier. La qualité des images, du son et des vidéos reste prioritaire.'],
  pt:['Escreva, desenhe, grave áudio, guarde capturas de ecrã, adicione vídeos e anexe qualquer tipo de ficheiro.','Tentamos reduzir todos os anexos para poupar espaço. Limite final: 5 MB por ficheiro. A qualidade de imagem, áudio e vídeo é prioritária.'],
  it:['Scrivi, disegna, registra audio, salva screenshot, aggiungi video e allega file di qualsiasi tipo.','Proviamo a ridurre tutti gli allegati per risparmiare spazio. Limite finale: 5 MB per file. La qualità di immagini, audio e video è prioritaria.'],
  ja:['書く、描く、音声を録音する、スクリーンショットを保存する、動画を追加する、あらゆる種類のファイルを添付する。','容量を節約するため、すべての添付ファイルの圧縮を試みます。最終上限は1ファイル5 MBです。画像、音声、動画の品質を優先します。'],
  ko:['글을 쓰고, 그림을 그리고, 오디오를 녹음하고, 스크린샷을 저장하고, 동영상을 추가하고, 모든 종류의 파일을 첨부하세요.','공간 절약을 위해 모든 첨부 파일의 압축을 시도합니다. 파일당 최종 용량은 5MB이며, 이미지·오디오·동영상 품질을 우선합니다.']
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
