import {uiText as T} from './ui-copy.js';
import {track} from './usage-metrics.js';
import {drawStrokes} from './style-model.js';
import {normalizeBackup,LOCAL_BACKUP_BYTES,createBoardBackup,verifyBackupAttachments} from './backup-import.js?v=20261008a';
import {readBoardLanguage} from './seo-language.js';
import {shareFile} from './share-tools.js?v=20261009a';

let tools=null, options=null, searchTools=null, lastFocus=null;
let favoritesOnly=false;
const favoriteLabels={es:T("Favoritos"),en:'Favorites',de:'Favoriten',fr:'Favoris',pt:T("Favoritos"),it:'Preferiti',ja:'お気に入り',ko:'즐겨찾기'};
const favoriteStatus={es:'Mostrando tus favoritos.',en:'Showing your favourites.',de:'Deine Favoriten werden angezeigt.',fr:'Affichage de vos favoris.',pt:'A mostrar os teus favoritos.',it:'Visualizzazione dei preferiti.',ja:'お気に入りを表示しています。',ko:'즐겨찾기를 표시합니다.'};
export async function download(name,body,type='application/json') {
  const url=URL.createObjectURL(body instanceof Blob?body:new Blob([body],{type}));
  if(window.__postispopNative){
    try {
      if(typeof window.__postispopSaveDownload!=='function')throw new Error('No se pudo abrir la descarga. Cierra y vuelve a abrir la aplicación.');
      return await window.__postispopSaveDownload(url,name);
    } catch(error) { throw Object.assign(new Error(error?.message||T("No se pudo guardar el archivo. Vuelve a intentarlo.")),{code:error?.code||'DOWNLOAD_FAILED'}); }
    finally { URL.revokeObjectURL(url); }
  }
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  return true;
}
const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=T(value);if(value)el.dataset.ppUiLabel=value;return el;};
async function api(endpoint,payload) {
  const r=await fetch('/api/'+endpoint,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok)throw new Error(data.error||'REQUEST_FAILED');return data;
}
async function currentBoard() {
  const me=await api('me');let selected;try{selected=localStorage.getItem('pp:last-board');}catch{}
  const board=me.boards.find(b=>b.id===selected)||me.boards[0];
  if(!board)throw new Error('BOARD_NOT_FOUND');
  const data=await api('board/'+board.id);
  if(data.id!=='guest-board'){
    // A missing style response is not an empty drawing. Exports must stop if
    // the required read fails, instead of advertising a partial backup.
    const styleData=await api('designs/styles'),{styles}=styleData;
    if(!Array.isArray(styles)||(styleData.offline&&!data.offline))throw new Error('STYLES_UNAVAILABLE');
    for(const note of data.notes){if(!note.protectedEnvelope)note.style=styles.find(s=>s.note_id===note.id)||null;}
  }
  return data;
}
function message(value){const node=searchTools?.querySelector('[role=status]');if(node)node.textContent=T(value);}
function dialog(title,returnFocus=document.activeElement,closeText=T("Cerrar")) {
  lastFocus=returnFocus;
  const el=document.createElement('dialog');el.className='pp-feature-dialog';
  el.setAttribute('aria-labelledby','pp-feature-title');
  const heading=text('h2',title);heading.id='pp-feature-title';el.append(heading);
  const close=text('button',closeText);close.type='button';close.addEventListener('click',()=>el.close());el.append(close);
  el.addEventListener('click',event=>{if(event.target!==el)return;const bounds=el.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)el.close();});
  el.addEventListener('close',()=>{el.remove();lastFocus?.focus();},{once:true});document.body.append(el);el.showModal();return el;
}
const ordered=board=>board.order.map(id=>board.notes.find(n=>n.id===id)).filter(Boolean);
async function exportJson(){
  message(T("Preparando la copia…"));
  const board=await currentBoard(),backup=await createBoardBackup(board);
  if(!await download('PostisPop-copia.json',JSON.stringify(backup))){message(T("Descarga cancelada. Tus notas se conservan."));return;}
  track('export');
  message(T("Copia completa descargada: notas, dibujos y adjuntos de este dispositivo. Las notas protegidas permanecen cifradas."));
}
async function exportPng({share=false}={}) {
  message(T("Preparando la imagen…"));
  const board=await currentBoard(), notes=ordered(board);
  // Preserve every page at the same readable scale. The supported 100-note
  // board needs at most 1600 × 8724 pixels (under 56 MB of RGBA storage).
  if(notes.length>100)throw new Error('IMAGE_EXPORT_TOO_LARGE');
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1200+Math.max(0,Math.ceil(notes.length/4)-3)*342;
  try {
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('IMAGE_EXPORT_FAILED');
  ctx.fillStyle='#f6f2e9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#172339';ctx.font='bold 40px sans-serif';ctx.fillText((board.title||T("Mi pizarra")).slice(0,60),50,64);
  const colors=['#ffec86','#ffc5d2','#b9e0f8','#f9f0d7','#c5e7bd','#d9c8f3'];
  notes.forEach((n,i)=>{
    const x=50+(i%4)*385,y=100+Math.floor(i/4)*342;
    ctx.fillStyle=colors[n.paper]||colors[0];ctx.fillRect(x,y,360,315);ctx.fillStyle='#172339';ctx.font='bold 17px sans-serif';ctx.fillText('NOTA '+(i+1),x+20,y+30);ctx.font='22px sans-serif';
    const content=n.protectedEnvelope?T("Nota protegida"):n.text||'';
    const lines=[];for(const paragraph of content.split('\n')){let line='';for(const word of paragraph.split(/\s+/)){for(const piece of word.match(/.{1,24}/gu)||['']){const next=line?line+' '+piece:piece;if(ctx.measureText(next).width>320&&line){lines.push(line);line=piece;}else line=next;}}lines.push(line);}
    const hasDrawing=!n.protectedEnvelope&&n.style?.drawing?.strokes?.length;
    const limit=hasDrawing?4:8;lines.slice(0,limit).forEach((line,j)=>ctx.fillText(line+(j===limit-1&&lines.length>limit?'…':''),x+20,y+65+j*28,320));
    if(hasDrawing){const sketch=document.createElement('canvas');sketch.width=320;sketch.height=135;drawStrokes(sketch.getContext('2d'),n.style.drawing,320,135);ctx.drawImage(sketch,x+20,y+170);}
  });
  ctx.font='16px sans-serif';ctx.fillText(T("PostisPop · Vista de texto resumida · Guarda una copia de seguridad para conservar todo el texto."),50,canvas.height-25);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('IMAGE_EXPORT_FAILED')),'image/png'));
  canvas.width=0;canvas.height=0;
  let shareResult='downloaded';
  if(share){
    const file=new File([blob],'PostisPop-pizarra.png',{type:'image/png'});
    let result='unsupported';try{result=await shareFile(file,{title:board.title||'PostisPop',text:'Copia visual de una pizarra PostisPop.'});}catch(error){if(error.message==='SHARE_FILE_TOO_LARGE')result='tooLarge';else throw error;}
    if(result==='unsupported'){if(!await download(file.name,file,file.type))result='cancelled';else result='downloaded';}
    shareResult=result;
    if(!['cancelled','tooLarge'].includes(result)){track('share');message(result==='shared'?'Se abrió el menú para compartir la imagen.':'Imagen descargada; puedes adjuntarla en WhatsApp o en otra app.');}
  }else{
    if(!await download('PostisPop-pizarra.png',blob,'image/png')){message(T("Descarga cancelada. Tus notas se conservan."));return;}
    track('export');message('PNG descargado: '+notes.length+' notas, con texto resumido, colores y trazos. Las notas protegidas siguen cerradas; no se incluyen adjuntos.');
  }
  return shareResult;
  } finally { canvas.width=0;canvas.height=0; }
}

const boardShareCopy={
  es:{title:'Compartir pizarra',close:T("Cerrar"),intro:'Envía una copia a WhatsApp o a otra aplicación desde la hoja del dispositivo. Es una exportación; no crea una pizarra colaborativa en vivo.',backup:'Compartir copia completa',image:'Compartir imagen resumida',preparing:'Preparando el archivo…',shared:'Se abrió el menú para compartir. Elige WhatsApp u otra aplicación.',downloaded:'Archivo descargado. Puedes adjuntarlo desde WhatsApp u otra aplicación.',cancelled:'Compartir cancelado.',failed:'No se pudo preparar la copia. Tus notas se conservan.',tooLarge:'El archivo supera el límite de 10 MB para compartir desde la aplicación. Comparte los adjuntos por separado.',backupText:'Copia de seguridad de una pizarra PostisPop. Las notas protegidas siguen cifradas.'},
  en:{title:'Share board',close:'Close',intro:'Send a copy to WhatsApp or another app using your device share sheet. This is an export; it does not create a live collaborative board.',backup:'Share full backup',image:'Share summary image',preparing:'Preparing file…',shared:'The share sheet opened. Choose WhatsApp or another app.',downloaded:'File downloaded. Attach it from WhatsApp or another app.',cancelled:'Sharing cancelled.',failed:'Could not prepare the copy. Your notes are safe.',tooLarge:'The file exceeds the 10 MB app sharing limit. Share attachments individually.',backupText:'Backup of a PostisPop board. Protected notes remain encrypted.'},
  de:{title:'Pinnwand teilen',close:'Schließen',intro:'Sende über das Teilen-Menü deines Geräts eine Kopie an WhatsApp oder eine andere App. Das ist ein Export und erstellt keine gemeinsam bearbeitete Pinnwand.',backup:'Vollständige Sicherung teilen',image:'Zusammenfassendes Bild teilen',preparing:'Datei wird vorbereitet…',shared:'Das Teilen-Menü ist geöffnet. Wähle WhatsApp oder eine andere App.',downloaded:'Datei heruntergeladen. Du kannst sie in WhatsApp oder einer anderen App anhängen.',cancelled:'Teilen abgebrochen.',failed:'Die Kopie konnte nicht vorbereitet werden. Deine Notizen bleiben erhalten.',tooLarge:'Die Datei überschreitet das App-Teilenlimit von 10 MB. Teile Anhänge einzeln.',backupText:'Sicherung einer PostisPop-Pinnwand. Geschützte Notizen bleiben verschlüsselt.'},
  fr:{title:'Partager le tableau',close:'Fermer',intro:'Envoyez une copie vers WhatsApp ou une autre application avec le menu de partage de l’appareil. C’est un export, pas un tableau collaboratif en direct.',backup:'Partager la sauvegarde complète',image:'Partager l’image résumée',preparing:'Préparation du fichier…',shared:'Le menu de partage est ouvert. Choisissez WhatsApp ou une autre application.',downloaded:'Fichier téléchargé. Vous pouvez le joindre dans WhatsApp ou une autre application.',cancelled:'Partage annulé.',failed:'Impossible de préparer la copie. Vos notes sont conservées.',tooLarge:'Le fichier dépasse la limite de partage de l’application de 10 Mo. Partagez les pièces jointes séparément.',backupText:'Sauvegarde d’un tableau PostisPop. Les notes protégées restent chiffrées.'},
  pt:{title:'Partilhar quadro',close:'Fechar',intro:'Envie uma cópia para o WhatsApp ou outra aplicação através do menu de partilha do dispositivo. É uma exportação; não cria um quadro colaborativo em direto.',backup:'Partilhar cópia completa',image:'Partilhar imagem resumida',preparing:'A preparar o ficheiro…',shared:'O menu de partilha abriu. Escolha WhatsApp ou outra aplicação.',downloaded:'Ficheiro transferido. Pode anexá-lo no WhatsApp ou noutra aplicação.',cancelled:'Partilha cancelada.',failed:'Não foi possível preparar a cópia. As suas notas estão seguras.',tooLarge:'O ficheiro excede o limite de partilha de 10 MB da aplicação. Partilhe os anexos individualmente.',backupText:'Cópia de segurança de um quadro PostisPop. As notas protegidas continuam encriptadas.'},
  it:{title:'Condividi bacheca',close:'Chiudi',intro:'Invia una copia a WhatsApp o a un’altra app dal menu di condivisione del dispositivo. È un’esportazione; non crea una bacheca collaborativa in tempo reale.',backup:'Condividi copia completa',image:'Condividi immagine riepilogativa',preparing:'Preparazione del file…',shared:'Il menu di condivisione è aperto. Scegli WhatsApp o un’altra app.',downloaded:'File scaricato. Puoi allegarlo da WhatsApp o da un’altra app.',cancelled:'Condivisione annullata.',failed:'Impossibile preparare la copia. Le note sono al sicuro.',tooLarge:'Il file supera il limite di condivisione dell’app di 10 MB. Condividi gli allegati singolarmente.',backupText:'Backup di una bacheca PostisPop. Le note protette restano cifrate.'},
  ja:{title:'ボードを共有',close:'閉じる',intro:'端末の共有メニューからWhatsAppなどのアプリへコピーを送信します。これは書き出しであり、リアルタイム共同編集ボードは作成されません。',backup:'完全なバックアップを共有',image:'要約画像を共有',preparing:'ファイルを準備しています…',shared:'共有メニューが開きました。WhatsAppなどを選んでください。',downloaded:'ファイルをダウンロードしました。WhatsAppなどで添付できます。',cancelled:'共有をキャンセルしました。',failed:'コピーを準備できませんでした。メモは保持されています。',tooLarge:'ファイルがアプリ共有の上限10 MBを超えています。添付ファイルを個別に共有してください。',backupText:'PostisPopボードのバックアップです。保護されたメモは暗号化されたままです。'},
  ko:{title:'보드 공유',close:'닫기',intro:'기기의 공유 메뉴를 통해 WhatsApp 또는 다른 앱으로 사본을 보냅니다. 내보내기이며 실시간 공동 편집 보드를 만들지는 않습니다.',backup:'전체 백업 공유',image:'요약 이미지 공유',preparing:'파일 준비 중…',shared:'공유 메뉴가 열렸습니다. WhatsApp 또는 다른 앱을 선택하세요.',downloaded:'파일을 다운로드했습니다. WhatsApp 등에서 첨부할 수 있습니다.',cancelled:'공유를 취소했습니다.',failed:'사본을 준비하지 못했습니다. 메모는 보존됩니다.',tooLarge:'파일이 앱 공유 한도인 10MB를 초과합니다. 첨부 파일을 각각 공유하세요.',backupText:'PostisPop 보드 백업입니다. 보호된 메모는 암호화 상태로 유지됩니다.'}
};

export function openShareDialog(trigger=document.activeElement){
  const copy=boardShareCopy[readBoardLanguage()]||boardShareCopy.es;
  const el=dialog(copy.title,trigger,copy.close),intro=text('p',copy.intro),status=text('p','');status.setAttribute('role','status');
  const add=(label,action)=>{const button=text('button',label);button.type='button';button.addEventListener('click',async()=>{button.disabled=true;status.textContent=copy.preparing;try{await action();}catch{status.textContent=copy.failed;}finally{button.disabled=false;}});el.append(button);};
  add(copy.backup,async()=>{
    const board=await currentBoard(),backup=await createBoardBackup(board),file=new File([JSON.stringify(backup)],'PostisPop-copia.json',{type:'application/json'});
    let result='unsupported';try{result=await shareFile(file,{title:board.title||copy.title,text:copy.backupText});}catch(error){if(error.message==='SHARE_FILE_TOO_LARGE')result='tooLarge';else throw error;}
    if(result==='unsupported'){if(!await download(file.name,file,file.type))result='cancelled';else result='downloaded';}
    if(result==='cancelled')status.textContent=copy.cancelled;
    else if(result==='tooLarge')status.textContent=copy.tooLarge;
    else{track('share');status.textContent=result==='shared'?copy.shared:copy.downloaded;}
  });
  add(copy.image,async()=>{const result=await exportPng({share:true});status.textContent=result==='cancelled'?copy.cancelled:result==='tooLarge'?copy.tooLarge:result==='downloaded'?copy.downloaded:copy.shared;});
  el.prepend(intro);el.append(status);return el;
}
async function printPdf() {
  const board=await currentBoard();const frame=document.createElement('iframe');frame.title=T("Vista de impresión");frame.style.cssText='position:fixed;width:1px;height:1px;left:-9999px;border:0';document.body.append(frame);
  const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>PostisPop · Exportación</title><style>body{font:12pt system-ui;color:#172339;margin:24px}article{break-inside:avoid;border:1px solid #aeb9ca;padding:16px;margin:12px 0}p{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:24pt}h2{font-size:14pt}@page{size:A4;margin:15mm}</style></head><body></body></html>');doc.close();
  const h=doc.createElement('h1');h.textContent=board.title||T("Mi pizarra");doc.body.append(h);
  ordered(board).filter(n=>n.text||n.doodle||n.image||n.protectedEnvelope||n.style?.drawing?.strokes?.length).forEach((n,i)=>{const article=doc.createElement('article'),head=doc.createElement('h2'),body=doc.createElement('p');head.textContent=T("Nota")+' '+(i+1);body.textContent=n.protectedEnvelope?T("Nota protegida"):n.text||T("(Nota sin texto)");article.append(head,body);if(!n.protectedEnvelope&&(n.doodle||n.image||n.style?.drawing?.strokes?.length)){const hint=doc.createElement('p');hint.textContent=T("Esta nota contiene un dibujo o imagen que no se incluye en esta impresión de texto.");article.append(hint);}doc.body.append(article);});
  const foot=doc.createElement('p');foot.textContent=T("Exportación de texto · Los archivos adjuntos no están incluidos.");doc.body.append(foot);
  frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});
  frame.contentWindow.focus();frame.contentWindow.print();track('export');message('Elige «Guardar como PDF» en la ventana de impresión.');setTimeout(()=>frame.remove(),120000);
}
const importError=error=>({
  BOARD_FULL:T("No hay suficientes notas vacías o la copia supera el límite de tu plan. No se ha sustituido ninguna nota."),
  NOTE_LIMIT:T("La copia supera el límite de notas de tu plan. No se ha importado ninguna nota."),
  OWNER_REQUIRED:T("Solo la persona propietaria de la pizarra puede importar notas."),
  SYNC_PENDING_BEFORE_IMPORT:T("Sincroniza los cambios pendientes y resuelve los conflictos antes de importar."),
  IMPORT_UNAVAILABLE:T("La importación en cuentas aún no está habilitada en el servidor. Conserva tu copia."),
  OFFLINE:T("Conéctate a internet para importar en tu cuenta. La pizarra local funciona sin conexión."),
  SESSION_CHANGED:T("La cuenta ha cambiado. Cierra este diálogo y vuelve a abrir la importación."),
  SESSION_REQUIRED:T("Inicia sesión de nuevo antes de importar."),
  INVALID_BACKUP:T("La copia no es compatible o contiene una nota dañada. No se ha importado ninguna nota."),
  STYLE_LOCKED:T("La copia usa un estilo que tu plan no incluye. No se ha importado ninguna nota."),
  INVALID_STYLE:T("La copia contiene un estilo no compatible. No se ha importado ninguna nota."),
  INVALID_ENVELOPE:T("La copia contiene una nota cifrada dañada. No se ha importado ninguna nota."),
  BACKUP_TOO_LARGE:T("El archivo supera el tamaño máximo indicado."),
  LOCAL_STORAGE_FULL:T("El almacenamiento de este dispositivo está lleno. Conserva el archivo de copia."),
  IMPORT_STORAGE_UNAVAILABLE:T("No se pudo preparar un reintento seguro. Libera almacenamiento y conserva tu copia."),
  STORAGE_LOCK_UNAVAILABLE:T("Este navegador no permite coordinar la importación con los adjuntos. Prueba un navegador actualizado."),
  INVALID_ATTACHMENT:T("La copia contiene un adjunto no compatible. No se ha restaurado."),
  ATTACHMENT_INTEGRITY:T("Un archivo de la copia está dañado. Conserva el original y vuelve a exportarlo."),
  ATTACHMENT_MAPPING_FAILED:T("No se pudo vincular cada archivo a su nota. Conserva la copia y reintenta."),
  ATTACHMENT_RESTORE_FAILED:T("No se pudieron guardar los archivos en este dispositivo. Libera espacio y reintenta con la misma copia."),
  ATTACHMENT_ROLLBACK_FAILED:T("No se pudo deshacer una restauración de archivos incompleta. Conserva tu copia y vuelve a intentarlo."),
  ATTACHMENT_CHECK_UNAVAILABLE:T("No se pudieron comprobar los adjuntos locales. Cierra otras pestañas y vuelve a intentarlo."),
  IMPORT_RETRY_REQUIRED:T("La pizarra cambió durante la restauración. Vuelve a intentarlo con la misma copia; no se duplicarán las notas ya añadidas."),
  IDEMPOTENCY_CONFLICT:T("Este reintento no coincide con la copia original. Conserva el archivo y vuelve a abrir el diálogo.")
}[error.message]||T("No se pudo confirmar el resultado. Reintenta con la misma copia; la importación en cuenta evita duplicar un envío ya completado."));
const exportError=error=>{
  if(error.code==='DOWNLOAD_FAILED'||/^NATIVE_DOWNLOAD_/.test(error.code||''))return error.message;
  return {
    IMAGE_EXPORT_TOO_LARGE:T("La imagen admite hasta 100 notas. Guarda una copia de seguridad para conservar la pizarra completa."),
    IMAGE_EXPORT_FAILED:T("No se pudo generar la imagen. Vuelve a intentarlo o guarda una copia de seguridad. Tus notas se conservan."),
    BACKUP_TOO_LARGE:T("La copia completa supera 50 MB. Descarga los archivos por separado antes de reducir sus adjuntos. Tus notas se conservan."),
    NOTE_PROTECTED:T("Una nota acaba de protegerse. Vuelve a guardar la copia para incluir su versión cifrada.")
  }[error.message]||T("No se pudo completar la operación. No se ha descargado una copia incompleta. Tus notas se conservan.");
};
async function showImport(initialFile,returnFocus=document.activeElement){
  const board=await currentBoard(),el=dialog(T("Restaurar una copia de seguridad"),returnFocus),cloud=board.id!=='guest-board',maxBytes=LOCAL_BACKUP_BYTES;
  el.append(text('p',T("Añade texto, colores, estilos, dibujos y notas cifradas a espacios vacíos. Incluye los archivos y enlaces de la copia. Los archivos se restauran en este dispositivo; las notas protegidas conservan su cifrado. Las notas actuales se conservan. Máximo 50 MB.")));
  if(cloud)el.append(text('p',T("Necesita conexión. Se respetan el límite de tu plan y los espacios disponibles. Los adjuntos locales de otro dispositivo no pueden comprobarse aquí.")));
  const label=text('label',T("Selecciona una copia de PostisPop")),file=document.createElement('input');file.type='file';file.accept='.json,application/json';label.append(file);el.append(label);
  const status=text('p','');status.setAttribute('role','status');el.append(status);
  const submit=text('button',T("Añadir a las notas vacías"));submit.type='button';submit.disabled=true;el.append(submit);
  let prepared=null,selection=0;
  const preview=async selected=>{
    const generation=++selection;prepared=null;submit.disabled=true;
    if(!selected){status.textContent=T("Selecciona una copia para revisar cuántas notas contiene.");return;}
    try{
      if(selected.size>maxBytes)throw Error('BACKUP_TOO_LARGE');
      let data;try{data=JSON.parse(await selected.text());}catch{throw Error('INVALID_BACKUP');}
      const normalized=normalizeBackup(data,{maxNotes:cloud?100:12,maxBytes});
      await verifyBackupAttachments(normalized.notes);
      if(generation!==selection)return;
      prepared=normalized;
      status.textContent=normalized.notes.length?selected.name+' · '+T("{count} notas con contenido. Se añadirán sin sustituir las actuales.").replace('{count}',normalized.notes.length):T("La copia no contiene notas para añadir.");
      submit.disabled=!normalized.notes.length;
    }catch(error){if(generation===selection)status.textContent=importError(error);}
  };
  file.addEventListener('change',()=>{initialFile=null;void preview(file.files[0]);});
  submit.addEventListener('click',async()=>{
    if(!prepared)return;submit.disabled=true;file.disabled=true;status.textContent=T("Importando la copia…");
    try{await api('board/'+board.id+'/import',prepared);location.reload();}
    catch(error){status.textContent=importError(error);submit.disabled=false;file.disabled=false;}
  });
  void preview(initialFile);
}
window.addEventListener('postispop:import-legacy',event=>{showImport(event.detail?.file).catch(()=>message(T("No se pudo abrir la restauración. Conserva tu archivo de copia.")));});
function filter(){
  const query=searchTools.querySelector('[type=search]').value.trim();
  const colors=searchTools.querySelector('select'),color=colors.value;
  colors.dataset.active=String(Boolean(color));colors.title=T("Filtrar por color")+': '+colors.selectedOptions[0].textContent;searchTools.querySelector('.pp-clear-filters').hidden=!(query||color||favoritesOnly);
  window.dispatchEvent(new CustomEvent('postispop:filter',{detail:{query,color,favoritesOnly}}));
  message(color?T('Color')+': '+colors.selectedOptions[0].textContent+' · '+(favoritesOnly?(favoriteStatus[readBoardLanguage()]||favoriteStatus.es):T('Búsqueda en todas tus notas. Las notas protegidas no exponen su texto.')):favoritesOnly?(favoriteStatus[readBoardLanguage()]||favoriteStatus.es):query||color?T("Búsqueda en todas tus notas. Las notas protegidas no exponen su texto."):'');
}
function refreshBoardChrome(){
 if(!searchTools?.isConnected)return;
 for(const node of searchTools.querySelectorAll('[data-pp-ui-label]')){const next=T(node.dataset.ppUiLabel);if(node.textContent!==next)node.textContent=next;}
 for(const [node,key,attribute]of [[options.querySelector('summary'),T("Opciones de la pizarra"),'title'],[options.querySelector('summary'),T("Opciones avanzadas"),'aria-label'],[tools,T("Herramientas de la pizarra"),'aria-label'],[searchTools,T("Buscar en tus notas"),'aria-label'],[searchTools.querySelector('[type=search]'),T("Buscar notas o #etiqueta"),'placeholder'],[searchTools.querySelector('[type=search]'),T("Buscar notas o etiquetas"),'aria-label'],[searchTools.querySelector('select'),T("Filtrar por color"),'aria-label'],[searchTools.querySelector('.pp-favorites-filter'),T("Favoritos"),'aria-label']]){const value=T(key);if(node?.getAttribute(attribute)!==value)node?.setAttribute(attribute,value);}
 const colors=searchTools.querySelector('select');colors.title=T("Filtrar por color")+': '+colors.selectedOptions[0].textContent;
}
export function initBoardTools(){
  const board=document.querySelector('.board-frame:not(.is-loading)');if(!board)return;
  if(tools?.isConnected){refreshBoardChrome();return;}
  searchTools?.remove();
  options=document.createElement('details');options.className='pp-board-options';
  const summary=text('summary','⋯');summary.title=T("Opciones de la pizarra");summary.setAttribute('aria-label',T("Opciones avanzadas"));options.append(summary);
  tools=document.createElement('div');tools.className='pp-tools';tools.setAttribute('aria-label',T("Herramientas de la pizarra"));
  searchTools=document.createElement('section');searchTools.className='pp-tools pp-note-search';searchTools.setAttribute('aria-label',T("Buscar en tus notas"));board.before(searchTools);
  const search=document.createElement('input');search.type='search';search.placeholder=T("Buscar notas o #etiqueta");search.setAttribute('aria-label',T("Buscar notas o etiquetas"));searchTools.append(search);
  const colors=document.createElement('select');colors.setAttribute('aria-label',T("Filtrar por color"));[T("Todos los colores"),T("Amarillo"),T("Rosa"),T("Azul"),T("Crema"),T("Verde"),T("Violeta")].forEach((label,i)=>{const opt=text('option',label);opt.value=i===0?'':String(i-1);colors.append(opt);});searchTools.append(colors);
  const favorite=text('button','☆');favorite.type='button';favorite.className='pp-favorites-filter';favorite.setAttribute('aria-pressed','false');favorite.setAttribute('aria-label',favoriteLabels[readBoardLanguage()]||favoriteLabels.es);favorite.title=favorite.getAttribute('aria-label');searchTools.append(favorite);
  favoritesOnly=false;
  favorite.addEventListener('click',()=>{favoritesOnly=!favoritesOnly;favorite.textContent=favoritesOnly?'★':'☆';favorite.setAttribute('aria-pressed',String(favoritesOnly));searchTools.classList.toggle('showing-favorites',favoritesOnly);filter();});
  let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,180);});colors.addEventListener('change',filter);
  window.addEventListener('postispop:clear-filter',()=>{if(!searchTools?.contains(search))return;clearTimeout(timer);search.value='';colors.value='';favoritesOnly=false;favorite.textContent='☆';favorite.setAttribute('aria-pressed','false');searchTools.classList.remove('showing-favorites');filter();});
  const operations=[[T("Guardar una copia"),exportJson],[T("Restaurar una copia"),trigger=>showImport(undefined,trigger)],[T("Descargar imagen"),exportPng],[T("Imprimir"),printPdf]];
  operations.forEach(([name,fn])=>{const button=text('button',name);button.type='button';button.addEventListener('click',async()=>{button.disabled=true;options.open=false;summary.focus({preventScroll:true});try{await fn(summary);}catch(error){message(exportError(error));}finally{button.disabled=false;}});tools.append(button);});
  const installHelp=text('a',T("Descargas e instalación"));installHelp.href='/descargas/';tools.append(installHelp);
  const install=text('button',T("Instalar aplicación"));install.type='button';install.dataset.experience='install';install.hidden=true;tools.append(install);
  const clear=text('button',T("Limpiar filtros"));clear.type='button';clear.className='pp-clear-filters';clear.hidden=true;clear.addEventListener('click',()=>window.dispatchEvent(new Event('postispop:clear-filter')));searchTools.append(clear);
  const status=text('span','');status.className='pp-search-status';status.setAttribute('role','status');searchTools.append(status);options.append(tools);searchTools.append(options);refreshBoardChrome();
}
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,[contenteditable=true],dialog,[role=dialog]'))return;
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey){if(!tools?.isConnected)return;event.preventDefault();searchTools?.querySelector('[type=search]')?.focus();}
  if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==='e'){if(!tools?.isConnected)return;event.preventDefault();options.open=false;exportJson().catch(error=>message(exportError(error)));}
});
