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

const instructionsCopy={"es":["Tus notas son privadas. Sin registrarte, lo que escribes se guarda automáticamente en este navegador y dispositivo: otras personas no pueden verlo. No hace falta pulsar Guardar.","Una pizarra para todo lo que se te ocurre. Toca una nota y empieza: escribe una idea, dibuja un boceto, graba una canción o guarda una captura importante. Añade fotos, vídeos y archivos desde los botones de la nota.","Encuentra lo importante. Busca texto o #etiquetas, marca tus favoritos con la estrella y fija notas para que aparezcan primero. Las notas protegidas con contraseña no se incluyen en la búsqueda.","Guarda tus secretos. Protege una nota con contraseña para cifrar su contenido. Conserva esa contraseña: no podemos recuperarla por ti. Comparte contenido solo cuando tú lo decidas.","Guardar sin complicaciones. Los cambios se guardan mientras trabajas; comprueba el indicador de guardado. Con cuenta y conexión, tus notas se sincronizan con la nube. Los archivos guardados localmente pueden permanecer solo en este dispositivo. Exporta una copia antes de borrar los datos del navegador o cambiar de dispositivo.","Empieza gratis y conserva más con Premium. Al registrarte puedes usar todas las notas durante 30 días. Después, las notas 1 a 6 siguen gratis; las demás se bloquean 30 días antes de borrarse. Premium las desbloquea y conserva: 2,95 €/mes, 5,95 €/trimestre, 19,95 €/año o 59,95 € de por vida."],"en":["Your notes are private. Without signing up, your writing is saved automatically in this browser and device: other people cannot see it. No Save button needed.","One board for every idea. Tap a note to write, draw, record a song or keep an important screenshot. Add photos, videos and files using the note controls.","Find what matters. Search text or #tags, star favourites and pin notes to show them first. Password-protected notes are excluded from search.","Keep your secrets. Password-protect a note to encrypt its content. Keep the password safe: we cannot recover it. Share content only when you choose.","Saving made simple. Changes are saved while you work; check the save indicator. With an account and connection, notes sync to the cloud. Locally stored files may stay on this device only. Export a backup before clearing browser data or switching devices.","Start free, keep more with Premium. Registration gives you 30 days to use all notes. Then notes 1–6 stay free; the others are locked for 30 days before deletion. Premium unlocks and keeps them: €2.95/month, €5.95/quarter, €19.95/year or €59.95 lifetime."],"de":["Deine Notizen sind privat. Ohne Registrierung wird dein Text automatisch in diesem Browser auf diesem Gerät gespeichert. Andere können ihn nicht sehen. Du musst nicht auf Speichern klicken.","Eine Pinnwand für jede Idee. Tippe auf eine Notiz, um zu schreiben, zu zeichnen, ein Lied aufzunehmen oder einen Screenshot zu speichern. Füge Fotos, Videos und Dateien über die Notizwerkzeuge hinzu.","Finde das Wichtige. Suche nach Text oder #Tags, markiere Favoriten und hefte Notizen an, damit sie zuerst erscheinen. Passwortgeschützte Notizen werden nicht durchsucht.","Bewahre deine Geheimnisse. Schütze eine Notiz mit einem Passwort, um ihren Inhalt zu verschlüsseln. Bewahre das Passwort auf: Wir können es nicht wiederherstellen. Teile Inhalte nur, wenn du es möchtest.","Einfach speichern. Änderungen werden während der Arbeit gespeichert; prüfe die Speicheranzeige. Mit Konto und Verbindung werden Notizen mit der Cloud synchronisiert. Lokal gespeicherte Dateien können nur auf diesem Gerät bleiben. Exportiere eine Sicherung, bevor du Browserdaten löschst oder das Gerät wechselst.","Starte kostenlos und behalte mehr mit Premium. Nach der Registrierung kannst du 30 Tage alle Notizen nutzen. Danach bleiben Notizen 1–6 kostenlos; die übrigen werden 30 Tage gesperrt und anschließend gelöscht. Premium entsperrt und bewahrt sie: 2,95 €/Monat, 5,95 €/Quartal, 19,95 €/Jahr oder 59,95 € auf Lebenszeit."],"fr":["Vos notes sont privées. Sans inscription, votre texte est enregistré automatiquement dans ce navigateur et sur cet appareil. Les autres ne peuvent pas le voir. Aucun bouton Enregistrer à presser.","Un tableau pour toutes vos idées. Touchez une note pour écrire, dessiner, enregistrer une chanson ou garder une capture importante. Ajoutez photos, vidéos et fichiers avec les outils de la note.","Retrouvez l’essentiel. Cherchez du texte ou des #étiquettes, marquez vos favoris et épinglez les notes à afficher en premier. Les notes protégées par mot de passe sont exclues de la recherche.","Gardez vos secrets. Protégez une note par mot de passe pour chiffrer son contenu. Conservez ce mot de passe : nous ne pouvons pas le récupérer. Partagez uniquement quand vous le décidez.","Un enregistrement simple. Les modifications sont sauvegardées pendant votre travail ; vérifiez l’indicateur. Avec un compte et une connexion, les notes sont synchronisées dans le cloud. Les fichiers locaux peuvent rester uniquement sur cet appareil. Exportez une sauvegarde avant d’effacer les données du navigateur ou de changer d’appareil.","Commencez gratuitement, conservez davantage avec Premium. Après inscription, utilisez toutes les notes pendant 30 jours. Ensuite, les notes 1 à 6 restent gratuites ; les autres sont bloquées 30 jours avant suppression. Premium les débloque et les conserve : 2,95 €/mois, 5,95 €/trimestre, 19,95 €/an ou 59,95 € à vie."],"pt":["As suas notas são privadas. Sem registo, o texto é guardado automaticamente neste navegador e dispositivo. Outras pessoas não o podem ver. Não precisa de carregar em Guardar.","Uma pizarra para todas as ideias. Toque numa nota para escrever, desenhar, gravar uma canção ou guardar uma captura importante. Adicione fotografias, vídeos e ficheiros com os botões da nota.","Encontre o essencial. Pesquise texto ou #etiquetas, marque favoritos e fixe notas para aparecerem primeiro. As notas protegidas por palavra-passe não entram na pesquisa.","Guarde os seus segredos. Proteja uma nota com palavra-passe para cifrar o conteúdo. Guarde essa palavra-passe: não a podemos recuperar. Partilhe apenas quando decidir.","Guardar sem complicações. As alterações são guardadas enquanto trabalha; confira o indicador. Com conta e ligação, as notas sincronizam com a nuvem. Os ficheiros locais podem ficar apenas neste dispositivo. Exporte uma cópia antes de apagar dados do navegador ou mudar de dispositivo.","Comece grátis e conserve mais com Premium. Após o registo, use todas as notas durante 30 dias. Depois, as notas 1–6 continuam grátis; as restantes ficam bloqueadas 30 dias antes de serem apagadas. Premium desbloqueia e conserva: 2,95 €/mês, 5,95 €/trimestre, 19,95 €/ano ou 59,95 € vitalício."],"it":["Le tue note sono private. Senza registrarti, il testo viene salvato automaticamente in questo browser e dispositivo. Gli altri non possono vederlo. Non serve premere Salva.","Una bacheca per ogni idea. Tocca una nota per scrivere, disegnare, registrare una canzone o conservare uno screenshot. Aggiungi foto, video e file dai pulsanti della nota.","Trova ciò che conta. Cerca testo o #etichette, segna i preferiti e fissa le note da mostrare per prime. Le note protette da password sono escluse dalla ricerca.","Custodisci i tuoi segreti. Proteggi una nota con password per cifrarne il contenuto. Conserva la password: non possiamo recuperarla. Condividi solo quando lo decidi.","Salvataggio semplice. Le modifiche vengono salvate mentre lavori; controlla l’indicatore. Con un account e una connessione, le note si sincronizzano nel cloud. I file locali possono restare solo su questo dispositivo. Esporta una copia prima di cancellare i dati del browser o cambiare dispositivo.","Inizia gratis e conserva di più con Premium. Dopo la registrazione puoi usare tutte le note per 30 giorni. Poi le note 1–6 restano gratuite; le altre vengono bloccate per 30 giorni prima dell’eliminazione. Premium le sblocca e conserva: 2,95 €/mese, 5,95 €/trimestre, 19,95 €/anno o 59,95 € a vita."],"ja":["ノートは非公開です。登録しなくても、入力した内容はこのブラウザと端末に自動保存され、他の人には見えません。保存ボタンを押す必要はありません。","あらゆるアイデアをひとつのボードに。ノートをタップして文章や絵を作成し、歌を録音したり、大切なスクリーンショットを保存したりできます。ノートのボタンから写真、動画、ファイルを追加できます。","大切なものを見つける。文章や#タグを検索し、星でお気に入りを選び、ピン留めで先頭に表示できます。パスワード保護されたノートは検索対象外です。","秘密を守る。ノートにパスワードを設定すると内容を暗号化できます。パスワードは保管してください。こちらでは復元できません。共有は自分で選んだときだけ行ってください。","簡単な自動保存。作業中に変更が保存されます。保存状態の表示を確認してください。アカウントと接続があればノートをクラウドに同期します。ローカルファイルはこの端末だけに残る場合があります。ブラウザデータの削除や端末の変更前にバックアップをエクスポートしてください。","無料で始めて、Premiumでもっと残す。登録後30日間はすべてのノートを使えます。その後は1〜6番が無料で、他のノートは30日間ロックされた後に削除されます。Premiumならロックを解除して保存できます。月額2.95ユーロ、3か月5.95ユーロ、年額19.95ユーロ、または買い切り59.95ユーロです。"],"ko":["메모는 비공개입니다. 가입하지 않아도 입력한 내용은 이 브라우저와 기기에 자동 저장되며 다른 사람은 볼 수 없습니다. 저장 버튼을 누를 필요가 없습니다.","모든 아이디어를 한 보드에. 메모를 눌러 글을 쓰고, 그림을 그리고, 노래를 녹음하거나 중요한 스크린샷을 보관하세요. 메모의 버튼으로 사진, 동영상과 파일을 추가할 수 있습니다.","중요한 것을 찾으세요. 글이나 #태그를 검색하고, 별로 즐겨찾기를 표시하고, 메모를 고정하여 먼저 표시하세요. 비밀번호로 보호된 메모는 검색에서 제외됩니다.","비밀을 지키세요. 메모에 비밀번호를 설정하면 내용이 암호화됩니다. 비밀번호를 보관하세요. 저희는 복구할 수 없습니다. 공유는 직접 선택할 때만 하세요.","간편한 자동 저장. 작업하는 동안 변경 내용이 저장됩니다. 저장 상태를 확인하세요. 계정과 연결이 있으면 메모가 클라우드에 동기화됩니다. 로컬 파일은 이 기기에만 남을 수 있습니다. 브라우저 데이터를 지우거나 기기를 바꾸기 전에 백업을 내보내세요.","무료로 시작하고 Premium으로 더 많이 보관하세요. 가입 후 30일 동안 모든 메모를 사용할 수 있습니다. 이후 1~6번은 무료이고 나머지는 30일 동안 잠긴 뒤 삭제됩니다. Premium은 잠금을 해제하고 보관합니다. 월 2.95유로, 3개월 5.95유로, 연 19.95유로 또는 평생 59.95유로입니다."]};
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
  const clone=document.createElement('div');
  clone.className='pp-seo-about';
  const privateNotice=document.createElement('p');
  privateNotice.className='pp-private-notice';
  const paragraphs=instructionsCopy[lang]||instructionsCopy.es;
  privateNotice.textContent=paragraphs[0];
  clone.append(privateNotice);
  const disclosure=document.createElement('details');
  const heading=document.createElement('summary');
  disclosure.append(heading);
  for(const text of paragraphs.slice(1)){const p=document.createElement('p');p.textContent=text;disclosure.append(p);}
  clone.append(disclosure);
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
