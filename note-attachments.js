import {withNoteStorageLock,assertAttachmentWritable,protectedMarker} from './attachment-lock.js';
import {readBoardLanguage} from './seo-language.js';
import {shareFile,shareText,openWhatsApp} from './share-tools.js?v=20261009a';
import {showCompleteNoteShare,installEditorShareButton} from './note-share.js';
const DB_NAME = 'postispop-note-attachments';
const STORE = 'attachments';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
// 144 kbit/s for five minutes is 5.4 MB; 6 MB leaves room for container overhead.
const MAX_MEDIA_BYTES = 6_000_000;
const CAMERA_PHOTO_BYTES = 128 * 1024;
const CAMERA_VIDEO_BYTES = MAX_MEDIA_BYTES;
const CAMERA_VIDEO_STOP_BYTES = 5_800_000;
const CAMERA_VIDEO_DURATION_MS = 5 * 60 * 1000;
const CAMERA_VIDEO_BITRATE = 144000;
const MAX_ATTACHMENTS = 100;

let activeNoteId = '';
let recorder = null;
let recordingStream = null;
let recordedChunks = [];
let cameraStream = null;
let cameraRecorder = null;
let cameraRecordStream = null;
let cameraChunks = [];
let cameraRecordBytes = 0;
let cameraRecordStarted = 0;
let cameraTimer = null;
let cameraFrame = 0;
let cameraPanel = null;
let cameraNoteId = '';
let cameraStopAtLimit = false;
let cameraCloseAfterStop = false;
let objectUrls = [];

const translations={
  es:{title:'Archivos adjuntos',add:'Añadir archivos',link:'Añadir enlace',voice:'Grabar voz',stop:'Detener',empty:'Todavía no hay adjuntos.',local:'Se guardan en este dispositivo y se incluyen al guardar una copia.',remove:'Eliminar adjunto',tooLarge:'No se pudo reducir a 5 MB. Prueba con una versión más pequeña.',compressing:'Comprimiendo el archivo…',failed:'No se pudo guardar el adjunto.',url:'Pega una dirección web',save:'Guardar enlace',cancel:'Cancelar',limit:'Cada nota admite hasta 100 adjuntos.',protected:'La nota se ha protegido. Este adjunto no se ha guardado sin cifrar.',protectedLink:'La nota se ha protegido. El enlace no se ha guardado sin cifrar.',validUrl:'Escribe un enlace válido.',longUrl:'El enlace es demasiado largo o contiene credenciales.',protocol:'El enlace debe comenzar por http:// o https://',removeError:'No se pudo modificar el adjunto. La nota puede estar protegida.',locked:'Adjuntos cerrados: la nota está protegida o ya no está disponible.',protecting:'Esta nota se está protegiendo. Cierra el editor y ábrela con su contraseña.',microphone:'No se ha podido acceder al micrófono.',recordUnavailable:'La grabación de voz no está disponible.',progress:'Preparando',compressingProgress:'Comprimiendo',savingProgress:'Guardando en este dispositivo',complete:'Adjunto guardado correctamente.',progressFile:'Archivo',cameraPermission:'Permite el acceso a la cámara y al micrófono para grabar vídeo.',videoPermission:'Permite el acceso al micrófono para grabar audio.',cameraDenied:'No se concedió el permiso de cámara o micrófono. Puedes activarlo en los ajustes de la app.',uploading:'Enviando',uploadComplete:'Archivo subido correctamente.'},
  en:{title:'Attachments',add:'Add files',link:'Add link',voice:'Record audio',stop:'Stop',empty:'No attachments yet.',local:'Saved on this device and included when you save a backup.',remove:'Remove attachment',tooLarge:'Could not reduce this file to 5 MB. Try a smaller version.',compressing:'Compressing file…',failed:'Could not save the attachment.',url:'Paste a web address',save:'Save link',cancel:'Cancel',limit:'Each note can have up to 100 attachments.',protected:'This note is protected. The attachment was not saved unencrypted.',protectedLink:'This note is protected. The link was not saved unencrypted.',validUrl:'Enter a valid link.',longUrl:'The link is too long or contains credentials.',protocol:'The link must start with http:// or https://',removeError:'Could not change the attachment. The note may be protected.',locked:'Attachments are closed: the note is protected or unavailable.',protecting:'This note is being protected. Close the editor and reopen it with its password.',microphone:'Could not access the microphone.',recordUnavailable:'Audio recording is unavailable.',progress:'Preparing',compressingProgress:'Compressing',savingProgress:'Saving on this device',complete:'Attachment saved successfully.',progressFile:'File',cameraPermission:'Allow camera and microphone access to record video.',videoPermission:'Allow microphone access to record audio.',cameraDenied:'Camera or microphone permission was denied. You can enable it in the app settings.',uploading:'Uploading',uploadComplete:'File uploaded successfully.'},
  de:{title:'Anhänge',add:'Dateien hinzufügen',link:'Link hinzufügen',voice:'Audio aufnehmen',stop:'Stopp',empty:'Noch keine Anhänge.',local:'Auf diesem Gerät gespeichert und in einer Sicherung enthalten.',remove:'Anhang entfernen',tooLarge:'Die Datei ließ sich nicht auf 5 MB verkleinern. Bitte eine kleinere Version verwenden.',compressing:'Datei wird komprimiert…',failed:'Der Anhang konnte nicht gespeichert werden.',url:'Webadresse einfügen',save:'Link speichern',cancel:'Abbrechen',limit:'Pro Notiz sind bis zu 100 Anhänge möglich.',protected:'Diese Notiz ist geschützt. Der Anhang wurde nicht unverschlüsselt gespeichert.',protectedLink:'Diese Notiz ist geschützt. Der Link wurde nicht unverschlüsselt gespeichert.',validUrl:'Bitte einen gültigen Link eingeben.',longUrl:'Der Link ist zu lang oder enthält Zugangsdaten.',protocol:'Der Link muss mit http:// oder https:// beginnen.',removeError:'Der Anhang konnte nicht geändert werden. Die Notiz ist möglicherweise geschützt.',locked:'Anhänge geschlossen: Die Notiz ist geschützt oder nicht verfügbar.',protecting:'Diese Notiz wird geschützt. Schließe den Editor und öffne sie mit ihrem Passwort erneut.',microphone:'Zugriff auf das Mikrofon nicht möglich.',recordUnavailable:'Audioaufnahme ist nicht verfügbar.',progress:'Vorbereitung',compressingProgress:'Komprimierung',savingProgress:'Speichern auf diesem Gerät',complete:'Anhang erfolgreich gespeichert.',progressFile:'Datei',cameraPermission:'Erlaube Kamera und Mikrofon, um Videos aufzunehmen.',videoPermission:'Erlaube den Mikrofonzugriff, um Audio aufzunehmen.',cameraDenied:'Kamera- oder Mikrofonzugriff verweigert. Du kannst ihn in den App-Einstellungen erlauben.',uploading:'Wird hochgeladen',uploadComplete:'Datei erfolgreich hochgeladen.'},
  fr:{title:'Pièces jointes',add:'Ajouter des fichiers',link:'Ajouter un lien',voice:'Enregistrer un audio',stop:'Arrêter',empty:'Aucune pièce jointe pour le moment.',local:'Enregistrées sur cet appareil et incluses dans une sauvegarde.',remove:'Supprimer la pièce jointe',tooLarge:'Impossible de réduire ce fichier à 5 Mo. Essayez une version plus petite.',compressing:'Compression du fichier…',failed:'Impossible d’enregistrer la pièce jointe.',url:'Collez une adresse web',save:'Enregistrer le lien',cancel:'Annuler',limit:'Chaque note accepte jusqu’à 100 pièces jointes.',protected:'Cette note est protégée. La pièce jointe n’a pas été enregistrée sans chiffrement.',protectedLink:'Cette note est protégée. Le lien n’a pas été enregistré sans chiffrement.',validUrl:'Saisissez un lien valide.',longUrl:'Le lien est trop long ou contient des identifiants.',protocol:'Le lien doit commencer par http:// ou https://',removeError:'Impossible de modifier la pièce jointe. La note est peut-être protégée.',locked:'Pièces jointes fermées : la note est protégée ou indisponible.',protecting:'Cette note est en cours de protection. Fermez l’éditeur et rouvrez-la avec son mot de passe.',microphone:'Impossible d’accéder au microphone.',recordUnavailable:'L’enregistrement audio est indisponible.',progress:'Préparation',compressingProgress:'Compression',savingProgress:'Enregistrement sur cet appareil',complete:'Pièce jointe enregistrée.',progressFile:'Fichier',cameraPermission:'Autorisez l’accès à la caméra et au microphone pour filmer.',videoPermission:'Autorisez l’accès au microphone pour enregistrer un audio.',cameraDenied:'L’accès à la caméra ou au microphone a été refusé. Autorisez-le dans les réglages de l’application.',uploading:'Envoi',uploadComplete:'Fichier envoyé.'},
  pt:{title:'Anexos',add:'Adicionar ficheiros',link:'Adicionar ligação',voice:'Gravar áudio',stop:'Parar',empty:'Ainda não há anexos.',local:'Guardados neste dispositivo e incluídos numa cópia de segurança.',remove:'Remover anexo',tooLarge:'Não foi possível reduzir este ficheiro para 5 MB. Tente uma versão menor.',compressing:'A comprimir o ficheiro…',failed:'Não foi possível guardar o anexo.',url:'Cole um endereço web',save:'Guardar ligação',cancel:'Cancelar',limit:'Cada nota aceita até 100 anexos.',protected:'Esta nota está protegida. O anexo não foi guardado sem encriptação.',protectedLink:'Esta nota está protegida. A ligação não foi guardada sem encriptação.',validUrl:'Introduza uma ligação válida.',longUrl:'A ligação é demasiado longa ou contém credenciais.',protocol:'A ligação deve começar por http:// ou https://',removeError:'Não foi possível alterar o anexo. A nota pode estar protegida.',locked:'Anexos fechados: a nota está protegida ou indisponível.',protecting:'Esta nota está a ser protegida. Feche o editor e volte a abri-la com a palavra-passe.',microphone:'Não foi possível aceder ao microfone.',recordUnavailable:'A gravação de áudio não está disponível.',progress:'A preparar',compressingProgress:'A comprimir',savingProgress:'A guardar neste dispositivo',complete:'Anexo guardado com sucesso.',progressFile:'Ficheiro',cameraPermission:'Permita o acesso à câmara e ao microfone para gravar vídeo.',videoPermission:'Permita o acesso ao microfone para gravar áudio.',cameraDenied:'A permissão da câmara ou do microfone foi recusada. Pode ativá-la nas definições da app.',uploading:'A enviar',uploadComplete:'Ficheiro enviado com sucesso.'},
  it:{title:'Allegati',add:'Aggiungi file',link:'Aggiungi link',voice:'Registra audio',stop:'Ferma',empty:'Nessun allegato.',local:'Salvati su questo dispositivo e inclusi in una copia di backup.',remove:'Rimuovi allegato',tooLarge:'Impossibile ridurre il file a 5 MB. Prova con una versione più piccola.',compressing:'Compressione del file…',failed:'Impossibile salvare l’allegato.',url:'Incolla un indirizzo web',save:'Salva link',cancel:'Annulla',limit:'Ogni nota può contenere fino a 100 allegati.',protected:'La nota è protetta. L’allegato non è stato salvato senza cifratura.',protectedLink:'La nota è protetta. Il link non è stato salvato senza cifratura.',validUrl:'Inserisci un link valido.',longUrl:'Il link è troppo lungo o contiene credenziali.',protocol:'Il link deve iniziare con http:// o https://',removeError:'Impossibile modificare l’allegato. La nota potrebbe essere protetta.',locked:'Allegati chiusi: la nota è protetta o non disponibile.',protecting:'La nota è in fase di protezione. Chiudi l’editor e riaprila con la password.',microphone:'Impossibile accedere al microfono.',recordUnavailable:'La registrazione audio non è disponibile.',progress:'Preparazione',compressingProgress:'Compressione',savingProgress:'Salvataggio su questo dispositivo',complete:'Allegato salvato correttamente.',progressFile:'File',cameraPermission:'Consenti l’accesso a fotocamera e microfono per registrare video.',videoPermission:'Consenti l’accesso al microfono per registrare audio.',cameraDenied:'Permesso per fotocamera o microfono negato. Puoi abilitarlo nelle impostazioni dell’app.',uploading:'Caricamento',uploadComplete:'File caricato correttamente.'},
  ja:{title:'添付ファイル',add:'ファイルを追加',link:'リンクを追加',voice:'音声を録音',stop:'停止',empty:'添付ファイルはありません。',local:'この端末に保存され、バックアップにも含まれます。',remove:'添付ファイルを削除',tooLarge:'5 MB以下に圧縮できませんでした。小さいファイルをお試しください。',compressing:'ファイルを圧縮中…',failed:'添付ファイルを保存できませんでした。',url:'ウェブアドレスを貼り付け',save:'リンクを保存',cancel:'キャンセル',limit:'1つのノートに最大100個の添付ファイルを追加できます。',protected:'このノートは保護されています。添付ファイルは暗号化せずに保存されませんでした。',protectedLink:'このノートは保護されています。リンクは暗号化せずに保存されませんでした。',validUrl:'有効なリンクを入力してください。',longUrl:'リンクが長すぎるか、認証情報が含まれています。',protocol:'リンクは http:// または https:// で始めてください。',removeError:'添付ファイルを変更できません。ノートが保護されている可能性があります。',locked:'添付ファイルは閉じています。ノートが保護されているか、利用できません。',protecting:'ノートを保護しています。エディターを閉じ、パスワードで再度開いてください。',microphone:'マイクにアクセスできませんでした。',recordUnavailable:'音声録音を利用できません。',progress:'準備中',compressingProgress:'圧縮中',savingProgress:'この端末に保存中',complete:'添付ファイルを保存しました。',progressFile:'ファイル',cameraPermission:'動画を撮影するにはカメラとマイクへのアクセスを許可してください。',videoPermission:'音声録音にはマイクへのアクセスを許可してください。',cameraDenied:'カメラまたはマイクの権限が拒否されました。アプリの設定で許可できます。',uploading:'アップロード中',uploadComplete:'ファイルをアップロードしました。'},
  ko:{title:'첨부 파일',add:'파일 추가',link:'링크 추가',voice:'오디오 녹음',stop:'중지',empty:'아직 첨부 파일이 없습니다.',local:'이 기기에 저장되며 백업에도 포함됩니다.',remove:'첨부 파일 삭제',tooLarge:'파일을 5MB 이하로 줄일 수 없습니다. 더 작은 파일을 사용해 보세요.',compressing:'파일 압축 중…',failed:'첨부 파일을 저장하지 못했습니다.',url:'웹 주소 붙여넣기',save:'링크 저장',cancel:'취소',limit:'노트 하나에 최대 100개의 파일을 첨부할 수 있습니다.',protected:'노트가 보호되어 있습니다. 첨부 파일은 암호화되지 않은 상태로 저장되지 않았습니다.',protectedLink:'노트가 보호되어 있습니다. 링크는 암호화되지 않은 상태로 저장되지 않았습니다.',validUrl:'올바른 링크를 입력하세요.',longUrl:'링크가 너무 길거나 인증 정보가 포함되어 있습니다.',protocol:'링크는 http:// 또는 https://로 시작해야 합니다.',removeError:'첨부 파일을 변경하지 못했습니다. 노트가 보호된 상태일 수 있습니다.',locked:'첨부 파일이 닫혔습니다. 노트가 보호되어 있거나 사용할 수 없습니다.',protecting:'노트를 보호하는 중입니다. 편집기를 닫고 비밀번호로 다시 여세요.',microphone:'마이크에 접근할 수 없습니다.',recordUnavailable:'오디오 녹음을 사용할 수 없습니다.',progress:'준비 중',compressingProgress:'압축 중',savingProgress:'이 기기에 저장 중',complete:'첨부 파일이 저장되었습니다.',progressFile:'파일',cameraPermission:'동영상을 녹화하려면 카메라와 마이크 접근을 허용해 주세요.',videoPermission:'오디오를 녹음하려면 마이크 접근을 허용해 주세요.',cameraDenied:'카메라 또는 마이크 권한이 거부되었습니다. 앱 설정에서 허용할 수 있습니다.',uploading:'업로드 중',uploadComplete:'파일이 업로드되었습니다.'}
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
const mediaLimitMessages={es:'No se pudo comprimir el audio o vídeo dentro del límite de 6 MB.',en:'Could not compress the audio or video within the 6 MB limit.',de:'Audio oder Video konnten nicht auf höchstens 6 MB komprimiert werden.',fr:'Impossible de compresser l’audio ou la vidéo sous la limite de 6 Mo.',pt:'Não foi possível comprimir o áudio ou vídeo dentro do limite de 6 MB.',it:'Impossibile comprimere audio o video entro il limite di 6 MB.',ja:'音声または動画を6 MB以内に圧縮できませんでした。',ko:'오디오 또는 동영상을 6MB 한도 내로 압축하지 못했습니다.'};
const cameraCopy={
  es:{open:'Cámara',photo:'Hacer foto',record:'Grabar vídeo',stop:'Detener y guardar',close:'Cerrar cámara',photoInfo:'Foto WebP · hasta 128 KB',videoInfo:'Vídeo 640×480 · 15 fps · máximo 5 min · hasta 6 MB',permission:'Permite el acceso a la cámara para continuar.',unavailable:'La cámara no está disponible en este navegador.',unsupported:'Este navegador no puede grabar vídeo con el tamaño reducido.',limit:'La grabación se detuvo cerca de 6 MB para respetar el límite.',recording:'Grabando',audioUnavailable:'Se grabará vídeo sin audio.',photoFailed:'No se pudo crear una foto de 128 KB. Prueba con más luz o acércate al sujeto.'},
  en:{open:'Camera',photo:'Take photo',record:'Record video',stop:'Stop and save',close:'Close camera',photoInfo:'WebP photo · up to 128 KB',videoInfo:'640×480 video · 15 fps · max 5 min · up to 6 MB',permission:'Allow camera access to continue.',unavailable:'The camera is unavailable in this browser.',unsupported:'This browser cannot record reduced-size video.',limit:'Recording stopped near 6 MB to respect the size limit.',recording:'Recording',audioUnavailable:'Video will be recorded without audio.',photoFailed:'Could not make a 128 KB photo. Try more light or move closer.'},
  de:{open:'Kamera',photo:'Foto aufnehmen',record:'Video aufnehmen',stop:'Stoppen und speichern',close:'Kamera schließen',photoInfo:'WebP-Foto · bis 128 KB',videoInfo:'Video 640×480 · 15 fps · max. 5 Min. · bis 6 MB',permission:'Erlaube den Kamerazugriff, um fortzufahren.',unavailable:'Die Kamera ist in diesem Browser nicht verfügbar.',unsupported:'Dieser Browser kann kein verkleinertes Video aufnehmen.',limit:'Die Aufnahme wurde nahe 6 MB gestoppt, um das Limit einzuhalten.',recording:'Aufnahme',audioUnavailable:'Das Video wird ohne Ton aufgenommen.',photoFailed:'Ein Foto mit 128 KB war nicht möglich. Bitte mehr Licht oder näher herangehen.'},
  fr:{open:'Caméra',photo:'Prendre une photo',record:'Filmer',stop:'Arrêter et enregistrer',close:'Fermer la caméra',photoInfo:'Photo WebP · jusqu’à 128 Ko',videoInfo:'Vidéo 640×480 · 15 ips · 5 min max. · jusqu’à 6 Mo',permission:'Autorisez l’accès à la caméra pour continuer.',unavailable:'La caméra est indisponible dans ce navigateur.',unsupported:'Ce navigateur ne peut pas enregistrer une vidéo réduite.',limit:'L’enregistrement s’est arrêté vers 6 Mo pour respecter la limite.',recording:'Enregistrement',audioUnavailable:'La vidéo sera enregistrée sans son.',photoFailed:'Impossible de créer une photo de 128 Ko. Essayez avec plus de lumière ou rapprochez-vous.'},
  pt:{open:'Câmara',photo:'Tirar fotografia',record:'Gravar vídeo',stop:'Parar e guardar',close:'Fechar câmara',photoInfo:'Fotografia WebP · até 128 KB',videoInfo:'Vídeo 640×480 · 15 fps · máximo 5 min · até 6 MB',permission:'Permita o acesso à câmara para continuar.',unavailable:'A câmara não está disponível neste navegador.',unsupported:'Este navegador não consegue gravar vídeo reduzido.',limit:'A gravação parou perto dos 6 MB para respeitar o limite.',recording:'A gravar',audioUnavailable:'O vídeo será gravado sem áudio.',photoFailed:'Não foi possível criar uma fotografia de 128 KB. Tente mais luz ou aproxime-se.'},
  it:{open:'Fotocamera',photo:'Scatta foto',record:'Registra video',stop:'Ferma e salva',close:'Chiudi fotocamera',photoInfo:'Foto WebP · fino a 128 KB',videoInfo:'Video 640×480 · 15 fps · max 5 min · fino a 6 MB',permission:'Consenti l’accesso alla fotocamera per continuare.',unavailable:'Fotocamera non disponibile in questo browser.',unsupported:'Questo browser non può registrare video a dimensioni ridotte.',limit:'Registrazione interrotta vicino a 6 MB per rispettare il limite.',recording:'Registrazione',audioUnavailable:'Il video verrà registrato senza audio.',photoFailed:'Impossibile creare una foto da 128 KB. Prova con più luce o avvicinati.'},
  ja:{open:'カメラ',photo:'写真を撮る',record:'動画を撮影',stop:'停止して保存',close:'カメラを閉じる',photoInfo:'WebP写真 · 最大128 KB',videoInfo:'640×480 · 15 fps · 最大5分 · 最大6 MB',permission:'続行するにはカメラへのアクセスを許可してください。',unavailable:'このブラウザーではカメラを利用できません。',unsupported:'このブラウザーでは小容量の動画を録画できません。',limit:'サイズ制限を守るため、約6 MBで録画を停止しました。',recording:'録画中',audioUnavailable:'音声なしで動画を録画します。',photoFailed:'128 KBの写真を作成できませんでした。明るくするか、被写体に近づいてください。'},
  ko:{open:'카메라',photo:'사진 찍기',record:'동영상 녹화',stop:'중지하고 저장',close:'카메라 닫기',photoInfo:'WebP 사진 · 최대 128KB',videoInfo:'640×480 동영상 · 15fps · 최대 5분 · 최대 6MB',permission:'계속하려면 카메라 접근을 허용해 주세요.',unavailable:'이 브라우저에서 카메라를 사용할 수 없습니다.',unsupported:'이 브라우저는 작은 용량의 동영상을 녹화할 수 없습니다.',limit:'용량 제한을 지키기 위해 약 6MB에서 녹화를 중지했습니다.',recording:'녹화 중',audioUnavailable:'소리 없이 동영상을 녹화합니다.',photoFailed:'128KB 사진을 만들지 못했습니다. 더 밝은 곳에서 찍거나 가까이 이동해 주세요.'}
};
const shareLabels={
  es:{shareNote:'Compartir nota',shareApp:'Otras apps',whatsapp:'WhatsApp',noteTitle:'Nota de PostisPop',emptyNote:'Esta nota no tiene texto para compartir.',shareOpened:'Se abrió el menú para compartir.',shareCopied:'Texto copiado. Pégalo en la aplicación que quieras.',shareSaved:'Archivo descargado; puedes adjuntarlo en WhatsApp u otra aplicación.',shareFailed:'No se pudo compartir este elemento.',shareProtected:'Esta nota está protegida. Compártela con su enlace cifrado en las opciones de contraseña.',attachmentShare:'Compartir archivo'},
  en:{shareNote:'Share note',shareApp:'Other apps',whatsapp:'WhatsApp',noteTitle:'PostisPop note',emptyNote:'This note has no text to share.',shareOpened:'The share sheet opened.',shareCopied:'Text copied. Paste it into the app you want.',shareSaved:'File downloaded; attach it in WhatsApp or another app.',shareFailed:'Could not share this item.',shareProtected:'This note is protected. Share it using its encrypted link in the password options.',attachmentShare:'Share file'},
  de:{shareNote:'Notiz teilen',shareApp:'Andere Apps',whatsapp:'WhatsApp',noteTitle:'PostisPop-Notiz',emptyNote:'Diese Notiz enthält keinen teilbaren Text.',shareOpened:'Das Teilen-Menü ist geöffnet.',shareCopied:'Text kopiert. Füge ihn in der gewünschten App ein.',shareSaved:'Datei heruntergeladen; du kannst sie in WhatsApp oder einer anderen App anhängen.',shareFailed:'Dieses Element konnte nicht geteilt werden.',shareProtected:'Diese Notiz ist geschützt. Teile sie über den verschlüsselten Link in den Passwortoptionen.',attachmentShare:'Datei teilen'},
  fr:{shareNote:'Partager la note',shareApp:'Autres applications',whatsapp:'WhatsApp',noteTitle:'Note PostisPop',emptyNote:'Cette note ne contient aucun texte à partager.',shareOpened:'Le menu de partage est ouvert.',shareCopied:'Texte copié. Collez-le dans l’application de votre choix.',shareSaved:'Fichier téléchargé ; vous pouvez le joindre dans WhatsApp ou une autre application.',shareFailed:'Impossible de partager cet élément.',shareProtected:'Cette note est protégée. Partagez-la avec son lien chiffré dans les options de mot de passe.',attachmentShare:'Partager le fichier'},
  pt:{shareNote:'Partilhar nota',shareApp:'Outras aplicações',whatsapp:'WhatsApp',noteTitle:'Nota PostisPop',emptyNote:'Esta nota não tem texto para partilhar.',shareOpened:'O menu de partilha abriu.',shareCopied:'Texto copiado. Cole-o na aplicação que preferir.',shareSaved:'Ficheiro transferido; pode anexá-lo no WhatsApp ou noutra aplicação.',shareFailed:'Não foi possível partilhar este elemento.',shareProtected:'Esta nota está protegida. Partilhe-a através da ligação encriptada nas opções da palavra-passe.',attachmentShare:'Partilhar ficheiro'},
  it:{shareNote:'Condividi nota',shareApp:'Altre app',whatsapp:'WhatsApp',noteTitle:'Nota PostisPop',emptyNote:'Questa nota non contiene testo da condividere.',shareOpened:'Il menu di condivisione è aperto.',shareCopied:'Testo copiato. Incollalo nell’app che preferisci.',shareSaved:'File scaricato; puoi allegarlo da WhatsApp o da un’altra app.',shareFailed:'Impossibile condividere questo elemento.',shareProtected:'Questa nota è protetta. Condividila con il link cifrato nelle opzioni della password.',attachmentShare:'Condividi file'},
  ja:{shareNote:'メモを共有',shareApp:'他のアプリ',whatsapp:'WhatsApp',noteTitle:'PostisPopのメモ',emptyNote:'共有できるテキストがありません。',shareOpened:'共有メニューが開きました。',shareCopied:'テキストをコピーしました。お好きなアプリに貼り付けてください。',shareSaved:'ファイルをダウンロードしました。WhatsAppなどで添付できます。',shareFailed:'この項目を共有できませんでした。',shareProtected:'このメモは保護されています。パスワード設定の暗号化リンクから共有してください。',attachmentShare:'ファイルを共有'},
  ko:{shareNote:'메모 공유',shareApp:'다른 앱',whatsapp:'WhatsApp',noteTitle:'PostisPop 메모',emptyNote:'공유할 텍스트가 없습니다.',shareOpened:'공유 메뉴가 열렸습니다.',shareCopied:'텍스트를 복사했습니다. 원하는 앱에 붙여넣으세요.',shareSaved:'파일을 다운로드했습니다. WhatsApp 등에서 첨부할 수 있습니다.',shareFailed:'이 항목을 공유하지 못했습니다.',shareProtected:'이 메모는 보호되어 있습니다. 비밀번호 옵션에서 암호화 링크로 공유하세요.',attachmentShare:'파일 공유'}
};
let currentLanguage=readBoardLanguage();
let labels={...(translations[currentLanguage]||translations.es),...(notices[currentLanguage]||notices.es),...(cameraCopy[currentLanguage]||cameraCopy.es),...(shareLabels[currentLanguage]||shareLabels.es),mediaTooLarge:mediaLimitMessages[currentLanguage]||mediaLimitMessages.es,addVideo:addVideoLabels[currentLanguage]||addVideoLabels.es};

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

async function encodeCameraPhoto(sourceCanvas){
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return null;
  let scale=Math.min(1,1600/Math.max(sourceCanvas.width,sourceCanvas.height));
  for(let pass=0;pass<9;pass++){
    canvas.width=Math.max(1,Math.round(sourceCanvas.width*scale));canvas.height=Math.max(1,Math.round(sourceCanvas.height*scale));
    context.drawImage(sourceCanvas,0,0,canvas.width,canvas.height);
    for(const quality of [.82,.72,.62,.52,.42,.32]){
      let blob=await toBlob(canvas,'image/webp',quality);
      if(blob.type!=='image/webp')blob=await toBlob(canvas,'image/jpeg',quality);
      if(blob.size<=CAMERA_PHOTO_BYTES)return blob;
    }
    scale*=.82;
  }
  return null;
}

async function compressImage(file,onProgress=()=>{}){
  if(!window.createImageBitmap)return null;
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  try{
    const canvas=document.createElement('canvas');let scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
    const attempts=7*5;let attempt=0;
    for(let dimensionPass=0;dimensionPass<7;dimensionPass++){
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext('2d',{alpha:true});if(!context)return null;
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.9,.84,.78,.72,.66]){
        const blob=await toBlob(canvas,'image/webp',quality);
        onProgress(++attempt/attempts);
        if(blob.size<=MAX_FILE_BYTES)return {file:fileFromBlob(blob,replaceExtension(file.name,'webp'),'image/webp'),compression:'image-webp'};
      }
      scale*=.82;
    }
    return null;
  }finally{bitmap.close?.();}
}

async function compressAudio(file,onProgress=()=>{}){
  const AudioContextType=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextType||!window.MediaRecorder)return null;
  const context=new AudioContextType();
  try{
    const buffer=await context.decodeAudioData(await file.arrayBuffer());
    const destination=context.createMediaStreamDestination(),source=context.createBufferSource();source.buffer=buffer;source.connect(destination);
    const mime=['audio/webm;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    const targetBits=Math.min(128000,Math.max(32000,Math.floor(MAX_MEDIA_BYTES*8*.9/buffer.duration)));
    const recorder=new MediaRecorder(destination.stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:targetBits});
    const chunks=[];
    const result=new Promise((resolve,reject)=>{
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>reject(new Error('AUDIO_COMPRESS_FAILED'));
      recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});resolve(blob);};
    });
    await context.resume();recorder.start();const startedAt=context.currentTime;source.start();
    await new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(recorder.state==='recording')recorder.requestData();onProgress(Math.min(.98,(context.currentTime-startedAt)/buffer.duration));},1000);source.onended=()=>{clearInterval(timer);onProgress(1);resolve();};source.onerror=()=>{clearInterval(timer);reject(new Error('AUDIO_COMPRESS_FAILED'));};});
    if(recorder.state!=='inactive')recorder.stop();
    const blob=await result;
    if(blob.size>MAX_MEDIA_BYTES)return null;
    const ext=blob.type.includes('mp4')?'m4a':'webm';
    return {file:fileFromBlob(blob,replaceExtension(file.name,ext),blob.type),compression:'audio-transcode'};
  }finally{await context.close().catch(()=>{});}
}

async function compressVideo(file,onProgress=()=>{}){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return null;
  const mediaUrl=URL.createObjectURL(file),video=document.createElement('video'),canvas=document.createElement('canvas');
  video.preload='auto';video.playsInline=true;video.src=mediaUrl;
  let audioContext=null,source=null;
  try{
    await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('VIDEO_DECODE_FAILED'));});
    if(!Number.isFinite(video.duration)||video.duration<=0){
      await new Promise((resolve,reject)=>{
        const finish=()=>{if(Number.isFinite(video.duration)&&video.duration>0){clearTimeout(timer);video.removeEventListener('durationchange',finish);video.removeEventListener('seeked',finish);video.currentTime=0;resolve();}};
        const timer=setTimeout(()=>reject(new Error('VIDEO_DURATION_UNKNOWN')),2500);
        video.addEventListener('durationchange',finish);video.addEventListener('seeked',finish);
        try{video.currentTime=Number.MAX_SAFE_INTEGER;}catch(error){clearTimeout(timer);reject(error);}
      });
    }
    if(!Number.isFinite(video.duration)||video.duration<=0)return null;
    const budgetBits=Math.min(CAMERA_VIDEO_BITRATE,Math.floor(MAX_MEDIA_BYTES*8*.9/video.duration)),audioBits=Math.min(32000,Math.floor(budgetBits*.18));
    const videoBits=budgetBits-audioBits;
    if(videoBits<24000)return null;
    canvas.width=640;canvas.height=480;
    const context=canvas.getContext('2d');if(!context)return null;
    const ratio=Math.min(canvas.width/video.videoWidth,canvas.height/video.videoHeight),frameWidth=video.videoWidth*ratio,frameHeight=video.videoHeight*ratio,frameX=(canvas.width-frameWidth)/2,frameY=(canvas.height-frameHeight)/2;
    const drawFrame=()=>{context.fillStyle='#000';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(video,frameX,frameY,frameWidth,frameHeight);};
    const videoStream=canvas.captureStream(15),tracks=[...videoStream.getVideoTracks()];
    const AudioContextType=window.AudioContext||window.webkitAudioContext;
    if(AudioContextType){
      try{audioContext=new AudioContextType();await audioContext.resume();source=audioContext.createMediaElementSource(video);const destination=audioContext.createMediaStreamDestination();source.connect(destination);tracks.push(...destination.stream.getAudioTracks());}catch{}
    }
    const stream=new MediaStream(tracks);
    const mime=['video/webm;codecs=av01.0.08M.08,opus','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4;codecs=av01.0.08M.08,mp4a.40.2','video/mp4;codecs=h264,aac','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    if(!mime)return null;
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:videoBits,audioBitsPerSecond:audioBits});
    const chunks=[],result=new Promise((resolve,reject)=>{
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);onProgress(Math.min(.98,video.currentTime/video.duration));};
      recorder.onerror=()=>reject(new Error('VIDEO_ENCODE_FAILED'));
      recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||mime}));
    });
    let frame=0;
    const draw=()=>{if(video.paused||video.ended)return;drawFrame();frame=requestAnimationFrame(draw);};
    const ended=new Promise((resolve,reject)=>{video.onended=resolve;video.onerror=()=>reject(new Error('VIDEO_DECODE_FAILED'));});
    await video.play();drawFrame();recorder.start(1000);draw();await ended;
    cancelAnimationFrame(frame);if(recorder.state!=='inactive')recorder.stop();
    const blob=await result;onProgress(1);
    if(blob.size>MAX_MEDIA_BYTES)return null;
    const ext=blob.type.includes('mp4')?'mp4':'webm';
    return {file:fileFromBlob(blob,replaceExtension(file.name,ext),blob.type),compression:'video-transcode'};
  }finally{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(mediaUrl);if(source)try{source.disconnect();}catch{}if(audioContext)await audioContext.close().catch(()=>{});}
}

async function compressGeneric(file,maxBytes=MAX_FILE_BYTES){
  if(!window.CompressionStream)return null;
  try{
    let total=0;
    const cap=new TransformStream({transform(chunk,controller){total+=chunk.byteLength;if(total>maxBytes)throw new Error('TOO_LARGE');controller.enqueue(chunk);}});
    const stream=file.stream().pipeThrough(new CompressionStream('gzip')).pipeThrough(cap);
    const blob=await new Response(stream).blob();
    if(blob.size>=file.size||blob.size>maxBytes)return null;
    return {file:fileFromBlob(blob,`${file.name}.gz`,'application/gzip'),compression:'gzip'};
  }catch{return null;}
}

async function prepareFile(file,onProgress=()=>{}){
  const maxBytes=/^(audio|video)\//.test(file.type)?MAX_MEDIA_BYTES:MAX_FILE_BYTES;
  onProgress(0);
  try{
    let result=null;
    if(file.type.startsWith('image/'))result=await compressImage(file,onProgress);
    else if(file.type.startsWith('audio/'))result=await compressAudio(file,onProgress);
    else if(file.type.startsWith('video/'))result=await compressVideo(file,onProgress);
    if(result&&result.file.size<=maxBytes&&(result.file.size<file.size||result.compression==='video-transcode')){onProgress(1);return result;}
    onProgress(.8);
    if(file.type.startsWith('video/'))return null;
    const generic=await compressGeneric(file,maxBytes);
    if(generic&&generic.file.size<file.size){onProgress(1);return generic;}
    onProgress(1);return file.type.startsWith('video/')?null:(file.size<=maxBytes?{file,compression:''}:null);
  }catch{onProgress(1);return file.type.startsWith('video/')?null:(file.size<=maxBytes?{file,compression:''}:null);}
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

function isLocallyProtected(noteId){try{return localStorage.getItem(protectedMarker(noteId))==='1';}catch{return true;}}
function noteText(){
  if(isLocallyProtected(activeNoteId))return null;
  const editor=document.querySelector('.editor-dialog'),field=editor?.querySelector('textarea,[contenteditable="true"]');
  return String(field?.value??field?.innerText??'').trim();
}
async function shareNoteWithApps(){await showCompleteNoteShare(activeNoteId);}
async function shareNoteOnWhatsApp(){await showCompleteNoteShare(activeNoteId);}
function downloadSharedFile(file){
  const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function shareAttachment(item){
  if(isLocallyProtected(activeNoteId)){notify(labels.shareProtected);return;}
  try{
    if(item.kind==='link'){
      const result=await shareText(`${item.name}\n${item.url}`,{title:labels.attachmentShare});
      if(result==='unsupported')openWhatsApp(`${item.name}\n${item.url}`);
      else notify(result==='shared'?labels.shareOpened:labels.shareCopied);
      return;
    }
    let blob=item.blob;
    if(item.compression==='gzip'){
      if(!window.DecompressionStream)throw Error('DECOMPRESSION_UNAVAILABLE');
      blob=await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
    }
    const file=new File([blob],item.name,{type:item.originalType||item.type||'application/octet-stream'});
    const result=await shareFile(file,{title:item.name,text:labels.attachmentShare});
    if(result==='unsupported'){downloadSharedFile(file);notify(labels.shareSaved);}
    else if(result==='shared')notify(labels.shareOpened);
  }catch(error){if(error?.name!=='AbortError')notify(labels.shareFailed);}
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

function progressStatus(phase,percent,fileName=''){
  const toast=document.querySelector('.pp-attachment-toast');if(!toast)return;
  const clamped=Math.max(0,Math.min(100,Math.round(percent)));
  const label=phase==='compress'?labels.compressingProgress:phase==='save'?labels.savingProgress:labels.progress;
  toast.replaceChildren();
  const text=document.createElement('span');text.className='pp-progress-label';text.textContent=`${fileName?`${labels.progressFile} ${fileName} · `:''}${label} ${clamped}%`;
  const progress=document.createElement('progress');progress.className='pp-progress-bar';progress.max=100;progress.value=clamped;progress.setAttribute('aria-label',label);progress.setAttribute('aria-valuetext',`${clamped}%`);
  toast.append(text,progress);toast.classList.add('is-visible');clearTimeout(notify.timer);
}

async function saveFiles(files, noteId=activeNoteId,{alreadyCompressed=false}={}) {
  if (!noteId) return;
  const ready=[],failures=[];
  const accepted=files.filter(supported),totalBytes=accepted.reduce((sum,file)=>sum+file.size,0)||1;let processedBytes=0;
  for(const source of accepted){
    if(!supported(source))continue;
    progressStatus('prepare',processedBytes/totalBytes*100,source.name);
    const prepared=alreadyCompressed?{file:source,compression:'recorded-video'}:await prepareFile(source,ratio=>progressStatus('compress',(processedBytes+source.size*ratio)/totalBytes*100,source.name));
    processedBytes+=source.size;
    const maxBytes=/^(audio|video)\//.test(source.type)?MAX_MEDIA_BYTES:MAX_FILE_BYTES;
    if(!prepared||prepared.file.size>maxBytes){failures.push(`${source.name}: ${maxBytes===MAX_MEDIA_BYTES?labels.mediaTooLarge:labels.tooLarge}`);continue;}
    ready.push({source,...prepared});
    progressStatus(alreadyCompressed?'prepare':'compress',processedBytes/totalBytes*100,source.name);
  }
  let storedBytes=0;const saveTotal=ready.reduce((sum,item)=>sum+item.file.size,0)||1;
  try { await withNoteStorageLock(noteId, async()=>{
    await assertAttachmentWritable(noteId);
    let count=(await listForNote(noteId)).length;
    for (const {source,file,compression} of ready) {
      if(count>=MAX_ATTACHMENTS){failures.push(labels.limit);break;}
      progressStatus('save',storedBytes/saveTotal*100,source.name);
      const id=crypto.randomUUID(),item={key:`${noteId}::${id}`,id,noteId,kind:'file',name:compression==='gzip'?source.name:(file.name||`audio-${Date.now()}.webm`),type:compression==='gzip'?(source.type||'application/octet-stream'):(file.type||'application/octet-stream'),...(compression==='gzip'?{originalType:source.type||'application/octet-stream'}:{}),size:file.size,originalSize:source.size,compression,created:Date.now(),blob:file};
      await transaction('readwrite',store=>store.put(item));count++;storedBytes+=file.size;progressStatus('save',storedBytes/saveTotal*100,source.name);
    }
  }); } catch(error) { notify(error.message==='NOTE_PROTECTED'?labels.protected:labels.failed);return; }
  if(activeNoteId===noteId)await renderList();
  if(failures.length)notify(failures.join(' · '),0);
  else if(ready.length)notify(labels.complete);
  else dismissNotify();
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
    const share=document.createElement('button');share.type='button';share.className='pp-attachment-share';share.setAttribute('aria-label',labels.attachmentShare);share.title=labels.attachmentShare;share.textContent='↗';share.addEventListener('click',()=>shareAttachment(item));
    row.append(badge, details, share, remove); card.append(row); list.append(card);
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
  } catch(error) { notify(error?.name==='NotAllowedError'||error?.name==='PermissionDeniedError'?labels.cameraDenied:labels.microphone); }
}

function cameraStatus(text=''){
  const status=cameraPanel?.querySelector('.pp-camera-status');if(status)status.textContent=text;
}

function releaseCamera(){
  clearInterval(cameraTimer);cameraTimer=null;clearInterval(cameraFrame);cameraFrame=0;
  cameraRecordStream?.getTracks().forEach(track=>track.stop());cameraRecordStream=null;
  cameraStream?.getTracks().forEach(track=>track.stop());cameraStream=null;
  const preview=cameraPanel?.querySelector('.pp-camera-preview');if(preview){preview.pause();preview.srcObject=null;}
  const consolePanel=cameraPanel?.querySelector('.pp-camera-console');if(consolePanel)consolePanel.hidden=true;
  cameraPanel=null;cameraNoteId='';cameraCloseAfterStop=false;
}

function closeCamera(){
  if(cameraRecorder?.state==='recording'){cameraCloseAfterStop=true;cameraRecorder.stop();return;}
  releaseCamera();
}

async function openCamera(panel){
  if(!navigator.mediaDevices?.getUserMedia){notify(labels.unavailable);return;}
  const noteId=activeNoteId;try{await assertAttachmentWritable(noteId);}catch{notify(labels.locked);return;}
  try{
    cameraPanel=panel;cameraNoteId=noteId;
    try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:15}},audio:{echoCancellation:true,noiseSuppression:true}});}
    catch{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:15}},audio:false});cameraStatus(labels.audioUnavailable);}
    const consolePanel=panel.querySelector('.pp-camera-console'),preview=panel.querySelector('.pp-camera-preview');
    consolePanel.hidden=false;preview.srcObject=cameraStream;await new Promise(resolve=>{if(preview.readyState>=1)resolve();else preview.onloadedmetadata=resolve;});
    await preview.play();
    panel.querySelector('.pp-camera-open').hidden=true;
    panel.querySelector('.pp-camera-photo').disabled=false;
    panel.querySelector('.pp-camera-record').disabled=false;
    if(cameraStream.getAudioTracks().length)cameraStatus(labels.videoInfo);else cameraStatus(`${labels.videoInfo} · ${labels.audioUnavailable}`);
  }catch(error){notify(error?.name==='NotAllowedError'||error?.name==='PermissionDeniedError'?labels.cameraDenied:labels.unavailable);releaseCamera();}
}

async function takeCameraPhoto(panel){
  const preview=panel.querySelector('.pp-camera-preview');if(!preview.videoWidth||!preview.videoHeight){notify(labels.unavailable);return;}
  try{
    await assertAttachmentWritable(cameraNoteId);
    const source=document.createElement('canvas'),scale=Math.min(1,1920/Math.max(preview.videoWidth,preview.videoHeight));
    source.width=Math.max(1,Math.round(preview.videoWidth*scale));source.height=Math.max(1,Math.round(preview.videoHeight*scale));
    const context=source.getContext('2d');if(!context)throw new Error('CAMERA_CANVAS_FAILED');
    context.drawImage(preview,0,0,source.width,source.height);
    const blob=await encodeCameraPhoto(source);if(!blob)throw new Error('CAMERA_PHOTO_LIMIT');
    const ext=blob.type==='image/webp'?'webp':'jpg',stamp=new Date().toISOString().replace(/[:.]/g,'-');
    await saveFiles([fileFromBlob(blob,`PostisPop-foto-${stamp}.${ext}`,blob.type)],cameraNoteId);
    cameraStatus(`${labels.photoInfo} · ${humanSize(blob.size)}`);
  }catch{notify(labels.photoFailed);}
}

function startCameraRecording(panel){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){notify(labels.unsupported);return;}
  const preview=panel.querySelector('.pp-camera-preview');if(!preview.videoWidth||!preview.videoHeight){notify(labels.unavailable);return;}
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;
  const context=canvas.getContext('2d');if(!context){notify(labels.unsupported);return;}
  const videoOnly=canvas.captureStream(15),tracks=[...videoOnly.getVideoTracks(),...cameraStream.getAudioTracks()];
  cameraRecordStream=new MediaStream(tracks);
  const type=['video/webm;codecs=av01.0.08M.08,opus','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4;codecs=av01.0.08M.08,mp4a.40.2','video/mp4;codecs=h264,aac','video/mp4'].find(mime=>MediaRecorder.isTypeSupported(mime));
  try{cameraRecorder=new MediaRecorder(cameraRecordStream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:120000,audioBitsPerSecond:24000,bitsPerSecond:CAMERA_VIDEO_BITRATE});}
  catch{cameraRecordStream.getTracks().forEach(track=>track.stop());cameraRecordStream=null;notify(labels.unsupported);return;}
  cameraChunks=[];cameraRecordBytes=0;cameraRecordStarted=Date.now();cameraStopAtLimit=false;cameraCloseAfterStop=false;
  const recordButton=panel.querySelector('.pp-camera-record'),stopButton=panel.querySelector('.pp-camera-stop');
  recordButton.hidden=true;stopButton.hidden=false;panel.querySelector('.pp-camera-photo').disabled=true;
  const draw=()=>{if(cameraRecorder?.state!=='recording')return;context.fillStyle='#000';context.fillRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/preview.videoWidth,canvas.height/preview.videoHeight),width=preview.videoWidth*scale,height=preview.videoHeight*scale;context.drawImage(preview,(canvas.width-width)/2,(canvas.height-height)/2,width,height);};draw();cameraFrame=setInterval(draw,1000/15);
  cameraRecorder.ondataavailable=event=>{
    if(!event.data.size)return;cameraRecordBytes+=event.data.size;cameraChunks.push(event.data);
    if(cameraRecordBytes>=CAMERA_VIDEO_STOP_BYTES){cameraStopAtLimit=true;cameraStatus(labels.limit);cameraRecorder?.stop();}
  };
  cameraRecorder.onerror=()=>{cameraStatus(labels.unsupported);};
  cameraRecorder.onstop=async()=>{
    clearInterval(cameraTimer);cameraTimer=null;clearInterval(cameraFrame);cameraFrame=0;
    const type=cameraRecorder?.mimeType||cameraChunks[0]?.type||'video/webm';
    const blob=new Blob(cameraChunks,{type});cameraRecorder=null;
    cameraRecordStream?.getTracks().forEach(track=>track.stop());cameraRecordStream=null;
    const closeWhenSaved=cameraCloseAfterStop,wasStoppedForLimit=cameraStopAtLimit;
    cameraChunks=[];
    if(blob.size&&blob.size<=CAMERA_VIDEO_BYTES){
      const ext=type.includes('mp4')?'mp4':'webm',stamp=new Date().toISOString().replace(/[:.]/g,'-');
      await saveFiles([fileFromBlob(blob,`PostisPop-video-${stamp}.${ext}`,type)],cameraNoteId,{alreadyCompressed:true});
      if(wasStoppedForLimit)notify(labels.limit);
    }else notify(labels.tooLarge);
    recordButton.hidden=false;stopButton.hidden=true;panel.querySelector('.pp-camera-photo').disabled=false;
    if(closeWhenSaved)releaseCamera();else cameraStatus(labels.videoInfo);
  };
  cameraRecorder.start(1000);
  cameraTimer=setInterval(()=>{
    const elapsed=Date.now()-cameraRecordStarted,seconds=Math.min(300,Math.floor(elapsed/1000));
    const time=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    cameraStatus(`${labels.recording} ${time} / 05:00 · ${humanSize(cameraRecordBytes)}`);
    if(elapsed>=CAMERA_VIDEO_DURATION_MS&&cameraRecorder?.state==='recording')cameraRecorder.stop();
  },500);
}

function createPanel() {
  const panel = document.createElement('section'); panel.className = 'pp-attachments'; panel.setAttribute('aria-label', labels.title);
  panel.innerHTML = `
    <div class="pp-attachments-heading"><div><strong>${labels.title}</strong><small>${labels.local}</small></div></div>
    <div class="pp-attachment-actions">
      <label class="pp-attachment-action pp-file-action">📎 <span>${labels.add}</span><input type="file" multiple></label>
      <label class="pp-attachment-action pp-video-action">🎬 <span>${labels.addVideo}</span><input type="file" accept="video/*" multiple></label>
      <button type="button" class="pp-attachment-action pp-camera-open">📷 <span>${labels.open}</span></button>
      <button type="button" class="pp-attachment-action pp-voice-action">🎙️ <span>${labels.voice}</span></button>
      <button type="button" class="pp-attachment-action pp-note-share">↗ <span>${labels.shareNote}</span></button>
      <button type="button" class="pp-attachment-action pp-note-whatsapp">💬 <span>${labels.whatsapp}</span></button>
      <button type="button" class="pp-attachment-action pp-link-action">🔗 <span>${labels.link}</span></button>
    </div>
    <div class="pp-camera-console" hidden>
      <video class="pp-camera-preview" autoplay playsinline muted aria-label="${labels.open}"></video>
      <div class="pp-camera-info"><small>${labels.photoInfo}</small><small>${labels.videoInfo}</small></div>
      <div class="pp-camera-controls">
        <button type="button" class="pp-attachment-action pp-camera-photo">📸 <span>${labels.photo}</span></button>
        <button type="button" class="pp-attachment-action pp-camera-record">⏺ <span>${labels.record}</span></button>
        <button type="button" class="pp-attachment-action pp-camera-stop" hidden>⏹ <span>${labels.stop}</span></button>
        <button type="button" class="pp-attachment-action pp-camera-close">✕ <span>${labels.close}</span></button>
      </div>
      <small class="pp-camera-status" role="status">${labels.cameraPermission}</small>
    </div>
    <form class="pp-link-form" hidden><input type="url" inputmode="url" placeholder="${labels.url}" aria-label="${labels.url}"><button type="submit">${labels.save}</button><button type="button" class="pp-link-cancel">${labels.cancel}</button></form>
    <div class="pp-attachments-list" aria-live="polite"></div>`;
  panel.querySelector('input[type=file]').addEventListener('change', async event => {
    const input=event.currentTarget,noteId=activeNoteId;await saveFiles([...input.files],noteId); input.value='';
  });
  panel.querySelector('.pp-video-action input').addEventListener('change',async event=>{
    const input=event.currentTarget,noteId=activeNoteId;await saveFiles([...input.files],noteId);input.value='';
  });
  panel.querySelector('.pp-camera-open').addEventListener('click',()=>openCamera(panel));
  panel.querySelector('.pp-note-share').addEventListener('click',shareNoteWithApps);
  panel.querySelector('.pp-note-whatsapp').addEventListener('click',shareNoteOnWhatsApp);
  panel.querySelector('.pp-camera-photo').addEventListener('click',()=>takeCameraPhoto(panel));
  panel.querySelector('.pp-camera-record').addEventListener('click',()=>startCameraRecording(panel));
  panel.querySelector('.pp-camera-stop').addEventListener('click',()=>{if(cameraRecorder?.state==='recording')cameraRecorder.stop();});
  panel.querySelector('.pp-camera-close').addEventListener('click',closeCamera);
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
  installEditorShareButton(dialog,activeNoteId);
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

const observer = new MutationObserver(() => {if(cameraPanel&&!cameraPanel.isConnected)closeCamera();enhanceEditor();});
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceEditor();

function refreshAttachmentLanguage(){
  const language=readBoardLanguage();if(language===currentLanguage)return;
  closeCamera();currentLanguage=language;labels={...(translations[language]||translations.es),...(notices[language]||notices.es),...(cameraCopy[language]||cameraCopy.es),...(shareLabels[language]||shareLabels.es),mediaTooLarge:mediaLimitMessages[language]||mediaLimitMessages.es,addVideo:addVideoLabels[language]||addVideoLabels.es};
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
