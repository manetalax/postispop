import {withNoteStorageLock,assertAttachmentWritable,protectedMarker} from './attachment-lock.js';
import {readBoardLanguage} from './seo-language.js';
const DB_NAME = 'postispop-note-attachments';
const STORE = 'attachments';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 100;

let activeNoteId = '';
let recorder = null;
let recordingStream = null;
let recordedChunks = [];
let objectUrls = [];

const translations={
  es:{title:'Archivos adjuntos',add:'Añadir archivos',link:'Añadir enlace',voice:'Grabar voz',stop:'Detener',empty:'Todavía no hay adjuntos.',local:'Se guardan en este dispositivo y se incluyen al guardar una copia.',remove:'Eliminar adjunto',tooLarge:'No se pudo reducir a 5 MB. Prueba con una versión más pequeña.',compressing:'Comprimiendo el archivo…',failed:'No se pudo guardar el adjunto.',url:'Pega una dirección web',save:'Guardar enlace',cancel:'Cancelar',limit:'Cada nota admite hasta 100 adjuntos.',protected:'La nota se ha protegido. Este adjunto no se ha guardado sin cifrar.',protectedLink:'La nota se ha protegido. El enlace no se ha guardado sin cifrar.',validUrl:'Escribe un enlace válido.',longUrl:'El enlace es demasiado largo o contiene credenciales.',protocol:'El enlace debe comenzar por http:// o https://',removeError:'No se pudo modificar el adjunto. La nota puede estar protegida.',locked:'Adjuntos cerrados: la nota está protegida o ya no está disponible.',protecting:'Esta nota se está protegiendo. Cierra el editor y ábrela con su contraseña.',microphone:'No se ha podido acceder al micrófono.',recordUnavailable:'La grabación de voz no está disponible.'},
  en:{title:'Attachments',add:'Add files',link:'Add link',voice:'Record audio',stop:'Stop',empty:'No attachments yet.',local:'Saved on this device and included when you save a backup.',remove:'Remove attachment',tooLarge:'Could not reduce this file to 5 MB. Try a smaller version.',compressing:'Compressing file…',failed:'Could not save the attachment.',url:'Paste a web address',save:'Save link',cancel:'Cancel',limit:'Each note can have up to 100 attachments.',protected:'This note is protected. The attachment was not saved unencrypted.',protectedLink:'This note is protected. The link was not saved unencrypted.',validUrl:'Enter a valid link.',longUrl:'The link is too long or contains credentials.',protocol:'The link must start with http:// or https://',removeError:'Could not change the attachment. The note may be protected.',locked:'Attachments are closed: the note is protected or unavailable.',protecting:'This note is being protected. Close the editor and reopen it with its password.',microphone:'Could not access the microphone.',recordUnavailable:'Audio recording is unavailable.'},
  de:{title:'Anhänge',add:'Dateien hinzufügen',link:'Link hinzufügen',voice:'Audio aufnehmen',stop:'Stopp',empty:'Noch keine Anhänge.',local:'Auf diesem Gerät gespeichert und in einer Sicherung enthalten.',remove:'Anhang entfernen',tooLarge:'Die Datei ließ sich nicht auf 5 MB verkleinern. Bitte eine kleinere Version verwenden.',compressing:'Datei wird komprimiert…',failed:'Der Anhang konnte nicht gespeichert werden.',url:'Webadresse einfügen',save:'Link speichern',cancel:'Abbrechen',limit:'Pro Notiz sind bis zu 100 Anhänge möglich.',protected:'Diese Notiz ist geschützt. Der Anhang wurde nicht unverschlüsselt gespeichert.',protectedLink:'Diese Notiz ist geschützt. Der Link wurde nicht unverschlüsselt gespeichert.',validUrl:'Bitte einen gültigen Link eingeben.',longUrl:'Der Link ist zu lang oder enthält Zugangsdaten.',protocol:'Der Link muss mit http:// oder https:// beginnen.',removeError:'Der Anhang konnte nicht geändert werden. Die Notiz ist möglicherweise geschützt.',locked:'Anhänge geschlossen: Die Notiz ist geschützt oder nicht verfügbar.',protecting:'Diese Notiz wird geschützt. Schließe den Editor und öffne sie mit ihrem Passwort erneut.',microphone:'Zugriff auf das Mikrofon nicht möglich.',recordUnavailable:'Audioaufnahme ist nicht verfügbar.'},
  fr:{title:'Pièces jointes',add:'Ajouter des fichiers',link:'Ajouter un lien',voice:'Enregistrer un audio',stop:'Arrêter',empty:'Aucune pièce jointe pour le moment.',local:'Enregistrées sur cet appareil et incluses dans une sauvegarde.',remove:'Supprimer la pièce jointe',tooLarge:'Impossible de réduire ce fichier à 5 Mo. Essayez une version plus petite.',compressing:'Compression du fichier…',failed:'Impossible d’enregistrer la pièce jointe.',url:'Collez une adresse web',save:'Enregistrer le lien',cancel:'Annuler',limit:'Chaque note accepte jusqu’à 100 pièces jointes.',protected:'Cette note est protégée. La pièce jointe n’a pas été enregistrée sans chiffrement.',protectedLink:'Cette note est protégée. Le lien n’a pas été enregistré sans chiffrement.',validUrl:'Saisissez un lien valide.',longUrl:'Le lien est trop long ou contient des identifiants.',protocol:'Le lien doit commencer par http:// ou https://',removeError:'Impossible de modifier la pièce jointe. La note est peut-être protégée.',locked:'Pièces jointes fermées : la note est protégée ou indisponible.',protecting:'Cette note est en cours de protection. Fermez l’éditeur et rouvrez-la avec son mot de passe.',microphone:'Impossible d’accéder au microphone.',recordUnavailable:'L’enregistrement audio est indisponible.'},
  pt:{title:'Anexos',add:'Adicionar ficheiros',link:'Adicionar ligação',voice:'Gravar áudio',stop:'Parar',empty:'Ainda não há anexos.',local:'Guardados neste dispositivo e incluídos numa cópia de segurança.',remove:'Remover anexo',tooLarge:'Não foi possível reduzir este ficheiro para 5 MB. Tente uma versão menor.',compressing:'A comprimir o ficheiro…',failed:'Não foi possível guardar o anexo.',url:'Cole um endereço web',save:'Guardar ligação',cancel:'Cancelar',limit:'Cada nota aceita até 100 anexos.',protected:'Esta nota está protegida. O anexo não foi guardado sem encriptação.',protectedLink:'Esta nota está protegida. A ligação não foi guardada sem encriptação.',validUrl:'Introduza uma ligação válida.',longUrl:'A ligação é demasiado longa ou contém credenciais.',protocol:'A ligação deve começar por http:// ou https://',removeError:'Não foi possível alterar o anexo. A nota pode estar protegida.',locked:'Anexos fechados: a nota está protegida ou indisponível.',protecting:'Esta nota está a ser protegida. Feche o editor e volte a abri-la com a palavra-passe.',microphone:'Não foi possível aceder ao microfone.',recordUnavailable:'A gravação de áudio não está disponível.'},
  it:{title:'Allegati',add:'Aggiungi file',link:'Aggiungi link',voice:'Registra audio',stop:'Ferma',empty:'Nessun allegato.',local:'Salvati su questo dispositivo e inclusi in una copia di backup.',remove:'Rimuovi allegato',tooLarge:'Impossibile ridurre il file a 5 MB. Prova con una versione più piccola.',compressing:'Compressione del file…',failed:'Impossibile salvare l’allegato.',url:'Incolla un indirizzo web',save:'Salva link',cancel:'Annulla',limit:'Ogni nota può contenere fino a 100 allegati.',protected:'La nota è protetta. L’allegato non è stato salvato senza cifratura.',protectedLink:'La nota è protetta. Il link non è stato salvato senza cifratura.',validUrl:'Inserisci un link valido.',longUrl:'Il link è troppo lungo o contiene credenziali.',protocol:'Il link deve iniziare con http:// o https://',removeError:'Impossibile modificare l’allegato. La nota potrebbe essere protetta.',locked:'Allegati chiusi: la nota è protetta o non disponibile.',protecting:'La nota è in fase di protezione. Chiudi l’editor e riaprila con la password.',microphone:'Impossibile accedere al microfono.',recordUnavailable:'La registrazione audio non è disponibile.'},
  ja:{title:'添付ファイル',add:'ファイルを追加',link:'リンクを追加',voice:'音声を録音',stop:'停止',empty:'添付ファイルはありません。',local:'この端末に保存され、バックアップにも含まれます。',remove:'添付ファイルを削除',tooLarge:'5 MB以下に圧縮できませんでした。小さいファイルをお試しください。',compressing:'ファイルを圧縮中…',failed:'添付ファイルを保存できませんでした。',url:'ウェブアドレスを貼り付け',save:'リンクを保存',cancel:'キャンセル',limit:'1つのノートに最大100個の添付ファイルを追加できます。',protected:'このノートは保護されています。添付ファイルは暗号化せずに保存されませんでした。',protectedLink:'このノートは保護されています。リンクは暗号化せずに保存されませんでした。',validUrl:'有効なリンクを入力してください。',longUrl:'リンクが長すぎるか、認証情報が含まれています。',protocol:'リンクは http:// または https:// で始めてください。',removeError:'添付ファイルを変更できません。ノートが保護されている可能性があります。',locked:'添付ファイルは閉じています。ノートが保護されているか、利用できません。',protecting:'ノートを保護しています。エディターを閉じ、パスワードで再度開いてください。',microphone:'マイクにアクセスできませんでした。',recordUnavailable:'音声録音を利用できません。'},
  ko:{title:'첨부 파일',add:'파일 추가',link:'링크 추가',voice:'오디오 녹음',stop:'중지',empty:'아직 첨부 파일이 없습니다.',local:'이 기기에 저장되며 백업에도 포함됩니다.',remove:'첨부 파일 삭제',tooLarge:'파일을 5MB 이하로 줄일 수 없습니다. 더 작은 파일을 사용해 보세요.',compressing:'파일 압축 중…',failed:'첨부 파일을 저장하지 못했습니다.',url:'웹 주소 붙여넣기',save:'링크 저장',cancel:'취소',limit:'노트 하나에 최대 100개의 파일을 첨부할 수 있습니다.',protected:'노트가 보호되어 있습니다. 첨부 파일은 암호화되지 않은 상태로 저장되지 않았습니다.',protectedLink:'노트가 보호되어 있습니다. 링크는 암호화되지 않은 상태로 저장되지 않았습니다.',validUrl:'올바른 링크를 입력하세요.',longUrl:'링크가 너무 길거나 인증 정보가 포함되어 있습니다.',protocol:'링크는 http:// 또는 https://로 시작해야 합니다.',removeError:'첨부 파일을 변경하지 못했습니다. 노트가 보호된 상태일 수 있습니다.',locked:'첨부 파일이 닫혔습니다. 노트가 보호되어 있거나 사용할 수 없습니다.',protecting:'노트를 보호하는 중입니다. 편집기를 닫고 비밀번호로 다시 여세요.',microphone:'마이크에 접근할 수 없습니다.',recordUnavailable:'오디오 녹음을 사용할 수 없습니다.'}
};
const notices={
  es:{locked:'Adjuntos cerrados: la nota está protegida o ya no está disponible.',protecting:'Esta nota se está protegiendo. Cierra el editor y ábrela con su contraseña.'},
  en:{locked:'Attachments are closed: the note is protected or unavailable.',protecting:'This note is being protected. Close the editor and reopen it with its password.'},
  de:{locked:'Anhänge geschlossen: Die Notiz ist geschützt oder nicht verfügbar.',protecting:'Diese Notiz wird geschützt. Schließe den Editor und öffne sie mit ihrem Passwort erneut.'},
  fr:{locked:'Pièces jointes fermées : la note est protégée ou indisponible.',protecting:'Cette note est en cours de protection. Fermez l’éditeur et rouvrez-la avec son mot de passe.'},
  pt:{locked:'Anexos fechados: a nota está protegida ou indisponível.',protecting:'Esta nota está a ser protegida. Feche o editor e volte a abri-la com a palavra-passe.'},
  it:{locked:'Allegati chiusi: la nota è protetta o non disponibile.',protecting:'La nota è in fase di protezione. Chiudi l’editor e riaprila con la password.'},
  ja:{locked:'添付ファイルは閉じています。ノートが保護されているか、利用できません。',protecting:'ノートを保護しています。エディターを閉じ、パスワードで再度開いてください。'},
  ko:{locked:'첨부 파일이 닫혔습니다. 노트가 보호되어 있거나 사용할 수 없습니다.',protecting:'노트를 보호하는 중입니다. 편집기를 닫고 비밀번호로 다시 여세요.'}
};
const addVideoLabels={es:'Añadir vídeo',en:'Add video',de:'Video hinzufügen',fr:'Ajouter une vidéo',pt:'Adicionar vídeo',it:'Aggiungi video',ja:'動画を追加',ko:'동영상 추가'};
let currentLanguage=readBoardLanguage();
let labels={...(translations[currentLanguage]||translations.es),...(notices[currentLanguage]||notices.es),addVideo:addVideoLabels[currentLanguage]||addVideoLabels.es};

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(STORE, { keyPath: 'key' });
      store.createIndex('noteId', 'noteId', { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(mode, run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = run(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

async function listForNote(noteId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).index('noteId').getAll(noteId);
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.created - b.created));
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

function extension(name = '') {
  return name.toLowerCase().split('.').pop();
}

function supported(file) {
  return file instanceof Blob;
}

function fileFromBlob(blob,name,type=blob.type){return new File([blob],name,{type:type||'application/octet-stream',lastModified:Date.now()});}
function replaceExtension(name,extensionName){return `${name.replace(/\.[^.]+$/,'')}.${extensionName}`;}
function toBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('ENCODE_FAILED')),type,quality));}

async function compressImage(file){
  if(!window.createImageBitmap)return null;
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  try{
    const canvas=document.createElement('canvas');let scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
    for(let dimensionPass=0;dimensionPass<7;dimensionPass++){
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext('2d',{alpha:true});if(!context)return null;
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.9,.84,.78,.72,.66]){
        const blob=await toBlob(canvas,'image/webp',quality);
        if(blob.size<=MAX_FILE_BYTES)return {file:fileFromBlob(blob,replaceExtension(file.name,'webp'),'image/webp'),compression:'image-webp'};
      }
      scale*=.82;
    }
    return null;
  }finally{bitmap.close?.();}
}

async function compressAudio(file){
  const AudioContextType=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextType||!window.MediaRecorder)return null;
  const context=new AudioContextType();
  try{
    const buffer=await context.decodeAudioData(await file.arrayBuffer());
    const destination=context.createMediaStreamDestination(),source=context.createBufferSource();source.buffer=buffer;source.connect(destination);
    const mime=['audio/webm;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    const targetBits=Math.min(128000,Math.max(64000,Math.floor(MAX_FILE_BYTES*8*.88/buffer.duration)));
    const recorder=new MediaRecorder(destination.stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:targetBits});
    const chunks=[];
    const result=new Promise((resolve,reject)=>{
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>reject(new Error('AUDIO_COMPRESS_FAILED'));
      recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});resolve(blob);};
    });
    await context.resume();recorder.start();source.start();
    await new Promise((resolve,reject)=>{source.onended=resolve;source.onerror=()=>reject(new Error('AUDIO_COMPRESS_FAILED'));});
    if(recorder.state!=='inactive')recorder.stop();
    const blob=await result;
    if(blob.size>MAX_FILE_BYTES)return null;
    const ext=blob.type.includes('mp4')?'m4a':'webm';
    return {file:fileFromBlob(blob,replaceExtension(file.name,ext),blob.type),compression:'audio-transcode'};
  }finally{await context.close().catch(()=>{});}
}

async function compressVideo(file){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return null;
  const mediaUrl=URL.createObjectURL(file),video=document.createElement('video'),canvas=document.createElement('canvas');
  video.preload='auto';video.playsInline=true;video.src=mediaUrl;
  let audioContext=null,source=null;
  try{
    await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('VIDEO_DECODE_FAILED'));});
    if(!Number.isFinite(video.duration)||video.duration<=0)return null;
    const budgetBits=Math.floor(MAX_FILE_BYTES*8*.88/video.duration),audioBits=Math.min(96000,Math.floor(budgetBits*.18));
    const videoBits=budgetBits-audioBits;
    if(videoBits<260000)return null;
    const maxDimension=videoBits>1000000?1280:videoBits>500000?960:videoBits>260000?720:480;
    const ratio=Math.min(1,maxDimension/Math.max(video.videoWidth,video.videoHeight));
    canvas.width=Math.max(2,Math.round(video.videoWidth*ratio/2)*2);canvas.height=Math.max(2,Math.round(video.videoHeight*ratio/2)*2);
    const context=canvas.getContext('2d');if(!context)return null;
    const videoStream=canvas.captureStream(24),tracks=[...videoStream.getVideoTracks()];
    const AudioContextType=window.AudioContext||window.webkitAudioContext;
    if(AudioContextType){
      try{audioContext=new AudioContextType();await audioContext.resume();source=audioContext.createMediaElementSource(video);const destination=audioContext.createMediaStreamDestination();source.connect(destination);tracks.push(...destination.stream.getAudioTracks());}catch{}
    }
    const stream=new MediaStream(tracks);
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    if(!mime)return null;
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:videoBits,audioBitsPerSecond:audioBits});
    const chunks=[],result=new Promise((resolve,reject)=>{
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>reject(new Error('VIDEO_ENCODE_FAILED'));
      recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||mime}));
    });
    let frame=0;
    const draw=()=>{if(video.paused||video.ended)return;context.drawImage(video,0,0,canvas.width,canvas.height);frame=requestAnimationFrame(draw);};
    const ended=new Promise((resolve,reject)=>{video.onended=resolve;video.onerror=()=>reject(new Error('VIDEO_DECODE_FAILED'));});
    await video.play();context.drawImage(video,0,0,canvas.width,canvas.height);recorder.start();draw();await ended;
    cancelAnimationFrame(frame);if(recorder.state!=='inactive')recorder.stop();
    const blob=await result;
    if(blob.size>MAX_FILE_BYTES)return null;
    const ext=blob.type.includes('mp4')?'mp4':'webm';
    return {file:fileFromBlob(blob,replaceExtension(file.name,ext),blob.type),compression:'video-transcode'};
  }finally{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(mediaUrl);if(source)try{source.disconnect();}catch{}if(audioContext)await audioContext.close().catch(()=>{});}
}

async function compressGeneric(file){
  if(!window.CompressionStream)return null;
  try{
    let total=0;
    const cap=new TransformStream({transform(chunk,controller){total+=chunk.byteLength;if(total>MAX_FILE_BYTES)throw new Error('TOO_LARGE');controller.enqueue(chunk);}});
    const stream=file.stream().pipeThrough(new CompressionStream('gzip')).pipeThrough(cap);
    const blob=await new Response(stream).blob();
    if(blob.size>=file.size||blob.size>MAX_FILE_BYTES)return null;
    return {file:fileFromBlob(blob,`${file.name}.gz`,'application/gzip'),compression:'gzip'};
  }catch{return null;}
}

async function prepareFile(file){
  notify(labels.compressing,0);
  try{
    let result=null;
    if(file.type.startsWith('image/'))result=await compressImage(file);
    else if(file.type.startsWith('audio/'))result=await compressAudio(file);
    else if(file.type.startsWith('video/'))result=await compressVideo(file);
    if(result&&result.file.size<file.size)return result;
    const generic=await compressGeneric(file);
    if(generic&&generic.file.size<file.size)return generic;
    return file.size<=MAX_FILE_BYTES?{file,compression:''}:null;
  }catch{return file.size<=MAX_FILE_BYTES?{file,compression:''}:null;}
}

function category(item) {
  if (item.kind === 'link') return 'link';
  const type = item.originalType || item.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf' || extension(item.name) === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(extension(item.name))) return 'word';
  if (['xls', 'xlsx'].includes(extension(item.name))) return 'excel';
  if (['ppt', 'pptx'].includes(extension(item.name))) return 'powerpoint';
  if (extension(item.name) === 'zip') return 'zip';
  return 'file';
}

function icon(kind) {
  return ({ image: '🖼️', audio: '🎧', video: '🎬', pdf: 'PDF', word: 'W', excel: 'X',
    powerpoint: 'P', zip: 'ZIP', link: '🔗', file: '📎' })[kind];
}

function humanSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function notify(message, duration=3200) {
  let toast = document.querySelector('.pp-attachment-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'pp-attachment-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(notify.timer);
  if(duration>0)notify.timer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}
function dismissNotify(){clearTimeout(notify.timer);document.querySelector('.pp-attachment-toast')?.classList.remove('is-visible');}

async function saveFiles(files, noteId=activeNoteId) {
  if (!noteId) return;
  const ready=[],failures=[];
  for(const source of files){
    if(!supported(source))continue;
    const prepared=await prepareFile(source);
    if(!prepared||prepared.file.size>MAX_FILE_BYTES){failures.push(`${source.name}: ${labels.tooLarge}`);continue;}
    ready.push({source,...prepared});
  }
  dismissNotify();
  try { await withNoteStorageLock(noteId, async()=>{
    await assertAttachmentWritable(noteId);
    let count=(await listForNote(noteId)).length;
    for (const {source,file,compression} of ready) {
      if(count>=MAX_ATTACHMENTS){notify(labels.limit);break;}
      const id=crypto.randomUUID(),item={key:`${noteId}::${id}`,id,noteId,kind:'file',name:compression==='gzip'?source.name:(file.name||`audio-${Date.now()}.webm`),type:compression==='gzip'?(source.type||'application/octet-stream'):(file.type||'application/octet-stream'),...(compression==='gzip'?{originalType:source.type||'application/octet-stream'}:{}),size:file.size,originalSize:source.size,compression,created:Date.now(),blob:file};
      await transaction('readwrite',store=>store.put(item));count++;
    }
  }); } catch(error) { notify(error.message==='NOTE_PROTECTED'?labels.protected:labels.failed);return; }
  if(failures.length)notify(failures.join(' · '));
  if(activeNoteId===noteId)await renderList();
}

async function saveLink(raw, noteId=activeNoteId) {
  if (!noteId) return;
  let url;try{url=new URL(raw.trim());}catch{notify(labels.validUrl);return;}
  if(raw.length>8192||url.username||url.password){notify(labels.longUrl);return;}
  if(!['http:','https:'].includes(url.protocol)){notify(labels.protocol);return;}
  try{await withNoteStorageLock(noteId,async()=>{
    await assertAttachmentWritable(noteId);
    if((await listForNote(noteId)).length>=MAX_ATTACHMENTS){notify(labels.limit);return;}
    const id=crypto.randomUUID();const item={key:`${noteId}::${id}`,id,noteId,kind:'link',name:url.hostname,url:url.href,created:Date.now(),size:0,type:'text/uri-list'};
    await transaction('readwrite',store=>store.put(item));
  });}catch(error){notify(error.message==='NOTE_PROTECTED'?labels.protectedLink:labels.failed);}
  if(activeNoteId===noteId)await renderList();
}

async function removeItem(key) {
  const noteId=key.split('::')[0];
  try{await withNoteStorageLock(noteId,async()=>{await assertAttachmentWritable(noteId);await transaction('readwrite',store=>store.delete(key));});}
  catch{notify(labels.removeError);}
  if(activeNoteId===noteId)await renderList();
}

function makeMedia(item, url, kind) {
  if (kind === 'image') {
    const img = document.createElement('img'); img.src = url; img.alt = item.name; img.loading = 'lazy'; return img;
  }
  if (kind === 'audio' || kind === 'video') {
    const media = document.createElement(kind); media.src = url; media.controls = true; media.preload = 'metadata'; return media;
  }
  return null;
}

async function renderList() {
  const list = document.querySelector('.pp-attachments-list');
  if (!list || !activeNoteId) return;
  const renderingNoteId=activeNoteId;
  try{await assertAttachmentWritable(renderingNoteId);}catch{objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];list.replaceChildren();const message=document.createElement('p');message.textContent=labels.locked;list.append(message);return;}
  objectUrls.forEach(URL.revokeObjectURL); objectUrls = [];
  let items = [];
  try { items = await listForNote(renderingNoteId); } catch { notify(labels.failed); }
  if(activeNoteId!==renderingNoteId||!list.isConnected)return;
  if(localStorage.getItem(protectedMarker(renderingNoteId))==='1'){list.replaceChildren();return;}
  list.replaceChildren();
  list.classList.toggle('is-empty', items.length === 0);
  if (!items.length) {
    const empty = document.createElement('p'); empty.className = 'pp-attachments-empty'; empty.textContent = labels.empty; list.append(empty); return;
  }
  for (const item of items) {
    const kind = category(item);
    const card = document.createElement('article'); card.className = `pp-attachment-card kind-${kind}`;
    let url = item.url,downloadName=item.name;
    if (item.blob) {
      let displayBlob=item.blob;
      if(item.compression==='gzip'){
        if(window.DecompressionStream){try{const bytes=await new Response(item.blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();displayBlob=new Blob([bytes],{type:item.originalType||item.type||'application/octet-stream'});}catch{downloadName=`${item.name}.gz`;displayBlob=item.blob;}}
        else downloadName=`${item.name}.gz`;
      }
      url = URL.createObjectURL(displayBlob); objectUrls.push(url);
    }
    const media = item.blob && makeMedia(item, url, kind);
    if (media) card.append(media);
    const row = document.createElement('div'); row.className = 'pp-attachment-row';
    const badge = document.createElement('span'); badge.className = 'pp-attachment-icon'; badge.textContent = icon(kind);
    const details = document.createElement('div'); details.className = 'pp-attachment-details';
    const open = document.createElement('a'); open.href = url; open.target = '_blank'; open.rel = 'noopener noreferrer';
    if (item.blob) {
      open.download = downloadName;
      open.textContent = downloadName;
    } else {
      open.textContent = item.url;
    }
    const meta = document.createElement('small'); meta.textContent = item.kind === 'link' ? item.name : `${kind.toUpperCase()} · ${humanSize(item.size)}`;
    details.append(open, meta);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'pp-attachment-remove';
    remove.setAttribute('aria-label', labels.remove); remove.title = labels.remove; remove.textContent = '×';
    remove.addEventListener('click', () => removeItem(item.key));
    row.append(badge, details, remove); card.append(row); list.append(card);
  }
}

function toggleLinkForm(panel, show) {
  const form = panel.querySelector('.pp-link-form');
  form.hidden = !show;
  if (show) form.querySelector('input').focus();
}

async function toggleRecording(button) {
  if (recorder?.state === 'recording') { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { notify(labels.recordUnavailable); return; }
  try {
    const recordedNoteId=activeNoteId;await assertAttachmentWritable(recordedNoteId);
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    const preferred = ['audio/webm;codecs=opus', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(recordingStream, preferred ? { mimeType: preferred } : undefined);
    recorder.ondataavailable = event => { if (event.data.size) recordedChunks.push(event.data); };
    recorder.onstop = async () => {
      const type = recorder.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'm4a' : 'webm';
      const blob = new Blob(recordedChunks, { type });
      await saveFiles([new File([blob], `Nota-de-voz-${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`, { type })],recordedNoteId);
      recordedChunks=[];
      recordingStream?.getTracks().forEach(track => track.stop()); recordingStream = null;
      button.classList.remove('is-recording'); button.querySelector('span').textContent = labels.voice;
    };
    recorder.start(); button.classList.add('is-recording'); button.querySelector('span').textContent = labels.stop;
  } catch { notify(labels.microphone); }
}

function createPanel() {
  const panel = document.createElement('section'); panel.className = 'pp-attachments'; panel.setAttribute('aria-label', labels.title);
  panel.innerHTML = `
    <div class="pp-attachments-heading"><div><strong>${labels.title}</strong><small>${labels.local}</small></div></div>
    <div class="pp-attachment-actions">
      <label class="pp-attachment-action pp-file-action">📎 <span>${labels.add}</span><input type="file" multiple></label>
      <label class="pp-attachment-action pp-video-action">🎬 <span>${labels.addVideo}</span><input type="file" accept="video/*" multiple></label>
      <button type="button" class="pp-attachment-action pp-voice-action">🎙️ <span>${labels.voice}</span></button>
      <button type="button" class="pp-attachment-action pp-link-action">🔗 <span>${labels.link}</span></button>
    </div>
    <form class="pp-link-form" hidden><input type="url" inputmode="url" placeholder="${labels.url}" aria-label="${labels.url}"><button type="submit">${labels.save}</button><button type="button" class="pp-link-cancel">${labels.cancel}</button></form>
    <div class="pp-attachments-list" aria-live="polite"></div>`;
  panel.querySelector('input[type=file]').addEventListener('change', async event => {
    const input=event.currentTarget,noteId=activeNoteId;await saveFiles([...input.files],noteId); input.value='';
  });
  panel.querySelector('.pp-video-action input').addEventListener('change',async event=>{
    const input=event.currentTarget,noteId=activeNoteId;await saveFiles([...input.files],noteId);input.value='';
  });
  panel.querySelector('.pp-voice-action').addEventListener('click', event => toggleRecording(event.currentTarget));
  panel.querySelector('.pp-link-action').addEventListener('click', () => toggleLinkForm(panel, true));
  panel.querySelector('.pp-link-cancel').addEventListener('click', () => toggleLinkForm(panel, false));
  panel.querySelector('.pp-link-form').addEventListener('submit', async event => {
    event.preventDefault(); const input = event.currentTarget.querySelector('input');
    await saveLink(input.value); input.value = ''; toggleLinkForm(panel, false);
  });
  return panel;
}

function noteIdFromDialog(dialog) {
  if (activeNoteId) return activeNoteId;
  const match = dialog.querySelector('.dialog-heading')?.textContent.match(/(\d+)/);
  if (!match) return '';
  return document.querySelectorAll('.sticky-note')[Number(match[1]) - 1]?.dataset.noteId || '';
}

async function enhanceEditor() {
  const dialog = document.querySelector('.editor-dialog');
  if (!dialog || dialog.querySelector('.pp-attachments')) return;
  activeNoteId = noteIdFromDialog(dialog);
  if (!activeNoteId) return;
  const anchor = dialog.querySelector('.edit-paper');
  if (!anchor) return;
  anchor.append(createPanel());
  await renderList();
}

document.addEventListener('pointerdown', event => {
  const note = event.target.closest?.('.sticky-note[data-note-id]');
  if (note) activeNoteId = note.dataset.noteId;
}, true);
document.addEventListener('click', event => {
  const note = event.target.closest?.('.sticky-note[data-note-id]');
  if (note) activeNoteId = note.dataset.noteId;
}, true);

const observer = new MutationObserver(() => enhanceEditor());
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceEditor();

function refreshAttachmentLanguage(){
  const language=readBoardLanguage();if(language===currentLanguage)return;
  currentLanguage=language;labels={...(translations[language]||translations.es),...(notices[language]||notices.es),addVideo:addVideoLabels[language]||addVideoLabels.es};
  document.querySelector('.pp-attachments')?.remove();enhanceEditor();
}
new MutationObserver(refreshAttachmentLanguage).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
window.addEventListener('storage',event=>{if(event.key==='pp:lang')refreshAttachmentLanguage();});

function closeProtectedAttachments(id){
  if(!id||id!==activeNoteId)return;
  objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];
  const panel=document.querySelector('.pp-attachments');if(panel){panel.replaceChildren();const text=document.createElement('p');text.textContent=labels.protecting;panel.append(text);}
  const editor=document.querySelector('.editor-dialog');editor?.querySelectorAll('textarea,input,button').forEach(input=>{if(!input.classList.contains('icon-button')&&!input.disabled){input.dataset.ppStorageDisabled='1';input.disabled=true;}});
}
window.addEventListener('storage',event=>{if(event.key!==protectedMarker(activeNoteId))return;if(event.newValue==='1')closeProtectedAttachments(activeNoteId);else if(event.newValue===null){document.querySelectorAll('[data-pp-storage-disabled]').forEach(input=>{input.disabled=false;delete input.dataset.ppStorageDisabled;});document.querySelector('.pp-attachments')?.remove();enhanceEditor();}});
window.addEventListener('postispop:protected',event=>closeProtectedAttachments(event.detail?.noteId));
