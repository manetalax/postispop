import {readBoardLanguage} from './seo-language.js';

// Explicit translations shared by the web and bundled native workspace.
export const uiLanguages=['es','en','de','fr','pt','it','ja','ko'];
export const uiMessages={
 "Símbolo de la nota": ["Símbolo de la nota","Note symbol","Notizsymbol","Symbole de la note","Símbolo da nota","Simbolo della nota","メモのシンボル","메모 기호"],
 "Compartir pizarra": ["Compartir pizarra","Share board","Pinnwand teilen","Partager le tableau","Partilhar quadro","Condividi bacheca","ボードを共有","보드 공유"],
 "Personalizar nota": [
  "Personalizar nota",
  "Personalize note",
  "Notiz gestalten",
  "Personnaliser la note",
  "Personalizar nota",
  "Personalizza nota",
  "ノートをカスタマイズ",
  "메모 꾸미기"
 ],
 "Añadir contenido": [
  "Añadir contenido",
  "Add content",
  "Inhalt hinzufügen",
  "Ajouter du contenu",
  "Adicionar conteúdo",
  "Aggiungi contenuti",
  "コンテンツを追加",
  "콘텐츠 추가"
 ],
 "Texto y papel": [
  "Texto y papel",
  "Text and paper",
  "Text und Papier",
  "Texte et papier",
  "Texto e papel",
  "Testo e carta",
  "文字と用紙",
  "텍스트와 종이"
 ],
 "Dibujo": [
  "Dibujo",
  "Drawing",
  "Zeichnen",
  "Dessin",
  "Desenho",
  "Disegno",
  "描画",
  "그리기"
 ],
 "Tipo de letra": [
  "Tipo de letra",
  "Font",
  "Schriftart",
  "Police",
  "Tipo de letra",
  "Carattere",
  "フォント",
  "글꼴"
 ],
 "Tamaño del texto": [
  "Tamaño del texto",
  "Text size",
  "Textgröße",
  "Taille du texte",
  "Tamanho do texto",
  "Dimensione del testo",
  "文字サイズ",
  "글자 크기"
 ],
 "Tipo de papel": [
  "Tipo de papel",
  "Paper style",
  "Papierstil",
  "Style de papier",
  "Estilo de papel",
  "Stile della carta",
  "用紙のスタイル",
  "종이 스타일"
 ],
 "Instrumento": [
  "Instrumento",
  "Drawing tool",
  "Zeichenwerkzeug",
  "Outil de dessin",
  "Ferramenta de desenho",
  "Strumento da disegno",
  "描画ツール",
  "그리기 도구"
 ],
 "Color de tinta": [
  "Color de tinta",
  "Ink color",
  "Tintenfarbe",
  "Couleur de l’encre",
  "Cor da tinta",
  "Colore dell’inchiostro",
  "インクの色",
  "잉크 색상"
 ],
 "Elegir otro color de tinta": [
  "Elegir otro color de tinta",
  "Choose another ink color",
  "Andere Tintenfarbe wählen",
  "Choisir une autre couleur d’encre",
  "Escolher outra cor de tinta",
  "Scegli un altro colore",
  "別のインク色を選択",
  "다른 잉크 색상 선택"
 ],
 "Escribir": [
  "Escribir",
  "Write",
  "Schreiben",
  "Écrire",
  "Escrever",
  "Scrivi",
  "書く",
  "쓰기"
 ],
 "Lápiz": [
  "Lápiz",
  "Pencil",
  "Bleistift",
  "Crayon",
  "Lápis",
  "Matita",
  "鉛筆",
  "연필"
 ],
 "Pincel": [
  "Pincel",
  "Brush",
  "Pinsel",
  "Pinceau",
  "Pincel",
  "Pennello",
  "筆",
  "붓"
 ],
 "Borrar trazos": [
  "Borrar trazos",
  "Erase strokes",
  "Striche löschen",
  "Effacer les traits",
  "Apagar traços",
  "Cancella tratti",
  "線を消す",
  "선 지우기"
 ],
 "Deshacer trazo": [
  "Deshacer trazo",
  "Undo stroke",
  "Strich rückgängig",
  "Annuler le trait",
  "Desfazer traço",
  "Annulla tratto",
  "線を取り消す",
  "선 실행 취소"
 ],
 "Rehacer trazo": [
  "Rehacer trazo",
  "Redo stroke",
  "Strich wiederholen",
  "Rétablir le trait",
  "Refazer traço",
  "Ripeti tratto",
  "線をやり直す",
  "선 다시 실행"
 ],
 "Cursiva": [
  "Cursiva",
  "Italic",
  "Kursiv",
  "Italique",
  "Itálico",
  "Corsivo",
  "斜体",
  "기울임"
 ],
 "Subrayado": [
  "Subrayado",
  "Underline",
  "Unterstreichen",
  "Souligné",
  "Sublinhado",
  "Sottolineato",
  "下線",
  "밑줄"
 ],
 "Herramientas de la nota": [
  "Herramientas de la nota",
  "Note tools",
  "Notizwerkzeuge",
  "Outils de la note",
  "Ferramentas da nota",
  "Strumenti della nota",
  "ノートのツール",
  "메모 도구"
 ],
 "Escribir y dibujar": [
  "Escribir y dibujar",
  "Write and draw",
  "Schreiben und zeichnen",
  "Écrire et dessiner",
  "Escrever e desenhar",
  "Scrivi e disegna",
  "文章と描画",
  "쓰기와 그리기"
 ],
 "Guardando…": [
  "Guardando…",
  "Saving…",
  "Wird gespeichert…",
  "Enregistrement…",
  "A guardar…",
  "Salvataggio…",
  "保存中…",
  "저장 중…"
 ],
 "Guardado": [
  "Guardado",
  "Saved",
  "Gespeichert",
  "Enregistré",
  "Guardado",
  "Salvato",
  "保存済み",
  "저장됨"
 ],
 "Guardado en este dispositivo · pendiente de sincronizar": [
  "Guardado en este dispositivo · pendiente de sincronizar",
  "Saved on this device · waiting to sync",
  "Auf diesem Gerät gespeichert · Synchronisierung ausstehend",
  "Enregistré sur cet appareil · synchronisation en attente",
  "Guardado neste dispositivo · sincronização pendente",
  "Salvato sul dispositivo · sincronizzazione in attesa",
  "この端末に保存済み・同期待ち",
  "이 기기에 저장됨 · 동기화 대기"
 ],
 "Reintentar": [
  "Reintentar",
  "Retry",
  "Erneut versuchen",
  "Réessayer",
  "Tentar novamente",
  "Riprova",
  "再試行",
  "다시 시도"
 ],
 "Abrir el dibujo de esta nota": [
  "Abrir el dibujo de esta nota",
  "Open this note’s drawing",
  "Zeichnung dieser Notiz öffnen",
  "Ouvrir le dessin de cette note",
  "Abrir o desenho desta nota",
  "Apri il disegno della nota",
  "このノートの描画を開く",
  "이 메모의 그림 열기"
 ],
 "Dibujo de la nota. Activa el lápiz para dibujar.": [
  "Dibujo de la nota. Activa el lápiz para dibujar.",
  "Note drawing. Select the pencil to draw.",
  "Notizzeichnung. Wähle den Stift zum Zeichnen.",
  "Dessin de la note. Activez le crayon pour dessiner.",
  "Desenho da nota. Ative o lápis para desenhar.",
  "Disegno della nota. Attiva la matita per disegnare.",
  "ノートの描画。鉛筆を選んで描画します。",
  "메모 그림. 연필을 선택하여 그리세요."
 ],
 "Goma: toca un trazo para borrarlo. Puedes deshacer.": [
  "Goma: toca un trazo para borrarlo. Puedes deshacer.",
  "Eraser: tap a stroke to remove it. You can undo.",
  "Radierer: Tippe auf einen Strich zum Löschen. Rückgängig ist möglich.",
  "Gomme : touchez un trait pour l’effacer. Vous pouvez annuler.",
  "Borracha: toque num traço para apagar. Pode desfazer.",
  "Gomma: tocca un tratto per cancellarlo. Puoi annullare.",
  "消しゴム：線に触れて消します。取り消し可能です。",
  "지우개: 선을 눌러 지우세요. 실행 취소할 수 있습니다."
 ],
 "Dibuja con el ratón, lápiz o dedo.": [
  "Dibuja con el ratón, lápiz o dedo.",
  "Draw with a mouse, stylus or finger.",
  "Zeichne mit Maus, Stift oder Finger.",
  "Dessinez avec la souris, un stylet ou le doigt.",
  "Desenhe com o rato, caneta ou dedo.",
  "Disegna con mouse, penna o dito.",
  "マウス、ペン、指で描画できます。",
  "마우스, 펜 또는 손가락으로 그리세요."
 ],
 "Límite del dibujo alcanzado. Borra o deshaz un trazo para continuar.": [
  "Límite del dibujo alcanzado. Borra o deshaz un trazo para continuar.",
  "Drawing limit reached. Erase or undo a stroke to continue.",
  "Zeichenlimit erreicht. Lösche einen Strich oder mache ihn rückgängig.",
  "Limite du dessin atteinte. Effacez ou annulez un trait pour continuer.",
  "Limite do desenho atingido. Apague ou desfaça um traço.",
  "Limite del disegno raggiunto. Cancella o annulla un tratto.",
  "描画の上限です。線を消すか取り消してください。",
  "그림 한도에 도달했습니다. 선을 지우거나 실행 취소하세요."
 ],
 "Opciones de la pizarra": [
  "Opciones de la pizarra",
  "Board options",
  "Pinnwandoptionen",
  "Options du tableau",
  "Opções da pizarra",
  "Opzioni della bacheca",
  "ボードのオプション",
  "보드 옵션"
 ],
 "Opciones avanzadas": [
  "Opciones avanzadas",
  "Board options",
  "Pinnwandoptionen",
  "Options du tableau",
  "Opções da pizarra",
  "Opzioni della bacheca",
  "ボードのオプション",
  "보드 옵션"
 ],
 "Herramientas de la pizarra": [
  "Herramientas de la pizarra",
  "Board tools",
  "Pinnwandwerkzeuge",
  "Outils du tableau",
  "Ferramentas da pizarra",
  "Strumenti della bacheca",
  "ボードのツール",
  "보드 도구"
 ],
 "Buscar en tus notas": [
  "Buscar en tus notas",
  "Search your notes",
  "Notizen durchsuchen",
  "Rechercher dans vos notes",
  "Pesquisar nas suas notas",
  "Cerca nelle tue note",
  "ノートを検索",
  "메모 검색"
 ],
 "Buscar notas o #etiqueta": [
  "Buscar notas o #etiqueta",
  "Search notes or #tag",
  "Notizen oder #Tag suchen",
  "Chercher des notes ou #étiquette",
  "Pesquisar notas ou #etiqueta",
  "Cerca note o #etichetta",
  "ノートや#タグを検索",
  "메모 또는 #태그 검색"
 ],
 "Buscar notas o etiquetas": [
  "Buscar notas o etiquetas",
  "Search notes or tags",
  "Notizen oder Tags suchen",
  "Rechercher notes ou étiquettes",
  "Pesquisar notas ou etiquetas",
  "Cerca note o etichette",
  "ノートやタグを検索",
  "메모 또는 태그 검색"
 ],
 "Filtrar por color": [
  "Filtrar por color",
  "Filter by color",
  "Nach Farbe filtern",
  "Filtrer par couleur",
  "Filtrar por cor",
  "Filtra per colore",
  "色で絞り込む",
  "색상으로 필터"
 ],
 "Todos los colores": [
  "Todos los colores",
  "All colors",
  "Alle Farben",
  "Toutes les couleurs",
  "Todas as cores",
  "Tutti i colori",
  "すべての色",
  "모든 색상"
 ],
 "Amarillo": [
  "Amarillo",
  "Yellow",
  "Gelb",
  "Jaune",
  "Amarelo",
  "Giallo",
  "黄色",
  "노랑"
 ],
 "Rosa": [
  "Rosa",
  "Pink",
  "Rosa",
  "Rose",
  "Rosa",
  "Rosa",
  "ピンク",
  "분홍"
 ],
 "Azul": [
  "Azul",
  "Blue",
  "Blau",
  "Bleu",
  "Azul",
  "Blu",
  "青",
  "파랑"
 ],
 "Crema": [
  "Crema",
  "Cream",
  "Creme",
  "Crème",
  "Creme",
  "Crema",
  "クリーム",
  "크림"
 ],
 "Verde": [
  "Verde",
  "Green",
  "Grün",
  "Vert",
  "Verde",
  "Verde",
  "緑",
  "초록"
 ],
 "Violeta": [
  "Violeta",
  "Violet",
  "Violett",
  "Violet",
  "Violeta",
  "Viola",
  "紫",
  "보라"
 ],
 "Favoritos": [
  "Favoritos",
  "Favorites",
  "Favoriten",
  "Favoris",
  "Favoritos",
  "Preferiti",
  "お気に入り",
  "즐겨찾기"
 ],
 "Guardar una copia": [
  "Guardar una copia",
  "Save a backup",
  "Sicherung speichern",
  "Enregistrer une sauvegarde",
  "Guardar uma cópia",
  "Salva una copia",
  "バックアップを保存",
  "백업 저장"
 ],
 "Restaurar una copia": [
  "Restaurar una copia",
  "Restore a backup",
  "Sicherung wiederherstellen",
  "Restaurer une sauvegarde",
  "Restaurar uma cópia",
  "Ripristina una copia",
  "バックアップを復元",
  "백업 복원"
 ],
 "Descargar imagen": [
  "Descargar imagen",
  "Download image",
  "Bild herunterladen",
  "Télécharger l’image",
  "Descarregar imagem",
  "Scarica immagine",
  "画像をダウンロード",
  "이미지 다운로드"
 ],
 "Imprimir": [
  "Imprimir",
  "Print",
  "Drucken",
  "Imprimer",
  "Imprimir",
  "Stampa",
  "印刷",
  "인쇄"
 ],
 "Descargas e instalación": [
  "Descargas e instalación",
  "Downloads and installation",
  "Downloads und Installation",
  "Téléchargements et installation",
  "Transferências e instalação",
  "Download e installazione",
  "ダウンロードとインストール",
  "다운로드 및 설치"
 ],
 "Instalar aplicación": [
  "Instalar aplicación",
  "Install app",
  "App installieren",
  "Installer l’application",
  "Instalar aplicação",
  "Installa l’app",
  "アプリをインストール",
  "앱 설치"
 ],
 "Cerrar": [
  "Cerrar",
  "Close",
  "Schließen",
  "Fermer",
  "Fechar",
  "Chiudi",
  "閉じる",
  "닫기"
 ],
 "Restaurar una copia de seguridad": [
  "Restaurar una copia de seguridad",
  "Restore a backup",
  "Sicherung wiederherstellen",
  "Restaurer une sauvegarde",
  "Restaurar uma cópia de segurança",
  "Ripristina una copia",
  "バックアップを復元",
  "백업 복원"
 ],
 "Selecciona una copia de PostisPop": [
  "Selecciona una copia de PostisPop",
  "Choose a PostisPop backup",
  "PostisPop-Sicherung auswählen",
  "Choisissez une sauvegarde PostisPop",
  "Selecione uma cópia de PostisPop",
  "Scegli una copia PostisPop",
  "PostisPopのバックアップを選択",
  "PostisPop 백업 선택"
 ],
 "Añadir a las notas vacías": [
  "Añadir a las notas vacías",
  "Add to empty notes",
  "Zu leeren Notizen hinzufügen",
  "Ajouter aux notes vides",
  "Adicionar às notas vazias",
  "Aggiungi alle note vuote",
  "空のノートに追加",
  "빈 메모에 추가"
 ],
 "Importando la copia…": [
  "Importando la copia…",
  "Importing backup…",
  "Sicherung wird importiert…",
  "Importation…",
  "A importar a cópia…",
  "Importazione…",
  "バックアップを読み込み中…",
  "백업 가져오는 중…"
 ],
 "Preparando la copia…": [
  "Preparando la copia…",
  "Preparing backup…",
  "Sicherung wird vorbereitet…",
  "Préparation de la sauvegarde…",
  "A preparar a cópia…",
  "Preparazione della copia…",
  "バックアップを準備中…",
  "백업 준비 중…"
 ],
 "Preparando la imagen…": [
  "Preparando la imagen…",
  "Preparing image…",
  "Bild wird vorbereitet…",
  "Préparation de l’image…",
  "A preparar a imagem…",
  "Preparazione dell’immagine…",
  "画像を準備中…",
  "이미지 준비 중…"
 ],
 "Limpiar filtros": [
  "Limpiar filtros",
  "Clear filters",
  "Filter zurücksetzen",
  "Effacer les filtres",
  "Limpar filtros",
  "Rimuovi filtri",
  "絞り込みを解除",
  "필터 초기화"
 ],
 "Búsqueda en todas tus notas. Las notas protegidas no exponen su texto.": [
  "Búsqueda en todas tus notas. Las notas protegidas no exponen su texto.",
  "Searching all your notes. Protected text stays hidden.",
  "Alle Notizen werden durchsucht. Geschützter Text bleibt verborgen.",
  "Recherche dans toutes vos notes. Le texte protégé reste masqué.",
  "Pesquisa em todas as notas. O texto protegido fica oculto.",
  "Ricerca in tutte le note. Il testo protetto resta nascosto.",
  "すべてのノートを検索します。保護された文字は表示されません。",
  "모든 메모를 검색합니다. 보호된 텍스트는 숨겨집니다."
 ],
 "Editorial": [
  "Editorial",
  "Editorial",
  "Modern",
  "Moderne",
  "Editorial",
  "Moderno",
  "標準",
  "기본"
 ],
 "Clásica": [
  "Clásica",
  "Classic",
  "Klassisch",
  "Classique",
  "Clássica",
  "Classico",
  "クラシック",
  "클래식"
 ],
 "Máquina de escribir": [
  "Máquina de escribir",
  "Typewriter",
  "Schreibmaschine",
  "Machine à écrire",
  "Máquina de escrever",
  "Macchina da scrivere",
  "タイプライター",
  "타자기"
 ],
 "Manuscrita": [
  "Manuscrita",
  "Handwritten",
  "Handschrift",
  "Manuscrite",
  "Manuscrita",
  "Manoscritto",
  "手書き",
  "손글씨"
 ],
 "Redondeada": [
  "Redondeada",
  "Rounded",
  "Abgerundet",
  "Arrondie",
  "Arredondada",
  "Arrotondato",
  "丸文字",
  "둥근 글씨"
 ],
 "Libro": [
  "Libro",
  "Book",
  "Buch",
  "Livre",
  "Livro",
  "Libro",
  "書籍",
  "책"
 ],
 "Liso": [
  "Liso",
  "Plain",
  "Unbedruckt",
  "Uni",
  "Liso",
  "Liscio",
  "無地",
  "무지"
 ],
 "Cuaderno rayado": [
  "Cuaderno rayado",
  "Ruled notebook",
  "Liniertes Heft",
  "Cahier ligné",
  "Caderno pautado",
  "Quaderno a righe",
  "罫線ノート",
  "줄 공책"
 ],
 "Cuadriculado": [
  "Cuadriculado",
  "Grid",
  "Kariert",
  "Quadrillé",
  "Quadriculado",
  "Quadretti",
  "方眼",
  "격자"
 ],
 "Punteado": [
  "Punteado",
  "Dotted",
  "Punktiert",
  "Pointillé",
  "Pontilhado",
  "Puntini",
  "ドット",
  "점선"
 ],
 "Diario de viaje": [
  "Diario de viaje",
  "Travel journal",
  "Reisetagebuch",
  "Carnet de voyage",
  "Diário de viagem",
  "Diario di viaggio",
  "旅行日記",
  "여행 일기"
 ],
 "Papiro": [
  "Papiro",
  "Papyrus",
  "Papyrus",
  "Papyrus",
  "Papiro",
  "Papiro",
  "パピルス",
  "파피루스"
 ],
 "Washi": [
  "Washi",
  "Washi",
  "Washi",
  "Washi",
  "Washi",
  "Washi",
  "和紙",
  "와시"
 ],
 "Pentagrama": [
  "Pentagrama",
  "Music staff",
  "Notenpapier",
  "Portée musicale",
  "Pauta musical",
  "Pentagramma",
  "五線譜",
  "오선지"
 ],
 "Hoja tipo receta": [
  "Hoja tipo receta",
  "Prescription-style paper",
  "Rezeptpapier",
  "Papier type ordonnance",
  "Papel tipo receita",
  "Carta stile ricetta",
  "処方箋風用紙",
  "처방전 스타일"
 ],
 "Plano técnico": [
  "Plano técnico",
  "Blueprint",
  "Bauplan",
  "Plan technique",
  "Plano técnico",
  "Disegno tecnico",
  "設計図",
  "설계도"
 ],
 "Cuadrante de turnos": [
  "Cuadrante de turnos",
  "Shift planner",
  "Schichtplan",
  "Planning des équipes",
  "Mapa de turnos",
  "Piano turni",
  "シフト表",
  "교대 근무표"
 ],
 "Ficha de estudio": [
  "Ficha de estudio",
  "Study card",
  "Lernkarte",
  "Fiche de révision",
  "Ficha de estudo",
  "Scheda di studio",
  "学習カード",
  "학습 카드"
 ],
 "Lápiz de grafito": [
  "Lápiz de grafito",
  "Graphite pencil",
  "Graphitstift",
  "Crayon graphite",
  "Lápis de grafite",
  "Matita di grafite",
  "黒鉛鉛筆",
  "흑연 연필"
 ],
 "Bolígrafo": [
  "Bolígrafo",
  "Ballpoint pen",
  "Kugelschreiber",
  "Stylo à bille",
  "Esferográfica",
  "Penna a sfera",
  "ボールペン",
  "볼펜"
 ],
 "Roller de tinta líquida": [
  "Roller de tinta líquida",
  "Rollerball",
  "Tintenroller",
  "Roller",
  "Roller de tinta líquida",
  "Penna roller",
  "ローラーボール",
  "롤러볼 펜"
 ],
 "Bolígrafo de gel": [
  "Bolígrafo de gel",
  "Gel pen",
  "Gelstift",
  "Stylo gel",
  "Caneta de gel",
  "Penna gel",
  "ゲルペン",
  "젤 펜"
 ],
 "Pluma estilográfica": [
  "Pluma estilográfica",
  "Fountain pen",
  "Füller",
  "Stylo plume",
  "Caneta de aparo",
  "Penna stilografica",
  "万年筆",
  "만년필"
 ],
 "Rotulador fino": [
  "Rotulador fino",
  "Fineliner",
  "Fineliner",
  "Feutre fin",
  "Marcador fino",
  "Pennarello fine",
  "細字ペン",
  "가는 펜"
 ],
 "Pincel de caligrafía": [
  "Pincel de caligrafía",
  "Calligraphy brush",
  "Kalligrafiepinsel",
  "Pinceau calligraphique",
  "Pincel de caligrafia",
  "Pennello calligrafico",
  "書道筆",
  "서예 붓"
 ],
 "Marcador": [
  "Marcador",
  "Marker",
  "Marker",
  "Feutre",
  "Marcador",
  "Pennarello",
  "マーカー",
  "마커"
 ],
 "Cera": [
  "Cera",
  "Crayon",
  "Wachsmalstift",
  "Crayon gras",
  "Lápis de cera",
  "Pastello a cera",
  "クレヨン",
  "크레용"
 ],
 "Tizas de colores": [
  "Tizas de colores",
  "Colored chalk",
  "Farbkreide",
  "Craies de couleur",
  "Giz colorido",
  "Gessetti colorati",
  "色チョーク",
  "색 분필"
 ],
 "Carboncillo": [
  "Carboncillo",
  "Charcoal",
  "Kohle",
  "Fusain",
  "Carvão",
  "Carboncino",
  "木炭",
  "목탄"
 ],
 "Sello de tinta": [
  "Sello de tinta",
  "Ink stamp",
  "Tintenstempel",
  "Tampon",
  "Carimbo",
  "Timbro",
  "インクスタンプ",
  "잉크 도장"
 ],
 "Pasta tricolor": [
  "Pasta tricolor",
  "Tricolor paste",
  "Dreifarbige Paste",
  "Pâte tricolore",
  "Pasta tricolor",
  "Pasta tricolore",
  "三色ペースト",
  "삼색 페이스트"
 ],
 "Spray de grafiti": [
  "Spray de grafiti",
  "Graffiti spray",
  "Graffitispray",
  "Bombe graffiti",
  "Spray de graffiti",
  "Spray graffiti",
  "スプレー",
  "그래피티 스프레이"
 ],
 "Pistola de pintura": [
  "Pistola de pintura",
  "Airbrush",
  "Airbrush",
  "Aérographe",
  "Pistola de pintura",
  "Aerografo",
  "エアブラシ",
  "에어브러시"
 ],
 "Pintauñas": [
  "Pintauñas",
  "Nail polish",
  "Nagellack",
  "Vernis à ongles",
  "Verniz de unhas",
  "Smalto",
  "マニキュア",
  "매니큐어"
 ],
 "Lápiz de cejas": [
  "Lápiz de cejas",
  "Eyebrow pencil",
  "Augenbrauenstift",
  "Crayon sourcils",
  "Lápis de sobrancelhas",
  "Matita sopracciglia",
  "眉ペンシル",
  "눈썹 연필"
 ],
 "Máscara de pestañas": [
  "Máscara de pestañas",
  "Mascara",
  "Mascara",
  "Mascara",
  "Máscara de pestanas",
  "Mascara",
  "マスカラ",
  "마스카라"
 ],
 "Delineador": [
  "Delineador",
  "Eyeliner",
  "Eyeliner",
  "Eye-liner",
  "Delineador",
  "Eyeliner",
  "アイライナー",
  "아이라이너"
 ],
 "Pintalabios": [
  "Pintalabios",
  "Lipstick",
  "Lippenstift",
  "Rouge à lèvres",
  "Batom",
  "Rossetto",
  "口紅",
  "립스틱"
 ],
 "Sombra de ojos": [
  "Sombra de ojos",
  "Eyeshadow",
  "Lidschatten",
  "Fard à paupières",
  "Sombra de olhos",
  "Ombretto",
  "アイシャドウ",
  "아이섀도"
 ],
 "Corrector de cinta": [
  "Corrector de cinta",
  "Correction tape",
  "Korrekturband",
  "Ruban correcteur",
  "Corretor de fita",
  "Correttore a nastro",
  "修正テープ",
  "수정 테이프"
 ],
 "Corrector líquido": [
  "Corrector líquido",
  "Correction fluid",
  "Korrekturflüssigkeit",
  "Correcteur liquide",
  "Corretor líquido",
  "Correttore liquido",
  "修正液",
  "수정액"
 ],
 "Brocha de pintura": [
  "Brocha de pintura",
  "Paintbrush",
  "Malpinsel",
  "Brosse à peinture",
  "Trincha",
  "Pennello da pittura",
  "ペイントブラシ",
  "페인트 붓"
 ],
 "Rodillo": [
  "Rodillo",
  "Paint roller",
  "Farbroller",
  "Rouleau",
  "Rolo",
  "Rullo",
  "ローラー",
  "롤러"
 ],
 "Esponja": [
  "Esponja",
  "Sponge",
  "Schwamm",
  "Éponge",
  "Esponja",
  "Spugna",
  "スポンジ",
  "스펀지"
 ],
 "Acuarela": [
  "Acuarela",
  "Watercolor",
  "Aquarell",
  "Aquarelle",
  "Aguarela",
  "Acquerello",
  "水彩",
  "수채화"
 ],
 "Sangre · tinta artística": [
  "Sangre · tinta artística",
  "Blood · artistic ink",
  "Blut · Kunsttinte",
  "Sang · encre artistique",
  "Sangue · tinta artística",
  "Sangue · inchiostro artistico",
  "血液風アートインク",
  "혈액 느낌 아트 잉크"
 ],
 "Tu caja fuerte": [
  "Tu caja fuerte",
  "Your vault",
  "Dein Tresor",
  "Votre coffre-fort",
  "O seu cofre",
  "La tua cassaforte",
  "金庫",
  "금고"
 ],
 "Nota": [
  "Nota",
  "Note",
  "Notiz",
  "Note",
  "Nota",
  "Nota",
  "ノート",
  "메모"
 ],
 "Protegida": [
  "Protegida",
  "Protected",
  "Geschützt",
  "Protégée",
  "Protegida",
  "Protetta",
  "保護済み",
  "보호됨"
 ],
 "Proteger o abrir": [
  "Proteger o abrir",
  "Protect or open",
  "Schützen oder öffnen",
  "Protéger ou ouvrir",
  "Proteger ou abrir",
  "Proteggi o apri",
  "保護・開く",
  "보호 또는 열기"
 ],
 "Notas con contraseña": [
  "Notas con contraseña",
  "Password-protected notes",
  "Passwortgeschützte Notizen",
  "Notes avec mot de passe",
  "Notas com palavra-passe",
  "Note con password",
  "パスワード付きノート",
  "비밀번호 메모"
 ],
 "Nota que quieres proteger o abrir": [
  "Nota que quieres proteger o abrir",
  "Note to protect or open",
  "Notiz zum Schützen oder Öffnen",
  "Note à protéger ou ouvrir",
  "Nota a proteger ou abrir",
  "Nota da proteggere o aprire",
  "保護または開くノート",
  "보호하거나 열 메모"
 ],
 "Contraseña de la nota": [
  "Contraseña de la nota",
  "Note password",
  "Notizpasswort",
  "Mot de passe de la note",
  "Palavra-passe da nota",
  "Password della nota",
  "ノートのパスワード",
  "메모 비밀번호"
 ],
 "Proteger esta nota": [
  "Proteger esta nota",
  "Protect this note",
  "Diese Notiz schützen",
  "Protéger cette note",
  "Proteger esta nota",
  "Proteggi questa nota",
  "このノートを保護",
  "이 메모 보호"
 ],
 "Contraseña": [
  "Contraseña",
  "Password",
  "Passwort",
  "Mot de passe",
  "Palavra-passe",
  "Password",
  "パスワード",
  "비밀번호"
 ],
 "Contraseña de esta nota": [
  "Contraseña de esta nota",
  "Password for this note",
  "Passwort für diese Notiz",
  "Mot de passe de cette note",
  "Palavra-passe desta nota",
  "Password di questa nota",
  "このノートのパスワード",
  "이 메모의 비밀번호"
 ],
 "Repite la contraseña": [
  "Repite la contraseña",
  "Repeat password",
  "Passwort wiederholen",
  "Répétez le mot de passe",
  "Repita a palavra-passe",
  "Ripeti la password",
  "パスワードを再入力",
  "비밀번호 다시 입력"
 ],
 "Cifrar y proteger": [
  "Cifrar y proteger",
  "Encrypt and protect",
  "Verschlüsseln und schützen",
  "Chiffrer et protéger",
  "Cifrar e proteger",
  "Cifra e proteggi",
  "暗号化して保護",
  "암호화 및 보호"
 ],
 "Nota protegida": [
  "Nota protegida",
  "Protected note",
  "Geschützte Notiz",
  "Note protégée",
  "Nota protegida",
  "Nota protetta",
  "保護されたノート",
  "보호된 메모"
 ],
 "Abrir nota": [
  "Abrir nota",
  "Open note",
  "Notiz öffnen",
  "Ouvrir la note",
  "Abrir nota",
  "Apri nota",
  "ノートを開く",
  "메모 열기"
 ],
 "Procesando de forma segura…": [
  "Procesando de forma segura…",
  "Processing securely…",
  "Sichere Verarbeitung…",
  "Traitement sécurisé…",
  "A processar em segurança…",
  "Elaborazione sicura…",
  "安全に処理中…",
  "안전하게 처리 중…"
 ],
 "Las contraseñas no coinciden.": [
  "Las contraseñas no coinciden.",
  "Passwords do not match.",
  "Die Passwörter stimmen nicht überein.",
  "Les mots de passe ne correspondent pas.",
  "As palavras-passe não coincidem.",
  "Le password non corrispondono.",
  "パスワードが一致しません。",
  "비밀번호가 일치하지 않습니다."
 ],
 "Dibujo de la nota": [
  "Dibujo de la nota",
  "Note drawing",
  "Notizzeichnung",
  "Dessin de la note",
  "Desenho da nota",
  "Disegno della nota",
  "ノートの描画",
  "메모 그림"
 ],
 "Esta nota cambió en otra ventana. Tu dibujo sigue aquí. Cierra y vuelve a abrir la nota para cargar la versión guardada.": [
  "Esta nota cambió en otra ventana. Tu dibujo sigue aquí. Cierra y vuelve a abrir la nota para cargar la versión guardada.",
  "This note changed in another window. Your drawing is still here. Close and reopen to load the saved version.",
  "Diese Notiz wurde in einem anderen Fenster geändert. Deine Zeichnung bleibt hier. Schließe und öffne die Notiz erneut.",
  "Cette note a changé ailleurs. Votre dessin reste ici. Fermez et rouvrez pour charger la version enregistrée.",
  "Esta nota mudou noutra janela. O desenho continua aqui. Feche e reabra para carregar a versão guardada.",
  "Questa nota è cambiata altrove. Il disegno resta qui. Chiudi e riapri per caricare la versione salvata.",
  "別の画面で変更されました。描画はここに残っています。閉じて再度開いて保存版を読み込んでください。",
  "다른 창에서 메모가 변경되었습니다. 그림은 여기에 있습니다. 닫았다가 다시 열어 저장된 버전을 불러오세요."
 ],
 "La nota ya está protegida. Ábrela con su contraseña para continuar.": [
  "La nota ya está protegida. Ábrela con su contraseña para continuar.",
  "This note is protected. Open it with its password to continue.",
  "Diese Notiz ist geschützt. Öffne sie mit dem Passwort.",
  "Cette note est protégée. Ouvrez-la avec son mot de passe.",
  "A nota está protegida. Abra-a com a palavra-passe.",
  "La nota è protetta. Aprila con la password.",
  "保護されています。パスワードで開いてください。",
  "보호된 메모입니다. 비밀번호로 여세요."
 ],
 "No queda espacio en este dispositivo. Conserva esta nota abierta hasta liberar espacio.": [
  "No queda espacio en este dispositivo. Conserva esta nota abierta hasta liberar espacio.",
  "This device is out of space. Keep the note open until you free up space.",
  "Kein Speicherplatz auf diesem Gerät. Lass die Notiz offen, bis du Platz freigibst.",
  "Cet appareil est plein. Gardez la note ouverte jusqu’à libérer de l’espace.",
  "O dispositivo está cheio. Mantenha a nota aberta até libertar espaço.",
  "Il dispositivo è pieno. Tieni aperta la nota finché liberi spazio.",
  "端末の空き容量がありません。容量を確保するまで開いたままにしてください。",
  "기기 공간이 부족합니다. 공간을 확보할 때까지 메모를 열어 두세요."
 ],
 "Sin conexión: estos cambios aún no se han guardado. Conserva la nota abierta; volveremos a intentarlo al conectarte.": [
  "Sin conexión: estos cambios aún no se han guardado. Conserva la nota abierta; volveremos a intentarlo al conectarte.",
  "Offline: these changes are not saved yet. Keep the note open; we will retry when connected.",
  "Offline: Änderungen noch nicht gespeichert. Lass die Notiz offen; wir versuchen es bei Verbindung erneut.",
  "Hors ligne : ces changements ne sont pas enregistrés. Gardez la note ouverte ; nouvel essai à la connexion.",
  "Sem ligação: alterações ainda não guardadas. Mantenha a nota aberta; tentaremos ao ligar.",
  "Offline: modifiche non ancora salvate. Tieni aperta la nota; riproveremo alla connessione.",
  "オフラインです。まだ保存されていません。開いたままにしてください。接続時に再試行します。",
  "오프라인입니다. 변경 사항이 아직 저장되지 않았습니다. 연결되면 다시 시도하므로 열어 두세요."
 ],
 "Tu cuenta no permite guardar este cambio todavía. La nota sigue abierta con tus cambios.": [
  "Tu cuenta no permite guardar este cambio todavía. La nota sigue abierta con tus cambios.",
  "Your account cannot save this change yet. The note stays open with your changes.",
  "Dein Konto kann diese Änderung noch nicht speichern. Die Notiz bleibt mit deinen Änderungen offen.",
  "Votre compte ne permet pas encore cette modification. La note reste ouverte avec vos changements.",
  "A conta ainda não permite guardar esta alteração. A nota permanece aberta.",
  "Il tuo account non può ancora salvare questa modifica. La nota resta aperta.",
  "このアカウントではまだ保存できません。変更したノートは開いたままです。",
  "현재 계정에서는 이 변경을 저장할 수 없습니다. 변경된 메모는 열린 상태로 유지됩니다."
 ],
 "El dibujo ha alcanzado el límite de esta nota. Deshaz el último trazo antes de guardar.": [
  "El dibujo ha alcanzado el límite de esta nota. Deshaz el último trazo antes de guardar.",
  "This drawing reached the note limit. Undo the last stroke before saving.",
  "Zeichenlimit erreicht. Mache den letzten Strich vor dem Speichern rückgängig.",
  "Limite atteinte. Annulez le dernier trait avant d’enregistrer.",
  "Limite atingido. Desfaça o último traço antes de guardar.",
  "Limite raggiunto. Annulla l’ultimo tratto prima di salvare.",
  "描画の上限です。最後の線を取り消してから保存してください。",
  "그림 한도에 도달했습니다. 마지막 선을 실행 취소한 후 저장하세요."
 ],
 "No se pudo guardar. Tu dibujo sigue aquí; vuelve a intentarlo.": [
  "No se pudo guardar. Tu dibujo sigue aquí; vuelve a intentarlo.",
  "Could not save. Your drawing is still here; try again.",
  "Speichern fehlgeschlagen. Deine Zeichnung bleibt hier; versuche es erneut.",
  "Enregistrement impossible. Votre dessin reste ici ; réessayez.",
  "Não foi possível guardar. O desenho continua aqui; tente novamente.",
  "Salvataggio non riuscito. Il disegno resta qui; riprova.",
  "保存できませんでした。描画は残っています。再試行してください。",
  "저장하지 못했습니다. 그림은 여기에 있습니다. 다시 시도하세요."
 ],
 "Tu nota permanece cifrada hasta que introduzcas su contraseña.": [
  "Tu nota permanece cifrada hasta que introduzcas su contraseña.",
  "Your note stays encrypted until you enter its password.",
  "Die Notiz bleibt verschlüsselt, bis du ihr Passwort eingibst.",
  "La note reste chiffrée jusqu’à la saisie du mot de passe.",
  "A nota permanece cifrada até introduzir a palavra-passe.",
  "La nota resta cifrata finché inserisci la password.",
  "パスワードを入力するまで暗号化されたままです。",
  "비밀번호를 입력할 때까지 메모는 암호화된 상태입니다."
 ],
 "Se guarda automáticamente cifrada. Al salir, la nota vuelve a bloquearse.": [
  "Se guarda automáticamente cifrada. Al salir, la nota vuelve a bloquearse.",
  "Automatically saved encrypted. Leaving locks the note again.",
  "Wird automatisch verschlüsselt gespeichert. Beim Verlassen wird sie wieder gesperrt.",
  "Enregistrement automatique chiffré. La note se verrouille en quittant.",
  "Guarda automaticamente cifrada. Ao sair, volta a bloquear.",
  "Salvataggio automatico cifrato. Uscendo, la nota si blocca.",
  "自動的に暗号化して保存します。終了すると再びロックされます。",
  "자동으로 암호화하여 저장합니다. 나가면 다시 잠깁니다."
 ],
 "Guardando automáticamente cifrada…": [
  "Guardando automáticamente cifrada…",
  "Automatically saving encrypted…",
  "Automatisch verschlüsselt speichern…",
  "Enregistrement automatique chiffré…",
  "A guardar automaticamente cifrada…",
  "Salvataggio automatico cifrato…",
  "暗号化して自動保存中…",
  "자동 암호화 저장 중…"
 ],
 "Guardada cifrada.": [
  "Guardada cifrada.",
  "Saved encrypted.",
  "Verschlüsselt gespeichert.",
  "Enregistrée chiffrée.",
  "Guardada cifrada.",
  "Salvata cifrata.",
  "暗号化して保存済み。",
  "암호화하여 저장되었습니다."
 ],
 "Guardada cifrada en este dispositivo. Pendiente de sincronizar.": [
  "Guardada cifrada en este dispositivo. Pendiente de sincronizar.",
  "Saved encrypted on this device. Waiting to sync.",
  "Auf diesem Gerät verschlüsselt gespeichert. Synchronisierung ausstehend.",
  "Enregistrée chiffrée sur cet appareil. Synchronisation en attente.",
  "Guardada cifrada neste dispositivo. Sincronização pendente.",
  "Salvata cifrata sul dispositivo. Sincronizzazione in attesa.",
  "この端末に暗号化して保存済み。同期待ちです。",
  "이 기기에 암호화하여 저장되었습니다. 동기화 대기 중입니다."
 ],
 "Texto de la nota protegida": [
  "Texto de la nota protegida",
  "Protected note text",
  "Text der geschützten Notiz",
  "Texte de la note protégée",
  "Texto da nota protegida",
  "Testo della nota protetta",
  "保護されたノートの文字",
  "보호된 메모 텍스트"
 ],
 "Tu texto sigue aquí.": [
  "Tu texto sigue aquí.",
  "Your text is still here.",
  "Dein Text bleibt hier.",
  "Votre texte reste ici.",
  "O texto continua aqui.",
  "Il testo resta qui.",
  "文字はここに残っています。",
  "텍스트는 여기에 있습니다."
 ],
 "Espera a que termine el guardado de esta nota y vuelve a pulsar.": [
  "Espera a que termine el guardado de esta nota y vuelve a pulsar.",
  "Wait for this note to finish saving, then try again.",
  "Warte, bis die Notiz gespeichert ist, und versuche es erneut.",
  "Attendez la fin de l’enregistrement, puis réessayez.",
  "Aguarde o fim da gravação e tente novamente.",
  "Attendi il salvataggio e riprova.",
  "保存が完了してから再度押してください。",
  "저장이 완료될 때까지 기다린 후 다시 누르세요."
 ],
 "Cierra y vuelve a abrir la nota para continuar.": [
  "Cierra y vuelve a abrir la nota para continuar.",
  "Close and reopen the note to continue.",
  "Schließe und öffne die Notiz erneut.",
  "Fermez et rouvrez la note.",
  "Feche e reabra a nota.",
  "Chiudi e riapri la nota.",
  "閉じて再度開いてください。",
  "메모를 닫았다가 다시 여세요."
 ],
 "Abre una pizarra para usar las notas protegidas.": [
  "Abre una pizarra para usar las notas protegidas.",
  "Open a board to use protected notes.",
  "Öffne eine Pinnwand für geschützte Notizen.",
  "Ouvrez un tableau pour les notes protégées.",
  "Abra uma pizarra para usar notas protegidas.",
  "Apri una bacheca per le note protette.",
  "ボードを開いて保護ノートを使ってください。",
  "보호된 메모를 사용하려면 보드를 여세요."
 ],
 "Crear enlace protegido": [
  "Crear enlace protegido",
  "Create protected link",
  "Geschützten Link erstellen",
  "Créer un lien protégé",
  "Criar ligação protegida",
  "Crea link protetto",
  "保護リンクを作成",
  "보호 링크 만들기"
 ],
 "Revocar todos los enlaces": [
  "Revocar todos los enlaces",
  "Revoke all links",
  "Alle Links widerrufen",
  "Révoquer tous les liens",
  "Revogar todas as ligações",
  "Revoca tutti i link",
  "すべてのリンクを無効化",
  "모든 링크 취소"
 ],
 "Copiar enlace": [
  "Copiar enlace",
  "Copy link",
  "Link kopieren",
  "Copier le lien",
  "Copiar ligação",
  "Copia link",
  "リンクをコピー",
  "링크 복사"
 ],
 "Abrir WhatsApp": [
  "Abrir WhatsApp",
  "Open WhatsApp",
  "WhatsApp öffnen",
  "Ouvrir WhatsApp",
  "Abrir WhatsApp",
  "Apri WhatsApp",
  "WhatsAppを開く",
  "WhatsApp 열기"
 ],
 "Enlace protegido": [
  "Enlace protegido",
  "Protected link",
  "Geschützter Link",
  "Lien protégé",
  "Ligação protegida",
  "Link protetto",
  "保護リンク",
  "보호 링크"
 ],
 "Enlace copiado. Envía la contraseña por separado.": [
  "Enlace copiado. Envía la contraseña por separado.",
  "Link copied. Send the password separately.",
  "Link kopiert. Sende das Passwort separat.",
  "Lien copié. Envoyez le mot de passe séparément.",
  "Ligação copiada. Envie a palavra-passe separadamente.",
  "Link copiato. Invia la password separatamente.",
  "コピーしました。パスワードは別に送ってください。",
  "링크를 복사했습니다. 비밀번호는 따로 보내세요."
 ],
 "No se pudo copiar. Usa el campo de enlace.": [
  "No se pudo copiar. Usa el campo de enlace.",
  "Could not copy. Use the link field.",
  "Kopieren fehlgeschlagen. Nutze das Linkfeld.",
  "Copie impossible. Utilisez le champ du lien.",
  "Não foi possível copiar. Use o campo da ligação.",
  "Copia non riuscita. Usa il campo del link.",
  "コピーできません。リンク欄を使ってください。",
  "복사하지 못했습니다. 링크 입력란을 사용하세요."
 ],
 "Caduca en 7 días. Comparte la contraseña por otro medio; nunca se incluye en el enlace.": [
  "Caduca en 7 días. Comparte la contraseña por otro medio; nunca se incluye en el enlace.",
  "Expires in 7 days. Send the password separately; it is never in the link.",
  "Läuft nach 7 Tagen ab. Sende das Passwort separat; es ist nie im Link.",
  "Expire dans 7 jours. Transmettez le mot de passe séparément ; il n’est jamais dans le lien.",
  "Expira em 7 dias. Envie a palavra-passe separadamente; nunca está na ligação.",
  "Scade tra 7 giorni. Invia la password separatamente; non è nel link.",
  "7日で期限切れです。パスワードは別の手段で送り、リンクには含めません。",
  "7일 후 만료됩니다. 비밀번호는 다른 수단으로 보내세요. 링크에 포함되지 않습니다."
 ],
 "Enlace creado. Quien conozca el enlace podrá descargar el contenido cifrado.": [
  "Enlace creado. Quien conozca el enlace podrá descargar el contenido cifrado.",
  "Link created. Anyone with the link can download the encrypted content.",
  "Link erstellt. Jeder mit dem Link kann den verschlüsselten Inhalt herunterladen.",
  "Lien créé. Toute personne avec le lien peut télécharger le contenu chiffré.",
  "Ligação criada. Quem a tiver pode descarregar o conteúdo cifrado.",
  "Link creato. Chi lo possiede può scaricare il contenuto cifrato.",
  "作成しました。リンクを知る人は暗号化データをダウンロードできます。",
  "링크가 생성되었습니다. 링크를 가진 사람은 암호화된 내용을 다운로드할 수 있습니다."
 ],
 "Enlaces revocados en el servidor. No se pueden retirar copias que alguien ya haya guardado.": [
  "Enlaces revocados en el servidor. No se pueden retirar copias que alguien ya haya guardado.",
  "Links revoked on the server. Already saved copies cannot be withdrawn.",
  "Links auf dem Server widerrufen. Gespeicherte Kopien können nicht zurückgenommen werden.",
  "Liens révoqués sur le serveur. Les copies déjà enregistrées ne peuvent pas être retirées.",
  "Ligações revogadas no servidor. As cópias já guardadas não podem ser retiradas.",
  "Link revocati sul server. Le copie già salvate non possono essere ritirate.",
  "サーバーで無効化しました。すでに保存されたコピーは回収できません。",
  "서버에서 링크를 취소했습니다. 이미 저장된 사본은 회수할 수 없습니다."
 ],
 "El texto, el dibujo y los adjuntos locales de hasta 2 MB se cifrarán con una contraseña propia.": [
  "El texto, el dibujo y los adjuntos locales de hasta 2 MB se cifrarán con una contraseña propia.",
  "Text, drawings and up to 2 MB of local attachments will be encrypted with a separate password.",
  "Text, Zeichnung und lokale Anhänge bis 2 MB werden mit einem eigenen Passwort verschlüsselt.",
  "Texte, dessin et pièces jointes locales jusqu’à 2 Mo seront chiffrés avec un mot de passe propre.",
  "Texto, desenho e anexos locais até 2 MB serão cifrados com uma palavra-passe própria.",
  "Testo, disegno e allegati locali fino a 2 MB saranno cifrati con una password dedicata.",
  "文字、描画、最大2 MBのローカル添付を専用パスワードで暗号化します。",
  "텍스트, 그림 및 최대 2 MB의 로컬 첨부 파일을 별도 비밀번호로 암호화합니다."
 ],
 "Mínimo 4 caracteres; recomendamos una frase larga y única. Las claves cortas pueden adivinarse aunque el contenido esté cifrado.": [
  "Mínimo 4 caracteres; recomendamos una frase larga y única. Las claves cortas pueden adivinarse aunque el contenido esté cifrado.",
  "At least 4 characters; use a long, unique phrase. Short passwords can be guessed even with encryption.",
  "Mindestens 4 Zeichen; nutze eine lange, einzigartige Phrase. Kurze Passwörter sind trotz Verschlüsselung erratbar.",
  "Au moins 4 caractères ; utilisez une phrase longue et unique. Les mots de passe courts peuvent être devinés malgré le chiffrement.",
  "Mínimo 4 caracteres; use uma frase longa e única. Palavras-passe curtas podem ser adivinhadas mesmo com cifragem.",
  "Almeno 4 caratteri; usa una frase lunga e unica. Password brevi possono essere indovinate anche con cifratura.",
  "4文字以上。長く固有のフレーズを推奨します。短いパスワードは暗号化しても推測されることがあります。",
  "최소 4자입니다. 길고 고유한 문구를 사용하세요. 짧은 비밀번호는 암호화해도 추측될 수 있습니다."
 ],
 "No hay recuperación de contraseña ni acceso administrativo al contenido. Guarda tu contraseña aparte.": [
  "No hay recuperación de contraseña ni acceso administrativo al contenido. Guarda tu contraseña aparte.",
  "There is no password recovery or administrator access to the content. Keep your password separately.",
  "Keine Passwortwiederherstellung und kein Administratorzugriff auf den Inhalt. Bewahre das Passwort separat auf.",
  "Aucune récupération du mot de passe ni accès administrateur au contenu. Conservez le mot de passe séparément.",
  "Não há recuperação de palavra-passe nem acesso administrativo ao conteúdo. Guarde a palavra-passe à parte.",
  "Nessun recupero password né accesso amministrativo ai contenuti. Conserva la password separatamente.",
  "パスワードの復旧や管理者による内容へのアクセスはできません。別に保管してください。",
  "비밀번호 복구나 관리자의 내용 접근은 불가능합니다. 비밀번호를 따로 보관하세요."
 ],
 "Sello: ": [
  "Sello: ",
  "Symbol: ",
  "Symbol: ",
  "Symbole : ",
  "Símbolo: ",
  "Simbolo: ",
  "シンボル：",
  "기호: "
 ],
 "MI VIAJE": [
  "MI VIAJE",
  "MY JOURNEY",
  "MEINE REISE",
  "MON VOYAGE",
  "A MINHA VIAGEM",
  "IL MIO VIAGGIO",
  "私の旅",
  "나의 여행"
 ],
 "APUNTES PERSONALES": [
  "APUNTES PERSONALES",
  "PERSONAL NOTES",
  "PERSÖNLICHE NOTIZEN",
  "NOTES PERSONNELLES",
  "APONTAMENTOS PESSOAIS",
  "APPUNTI PERSONALI",
  "個人用メモ",
  "개인 메모"
 ],
 "FECHA: __________": [
  "FECHA: __________",
  "DATE: __________",
  "DATUM: __________",
  "DATE : __________",
  "DATA: __________",
  "DATA: __________",
  "日付：__________",
  "날짜: __________"
 ],
 "PAPEL CREATIVO · NO ES UNA RECETA MÉDICA": [
  "PAPEL CREATIVO · NO ES UNA RECETA MÉDICA",
  "CREATIVE PAPER · NOT A MEDICAL PRESCRIPTION",
  "KREATIVPAPIER · KEIN MEDIZINISCHES REZEPT",
  "PAPIER CRÉATIF · PAS UNE ORDONNANCE MÉDICALE",
  "PAPEL CRIATIVO · NÃO É RECEITA MÉDICA",
  "CARTA CREATIVA · NON È UNA RICETTA MEDICA",
  "創作用紙・医療処方箋ではありません",
  "창작용 종이 · 의료 처방전이 아닙니다"
 ],
 "MI CUADRANTE": [
  "MI CUADRANTE",
  "MY SCHEDULE",
  "MEIN DIENSTPLAN",
  "MON PLANNING",
  "O MEU HORÁRIO",
  "IL MIO CALENDARIO",
  "予定表",
  "나의 일정"
 ],
 "RECORDATORIOS": [
  "RECORDATORIOS",
  "REMINDERS",
  "ERINNERUNGEN",
  "RAPPELS",
  "LEMBRETES",
  "PROMEMORIA",
  "リマインダー",
  "알림"
 ],
 "TEMA · IDEAS · REPASO": [
  "TEMA · IDEAS · REPASO",
  "TOPIC · IDEAS · REVIEW",
  "THEMA · IDEEN · WIEDERHOLUNG",
  "SUJET · IDÉES · RÉVISION",
  "TEMA · IDEIAS · REVISÃO",
  "TEMA · IDEE · RIPASSO",
  "テーマ・アイデア・復習",
  "주제 · 아이디어 · 복습"
 ],
 "No queda espacio suficiente en este dispositivo. Tus datos anteriores se conservan; libera espacio y vuelve a intentarlo.": [
  "No queda espacio suficiente en este dispositivo. Tus datos anteriores se conservan; libera espacio y vuelve a intentarlo.",
  "Not enough device space. Existing data is safe; free space and retry.",
  "Nicht genug Gerätespeicher. Bisherige Daten bleiben erhalten; schaffe Platz und versuche es erneut.",
  "Espace insuffisant. Les données existantes sont conservées ; libérez de l’espace et réessayez.",
  "Espaço insuficiente. Os dados anteriores conservam-se; liberte espaço e tente novamente.",
  "Spazio insufficiente. I dati precedenti sono al sicuro; libera spazio e riprova.",
  "端末の容量が不足しています。既存のデータは保たれています。空き容量を確保して再試行してください。",
  "기기 공간이 부족합니다. 기존 데이터는 보존됩니다. 공간을 확보하고 다시 시도하세요."
 ],
 "El enlace ha caducado, se ha revocado o ya no está disponible.": [
  "El enlace ha caducado, se ha revocado o ya no está disponible.",
  "The link expired, was revoked or is unavailable.",
  "Der Link ist abgelaufen, widerrufen oder nicht verfügbar.",
  "Le lien a expiré, a été révoqué ou est indisponible.",
  "A ligação expirou, foi revogada ou não está disponível.",
  "Il link è scaduto, revocato o non disponibile.",
  "期限切れ、無効化、または利用できないリンクです。",
  "링크가 만료되었거나 취소되었거나 사용할 수 없습니다."
 ],
 "Este navegador no permite coordinar el cifrado con otros editores abiertos. Usa una versión actual de Chrome, Firefox, Safari o la aplicación para proteger esta nota.": [
  "Este navegador no permite coordinar el cifrado con otros editores abiertos. Usa una versión actual de Chrome, Firefox, Safari o la aplicación para proteger esta nota.",
  "This browser cannot coordinate encryption across open editors. Use an updated Chrome, Firefox, Safari or the app.",
  "Dieser Browser kann die Verschlüsselung offener Editoren nicht koordinieren. Nutze aktuelles Chrome, Firefox, Safari oder die App.",
  "Ce navigateur ne peut pas coordonner le chiffrement entre éditeurs. Utilisez Chrome, Firefox, Safari à jour ou l’application.",
  "Este navegador não coordena a cifragem entre editores. Use Chrome, Firefox, Safari atualizado ou a aplicação.",
  "Il browser non coordina la cifratura tra editor. Usa Chrome, Firefox, Safari aggiornato o l’app.",
  "開いている編集画面間の暗号化を調整できません。最新のChrome、Firefox、Safariまたはアプリを使ってください。",
  "이 브라우저는 열린 편집기 간 암호화를 조정할 수 없습니다. 최신 Chrome, Firefox, Safari 또는 앱을 사용하세요."
 ],
 "La contraseña no es correcta o la nota está dañada.": [
  "La contraseña no es correcta o la nota está dañada.",
  "Incorrect password or damaged note.",
  "Falsches Passwort oder beschädigte Notiz.",
  "Mot de passe incorrect ou note endommagée.",
  "Palavra-passe incorreta ou nota danificada.",
  "Password errata o nota danneggiata.",
  "パスワードが違うか、ノートが破損しています。",
  "비밀번호가 틀렸거나 메모가 손상되었습니다."
 ],
 "La contraseña debe tener al menos 4 caracteres.": [
  "La contraseña debe tener al menos 4 caracteres.",
  "Password needs at least 4 characters.",
  "Passwort muss mindestens 4 Zeichen haben.",
  "Le mot de passe doit contenir au moins 4 caractères.",
  "A palavra-passe precisa de pelo menos 4 caracteres.",
  "La password deve avere almeno 4 caratteri.",
  "パスワードは4文字以上必要です。",
  "비밀번호는 최소 4자여야 합니다."
 ],
 "La contraseña es demasiado larga.": [
  "La contraseña es demasiado larga.",
  "Password is too long.",
  "Passwort ist zu lang.",
  "Le mot de passe est trop long.",
  "A palavra-passe é demasiado longa.",
  "La password è troppo lunga.",
  "パスワードが長すぎます。",
  "비밀번호가 너무 깁니다."
 ],
 "La nota cambió en otro lugar. Cierra y vuelve a abrir antes de guardar.": [
  "La nota cambió en otro lugar. Cierra y vuelve a abrir antes de guardar.",
  "The note changed elsewhere. Close and reopen before saving.",
  "Die Notiz wurde anderswo geändert. Vor dem Speichern schließen und erneut öffnen.",
  "La note a changé ailleurs. Fermez et rouvrez avant d’enregistrer.",
  "A nota mudou noutro lugar. Feche e reabra antes de guardar.",
  "La nota è cambiata altrove. Chiudi e riapri prima di salvare.",
  "別の場所で変更されました。保存前に閉じて再度開いてください。",
  "다른 곳에서 변경되었습니다. 저장 전에 닫았다가 다시 여세요."
 ],
 "El dibujo cambió. Cierra y vuelve a abrir antes de proteger.": [
  "El dibujo cambió. Cierra y vuelve a abrir antes de proteger.",
  "The drawing changed. Close and reopen before protecting.",
  "Die Zeichnung wurde geändert. Vor dem Schützen erneut öffnen.",
  "Le dessin a changé. Fermez et rouvrez avant de protéger.",
  "O desenho mudou. Feche e reabra antes de proteger.",
  "Il disegno è cambiato. Chiudi e riapri prima di proteggere.",
  "描画が変更されました。保護する前に閉じて再度開いてください。",
  "그림이 변경되었습니다. 보호하기 전에 닫았다가 다시 여세요."
 ],
 "Los adjuntos superan 2 MB en total. Esta nota se conserva sin cambios; reduce sus adjuntos antes de protegerla.": [
  "Los adjuntos superan 2 MB en total. Esta nota se conserva sin cambios; reduce sus adjuntos antes de protegerla.",
  "Attachments exceed 2 MB total. The note is unchanged; reduce attachments before protecting it.",
  "Anhänge überschreiten insgesamt 2 MB. Die Notiz bleibt unverändert; reduziere Anhänge vor dem Schützen.",
  "Les pièces jointes dépassent 2 Mo. La note reste inchangée ; réduisez-les avant de protéger.",
  "Os anexos excedem 2 MB. A nota não mudou; reduza os anexos antes de proteger.",
  "Gli allegati superano 2 MB totali. La nota è invariata; riducili prima di proteggerla.",
  "添付が合計2 MBを超えています。ノートは変更されていません。保護前に添付を減らしてください。",
  "첨부 파일이 총 2 MB를 초과합니다. 메모는 변경되지 않았습니다. 보호 전에 첨부 파일을 줄이세요."
 ],
 "La nota supera el tamaño de cifrado permitido. Se conserva sin cambios.": [
  "La nota supera el tamaño de cifrado permitido. Se conserva sin cambios.",
  "The note exceeds the encryption size limit. It is unchanged.",
  "Die Notiz überschreitet das Verschlüsselungslimit. Sie bleibt unverändert.",
  "La note dépasse la taille de chiffrement autorisée. Elle reste inchangée.",
  "A nota excede o tamanho permitido para cifragem. Conserva-se sem alterações.",
  "La nota supera il limite di cifratura. Resta invariata.",
  "暗号化のサイズ上限を超えています。変更されていません。",
  "암호화 크기 한도를 초과합니다. 메모는 변경되지 않았습니다."
 ],
 "Guarda y sincroniza los cambios pendientes antes de proteger esta nota.": [
  "Guarda y sincroniza los cambios pendientes antes de proteger esta nota.",
  "Save and sync pending changes before protecting this note.",
  "Speichere und synchronisiere ausstehende Änderungen vor dem Schützen.",
  "Enregistrez et synchronisez les changements avant de protéger.",
  "Guarde e sincronize as alterações pendentes antes de proteger.",
  "Salva e sincronizza le modifiche prima di proteggere.",
  "保護する前に未保存の変更を保存して同期してください。",
  "보호하기 전에 대기 중인 변경 사항을 저장하고 동기화하세요."
 ],
 "Hay un borrador pendiente de esta nota. Ábrelo y guárdalo antes de protegerla.": [
  "Hay un borrador pendiente de esta nota. Ábrelo y guárdalo antes de protegerla.",
  "This note has a pending draft. Open and save it before protecting.",
  "Es gibt einen Entwurf. Öffne und speichere ihn vor dem Schützen.",
  "Un brouillon est en attente. Ouvrez-le et enregistrez avant de protéger.",
  "Há um rascunho pendente. Abra e guarde antes de proteger.",
  "C’è una bozza in sospeso. Aprila e salvala prima di proteggere.",
  "下書きがあります。保護前に開いて保存してください。",
  "대기 중인 초안이 있습니다. 보호 전에 열어서 저장하세요."
 ],
 "Esta nota tiene una captura alojada fuera del cifrado. Descárgala, elimina la captura de la nota y añádela como archivo local antes de protegerla.": [
  "Esta nota tiene una captura alojada fuera del cifrado. Descárgala, elimina la captura de la nota y añádela como archivo local antes de protegerla.",
  "This note has an image outside encryption. Download it, remove the capture and add it as a local file before protecting.",
  "Diese Notiz hat ein unverschlüsseltes Bild. Lade es herunter, entferne die Aufnahme und füge es vor dem Schützen als lokale Datei hinzu.",
  "Cette note contient une capture hors chiffrement. Téléchargez-la, retirez-la et ajoutez-la comme fichier local avant de protéger.",
  "A captura está fora da cifragem. Descarregue-a, remova-a da nota e adicione-a como ficheiro local antes de proteger.",
  "L’immagine è fuori dalla cifratura. Scaricala, rimuovila e aggiungila come file locale prima di proteggere.",
  "暗号化外の画像があります。ダウンロードしてノートから削除し、ローカルファイルとして追加してから保護してください。",
  "암호화 외부의 이미지가 있습니다. 다운로드하고 메모에서 제거한 후 로컬 파일로 추가하여 보호하세요."
 ],
 "Inicia sesión para compartir una nota protegida.": [
  "Inicia sesión para compartir una nota protegida.",
  "Sign in to share a protected note.",
  "Melde dich an, um geschützte Notizen zu teilen.",
  "Connectez-vous pour partager une note protégée.",
  "Inicie sessão para partilhar uma nota protegida.",
  "Accedi per condividere una nota protetta.",
  "保護ノートを共有するにはログインしてください。",
  "보호된 메모를 공유하려면 로그인하세요."
 ],
 "Solo la persona propietaria de la pizarra puede modificar o compartir esta nota.": [
  "Solo la persona propietaria de la pizarra puede modificar o compartir esta nota.",
  "Only the board owner can modify or share this note.",
  "Nur der Eigentümer kann diese Notiz ändern oder teilen.",
  "Seul le propriétaire du tableau peut modifier ou partager cette note.",
  "Só o proprietário da pizarra pode alterar ou partilhar esta nota.",
  "Solo il proprietario della bacheca può modificare o condividere questa nota.",
  "ボードの所有者のみ変更や共有ができます。",
  "보드 소유자만 이 메모를 수정하거나 공유할 수 있습니다."
 ],
 "El cifrado necesita HTTPS o la aplicación instalada.": [
  "El cifrado necesita HTTPS o la aplicación instalada.",
  "Encryption requires HTTPS or the installed app.",
  "Verschlüsselung benötigt HTTPS oder die installierte App.",
  "Le chiffrement nécessite HTTPS ou l’application installée.",
  "A cifragem precisa de HTTPS ou da aplicação instalada.",
  "La cifratura richiede HTTPS o l’app installata.",
  "暗号化にはHTTPSまたはインストール済みアプリが必要です。",
  "암호화에는 HTTPS 또는 설치된 앱이 필요합니다."
 ],
 "La nota está cifrada, pero no se han podido retirar todos los adjuntos locales anteriores. Mantén este dispositivo privado y reabre la aplicación para reintentar la limpieza.": [
  "La nota está cifrada, pero no se han podido retirar todos los adjuntos locales anteriores. Mantén este dispositivo privado y reabre la aplicación para reintentar la limpieza.",
  "The note is encrypted, but some previous local attachments could not be removed. Keep this device private and reopen the app to retry cleanup.",
  "Die Notiz ist verschlüsselt, aber alte lokale Anhänge konnten nicht vollständig entfernt werden. Halte das Gerät privat und öffne die App erneut.",
  "La note est chiffrée, mais certains anciens fichiers locaux n’ont pas été retirés. Gardez cet appareil privé et rouvrez l’application.",
  "A nota está cifrada, mas alguns anexos locais anteriores não foram retirados. Mantenha o dispositivo privado e reabra a aplicação.",
  "La nota è cifrata, ma alcuni vecchi allegati locali non sono stati rimossi. Mantieni privato il dispositivo e riapri l’app.",
  "暗号化済みですが、古いローカル添付の一部を削除できませんでした。端末を他人に渡さず、アプリを再度開いて削除を再試行してください。",
  "메모는 암호화되었지만 이전 로컬 첨부 파일 일부를 제거하지 못했습니다. 기기를 비공개로 유지하고 앱을 다시 열어 정리를 시도하세요."
 ],
 "La operación no está disponible. No se ha confirmado ningún cambio. Comprueba la conexión y la configuración del servidor.": [
  "La operación no está disponible. No se ha confirmado ningún cambio. Comprueba la conexión y la configuración del servidor.",
  "Operation unavailable. No change is confirmed. Check connection and server configuration.",
  "Vorgang nicht verfügbar. Keine Änderung bestätigt. Prüfe Verbindung und Serverkonfiguration.",
  "Opération indisponible. Aucun changement confirmé. Vérifiez la connexion et le serveur.",
  "Operação indisponível. Nenhuma alteração confirmada. Verifique a ligação e o servidor.",
  "Operazione non disponibile. Nessuna modifica confermata. Verifica connessione e server.",
  "操作できません。変更は確認されていません。接続とサーバー設定を確認してください。",
  "작업을 사용할 수 없습니다. 변경이 확인되지 않았습니다. 연결과 서버 설정을 확인하세요."
 ],
 " Entiendo que se retirarán las versiones anteriores de este espacio de la papelera y los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias ya descargadas no se pueden retirar.": [
  " Entiendo que se retirarán las versiones anteriores de este espacio de la papelera y los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias ya descargadas no se pueden retirar.",
  " I understand that previous versions in this workspace’s trash will be removed and original local attachments will be included in the encrypted content. Downloaded copies cannot be withdrawn.",
  " Ich verstehe, dass frühere Versionen im Papierkorb entfernt und lokale Originalanhänge verschlüsselt werden. Heruntergeladene Kopien können nicht zurückgenommen werden.",
  " Je comprends que les anciennes versions dans la corbeille seront retirées et les fichiers locaux originaux inclus dans le contenu chiffré. Les copies téléchargées ne peuvent pas être retirées.",
  " Compreendo que as versões anteriores na lixeira serão retiradas e os anexos locais originais incluídos no conteúdo cifrado. As cópias descarregadas não podem ser retiradas.",
  " Comprendo che le vecchie versioni nel cestino saranno rimosse e gli allegati locali originali inclusi nel contenuto cifrato. Le copie scaricate non possono essere ritirate.",
  " ゴミ箱の以前の版は削除され、元のローカル添付は暗号化データに含まれることを理解しました。ダウンロード済みコピーは回収できません。",
  " 휴지통의 이전 버전이 제거되고 원본 로컬 첨부 파일이 암호화된 내용에 포함됨을 이해합니다. 다운로드한 사본은 회수할 수 없습니다."
 ],
 " Entiendo que los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias y versiones guardadas anteriormente fuera de esta nota no se pueden retirar.": [
  " Entiendo que los adjuntos locales originales quedarán dentro del contenido cifrado. Las copias y versiones guardadas anteriormente fuera de esta nota no se pueden retirar.",
  " I understand that original local attachments will be included in encrypted content. Copies and versions previously saved outside this note cannot be withdrawn.",
  " Ich verstehe, dass lokale Originalanhänge verschlüsselt werden. Frühere Kopien und Versionen außerhalb der Notiz können nicht zurückgenommen werden.",
  " Je comprends que les fichiers locaux originaux seront chiffrés. Les copies et versions précédemment enregistrées hors de cette note ne peuvent pas être retirées.",
  " Compreendo que os anexos locais originais serão cifrados. Cópias e versões guardadas fora desta nota não podem ser retiradas.",
  " Comprendo che gli allegati locali originali saranno cifrati. Le copie e versioni già salvate fuori dalla nota non possono essere ritirate.",
  " 元のローカル添付が暗号化されることを理解しました。このノート外に保存済みのコピーや版は回収できません。",
  " 원본 로컬 첨부 파일이 암호화됨을 이해합니다. 이 메모 외부에 저장된 사본과 버전은 회수할 수 없습니다."
 ],
 "El estilo original no es compatible con esta versión; se conserva dentro de la nota cifrada.": [
  "El estilo original no es compatible con esta versión; se conserva dentro de la nota cifrada.",
  "The original style is unsupported in this version; it remains in the encrypted note.",
  "Der ursprüngliche Stil wird nicht unterstützt; er bleibt in der verschlüsselten Notiz.",
  "Le style d’origine n’est pas compatible ; il reste dans la note chiffrée.",
  "O estilo original não é compatível; conserva-se na nota cifrada.",
  "Lo stile originale non è compatibile; resta nella nota cifrata.",
  "元のスタイルに対応していませんが、暗号化ノート内に保存されています。",
  "원래 스타일은 이 버전에서 지원되지 않지만 암호화된 메모에 보존됩니다."
 ],
 "Te comparto una nota protegida de PostisPop. La contraseña te la comunicaré aparte. ": [
  "Te comparto una nota protegida de PostisPop. La contraseña te la comunicaré aparte. ",
  "I’m sharing a protected PostisPop note. I’ll send the password separately. ",
  "Ich teile eine geschützte PostisPop-Notiz. Das Passwort sende ich separat. ",
  "Je partage une note PostisPop protégée. Je transmettrai le mot de passe séparément. ",
  "Partilho uma nota protegida de PostisPop. Enviarei a palavra-passe separadamente. ",
  "Condivido una nota PostisPop protetta. Invierò la password separatamente. ",
  "保護されたPostisPopノートを共有します。パスワードは別にお知らせします。",
  "보호된 PostisPop 메모를 공유합니다. 비밀번호는 따로 보내겠습니다. "
 ],
 "El texto descifrado solo permanece en esta ventana.": [
  "El texto descifrado solo permanece en esta ventana.",
  "Decrypted text stays only in this window.",
  "Entschlüsselter Text bleibt nur in diesem Fenster.",
  "Le texte déchiffré reste uniquement dans cette fenêtre.",
  "O texto decifrado permanece apenas nesta janela.",
  "Il testo decifrato resta solo in questa finestra.",
  "復号した文字はこの画面内にのみ保持されます。",
  "복호화된 텍스트는 이 창에만 유지됩니다."
 ],
 "Nota protegida. Abrir con contraseña.": [
  "Nota protegida. Abrir con contraseña.",
  "Protected note. Open with password.",
  "Geschützte Notiz. Mit Passwort öffnen.",
  "Note protégée. Ouvrir avec un mot de passe.",
  "Nota protegida. Abrir com palavra-passe.",
  "Nota protetta. Apri con password.",
  "保護ノート。パスワードで開きます。",
  "보호된 메모. 비밀번호로 여세요."
 ],
 "Selecciona una copia para revisar cuántas notas contiene.": [
  "Selecciona una copia para revisar cuántas notas contiene.",
  "Choose a backup to review its note count.",
  "Wähle eine Sicherung, um die Anzahl der Notizen zu prüfen.",
  "Choisissez une sauvegarde pour vérifier son nombre de notes.",
  "Selecione uma cópia para rever o número de notas.",
  "Scegli una copia per verificare il numero di note.",
  "バックアップを選んでノート数を確認してください。",
  "메모 수를 확인하려면 백업을 선택하세요."
 ],
 "La copia no contiene notas para añadir.": [
  "La copia no contiene notas para añadir.",
  "This backup has no notes to add.",
  "Diese Sicherung enthält keine Notizen zum Hinzufügen.",
  "Cette sauvegarde ne contient aucune note à ajouter.",
  "A cópia não contém notas para adicionar.",
  "La copia non contiene note da aggiungere.",
  "追加できるノートがありません。",
  "추가할 메모가 없습니다."
 ],
 "No se pudo abrir la restauración. Conserva tu archivo de copia.": [
  "No se pudo abrir la restauración. Conserva tu archivo de copia.",
  "Could not open restore. Keep your backup file.",
  "Wiederherstellung konnte nicht geöffnet werden. Bewahre die Sicherung auf.",
  "Restauration impossible à ouvrir. Conservez votre fichier.",
  "Não foi possível abrir a restauração. Conserve o ficheiro.",
  "Impossibile aprire il ripristino. Conserva il file di copia.",
  "復元を開けませんでした。バックアップを保管してください。",
  "복원을 열지 못했습니다. 백업 파일을 보관하세요."
 ],
 "Añade texto, colores, estilos, dibujos y notas cifradas a espacios vacíos. Incluye los archivos y enlaces de la copia. Los archivos se restauran en este dispositivo; las notas protegidas conservan su cifrado. Las notas actuales se conservan. Máximo 50 MB.": [
  "Añade texto, colores, estilos, dibujos y notas cifradas a espacios vacíos. Incluye los archivos y enlaces de la copia. Los archivos se restauran en este dispositivo; las notas protegidas conservan su cifrado. Las notas actuales se conservan. Máximo 50 MB.",
  "Adds text, colors, styles, drawings and encrypted notes to empty slots, including backup files and links. Files restore on this device; protected notes stay encrypted. Current notes are kept. Maximum 50 MB.",
  "Fügt Text, Farben, Stile, Zeichnungen und verschlüsselte Notizen in leere Plätze ein, einschließlich Dateien und Links. Dateien werden auf diesem Gerät wiederhergestellt. Geschützte Notizen bleiben verschlüsselt, aktuelle Notizen erhalten. Maximal 50 MB.",
  "Ajoute texte, couleurs, styles, dessins et notes chiffrées aux emplacements vides, avec fichiers et liens. Les fichiers sont restaurés sur cet appareil, les notes protégées restent chiffrées et les notes actuelles sont conservées. Maximum 50 Mo.",
  "Adiciona texto, cores, estilos, desenhos e notas cifradas aos espaços vazios, incluindo ficheiros e ligações. Os ficheiros restauram-se neste dispositivo; as notas protegidas ficam cifradas e as atuais conservam-se. Máximo 50 MB.",
  "Aggiunge testo, colori, stili, disegni e note cifrate agli spazi vuoti, con file e link. I file si ripristinano su questo dispositivo; le note protette restano cifrate e quelle attuali sono conservate. Massimo 50 MB.",
  "文字、色、スタイル、描画、暗号化ノートを空き枠に追加し、ファイルとリンクも含めます。ファイルはこの端末に復元します。保護は維持され、既存のノートは残ります。最大50 MB。",
  "텍스트, 색상, 스타일, 그림 및 암호화된 메모를 빈 공간에 추가하며 파일과 링크도 포함합니다. 파일은 이 기기에 복원되며 보호된 메모와 기존 메모는 유지됩니다. 최대 50 MB."
 ],
 "Necesita conexión. Se respetan el límite de tu plan y los espacios disponibles. Los adjuntos locales de otro dispositivo no pueden comprobarse aquí.": [
  "Necesita conexión. Se respetan el límite de tu plan y los espacios disponibles. Los adjuntos locales de otro dispositivo no pueden comprobarse aquí.",
  "Connection required. Plan limits and empty slots apply. Local attachments on other devices cannot be checked here.",
  "Verbindung erforderlich. Tariflimits und freie Plätze gelten. Lokale Anhänge anderer Geräte können hier nicht geprüft werden.",
  "Connexion nécessaire. Les limites du forfait et emplacements libres s’appliquent. Les fichiers locaux d’autres appareils ne peuvent pas être vérifiés ici.",
  "Precisa de ligação. Aplicam-se os limites do plano e espaços livres. Não é possível verificar anexos locais de outros dispositivos.",
  "Serve una connessione. Si applicano limiti del piano e spazi liberi. Gli allegati locali di altri dispositivi non sono verificabili qui.",
  "接続が必要です。プランの上限と空き枠を適用します。他の端末のローカル添付はここでは確認できません。",
  "연결이 필요합니다. 요금제 한도와 빈 공간이 적용됩니다. 다른 기기의 로컬 첨부 파일은 여기에서 확인할 수 없습니다."
 ],
 "{count} notas con contenido. Se añadirán sin sustituir las actuales.": [
  "{count} notas con contenido. Se añadirán sin sustituir las actuales.",
  "{count} notes with content. Added without replacing current notes.",
  "{count} Notizen mit Inhalt. Aktuelle Notizen werden nicht ersetzt.",
  "{count} notes avec contenu. Ajoutées sans remplacer les notes actuelles.",
  "{count} notas com conteúdo. Adicionadas sem substituir as atuais.",
  "{count} note con contenuti. Aggiunte senza sostituire quelle attuali.",
  "内容のあるノート{count}件。既存のノートを置き換えず追加します。",
  "내용이 있는 메모 {count}개. 기존 메모를 대체하지 않고 추가합니다."
 ],
 "Guardado en este dispositivo": [
  "Guardado en este dispositivo",
  "Saved on this device",
  "Auf diesem Gerät gespeichert",
  "Enregistré sur cet appareil",
  "Guardado neste dispositivo",
  "Salvato sul dispositivo",
  "この端末に保存済み",
  "이 기기에 저장됨"
 ],
 "Guardado en la nube": [
  "Guardado en la nube",
  "Saved in the cloud",
  "In der Cloud gespeichert",
  "Enregistré dans le cloud",
  "Guardado na nuvem",
  "Salvato nel cloud",
  "クラウドに保存済み",
  "클라우드에 저장됨"
 ],
 "Error al guardar. Conserva el borrador y vuelve a intentarlo.": [
  "Error al guardar. Conserva el borrador y vuelve a intentarlo.",
  "Save failed. Keep the draft and retry.",
  "Speichern fehlgeschlagen. Bewahre den Entwurf auf und versuche es erneut.",
  "Échec de l’enregistrement. Gardez le brouillon et réessayez.",
  "Erro ao guardar. Conserve o rascunho e tente novamente.",
  "Salvataggio fallito. Conserva la bozza e riprova.",
  "保存に失敗しました。下書きを残して再試行してください。",
  "저장에 실패했습니다. 초안을 보관하고 다시 시도하세요."
 ],
 "No hay suficientes notas vacías o la copia supera el límite de tu plan. No se ha sustituido ninguna nota.": [
  "No hay suficientes notas vacías o la copia supera el límite de tu plan. No se ha sustituido ninguna nota.",
  "Not enough empty notes or backup exceeds your plan limit. No notes replaced.",
  "Nicht genug leere Notizen oder Tariflimit überschritten. Keine Notiz ersetzt.",
  "Pas assez de notes vides ou limite du forfait dépassée. Aucune note remplacée.",
  "Notas vazias insuficientes ou limite do plano excedido. Nenhuma nota substituída.",
  "Note vuote insufficienti o limite del piano superato. Nessuna nota sostituita.",
  "空き枠が不足しているかプラン上限を超えています。置き換えはありません。",
  "빈 메모가 부족하거나 요금제 한도를 초과합니다. 메모는 대체되지 않았습니다."
 ],
 "La copia supera el límite de notas de tu plan. No se ha importado ninguna nota.": [
  "La copia supera el límite de notas de tu plan. No se ha importado ninguna nota.",
  "Backup exceeds your plan’s note limit. No notes imported.",
  "Sicherung überschreitet das Notizlimit. Keine Notiz importiert.",
  "Sauvegarde au-delà de la limite de notes. Aucune note importée.",
  "A cópia excede o limite de notas. Nenhuma nota importada.",
  "La copia supera il limite di note. Nessuna nota importata.",
  "ノート数の上限を超えています。読み込まれていません。",
  "백업이 메모 한도를 초과합니다. 가져온 메모는 없습니다."
 ],
 "Solo la persona propietaria de la pizarra puede importar notas.": [
  "Solo la persona propietaria de la pizarra puede importar notas.",
  "Only the board owner can import notes.",
  "Nur der Eigentümer kann Notizen importieren.",
  "Seul le propriétaire peut importer des notes.",
  "Só o proprietário pode importar notas.",
  "Solo il proprietario può importare note.",
  "所有者のみノートを読み込めます。",
  "소유자만 메모를 가져올 수 있습니다."
 ],
 "Sincroniza los cambios pendientes y resuelve los conflictos antes de importar.": [
  "Sincroniza los cambios pendientes y resuelve los conflictos antes de importar.",
  "Sync pending changes and resolve conflicts before importing.",
  "Synchronisiere Änderungen und löse Konflikte vor dem Import.",
  "Synchronisez les changements et résolvez les conflits avant d’importer.",
  "Sincronize alterações e resolva conflitos antes de importar.",
  "Sincronizza modifiche e risolvi conflitti prima di importare.",
  "未同期の変更と競合を解決してから読み込んでください。",
  "가져오기 전에 변경 사항을 동기화하고 충돌을 해결하세요."
 ],
 "La importación en cuentas aún no está habilitada en el servidor. Conserva tu copia.": [
  "La importación en cuentas aún no está habilitada en el servidor. Conserva tu copia.",
  "Account import is not enabled on the server yet. Keep your backup.",
  "Kontoimport ist auf dem Server noch nicht aktiviert. Bewahre die Sicherung auf.",
  "L’importation du compte n’est pas activée sur le serveur. Gardez votre sauvegarde.",
  "A importação na conta ainda não está ativa no servidor. Conserve a cópia.",
  "Importazione nell’account non ancora attiva. Conserva la copia.",
  "サーバーでアカウントの読み込みがまだ有効ではありません。バックアップを残してください。",
  "서버에서 계정 가져오기가 아직 활성화되지 않았습니다. 백업을 보관하세요."
 ],
 "Conéctate a internet para importar en tu cuenta. La pizarra local funciona sin conexión.": [
  "Conéctate a internet para importar en tu cuenta. La pizarra local funciona sin conexión.",
  "Connect to import into your account. The local board works offline.",
  "Verbinde dich für den Kontoimport. Die lokale Pinnwand funktioniert offline.",
  "Connectez-vous à internet pour importer dans votre compte. Le tableau local fonctionne hors ligne.",
  "Ligue-se à internet para importar na conta. A pizarra local funciona sem ligação.",
  "Connettiti per importare nell’account. La bacheca locale funziona offline.",
  "アカウントに読み込むには接続してください。ローカルボードはオフラインで使えます。",
  "계정으로 가져오려면 인터넷에 연결하세요. 로컬 보드는 오프라인에서 작동합니다."
 ],
 "La cuenta ha cambiado. Cierra este diálogo y vuelve a abrir la importación.": [
  "La cuenta ha cambiado. Cierra este diálogo y vuelve a abrir la importación.",
  "Account changed. Close this dialog and reopen import.",
  "Konto geändert. Schließe den Dialog und öffne den Import erneut.",
  "Le compte a changé. Fermez cette fenêtre et rouvrez l’importation.",
  "A conta mudou. Feche o diálogo e reabra a importação.",
  "Account cambiato. Chiudi la finestra e riapri l’importazione.",
  "アカウントが変わりました。この画面を閉じて読み込みを開き直してください。",
  "계정이 변경되었습니다. 대화 상자를 닫고 가져오기를 다시 여세요."
 ],
 "Inicia sesión de nuevo antes de importar.": [
  "Inicia sesión de nuevo antes de importar.",
  "Sign in again before importing.",
  "Melde dich vor dem Import erneut an.",
  "Reconnectez-vous avant d’importer.",
  "Inicie sessão novamente antes de importar.",
  "Accedi di nuovo prima di importare.",
  "再ログインしてから読み込んでください。",
  "가져오기 전에 다시 로그인하세요."
 ],
 "La copia no es compatible o contiene una nota dañada. No se ha importado ninguna nota.": [
  "La copia no es compatible o contiene una nota dañada. No se ha importado ninguna nota.",
  "Backup is incompatible or has a damaged note. Nothing imported.",
  "Sicherung inkompatibel oder beschädigte Notiz. Nichts importiert.",
  "Sauvegarde incompatible ou note endommagée. Rien importé.",
  "Cópia incompatível ou nota danificada. Nada importado.",
  "Copia incompatibile o nota danneggiata. Nulla importato.",
  "非対応のバックアップか破損したノートがあります。読み込まれていません。",
  "호환되지 않는 백업이거나 손상된 메모가 있습니다. 가져오지 않았습니다."
 ],
 "La copia usa un estilo que tu plan no incluye. No se ha importado ninguna nota.": [
  "La copia usa un estilo que tu plan no incluye. No se ha importado ninguna nota.",
  "Backup uses a style outside your plan. Nothing imported.",
  "Stil nicht im Tarif enthalten. Nichts importiert.",
  "Style non inclus dans votre forfait. Rien importé.",
  "Estilo não incluído no plano. Nada importado.",
  "Stile non incluso nel piano. Nulla importato.",
  "プランに含まれないスタイルです。読み込まれていません。",
  "요금제에 포함되지 않은 스타일입니다. 가져오지 않았습니다."
 ],
 "La copia contiene un estilo no compatible. No se ha importado ninguna nota.": [
  "La copia contiene un estilo no compatible. No se ha importado ninguna nota.",
  "Backup contains an unsupported style. Nothing imported.",
  "Sicherung enthält einen nicht unterstützten Stil. Nichts importiert.",
  "Style incompatible dans la sauvegarde. Rien importé.",
  "Estilo incompatível na cópia. Nada importado.",
  "Stile incompatibile nella copia. Nulla importato.",
  "非対応のスタイルが含まれています。読み込まれていません。",
  "지원되지 않는 스타일이 포함되어 있습니다. 가져오지 않았습니다."
 ],
 "La copia contiene una nota cifrada dañada. No se ha importado ninguna nota.": [
  "La copia contiene una nota cifrada dañada. No se ha importado ninguna nota.",
  "Backup contains a damaged encrypted note. Nothing imported.",
  "Beschädigte verschlüsselte Notiz in der Sicherung. Nichts importiert.",
  "Note chiffrée endommagée dans la sauvegarde. Rien importé.",
  "Nota cifrada danificada na cópia. Nada importado.",
  "Nota cifrata danneggiata nella copia. Nulla importato.",
  "暗号化ノートが破損しています。読み込まれていません。",
  "암호화된 메모가 손상되었습니다. 가져오지 않았습니다."
 ],
 "El archivo supera el tamaño máximo indicado.": [
  "El archivo supera el tamaño máximo indicado.",
  "File exceeds the stated size limit.",
  "Datei überschreitet das angegebene Größenlimit.",
  "Le fichier dépasse la taille maximale indiquée.",
  "O ficheiro excede o tamanho máximo indicado.",
  "Il file supera la dimensione massima indicata.",
  "ファイルが指定のサイズ上限を超えています。",
  "파일이 표시된 크기 한도를 초과합니다."
 ],
 "El almacenamiento de este dispositivo está lleno. Conserva el archivo de copia.": [
  "El almacenamiento de este dispositivo está lleno. Conserva el archivo de copia.",
  "Device storage is full. Keep your backup file.",
  "Gerätespeicher voll. Bewahre die Sicherung auf.",
  "Stockage de l’appareil plein. Gardez la sauvegarde.",
  "Armazenamento do dispositivo cheio. Conserve a cópia.",
  "Memoria del dispositivo piena. Conserva la copia.",
  "端末の容量がいっぱいです。バックアップを残してください。",
  "기기 저장 공간이 가득 찼습니다. 백업을 보관하세요."
 ],
 "No se pudo preparar un reintento seguro. Libera almacenamiento y conserva tu copia.": [
  "No se pudo preparar un reintento seguro. Libera almacenamiento y conserva tu copia.",
  "Could not prepare a safe retry. Free storage and keep your backup.",
  "Sicherer Wiederholungsversuch nicht möglich. Schaffe Platz und bewahre die Sicherung auf.",
  "Nouvel essai sécurisé impossible. Libérez du stockage et gardez la sauvegarde.",
  "Não foi possível preparar nova tentativa segura. Liberte espaço e conserve a cópia.",
  "Impossibile preparare un tentativo sicuro. Libera spazio e conserva la copia.",
  "安全な再試行を準備できませんでした。空き容量を確保しバックアップを残してください。",
  "안전한 재시도를 준비하지 못했습니다. 공간을 확보하고 백업을 보관하세요."
 ],
 "Este navegador no permite coordinar la importación con los adjuntos. Prueba un navegador actualizado.": [
  "Este navegador no permite coordinar la importación con los adjuntos. Prueba un navegador actualizado.",
  "This browser cannot coordinate import and attachments. Try an updated browser.",
  "Dieser Browser kann Import und Anhänge nicht koordinieren. Nutze einen aktuellen Browser.",
  "Ce navigateur ne coordonne pas importation et fichiers. Essayez un navigateur à jour.",
  "O navegador não coordena importação e anexos. Use um navegador atualizado.",
  "Il browser non coordina importazione e allegati. Usa un browser aggiornato.",
  "読み込みと添付の処理を調整できません。最新ブラウザーを使ってください。",
  "가져오기와 첨부 파일을 조정할 수 없습니다. 최신 브라우저를 사용하세요."
 ],
 "La copia contiene un adjunto no compatible. No se ha restaurado.": [
  "La copia contiene un adjunto no compatible. No se ha restaurado.",
  "Backup has an unsupported attachment. Not restored.",
  "Nicht unterstützter Anhang. Nicht wiederhergestellt.",
  "Pièce jointe incompatible. Non restaurée.",
  "Anexo incompatível na cópia. Não restaurado.",
  "Allegato incompatibile. Non ripristinato.",
  "非対応の添付です。復元されていません。",
  "지원되지 않는 첨부 파일입니다. 복원하지 않았습니다."
 ],
 "Un archivo de la copia está dañado. Conserva el original y vuelve a exportarlo.": [
  "Un archivo de la copia está dañado. Conserva el original y vuelve a exportarlo.",
  "A backup file is damaged. Keep the original and export again.",
  "Datei der Sicherung beschädigt. Bewahre das Original auf und exportiere erneut.",
  "Un fichier de la sauvegarde est endommagé. Gardez l’original et exportez à nouveau.",
  "Um ficheiro da cópia está danificado. Conserve o original e exporte novamente.",
  "Un file della copia è danneggiato. Conserva l’originale ed esporta di nuovo.",
  "バックアップのファイルが破損しています。元のファイルを残し、再度書き出してください。",
  "백업 파일이 손상되었습니다. 원본을 보관하고 다시 내보내세요."
 ],
 "No se pudo vincular cada archivo a su nota. Conserva la copia y reintenta.": [
  "No se pudo vincular cada archivo a su nota. Conserva la copia y reintenta.",
  "Could not match files to their notes. Keep the backup and retry.",
  "Dateien konnten nicht den Notizen zugeordnet werden. Bewahre die Sicherung auf und versuche erneut.",
  "Association des fichiers aux notes impossible. Gardez la sauvegarde et réessayez.",
  "Não foi possível ligar ficheiros às notas. Conserve a cópia e tente novamente.",
  "Impossibile associare file alle note. Conserva la copia e riprova.",
  "ファイルをノートに関連付けできませんでした。バックアップを残して再試行してください。",
  "파일을 메모에 연결하지 못했습니다. 백업을 보관하고 다시 시도하세요."
 ],
 "No se pudieron guardar los archivos en este dispositivo. Libera espacio y reintenta con la misma copia.": [
  "No se pudieron guardar los archivos en este dispositivo. Libera espacio y reintenta con la misma copia.",
  "Could not save files on this device. Free space and retry the same backup.",
  "Dateien konnten nicht gespeichert werden. Schaffe Platz und nutze dieselbe Sicherung erneut.",
  "Fichiers non enregistrés sur cet appareil. Libérez de l’espace et réessayez la même sauvegarde.",
  "Não foi possível guardar os ficheiros. Liberte espaço e tente a mesma cópia.",
  "Impossibile salvare i file. Libera spazio e riprova la stessa copia.",
  "端末にファイルを保存できません。空き容量を確保して同じバックアップで再試行してください。",
  "기기에 파일을 저장하지 못했습니다. 공간을 확보하고 같은 백업으로 다시 시도하세요."
 ],
 "No se pudo deshacer una restauración de archivos incompleta. Conserva tu copia y vuelve a intentarlo.": [
  "No se pudo deshacer una restauración de archivos incompleta. Conserva tu copia y vuelve a intentarlo.",
  "Could not undo an incomplete file restore. Keep your backup and retry.",
  "Unvollständige Dateiwiederherstellung konnte nicht rückgängig gemacht werden. Bewahre die Sicherung auf und versuche erneut.",
  "Restauration incomplète impossible à annuler. Gardez la sauvegarde et réessayez.",
  "Não foi possível desfazer a restauração incompleta. Conserve a cópia e tente novamente.",
  "Impossibile annullare un ripristino incompleto. Conserva la copia e riprova.",
  "不完全なファイル復元を取り消せませんでした。バックアップを残して再試行してください。",
  "불완전한 파일 복원을 취소하지 못했습니다. 백업을 보관하고 다시 시도하세요."
 ],
 "No se pudieron comprobar los adjuntos locales. Cierra otras pestañas y vuelve a intentarlo.": [
  "No se pudieron comprobar los adjuntos locales. Cierra otras pestañas y vuelve a intentarlo.",
  "Could not check local attachments. Close other tabs and retry.",
  "Lokale Anhänge konnten nicht geprüft werden. Schließe andere Tabs und versuche erneut.",
  "Vérification des fichiers locaux impossible. Fermez les autres onglets et réessayez.",
  "Não foi possível verificar anexos locais. Feche outros separadores e tente novamente.",
  "Impossibile verificare allegati locali. Chiudi altre schede e riprova.",
  "ローカル添付を確認できませんでした。他のタブを閉じて再試行してください。",
  "로컬 첨부 파일을 확인하지 못했습니다. 다른 탭을 닫고 다시 시도하세요."
 ],
 "La pizarra cambió durante la restauración. Vuelve a intentarlo con la misma copia; no se duplicarán las notas ya añadidas.": [
  "La pizarra cambió durante la restauración. Vuelve a intentarlo con la misma copia; no se duplicarán las notas ya añadidas.",
  "Board changed during restore. Retry the same backup; already added notes will not duplicate.",
  "Pinnwand während Wiederherstellung geändert. Nutze dieselbe Sicherung erneut; keine doppelten Notizen.",
  "Le tableau a changé pendant la restauration. Réessayez la même sauvegarde ; pas de notes en double.",
  "A pizarra mudou durante a restauração. Tente a mesma cópia; não haverá notas duplicadas.",
  "Bacheca cambiata durante il ripristino. Riprova la stessa copia; le note aggiunte non saranno duplicate.",
  "復元中にボードが変更されました。同じバックアップで再試行してください。追加済みノートは重複しません。",
  "복원 중 보드가 변경되었습니다. 같은 백업으로 다시 시도하세요. 추가된 메모는 중복되지 않습니다."
 ],
 "Este reintento no coincide con la copia original. Conserva el archivo y vuelve a abrir el diálogo.": [
  "Este reintento no coincide con la copia original. Conserva el archivo y vuelve a abrir el diálogo.",
  "This retry does not match the original backup. Keep the file and reopen the dialog.",
  "Dieser Versuch passt nicht zur ursprünglichen Sicherung. Bewahre die Datei auf und öffne den Dialog erneut.",
  "Cet essai ne correspond pas à la sauvegarde originale. Gardez le fichier et rouvrez la fenêtre.",
  "A tentativa não coincide com a cópia original. Conserve o ficheiro e reabra o diálogo.",
  "Il tentativo non corrisponde alla copia originale. Conserva il file e riapri la finestra.",
  "元のバックアップと一致しません。ファイルを残して画面を開き直してください。",
  "원래 백업과 일치하지 않습니다. 파일을 보관하고 대화 상자를 다시 여세요."
 ],
 "No se pudo confirmar el resultado. Reintenta con la misma copia; la importación en cuenta evita duplicar un envío ya completado.": [
  "No se pudo confirmar el resultado. Reintenta con la misma copia; la importación en cuenta evita duplicar un envío ya completado.",
  "Result could not be confirmed. Retry the same backup; account import prevents duplicating completed imports.",
  "Ergebnis nicht bestätigt. Nutze dieselbe Sicherung erneut; Kontoimport vermeidet Duplikate.",
  "Résultat non confirmé. Réessayez la même sauvegarde ; l’importation du compte évite les doublons.",
  "Resultado não confirmado. Tente a mesma cópia; a importação na conta evita duplicados.",
  "Risultato non confermato. Riprova la stessa copia; l’importazione evita duplicati.",
  "結果を確認できません。同じバックアップで再試行してください。アカウント読み込みは重複を防ぎます。",
  "결과를 확인하지 못했습니다. 같은 백업으로 다시 시도하세요. 계정 가져오기는 중복을 방지합니다."
 ],
 "La imagen admite hasta 100 notas. Guarda una copia de seguridad para conservar la pizarra completa.": [
  "La imagen admite hasta 100 notas. Guarda una copia de seguridad para conservar la pizarra completa.",
  "Image supports up to 100 notes. Save a backup to keep the whole board.",
  "Bild unterstützt bis zu 100 Notizen. Sichere die gesamte Pinnwand als Backup.",
  "L’image accepte jusqu’à 100 notes. Sauvegardez pour conserver tout le tableau.",
  "A imagem admite até 100 notas. Guarde uma cópia para conservar toda a pizarra.",
  "L’immagine supporta 100 note. Salva una copia per conservare tutta la bacheca.",
  "画像は最大100ノートです。全体を残すにはバックアップを保存してください。",
  "이미지는 최대 100개 메모를 지원합니다. 전체 보드를 보관하려면 백업을 저장하세요."
 ],
 "No se pudo generar la imagen. Vuelve a intentarlo o guarda una copia de seguridad. Tus notas se conservan.": [
  "No se pudo generar la imagen. Vuelve a intentarlo o guarda una copia de seguridad. Tus notas se conservan.",
  "Could not generate image. Retry or save a backup. Your notes are safe.",
  "Bild konnte nicht erzeugt werden. Versuche erneut oder sichere ein Backup. Notizen bleiben erhalten.",
  "Image impossible à générer. Réessayez ou sauvegardez. Vos notes sont conservées.",
  "Não foi possível gerar a imagem. Tente novamente ou guarde uma cópia. As notas conservam-se.",
  "Impossibile generare l’immagine. Riprova o salva una copia. Le note sono al sicuro.",
  "画像を作成できません。再試行またはバックアップを保存してください。ノートは残っています。",
  "이미지를 생성하지 못했습니다. 다시 시도하거나 백업을 저장하세요. 메모는 보존됩니다."
 ],
 "La copia completa supera 50 MB. Descarga los archivos por separado antes de reducir sus adjuntos. Tus notas se conservan.": [
  "La copia completa supera 50 MB. Descarga los archivos por separado antes de reducir sus adjuntos. Tus notas se conservan.",
  "Full backup exceeds 50 MB. Download files separately before reducing attachments. Notes are kept.",
  "Sicherung überschreitet 50 MB. Lade Dateien separat herunter, bevor du Anhänge reduzierst. Notizen bleiben erhalten.",
  "Sauvegarde supérieure à 50 Mo. Téléchargez les fichiers séparément avant de réduire les pièces jointes. Notes conservées.",
  "A cópia excede 50 MB. Descarregue ficheiros à parte antes de reduzir anexos. As notas conservam-se.",
  "La copia supera 50 MB. Scarica i file separatamente prima di ridurre gli allegati. Note conservate.",
  "バックアップが50 MBを超えています。添付を減らす前にファイルを個別にダウンロードしてください。ノートは残っています。",
  "전체 백업이 50 MB를 초과합니다. 첨부 파일을 줄이기 전에 파일을 따로 다운로드하세요. 메모는 보존됩니다."
 ],
 "Una nota acaba de protegerse. Vuelve a guardar la copia para incluir su versión cifrada.": [
  "Una nota acaba de protegerse. Vuelve a guardar la copia para incluir su versión cifrada.",
  "A note was just protected. Save the backup again to include its encrypted version.",
  "Eine Notiz wurde geschützt. Sichere erneut, um die verschlüsselte Version einzuschließen.",
  "Une note vient d’être protégée. Sauvegardez à nouveau pour inclure sa version chiffrée.",
  "Uma nota foi protegida. Guarde novamente para incluir a versão cifrada.",
  "Una nota è stata protetta. Salva di nuovo per includere la versione cifrata.",
  "ノートが保護されました。暗号化版を含めるためにバックアップを再度保存してください。",
  "메모가 보호되었습니다. 암호화된 버전을 포함하려면 백업을 다시 저장하세요."
 ],
 "No se pudo completar la operación. No se ha descargado una copia incompleta. Tus notas se conservan.": [
  "No se pudo completar la operación. No se ha descargado una copia incompleta. Tus notas se conservan.",
  "Operation failed. No incomplete backup downloaded. Your notes are kept.",
  "Vorgang fehlgeschlagen. Keine unvollständige Sicherung heruntergeladen. Notizen bleiben erhalten.",
  "Opération échouée. Aucune sauvegarde incomplète téléchargée. Notes conservées.",
  "A operação falhou. Nenhuma cópia incompleta foi descarregada. As notas conservam-se.",
  "Operazione fallita. Nessuna copia incompleta scaricata. Note conservate.",
  "操作に失敗しました。不完全なバックアップはダウンロードされていません。ノートは残っています。",
  "작업에 실패했습니다. 불완전한 백업은 다운로드되지 않았습니다. 메모는 보존됩니다."
 ],
 "Copia completa descargada: notas, dibujos y adjuntos de este dispositivo. Las notas protegidas permanecen cifradas.": [
  "Copia completa descargada: notas, dibujos y adjuntos de este dispositivo. Las notas protegidas permanecen cifradas.",
  "Full backup downloaded: notes, drawings and attachments on this device. Protected notes stay encrypted.",
  "Vollständige Sicherung heruntergeladen: Notizen, Zeichnungen und Anhänge dieses Geräts. Geschützte Notizen bleiben verschlüsselt.",
  "Sauvegarde complète téléchargée : notes, dessins et fichiers de cet appareil. Les notes protégées restent chiffrées.",
  "Cópia completa descarregada: notas, desenhos e anexos deste dispositivo. Notas protegidas ficam cifradas.",
  "Copia completa scaricata: note, disegni e allegati del dispositivo. Le note protette restano cifrate.",
  "ノート、描画、この端末の添付を含むバックアップを保存しました。保護ノートは暗号化されたままです。",
  "메모, 그림 및 이 기기의 첨부 파일을 포함한 백업을 다운로드했습니다. 보호된 메모는 암호화 상태입니다."
 ],
 "No se pudo guardar el archivo. Vuelve a intentarlo.": [
  "No se pudo guardar el archivo. Vuelve a intentarlo.",
  "Could not save the file. Try again.",
  "Datei konnte nicht gespeichert werden. Versuche es erneut.",
  "Fichier non enregistré. Réessayez.",
  "Não foi possível guardar o ficheiro. Tente novamente.",
  "Impossibile salvare il file. Riprova.",
  "ファイルを保存できませんでした。再試行してください。",
  "파일을 저장하지 못했습니다. 다시 시도하세요."
 ],
 "Descarga cancelada. Tus notas se conservan.": [
  "Descarga cancelada. Tus notas se conservan.",
  "Download cancelled. Your notes are kept.",
  "Download abgebrochen. Notizen bleiben erhalten.",
  "Téléchargement annulé. Notes conservées.",
  "Transferência cancelada. Notas conservadas.",
  "Download annullato. Note conservate.",
  "ダウンロードを取り消しました。ノートは残っています。",
  "다운로드가 취소되었습니다. 메모는 보존됩니다."
 ],
 "PostisPop · Vista de texto resumida · Guarda una copia de seguridad para conservar todo el texto.": [
  "PostisPop · Vista de texto resumida · Guarda una copia de seguridad para conservar todo el texto.",
  "PostisPop · Text summary · Save a backup to keep all text.",
  "PostisPop · Textübersicht · Sichere ein Backup für den vollständigen Text.",
  "PostisPop · Résumé du texte · Sauvegardez pour conserver tout le texte.",
  "PostisPop · Resumo do texto · Guarde uma cópia para conservar todo o texto.",
  "PostisPop · Riepilogo · Salva una copia per conservare tutto il testo.",
  "PostisPop・文字の要約・全文を残すにはバックアップを保存してください。",
  "PostisPop · 텍스트 요약 · 전체 텍스트를 보관하려면 백업을 저장하세요."
 ],
 "Vista de impresión": [
  "Vista de impresión",
  "Print preview",
  "Druckansicht",
  "Aperçu avant impression",
  "Vista de impressão",
  "Anteprima di stampa",
  "印刷プレビュー",
  "인쇄 미리보기"
 ],
 "Mi pizarra": [
  "Mi pizarra",
  "My board",
  "Meine Pinnwand",
  "Mon tableau",
  "A minha pizarra",
  "La mia bacheca",
  "マイボード",
  "내 보드"
 ],
 "(Nota sin texto)": [
  "(Nota sin texto)",
  "(Note without text)",
  "(Notiz ohne Text)",
  "(Note sans texte)",
  "(Nota sem texto)",
  "(Nota senza testo)",
  "（文字のないノート）",
  "(텍스트 없는 메모)"
 ],
 "Esta nota contiene un dibujo o imagen que no se incluye en esta impresión de texto.": [
  "Esta nota contiene un dibujo o imagen que no se incluye en esta impresión de texto.",
  "This note contains a drawing or image not included in this text printout.",
  "Zeichnung oder Bild dieser Notiz wird nicht im Textausdruck enthalten.",
  "Le dessin ou l’image de cette note n’est pas inclus dans cette impression du texte.",
  "O desenho ou imagem não está incluído nesta impressão do texto.",
  "Il disegno o immagine non è incluso nella stampa del testo.",
  "描画や画像はこの文字の印刷には含まれません。",
  "이 메모의 그림이나 이미지는 텍스트 인쇄에 포함되지 않습니다."
 ],
 "Exportación de texto · Los archivos adjuntos no están incluidos.": [
  "Exportación de texto · Los archivos adjuntos no están incluidos.",
  "Text export · Attachments are not included.",
  "Textexport · Anhänge sind nicht enthalten.",
  "Exportation du texte · Fichiers joints non inclus.",
  "Exportação de texto · Anexos não incluídos.",
  "Esportazione testo · Allegati non inclusi.",
  "文字の書き出し・添付は含まれません。",
  "텍스트 내보내기 · 첨부 파일은 포함되지 않습니다."
 ],
 "Volver a la pizarra": [
  "Volver a la pizarra",
  "Back to board",
  "Zur Pinnwand",
  "Retour au tableau",
  "Voltar à pizarra",
  "Torna alla bacheca",
  "ボードに戻る",
  "보드로 돌아가기"
 ],
 "Páginas de notas": [
  "Páginas de notas",
  "Note pages",
  "Notizseiten",
  "Pages de notes",
  "Páginas de notas",
  "Pagine di note",
  "ノートのページ",
  "메모 페이지"
 ],
 "Página anterior": [
  "Página anterior",
  "Previous page",
  "Vorherige Seite",
  "Page précédente",
  "Página anterior",
  "Pagina precedente",
  "前のページ",
  "이전 페이지"
 ],
 "Página siguiente": [
  "Página siguiente",
  "Next page",
  "Nächste Seite",
  "Page suivante",
  "Página seguinte",
  "Pagina successiva",
  "次のページ",
  "다음 페이지"
 ],
 "Ir a la página": [
  "Ir a la página",
  "Go to page",
  "Zur Seite",
  "Aller à la page",
  "Ir para a página",
  "Vai alla pagina",
  "ページに移動",
  "페이지로 이동"
 ],
 "Añadir nota": [
  "Añadir nota",
  "Add note",
  "Notiz hinzufügen",
  "Ajouter une note",
  "Adicionar nota",
  "Aggiungi nota",
  "ノートを追加",
  "메모 추가"
 ],
 "Añadir nota · sujeto al límite de tu cuenta": [
  "Añadir nota · sujeto al límite de tu cuenta",
  "Add note · account limit applies",
  "Notiz hinzufügen · Kontolimit gilt",
  "Ajouter une note · selon la limite du compte",
  "Adicionar nota · sujeito ao limite da conta",
  "Aggiungi nota · entro il limite dell’account",
  "ノートを追加・アカウントの上限内",
  "메모 추가 · 계정 한도 적용"
 ],
 "Página {page} de {pages}": [
  "Página {page} de {pages}",
  "Page {page} of {pages}",
  "Seite {page} von {pages}",
  "Page {page} sur {pages}",
  "Página {page} de {pages}",
  "Pagina {page} di {pages}",
  "{pages}ページ中{page}ページ",
  "{pages}페이지 중 {page}페이지"
 ],
 "No hay notas que coincidan. Prueba otro texto o color.": [
  "No hay notas que coincidan. Prueba otro texto o color.",
  "No matching notes. Try another text or color.",
  "Keine passenden Notizen. Versuche anderen Text oder Farbe.",
  "Aucune note correspondante. Essayez un autre texte ou une autre couleur.",
  "Nenhuma nota corresponde. Experimente outro texto ou cor.",
  "Nessuna nota corrisponde. Prova altro testo o colore.",
  "該当するノートがありません。別の文字や色を試してください。",
  "일치하는 메모가 없습니다. 다른 텍스트나 색상을 사용하세요."
 ],
 "Color": [
  "Color",
  "Color",
  "Farbe",
  "Couleur",
  "Cor",
  "Colore",
  "色",
  "색상"
 ],
 "Reintentar guardar": [
  "Reintentar guardar",
  "Retry saving",
  "Speichern erneut versuchen",
  "Réessayer l’enregistrement",
  "Tentar guardar novamente",
  "Riprova a salvare",
  "保存を再試行",
  "저장 다시 시도"
 ],
 "Compartir": [
  "Compartir",
  "Share",
  "Teilen",
  "Partager",
  "Partilhar",
  "Condividi",
  "共有",
  "공유"
 ],
 "Modo local": [
  "Modo local",
  "Local mode",
  "Lokaler Modus",
  "Mode local",
  "Modo local",
  "Modalità locale",
  "ローカルモード",
  "로컬 모드"
 ],
 "Modo nube": [
  "Modo nube",
  "Cloud mode",
  "Cloud-Modus",
  "Mode cloud",
  "Modo nuvem",
  "Modalità cloud",
  "クラウドモード",
  "클라우드 모드"
 ],
 "Último guardado local: ": [
  "Último guardado local: ",
  "Last local save: ",
  "Zuletzt lokal gespeichert: ",
  "Dernière sauvegarde locale : ",
  "Última gravação local: ",
  "Ultimo salvataggio locale: ",
  "最終ローカル保存：",
  "마지막 로컬 저장: "
 ],
 "Última sincronización: ": [
  "Última sincronización: ",
  "Last sync: ",
  "Letzte Synchronisierung: ",
  "Dernière synchronisation : ",
  "Última sincronização: ",
  "Ultima sincronizzazione: ",
  "最終同期：",
  "마지막 동기화: "
 ],
 "La pizarra se está preparando. Espera un momento y vuelve a pulsar.": [
  "La pizarra se está preparando. Espera un momento y vuelve a pulsar.",
  "Board is loading. Wait a moment and try again.",
  "Pinnwand wird vorbereitet. Warte kurz und versuche erneut.",
  "Le tableau se prépare. Patientez et réessayez.",
  "A pizarra está a preparar-se. Aguarde e tente novamente.",
  "Bacheca in preparazione. Attendi e riprova.",
  "ボードを準備中です。少し待って再試行してください。",
  "보드를 준비 중입니다. 잠시 기다린 후 다시 누르세요."
 ],
 "No se pudieron guardar los contadores. Vuelve a intentarlo; los datos se conservan.": [
  "No se pudieron guardar los contadores. Vuelve a intentarlo; los datos se conservan.",
  "Could not save counters. Retry; data is kept.",
  "Zähler konnten nicht gespeichert werden. Versuche erneut; Daten bleiben erhalten.",
  "Compteurs non enregistrés. Réessayez ; les données sont conservées.",
  "Não foi possível guardar os contadores. Tente novamente; dados conservados.",
  "Impossibile salvare i contatori. Riprova; dati conservati.",
  "カウンターを保存できません。再試行してください。データは残っています。",
  "카운터를 저장하지 못했습니다. 다시 시도하세요. 데이터는 보존됩니다."
 ],
 "No se pudo abrir el menú para compartir. Tus notas se conservan.": [
  "No se pudo abrir el menú para compartir. Tus notas se conservan.",
  "Could not open sharing. Your notes are kept.",
  "Teilen-Menü konnte nicht geöffnet werden. Notizen bleiben erhalten.",
  "Partage impossible à ouvrir. Vos notes sont conservées.",
  "Não foi possível abrir a partilha. As notas conservam-se.",
  "Impossibile aprire la condivisione. Note conservate.",
  "共有メニューを開けません。ノートは残っています。",
  "공유 메뉴를 열지 못했습니다. 메모는 보존됩니다."
 ],
 "Guardado cancelado. Tus contadores se conservan.": [
  "Guardado cancelado. Tus contadores se conservan.",
  "Save cancelled. Your counters are kept.",
  "Speichern abgebrochen. Zähler bleiben erhalten.",
  "Enregistrement annulé. Compteurs conservés.",
  "Gravação cancelada. Contadores conservados.",
  "Salvataggio annullato. Contatori conservati.",
  "保存を取り消しました。カウンターは残っています。",
  "저장이 취소되었습니다. 카운터는 보존됩니다."
 ]
};
const uiSources=new Map();for(const [key,row]of Object.entries(uiMessages))for(const value of row)if(!uiSources.has(value))uiSources.set(value,key);
export function uiText(value,language=readBoardLanguage()){const index=uiLanguages.indexOf(language),key=Object.hasOwn(uiMessages,value)?value:uiSources.get(value);return uiMessages[key]?.[index<0?0:index]??value;}
