import {countryScene,countrySceneProfiles,countryArtCoverage} from './assets/designs/country-scenes.js';
import {themeProfilesA,renderThemeA} from './assets/designs/theme-profiles-a.js';
import {themeProfilesD,renderThemeD} from './assets/designs/theme-profiles-d.js';
import {themeProfilesB,renderThemeB} from './assets/designs/theme-profiles-b.js';
import {themeProfilesC,renderThemeC} from './assets/designs/theme-profiles-c.js';
import {countryFlags} from './assets/designs/country-flags.js';
// Original, code-rendered stationery. Shared by the storefront and the real board.
const groups = [
  ['Tecnología', 'Circuitos|Código abierto|Robótica|Gaming|Fotografía digital|Laboratorio de IA|Estudio de streaming|Ciberpunk|Ingeniería electrónica|Realidad virtual', 'chip', '#163b47', '#73ded2'],
  ['Cocina', 'Recetario familiar|Café de barrio|Huerto y cocina|Pan artesanal|Tarde de té|Chef de autor|Sushi atelier|Pastelería francesa|Cocina mediterránea|Chocolate y especias', 'cup', '#594034', '#edbf80'],
  ['Viajes', 'Diario de ruta|Camping|Caravana|Rutas en bicicleta|Islas y playas|Pasaporte de aventuras|Explorador polar|Orient Express|Navegación clásica|Mapa del tesoro', 'compass', '#234853', '#f0bd67'],
  ['Naturaleza', 'Jardín botánico|Bosque de setas|Océano azul|Pesca al amanecer|Montaña y senderismo|Safari fotográfico|Observatorio de aves|Caza y campo|Selva tropical|Colección de minerales', 'leaf', '#244e3d', '#cbdcab'],
  ['Historia', 'Biblioteca antigua|Cartas de época|Arqueología|Castillos medievales|Relojería vintage|Egipto y papiros|Grecia clásica|Roma y sus mosaicos|Japón y papel washi|Cartografía e historia militar', 'arch', '#594437', '#e7c389'],
  ['Música', 'Radio retro|Vinilos y soul|Acústico indie|Jazz de medianoche|Festival de verano|Heavy metal|Rap y grafiti|Pop de escenario|K-pop backstage|Estudio de composición', 'music', '#35234c', '#d7b3fa'],
  ['Profesiones', 'Aula creativa|Periodismo|Carpintería|Diseño de moda|Veterinaria|Consulta médica|Planos de arquitecto|Laboratorio científico|Estudio jurídico|Taller de automoción', 'work', '#234b58', '#aad6e2'],
  ['Deporte', 'Fútbol de barrio|Baloncesto|Running|Yoga|Natación|Ciclismo de competición|Escalada|Surf|Artes marciales|Motor y circuitos', 'sport', '#2b453d', '#dee996'],
  ['Arte y ocio', 'Acuarela|Cine clásico|Lectura|Ajedrez|Jardinería|Atelier de pintura|Manga y bocetos|Astrofotografía|Caligrafía|Origami de autor', 'art', '#56464d', '#f1c7b4'],
  ['Creencias y celebraciones', 'Gratitud diaria|Celebración familiar|Calendario festivo|Paz y reflexión|Diario de esperanza|Cristianismo: luz y vidrieras|Islam: geometría y luz|Judaísmo: estudio y memoria|Budismo: jardín y loto|Hinduismo: flores y colores', 'light', '#49314f', '#ecd09a']
];

export const thematicDesigns = groups.flatMap(([category,names,motif,background,accent],group)=>names.split('|').map((title,index)=>({
  id:`theme-${String(group*10+index+1).padStart(3,'0')}`,title,category,tier:index<5?'reward':'premium',motif,background,accent,
  paper:title.includes('composición')?'music':title==='Consulta médica'?'prescription':title.includes('papiros')?'papyrus':title.includes('arquitecto')?'blueprint':title.includes('washi')?'washi':['plain','ruled','grid','dots','journal'][index%5],
  pattern:index,details:detailsFor(title,category),kind:'theme',edition:'foundation'
})));

function detailsFor(title,category){
  if(title==='Egipto y papiros')return ['Pirámides','Ornamentos de loto','Papiros para tus notas'];
  if(title==='Consulta médica')return ['Consulta','Hojas tipo receta','Apuntes personales'];
  if(title==='Estudio de composición')return ['Pentagramas','Clave de sol','Ideas musicales'];
  return [title,category,'Pizarra y papelería coordinadas'];
}

// 193 UN member countries plus the two observer states, listed alphabetically in the UI.
// Motifs are illustrative creative choices, not descriptions of every resident.
const countries = `AF|Hindu Kush|Lapislázuli
AL|Alpes albaneses|Costa adriática
DZ|Sáhara|Arcos de la casba
AD|Pirineos|Piedra románica
AO|Baobabs|Cataratas de Kalandula
AG|Mar Caribe|Astilleros históricos
AR|Patagonia|Tango
AM|Monasterios|Granadas
AU|Arrecife|Eucaliptos
AT|Alpes|Partituras vienesas
AZ|Mar Caspio|Alfombras
BS|Aguas turquesas|Caracolas
BH|Perlas|Geometría arquitectónica
BD|Delta del Ganges|Nenúfares
BB|Coral|Caña de azúcar
BY|Bosques|Bordados
BE|Art nouveau|Chocolate
BZ|Arrecife|Selva
BJ|Arquitectura de tierra|Tejidos
BT|Himalaya|Arquitectura dzong
BO|Salar de Uyuni|Aguayos
BA|Puentes de piedra|Montañas
BW|Delta del Okavango|Cestería
BR|Amazonia|Bossa nova
BN|Selva de Borneo|Arquitectura dorada
BG|Rosas|Bordados
BF|Tejidos|Baobabs
BI|Lago Tanganica|Tambores
CV|Islas volcánicas|Morna
KH|Angkor|Flor de loto
CM|Monte Camerún|Máscaras artesanales
CA|Arces|Lagos y montañas
CF|Selva|Río Ubangui
TD|Lago Chad|Desierto de Ennedi
CL|Atacama|Cordillera andina
CN|Jardines|Porcelana
CO|Café|Palmas de cera
KM|Ylang-ylang|Islas volcánicas
CG|Cuenca del Congo|Bosque tropical
CD|Río Congo|Malaquita
CR|Bosque nuboso|Colibríes
CI|Cacao|Tejidos
HR|Costa dálmata|Mosaicos
CU|Música|Arquitectura colonial
CY|Olivos|Mosaicos mediterráneos
CZ|Relojes astronómicos|Cristal de Bohemia
DK|Diseño nórdico|Faros
DJ|Lago Assal|Sal y volcanes
DM|Bosque tropical|Cascadas
DO|Merengue|Palmeras
EC|Andes|Fauna de Galápagos
EG|Pirámides|Papiros
SV|Volcanes|Añil
GQ|Bosques|Isla de Bioko
ER|Mar Rojo|Arquitectura de Asmara
EE|Bosques bálticos|Diseño digital
SZ|Tejidos|Colinas
ET|Café|Tierras altas
FJ|Coral|Tejidos de corteza
FI|Lagos|Auroras
FR|Atelier parisino|Lavanda
GA|Bosque ecuatorial|Costa atlántica
GM|Río Gambia|Aves
GE|Viñedos|Cáucaso
DE|Bauhaus|Bosques
GH|Kente|Cacao
GR|Columnas|Olivos
GD|Nuez moscada|Playas
GT|Textiles mayas|Volcanes
GN|Tierras altas|Percusión
GW|Archipiélago de Bijagós|Manglares
GY|Cascada Kaieteur|Selva
HT|Pintura haitiana|Montañas
HN|Copán|Arrecifes
HU|Termas|Bordados
IS|Volcanes|Auroras
IN|Arquitectura|Estampados textiles
ID|Batik|Islas y volcanes
IR|Jardines persas|Azulejos
IQ|Mesopotamia|Palmeras datileras
IE|Tréboles|Acantilados
IL|Olivos|Arquitectura de piedra
IT|Renacimiento|Café
JM|Reggae|Montañas Azules
JP|Washi|Cerezos
JO|Petra|Desierto
KZ|Estepa|Ornamentos textiles
KE|Acacias|Gran Valle del Rift
KI|Atolones|Cocoteros
KP|Montañas|Arquitectura tradicional
KR|Hanji|Diseño pop
KW|Perlas|Velas dhow
KG|Montañas Tian Shan|Fieltro
LA|Mekong|Arrozales
LV|Ámbar|Bosques
LB|Cedros|Mosaicos
LS|Montañas|Tejidos
LR|Bosque tropical|Costa
LY|Desierto|Ruinas clásicas
LI|Alpes|Castillos
LT|Ámbar|Dunas bálticas
LU|Fortificaciones|Bosques
MG|Baobabs|Lémures
MW|Lago Malawi|Peces de colores
MY|Batik|Bosque tropical
MV|Atolones|Coral
ML|Arquitectura de tierra|Índigo
MT|Caliza|Puertas de colores
MH|Atolones|Cartas de navegación
MR|Desierto|Caravanas
MU|Bosque insular|Océano Índico
MX|Papel picado|Cactus
FM|Islas|Navegación oceánica
MD|Viñedos|Bordados
MC|Puerto|Arquitectura mediterránea
MN|Estepa|Cielo abierto
ME|Montañas|Bahía de Kotor
MA|Zellige|Jardines
MZ|Costa índica|Capulanas
MM|Lago Inle|Laca artesanal
NA|Dunas|Cielo estrellado
NR|Océano Pacífico|Paisaje insular
NP|Himalaya|Mandala geométrico
NL|Canales|Tulipanes
NZ|Helechos|Alpes del Sur
NI|Volcanes|Lagos
NE|Dunas|Río Níger
NG|Adire|Música
MK|Lago Ohrid|Mosaicos
NO|Fiordos|Auroras
OM|Montañas|Velas dhow
PK|Arte de camiones|Karakórum
PW|Islas Rocosas|Arrecifes
PS|Olivos|Bordado tatreez
PA|Canal|Molas
PG|Aves del paraíso|Arte de madera
PY|Ñandutí|Yerba mate
PE|Andes|Textiles
PH|Islas|Terrazas de arroz
PL|Recortes de papel|Bosques
PT|Azulejos|Olas atlánticas
QA|Perlas|Arquitectura del desierto
RO|Cárpatos|Bordados
RU|Abedules|Arquitectura tradicional
RW|Colinas|Cestería
KN|Picos volcánicos|Costa caribeña
LC|Pitones|Bosque tropical
VC|Islas Granadinas|Velas
WS|Tapa|Paisaje volcánico
SM|Monte Titano|Torres
ST|Cacao|Bosque insular
SA|Arquitectura de Najd|Dátiles
SN|Baobabs|Textiles
RS|Danubio|Bordados
SC|Granito|Palmeras
SL|Playas|Tejidos
SG|Jardines|Arquitectura urbana
SK|Tatras|Arte en madera
SI|Alpes Julianos|Lago Bled
SB|Arrecifes|Arte en concha
SO|Costa índica|Incienso
ZA|Proteas|Paisajes del Cabo
SS|Nilo Blanco|Sabana
ES|Azulejos|Olivos
LK|Té|Elefantes
SD|Pirámides nubias|Nilo
SR|Selva|Arquitectura en madera
SE|Bosques|Diseño nórdico
CH|Alpes|Relojería
SY|Mosaicos|Patios damascenos
TJ|Pamir|Bordados
TZ|Kilimanjaro|Costa suajili
TH|Orquídeas|Seda
TL|Tais|Montañas
TG|Tejidos|Palmerales
TO|Tapa|Islas del Pacífico
TT|Steelpan|Carnaval
TN|Mosaicos|Olivos
TR|Azulejos|Capadocia
TM|Alfombras|Desierto de Karakum
TV|Atolones|Cestería
UG|Lagos|Bosque tropical
UA|Girasoles|Bordados
AE|Dunas|Arquitectura urbana
GB|Bibliotecas|Jardines
US|Jazz|Parques nacionales
UY|Mate|Costa atlántica
UZ|Samarcanda|Azulejos
VU|Volcanes|Arte de arena
VA|Arquitectura renacentista|Biblioteca
VE|Tepuyes|Orquídeas
VN|Faroles|Terrazas de arroz
YE|Arquitectura de Saná|Café
ZM|Cataratas Victoria|Cobre
ZW|Gran Zimbabue|Sabana`;
const names = new Intl.DisplayNames(['es'],{type:'region'});
export const countryDesigns = countries.split('\n').map((line,index)=>{
  const [code,...details]=line.split('|');
  const motif='compass',background='#243c46',accent='#e8c98c';
  return {id:`country-${code.toLowerCase()}`,code,title:names.of(code),category:'Países',tier:'premium',kind:'country',edition:'foundation',details,motif,background,accent,pattern:0,paper:'journal'};
}).sort((a,b)=>a.title.localeCompare(b.title,'es'));
const templates = (...entries) => entries.map(([title,...lines]) => ({title,body:lines.join('\n')}));
for(const design of countryDesigns){
  const profile=countrySceneProfiles[design.code];if(!profile)continue;
  Object.assign(design,profile,{culturalNote:profile.notes,paper:design.code==='JP'?'washi':design.code==='EG'?'papyrus':'journal'});
  design.noteTemplates=templates(['Mi itinerario','Fechas / ciudades','Reservas por confirmar'],['Un lugar por conocer',profile.landmark?.name||'Mi próxima visita','Consultar información local'],['Sabores por descubrir',profile.food?.name||'Una propuesta por investigar','Preferencias y alergias'],['En mi equipaje','Agua / ropa / documentos','Adaptar al clima y al viaje'],['Cuaderno de viaje','Lo que observé','Guardar mis referencias'],['A mi regreso','Ordenar notas y fotos','Un detalle para recordar']);
}

const crafted = {
  'theme-046': {art:'egypt',background:'#233d3f',accent:'#e5bc72',paper:'papyrus',details:['Pirámides y loto','Papiro de fibras cruzadas','Marco geométrico dorado'],noteTemplates:templates(['Mi expedición','Destino / fecha','Preparar mi ruta'],['Cuaderno de campo','Una idea por descubrir','Referencias y lecturas'],['Pendientes','Revisar mis apuntes','Ordenar fotografías'],['Para recordar','Ese pequeño detalle','que no quiero perder'],['Mi colección','Historias y hallazgos','Fuentes para consultar'],['Próximo paso','Elegir una idea','y ponerla en marcha'])},
  'theme-049': {art:'japan',background:'#eae5d9',accent:'#703e48',paper:'washi',details:['Rama de cerezo','Tinta y papel washi','Olas y pliegues de papel'],noteTemplates:templates(['Un momento','Respirar y observar','Una cosa a la vez'],['Mi taller','Bocetos por terminar','Papel / tinta / ideas'],['Por descubrir','Un libro','Un lugar','Una conversación'],['Hoy','Mi intención del día','Un pequeño avance'],['Colección de ideas','Guardar referencias','Probar un nuevo trazo'],['Próxima página','Lo que quiero aprender','y volver a practicar'])},
  'theme-060': {art:'composition',background:'#252d39',accent:'#ddb780',paper:'music',details:['Pentagramas de cinco líneas','Clave de sol dibujada','Mesa de composición'],noteTemplates:templates(['Motivo A','Tempo: ____','Tonalidad: ____'],['Estructura','Intro / verso / puente','Cierre'],['Ensayo','Pasaje por practicar','Compás: ____'],['Armonía','Progresión de acordes','Variaciones'],['Escucha','Obra / intérprete','Detalles para estudiar'],['Próxima sesión','Preparar partitura','Grabar una idea'])},
  'theme-066': {art:'medical',background:'#dce9e7',accent:'#1a635f',paper:'prescription',details:['Mesa de consulta','Hoja personal tipo receta','Agenda y seguimiento'],noteTemplates:templates(['Agenda','Revisar citas propias','Preparar preguntas'],['Recordatorio','Fecha: ____','Apunte personal'],['Consulta','Preguntas pendientes','Documentos que llevar'],['Organización','Material por revisar','Tareas de la semana'],['Seguimiento personal','Próxima fecha: ____','Recordatorio: ____'],['Lecturas','Tema para repasar','Fuente / fecha'])},
  'theme-061': {art:'classroom',background:'#325753',accent:'#efd391',paper:'ruled',details:['Pizarra de aula','Lápices y planificación','Reuniones y correcciones'],noteTemplates:templates(['Esta semana','Preparar clase','Revisar materiales'],['Correcciones','Trabajo pendiente','Fecha de entrega'],['Reuniones','Día / hora','Puntos del encuentro'],['Tareas del grupo','Actividad','Materiales'],['Próxima clase','Objetivo de aprendizaje','Inicio / práctica / cierre'],['Ideas para el aula','Dinámica nueva','Lectura recomendada'])},
};
const musicArts = {51:'radio',52:'vinyl',53:'acoustic',54:'jazz',55:'festival',56:'heavy',57:'rap',58:'pop',59:'kpop'};
const musicDetails = {
  radio:['Dial y ondas de radio','Libreta de escuchas','Programas y descubrimientos'],vinyl:['Disco de vinilo','Surcos y carátulas','Escuchas favoritas'],
  acoustic:['Guitarra acústica','Madera y cuaderno','Acordes y letras'],jazz:['Piano nocturno','Vinilo y luz dorada','Estudio y escucha'],
  festival:['Escenario abierto','Guirnaldas de luz','Agenda de conciertos'],heavy:['Amplificadores y púas','Tramas de escenario','Ensayo y repertorio'],
  rap:['Muro de ladrillo','Micrófono y trazos','Rimas y estructura'],pop:['Focos de escenario','Destellos y ritmo','Canciones y ensayos'],
  kpop:['Estrellas y escenario','Tarjetas de ensayo','Música y coreografía']
};
for (const [number,art] of Object.entries(musicArts)) {
  const id=`theme-${number.padStart(3,'0')}`;
  crafted[id]={art,background:art==='kpop'?'#3d355b':art==='rap'?'#353432':art==='acoustic'?'#594235':'#292633',accent:art==='heavy'?'#d9b2a0':art==='kpop'?'#e5b0d6':'#ecd3a3',paper:art==='acoustic'||art==='jazz'?'music':'ruled',details:musicDetails[art],noteTemplates:templates(['Mi repertorio','Canción / versión','Por aprender'],['Ideas nuevas','Frase / melodía / ritmo','Guardar la inspiración'],['Esta semana','Sesión de práctica','Objetivo concreto'],['Escucha del día','Artista / álbum','Lo que me inspira'],['Agenda','Ensayo / concierto','Fecha y lugar'],['Próximo paso','Revisar la grabación','Terminar una idea'])};
}
for(const design of thematicDesigns) if(crafted[design.id]) Object.assign(design,crafted[design.id],{edition:'crafted'});
for(const design of thematicDesigns) {for(const profiles of [themeProfilesA,themeProfilesB,themeProfilesC,themeProfilesD]) if(profiles[design.id]) Object.assign(design,profiles[design.id]);}
export const professionDesigns = [
  {id:'profession-firefighters',title:'Bomberos · guardias y equipo',art:'firefighters',background:'#303534',accent:'#f0c964',paper:'shift',details:['Casco y manguera laterales','Cuadrante de guardias','Revisión de equipo'],noteTemplates:templates(['Mi guardia','Fecha: ____','Entrada / salida'],['Equipo','Revisión pendiente','Anotar reposición'],['Relevo','Recordatorios del turno','Entrega / recogida'],['Formación','Curso / práctica','Fecha y material'],['Semana','Lunes a domingo','Cambios por confirmar'],['Tareas personales','Un pendiente','Próximo paso'])},
  {id:'profession-police',title:'Policía · turnos y agenda',art:'police',background:'#263b56',accent:'#b7d0e6',paper:'shift',details:['Escudo genérico y libreta','Cuadrante de turnos','Recordatorios personales'],noteTemplates:templates(['Mi turno','Fecha: ____','Entrada / salida'],['Agenda','Reunión / formación','Hora y lugar'],['Relevo','Recordatorios del turno','Pendientes propios'],['Material','Preparar equipo','Reposición pendiente'],['Semana','Cambios de cuadrante','Confirmar fechas'],['Estudio','Tema por repasar','Próximo objetivo'])},
  {id:'profession-students',title:'Estudiantes · semestre a mano',art:'students',background:'#c9d8d0',accent:'#355c56',paper:'study',details:['Plan del semestre','Fichas de repaso','Exámenes y entregas'],noteTemplates:templates(['Mi semana','Clase / horario','Material por preparar'],['Próxima entrega','Asignatura: ____','Fecha: ____'],['Repaso','Tema que ya entiendo','Tema por practicar'],['Exámenes','Fecha / temario','Plan de estudio'],['Trabajo en grupo','Mi parte','Próxima reunión'],['Pequeños avances','Lo que terminé hoy','Mi siguiente paso'])}
].map((design,index)=>({...design,category:'Profesiones',tier:'premium',kind:'expansion',edition:'crafted',motif:'work',pattern:index}));
export const catalogCoverage = Object.freeze({initialThemes:100,rewardThemes:50,initialPremiumThemes:50,countries:195,countryCriterion:'193 Estados miembros de la ONU y 2 Estados observadores',territories:'Los territorios y otras entidades no incluidos en este criterio todavía no forman parte de esta colección.',countryStatus:`Las 195 vistas incluyen bandera, silueta geográfica ornamental y papelería. Hay ${countryArtCoverage.verifiedIllustratedLandmarks} lugares y ${countryArtCoverage.verifiedIllustratedDishes} propuestas gastronómicas ilustradas con fuentes verificadas; ${countryArtCoverage.finishedEditions} países reúnen ambos. ${countryArtCoverage.finishedEditions===195?'Cada edición propone una selección cultural concreta, sin resumir toda la diversidad del país.':'Las ediciones restantes siguen en desarrollo.'}`});
export const designs = [...thematicDesigns,...professionDesigns,...countryDesigns];
export const packs = [
  {id:'music',title:'Música a tu manera',description:'Del vinilo al estudio de composición.',designIds:designs.filter(d=>d.category==='Música').map(d=>d.id)},
  {id:'professions',title:'Profesiones y estudio',description:'Aula, consulta, turnos y proyectos cotidianos.',designIds:designs.filter(d=>d.category==='Profesiones').map(d=>d.id)},
  {id:'travel',title:'Rutas y viajes',description:'Prepara la mochila y guarda tus descubrimientos.',designIds:designs.filter(d=>d.category==='Viajes').map(d=>d.id)},
  {id:'countries',title:'Pasaporte · 195 países',description:'Banderas, mapas y ediciones culturales. Consulta su estado.',designIds:countryDesigns.map(d=>d.id)},
  {id:'medical',title:'Consulta y bienestar',description:'Organización personal para consulta y estudio.',designIds:['theme-065','theme-066','theme-068']}
];

export const fonts = [{id:'sans',name:'Editorial',css:'"PP Editorial",sans-serif'},{id:'serif',name:'Clásica',css:'"PP Clasica",serif'},{id:'mono',name:'Máquina de escribir',css:'"PP Maquina",monospace'},{id:'hand',name:'Manuscrita',css:'"PP Manuscrita",cursive'},{id:'rounded',name:'Redondeada',css:'"PP Redondeada",sans-serif'},{id:'book',name:'Libro',css:'"PP Libro",serif'}];
export const instruments = [{id:'graphite',name:'Lápiz de grafito',width:2,opacity:.6},{id:'ballpoint',name:'Bolígrafo',width:2,opacity:1},{id:'roller',name:'Roller de tinta líquida',width:3,opacity:.95},{id:'gel',name:'Bolígrafo de gel',width:4,opacity:1},{id:'fountain',name:'Pluma estilográfica',width:5,opacity:.9},{id:'fineliner',name:'Rotulador fino',width:1,opacity:1},{id:'brush',name:'Pincel de caligrafía',width:9,opacity:.85},{id:'marker',name:'Marcador',width:14,opacity:.3},{id:'crayon',name:'Cera',width:8,opacity:.55},{id:'chalk',name:'Tiza',width:6,opacity:.5},{id:'charcoal',name:'Carboncillo',width:10,opacity:.7},{id:'stamp',name:'Sello de tinta',width:12,opacity:1},{id:'toothpaste',name:'Pasta tricolor',width:18,opacity:1},{id:'spray',name:'Spray de grafiti',width:16,opacity:.6},{id:'airbrush',name:'Pistola de pintura',width:24,opacity:.3}];
export const papers = [{id:'plain',name:'Liso'},{id:'ruled',name:'Cuaderno rayado'},{id:'grid',name:'Cuadriculado'},{id:'dots',name:'Punteado'},{id:'journal',name:'Diario de viaje'},{id:'papyrus',name:'Papiro'},{id:'washi',name:'Washi'},{id:'music',name:'Pentagrama'},{id:'prescription',name:'Hoja tipo receta'},{id:'blueprint',name:'Plano técnico'},{id:'shift',name:'Cuadrante de turnos'},{id:'study',name:'Ficha de estudio'}];
export const palettes = [{id:'classic',name:'Clásica',colors:['#163b62','#883647','#415946','#4d3b68','#6b482c','#222222']},{id:'jewel',name:'Piedras preciosas',colors:['#065f46','#1e3a8a','#701a75','#9f1239','#713f12','#334155']},{id:'earth',name:'Tierra',colors:['#6b4226','#5b622c','#923f26','#315750','#624552','#4d483f']},{id:'studio',name:'Estudio',colors:['#1649bb','#9b1663','#7b352c','#315845','#663ba0','#222835']}];
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const svgUrl=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
// Vector drawings are shared verbatim by the catalogue and board. No remote image requests.
const treble='<path d="M28 9c-21 16-20 30-5 34 16 4 18-18 3-17-11 1-10 15 2 15M26 3c-3 1-6 8-3 18l9 31c3 13-13 12-13 5" fill="none" stroke="currentColor" stroke-width="2.5"/>';
const lotus='<path d="M24 45C1 38 0 19 4 18c13 0 20 27 20 27S45 43 45 18C30 17 24 45 24 45Zm0-42c-15 18-12 31 0 42 12-11 15-24 0-42Z"/>';
const helmet='<path d="M5 35h40v7H5zM10 35V24a14 14 0 0 1 28 0v11M20 12v21m8-21v21M7 42h34"/><rect x="18" y="22" width="12" height="12" rx="2"/>';
const shield='<path d="M24 3 43 10v17c-3 10-10 16-19 21C15 43 8 37 5 27V10z"/><path d="m24 13 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/>';
const glyphs={
  chip:'<rect x="9" y="9" width="30" height="30" rx="5"/><rect x="17" y="17" width="14" height="14"/><path d="M16 1v8m16-8v8M16 39v8m16-8v8M1 16h8m-8 16h8m30-16h8m-8 16h8"/>',
  code:'<path d="m16 12-12 12 12 12m16-24 12 12-12 12M28 6l-8 36"/>',robot:'<rect x="7" y="13" width="34" height="27" rx="6"/><circle cx="17" cy="24" r="2"/><circle cx="31" cy="24" r="2"/><path d="M17 33h14M24 13V5m-4 0h8M7 23H2m39 0h5"/>',game:'<path d="M14 14h20c8 0 17 26 9 29-4 2-10-7-13-7H18c-3 0-9 9-13 7-8-3 1-29 9-29Z"/><path d="M15 20v12m-6-6h12m11-4h1m5 8h1"/>',camera:'<path d="M4 14h10l4-7h12l4 7h10v28H4Z"/><circle cx="24" cy="27" r="9"/>',network:'<circle cx="24" cy="24" r="6"/><circle cx="6" cy="6" r="4"/><circle cx="42" cy="6" r="4"/><circle cx="6" cy="42" r="4"/><circle cx="42" cy="42" r="4"/><path d="m9 9 11 11m8 8 11 11m0-30L28 20M20 28 9 39"/>',mic:'<rect x="17" y="3" width="14" height="28" rx="7"/><path d="M10 22v4a14 14 0 0 0 28 0v-4M24 40v7m-9 0h18"/>',city:'<path d="M2 46V24h10v22m0 0V12h12v34m0 0V3h12v43m0 0V22h10v24M17 18v4m0 5v4m13-20v4m0 5v4"/>',circuit:'<path d="M2 8h18v12h20v22M2 40h14V28h15V4"/><circle cx="2" cy="8" r="2"/><circle cx="40" cy="42" r="3"/><circle cx="31" cy="4" r="3"/>',goggles:'<path d="M2 15h44v23H31l-7-7-7 7H2Z"/><circle cx="12" cy="25" r="5"/><circle cx="36" cy="25" r="5"/>',
  recipe:'<path d="M8 4h31v41H8zm8 9h15M16 20h15m-15 8h15m-15 8h9"/><path d="M4 8h8m-8 9h8m-8 9h8m-8 9h8"/>',cup:'<path d="M5 17h29v17c0 14-29 14-29 0zM34 20h5c10 0 10 14-5 14M3 46h36M14 10c-7-4 7-6 0-10m12 10c-7-4 7-6 0-10"/>',sprout:'<path d="M24 45V19C3 26 2 7 4 6c19-2 20 13 20 13C24 1 45 2 45 5c0 19-21 18-21 14M10 46h28"/>',bread:'<path d="M5 21C-5-3 53-3 43 21v23H5Zm9-10 8 8m4-10 8 8"/>',tea:'<path d="M10 17h27l-3 25H14ZM37 22h4c10 0 5 14-6 14M17 10c-5-5 5-5 0-10m11 10c-5-5 5-5 0-10M9 46h31"/>',chef:'<path d="M12 28C-7 26 0 4 15 9 17-4 35-1 35 10 52 4 56 28 36 28v17H12Z"/><path d="M12 36h24"/>',sushi:'<ellipse cx="24" cy="13" rx="20" ry="9"/><path d="M4 13v21c0 13 40 13 40 0V13"/><ellipse cx="24" cy="13" rx="8" ry="4"/>',cake:'<path d="M4 23h40v22H4ZM4 23c7 14 12-10 20 0s12-10 20 0M15 21V11m9 10V8m9 13V11"/><path d="M24 5c-7-7 7-7 0 0Z"/>',olive:'<path d="M7 44 40 5M13 36c-15 0-10-16 0-14 10 0 9 14 0 14Zm18-12c-13 0-11-16 0-14 10 0 10 14 0 14Z"/>',chocolate:'<path d="M6 4h36v40H6ZM6 17h36M6 30h36M18 4v40M30 4v40"/>',
  compass:'<circle cx="24" cy="24" r="21"/><path d="m32 11-4 17-17 9 9-17zM24 3v5m0 32v5M3 24h5m32 0h5"/>',tent:'<path d="M2 42 24 4l22 38ZM24 18 13 42m11-24 11 24M24 4v38"/>',van:'<path d="M3 12h29l12 16v12H3ZM29 12v16h15M9 18h13v10H9Z"/><circle cx="12" cy="41" r="5"/><circle cx="36" cy="41" r="5"/>',bike:'<circle cx="11" cy="34" r="10"/><circle cx="38" cy="34" r="10"/><path d="m11 34 10-19 17 19H11l9-15h14m-4-11h7M17 14h9"/>',island:'<path d="M2 45q22-12 44 0M23 39l6-28M29 11C12-8 4 6 7 10c10-5 15-3 22 1C50-3 48 13 45 17c-3-9-10-9-16-6Z"/>',passport:'<rect x="8" y="3" width="32" height="42" rx="4"/><circle cx="24" cy="24" r="10"/><path d="M14 24h20M24 14c-7 6-7 14 0 20 7-6 7-14 0-20M17 39h14"/>',polar:'<path d="m3 42 10-19 6 8L29 8l17 34ZM23 22l6 4 5-5"/>',train:'<rect x="10" y="2" width="28" height="35" rx="6"/><path d="M14 10h20v13H14Zm-3 33 7-7m19 7-7-7M13 31h2m18 0h2"/>',sail:'<path d="m4 34 7 11h26l8-11ZM24 3v29H4ZM27 7l16 24H27Z"/>',map:'<path d="m2 10 15-6 15 6 14-6v36l-14 6-15-6-15 6Zm15-6v36M32 10v36M8 17l31 16"/>',
  leaf:'<path d="M8 43C-1 13 11 8 42 6c0 31-13 41-34 37Zm0 0L34 14M16 35V20m8 8h13"/>',mushroom:'<path d="M2 28c0-32 44-32 44 0Zm17 0-4 17h18l-4-17M11 21h2m9-8h2m10 9h2"/>',wave:'<path d="M2 17c12-20 33-13 30 2-1 9-12 11-15 7 18 1 6-24-15 5 7-2 11 7 22 7s17-9 22-6M2 44c13-8 29 6 44-2"/>',fish:'<path d="M4 24C18 3 36 6 36 24S18 45 4 24Zm32 0 11-13v26Z"/><circle cx="13" cy="22" r="2"/>',mountain:'<path d="M2 43 18 7l15 36M25 24l8-15 13 34M12 21l6 5 6-5"/>',binoculars:'<path d="M4 19h15v25H4ZM29 19h15v25H29ZM7 19V7h9v12m16 0V7h9v12M19 27h10"/>',bird:'<path d="M4 35c17 2 4-29 20-29 8 0 9 10 9 10l13 3-13 6C28 45 13 48 4 35ZM15 35 26 21"/>',antler:'<path d="M24 46V25M24 29C8 27 7 18 9 3m3 17L2 14m9-1 8-7M24 29c16-2 17-11 15-26m-3 17 10-6m-9-1-8-7"/>',palm:'<path d="M22 47V15C5-1-1 12 3 18c7-8 13-6 19-3C9-2 25-9 26 4c7-13 28 1 17 9-9-9-18-1-21 2 16-4 25 8 20 13-5-7-15-10-20-13Z"/>',gem:'<path d="m2 15 10-12h24l10 12-22 32ZM2 15h44M12 3l6 12 6 32 6-32 6-12"/>',
  book:'<path d="M24 10C16 3 6 3 2 6v36c9-4 16-2 22 3 6-5 13-7 22-3V6c-4-3-14-3-22 4Zm0 0v35"/>',letter:'<path d="M2 10h44v30H2Zm0 0 22 17L46 10M2 40l16-17m12 0 16 17"/>',archaeology:'<path d="M17 3h14v10c16 7 15 32-7 32S1 20 17 13ZM17 9h14M9 27h30m-26 9h22"/>',castle:'<path d="M3 46V8h6v8h7V8h6v15h4V8h6v8h7V8h6v38ZM19 46V32h10v14"/>',clock:'<circle cx="24" cy="24" r="21"/><path d="M24 7v17l11 8M24 3v4m0 34v4M3 24h4m34 0h4"/>',egypt:'<path d="M2 42 20 6l20 36ZM20 6v36M29 22l8-13 10 33"/>',columns:'<path d="M3 11 24 2l21 9ZM2 45h44M9 15v25m7-25v25m8-25v25m8-25v25m7-25v25"/>',mosaic:'<path d="M2 2h44v44H2Zm22 3 19 19-19 19L5 24ZM13 13h22v22H13Z"/>',japan:'<path d="M5 42c22-9 7-32 38-37M15 29l-9-9m21-4 1-13"/><circle cx="8" cy="18" r="5"/><circle cx="29" cy="7" r="5"/>',military:'<path d="m24 3 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1Z"/><path d="M5 45h38"/>',
  work:'<rect x="3" y="14" width="42" height="30" rx="4"/><path d="M15 14V5h18v9M3 26h42M21 24v7h6v-7"/>',news:'<path d="M7 4h36v40H7ZM2 12h5M2 12v32h41M13 10h23M13 17h10v12H13Zm16 0h8m-8 6h8M13 35h24"/>',hammer:'<path d="m5 15 12-12 13 2 4 6-10 3-8 10Zm12 8 20 22 8-8-21-21"/>',dress:'<path d="m16 3 8 6 8-6 5 10-7 9 14 24H4l14-24-7-9Z"/>',paw:'<path d="M24 24c-22 2-23 27 0 18 23 9 22-16 0-18Z"/><ellipse cx="8" cy="19" rx="4" ry="6"/><ellipse cx="18" cy="9" rx="4" ry="6"/><ellipse cx="30" cy="9" rx="4" ry="6"/><ellipse cx="40" cy="19" rx="4" ry="6"/>',medical:'<path d="M16 3h16v13h13v16H32v13H16V32H3V16h13Z"/>',ruler:'<path d="M4 44 44 4v40ZM17 36h18V18M14 34l4 4m4-12 4 4m4-12 4 4"/>',flask:'<path d="M17 3h14m-12 0v16L4 42q20 7 40 0L29 19V3M10 31h28M17 38h2m8 2h2"/>',scales:'<path d="M24 3v40M6 44h36M4 14h40M11 14 2 33h18ZM37 14l-9 19h18Z"/>',wrench:'<path d="M30 4c-14-2-18 12-11 21L3 41l7 7 16-17c13 7 25-4 19-16L35 25l-10-9Z"/>',
  ball:'<circle cx="24" cy="24" r="21"/><path d="m24 12 11 8-4 13H17l-4-13zM24 3v9m21 12-10-4m-2 23-2-10M15 43l2-10M3 24l10-4"/>',basket:'<circle cx="24" cy="24" r="21"/><path d="M3 24h42M24 3v42M7 9c20 2 18 30 34 30M7 39C27 37 25 9 41 9"/>',shoe:'<path d="m6 9 12 15 7-9 8 17 12 5v8H3V18ZM3 37h41M23 24l6-3m-3 10 7-3"/>',yoga:'<circle cx="24" cy="8" r="5"/><path d="M24 13v18L6 44h36L24 31M24 20 8 31 2 20m22 0 16 11 6-11"/>',swim:'<circle cx="31" cy="10" r="5"/><path d="m3 23 12-14 10 17 14-8 7 7M2 34q8-7 15 0t15 0 15 0M2 44q8-7 15 0t15 0 15 0"/>',climb:'<path d="M3 46 22 4l23 42M19 25l8-5-4-7M10 39l13-8 7 9M32 19l9-9"/>',surf:'<path d="M12 45C-12 14 29-11 35 5S36 39 12 45Zm0 0L30 8M2 45c13-6 23 7 44-2"/>',karate:'<path d="M14 3 24 13 34 3l12 17-11 6-2 20H15l-2-20-11-6ZM14 3l20 23M34 3 14 26m0 4h20M24 30l6 14m-6-14-5 13"/>',race:'<path d="M6 47V3h36v25H6M6 3l36 25M42 3 6 28M6 15h36M18 3v25M30 3v25"/>',
  palette:'<path d="M44 26C50-5 6-6 3 22c-2 21 25 31 28 19 2-8-8-9-3-14 4-4 9 5 16-1Z"/><circle cx="14" cy="15" r="2"/><circle cx="25" cy="10" r="2"/><circle cx="36" cy="16" r="2"/>',film:'<path d="M3 12h42v32H3Zm0 0L41 2l4 10M11 10l4-6m8 4 4-7M3 21h42M22 27l10 6-10 6Z"/>',chess:'<path d="M8 44h32l-5-8H13Zm5-8 5-12h12l5 12M12 24h24l-3-10H15Zm12-10V1m-6 5h12"/>',watering:'<path d="M13 20h23v25H13Zm23 6c18-15 13-24-3-13M13 28 2 11l-2 6 13 21M18 20v-8h10v8"/>',easel:'<path d="M7 5h34v28H7ZM24 0v5m0 28v15M13 33 3 48m32-15 10 15M12 25l8-9 7 6 8-10"/>',comic:'<path d="M4 4h40v31H19L7 46V35H4ZM12 14h24m-24 9h16"/>',telescope:'<path d="m5 20 28-14 7 15-28 13ZM33 6l8-4 7 15-8 4M24 29v19M24 31 8 47m16-16 16 16"/>',nib:'<path d="M24 2 42 34 24 46 6 34ZM24 2v28"/><circle cx="24" cy="33" r="4"/>',origami:'<path d="M2 10 46 2 20 46 17 23ZM2 10l18 36M17 23 46 2"/>',
  heart:'<path d="M24 43C-10 21 1-8 24 10c23-18 34 11 0 33Z"/>',family:'<circle cx="14" cy="12" r="7"/><circle cx="34" cy="12" r="7"/><path d="M2 42V28c0-10 24-10 24 0v14m-4-14c0-10 24-10 24 0v14"/>',calendar:'<rect x="3" y="8" width="42" height="37" rx="3"/><path d="M13 2v12M35 2v12M3 20h42M13 28h6m10 0h6m-22 9h6m10 0h6"/>',dove:'<path d="M5 41C25 33 18 11 5 4c24 0 34 8 32 23l9 1-10 7C30 44 20 48 5 41Z"/>',candle:'<path d="M15 19h18v27H15ZM24 1c-16 17 16 22 0 0ZM24 19v-4"/>',window:'<path d="M5 46V22a19 19 0 0 1 38 0v24ZM24 3v43M5 26h38M10 11l14 15 14-15M5 46l19-20 19 20"/>',geometry:'<path d="M24 2 40 8l6 16-6 16-16 6-16-6-6-16L8 8ZM8 8h32v32H8ZM24 2 46 24 24 46 2 24Z"/>',study:treble,lotus,flowers:'<circle cx="24" cy="24" r="5"/><path d="M24 18c-15-16 15-16 0 0Zm6 5c14-16 26 10 0 0Zm-2 6c22 3 6 28 0 0Zm-7 0c4 22-25 17 0 0Zm-3-7c-21 9-24-19 0 0Z"/>'
};
const motifOrder='chip code robot game camera network mic city circuit goggles recipe cup sprout bread tea chef sushi cake olive chocolate compass tent van bike island passport polar train sail map leaf mushroom wave fish mountain binoculars bird antler palm gem book letter archaeology castle clock egypt columns mosaic japan military mic mic mic mic mic mic mic mic mic mic work news hammer dress paw medical ruler flask scales wrench ball basket shoe yoga swim bike climb surf karate race palette film book chess watering easel comic telescope nib origami heart family calendar dove candle window geometry book lotus flowers'.split(' ');
for(const [index,design] of thematicDesigns.entries()) design.motif=motifOrder[index];
Object.assign(thematicDesigns.find(d=>d.id==='theme-066'),{searchTerms:['medicina','salud','médico','doctora']});
Object.assign(thematicDesigns.find(d=>d.id==='theme-061'),{searchTerms:['maestro','maestra','profesor','docencia','colegio']});
const glyph=(name,x,y,scale=1,color='currentColor',opacity=1)=>`<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">${glyphs[name]||glyphs.book}</g>`;
const line=(d,stroke,width=1,opacity=1)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`;
function paperContent(type){
  const ink=type==='blueprint'?'#5a899a':'#556a72';
  const fill={papyrus:'#eacb92',washi:'#f5f0df',blueprint:'#e4f0f5',prescription:'#f4fbf8',shift:'#fcf8e9',study:'#fbf7ef'}[type]||'#fffaf0';
  let art=`<rect width="220" height="250" fill="${fill}"/>`;
  if(type==='papyrus'){
    for(let n=1;n<250;n+=4)art+=line(`M0 ${n}q60 ${n%7-3} 120 0t120 0`,'#967747',.7,.18);
    for(let n=2;n<220;n+=8)art+=line(`M${n} 0q${n%5-2} 130 0 250`,'#ba995f',.7,.2);
    art+='<path d="M3 6 14 4l6 3 8-3 15 3 15-3 9 2 20-2 16 3 19-3 13 2 17-3 15 4 12-2 20 1 19-2M3 243l14 2 17-3 15 3 19-2 24 2 13-3 15 3 21-2 13 3 16-3 24 2 23-2" fill="none" stroke="#af8b53" stroke-width="2"/>';
  }
  if(type==='washi'){
    for(let y=0;y<250;y+=11)for(let x=0;x<220;x+=19)art+=line(`M${x} ${y}l${4+(x%5)} 2`,'#b7b69b',.65,.24);
    art+='<path d="M0 15c11 0 12-15 25-15M198 250c1-14 22-12 22-26" fill="none" stroke="#c98582" stroke-width="4" opacity=".4"/>';
  }
  if(['ruled','journal','prescription','study'].includes(type))for(let y=type==='prescription'?82:50;y<240;y+=23)art+=line(`M14 ${y}h192`,ink,.65,.3);
  if(['grid','blueprint'].includes(type))for(let n=0;n<250;n+=20)art+=line(`M${n} 0v250M0 ${n}h250`,ink,.65,.35);
  if(type==='dots')for(let y=15;y<250;y+=20)for(let x=15;x<220;x+=20)art+=`<circle cx="${x}" cy="${y}" r=".9" fill="${ink}" opacity=".4"/>`;
  if(type==='journal'){art+=line('M28 0v250','#b86c5c',.7,.35);art+='<rect x="142" y="12" width="62" height="19" rx="3" fill="none" stroke="#99866e" stroke-dasharray="2 2"/><text x="152" y="25" font-family="sans-serif" font-size="8" fill="#81715d">MI VIAJE</text>';}
  if(type==='music'){
    for(let b=0;b<3;b++)for(let n=0;n<5;n++)art+=line(`M14 ${65+b*65+n*6}h192`,ink,.75,.6);
    art+=`<g color="#36515a" transform="translate(9 59) scale(.48)">${treble}</g>`;
  }
  if(type==='prescription')art+='<path d="M14 13h5v5h5v5h-5v5h-5v-5H9v-5h5Z" fill="#338176"/><text x="30" y="23" font-size="9" font-family="sans-serif" fill="#29675e">APUNTES PERSONALES</text><path d="M12 34h196" stroke="#62a397"/><text x="14" y="48" font-size="7" font-family="sans-serif" fill="#486c64">FECHA: __________</text><text x="14" y="240" font-size="6.5" font-family="sans-serif" fill="#486c64">PAPEL CREATIVO · NO ES UNA RECETA MÉDICA</text>';
  if(type==='shift'){
    art+='<rect x="12" y="12" width="196" height="27" fill="#e7e4d6"/><text x="20" y="30" font-size="10" font-family="sans-serif" fill="#314352">MI CUADRANTE</text>';
    for(let n=0;n<8;n++)art+=line(`M${12+n*28} 56v175`,ink,.6,.4);
    for(let n=0;n<6;n++)art+=line(`M12 ${56+n*24}h196`,ink,.6,.4);
    ['L','M','X','J','V','S','D'].forEach((day,n)=>{art+=`<text x="${22+n*28}" y="69" font-size="8" font-family="sans-serif" fill="#314352">${day}</text>`;});
    art+='<text x="14" y="200" font-size="8" font-family="sans-serif" fill="#314352">RECORDATORIOS</text>'+line('M14 214h192m-192 18h192',ink,.65,.3);
  }
  if(type==='study')art+='<path d="M58 39v194" stroke="#ac8272" opacity=".5"/><rect x="12" y="12" width="196" height="24" rx="3" fill="#e7ecdf"/><text x="20" y="28" font-size="9" font-family="sans-serif" fill="#445b50">TEMA · IDEAS · REPASO</text>';
  return art;
}
export function paperSvg(type='plain'){return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="250" viewBox="0 0 220 250">${paperContent(type)}</svg>`;}
function borderArt(d){
  const a=d.accent;let out='';
  if(themeProfilesA[d.id]) return renderThemeA(d,{glyph,line});
  if(themeProfilesB[d.id]) return renderThemeB(d,{glyph,line});
  if(themeProfilesD[d.id]) return renderThemeD(d,{glyph,line});
  if(themeProfilesC[d.id]) return renderThemeC(d,{glyph,line});
  if(d.art==='egypt'){
    out+='<rect x="18" y="16" width="684" height="468" rx="8" fill="none" stroke="#d6ac61" stroke-width="3"/>';
    for(let i=0;i<26;i++)out+=`<path d="m${24+i*26} 24 10 9 10-9m-20 452 10-9 10 9" stroke="${a}" fill="none" stroke-width="1.3"/>`;
    out+=`<circle cx="635" cy="62" r="21" fill="${a}" opacity=".8"/>`+line('M595 91 624 48l29 43m-20 0 25-33 24 33','#1c393a',2);
    for(const x of [23,670])for(const y of [140,290])out+=`<g transform="translate(${x} ${y}) scale(.57)" stroke="${a}" stroke-width="1.6" fill="none">${lotus}</g>`;
    out+=line('M8 435 68 348l61 87M575 435l67-98 68 98',a,1,.25);
  }else if(d.art==='japan'){
    out+='<circle cx="624" cy="66" r="27" fill="#c67972" opacity=".75"/>'+line('M684 25c-60 26-67 87-4 126M701 117l-41-19m15-29-39-4','#49473f',4);
    for(const [x,y]of [[665,42],[678,71],[655,95],[688,122],[641,66]])out+=`<g transform="translate(${x} ${y})" fill="#d8a0a1" stroke="#b5787d" stroke-width=".8"><circle cx="0" cy="-5" r="5"/><circle cx="5" cy="0" r="5"/><circle cx="3" cy="6" r="5"/><circle cx="-4" cy="5" r="5"/><circle cx="-6" cy="-1" r="5"/><circle r="2" fill="#eec999"/></g>`;
    for(let x=-40;x<750;x+=42)for(let y=459;y<500;y+=17)out+=line(`M${x} ${y}a21 21 0 0 1 42 0m-34 0a13 13 0 0 1 26 0`,'#6c8183',.75,.4);
    out+=glyph('origami',21,193,.55,'#867763',.7);
  }else if(d.art==='medical'){
    out+='<rect x="18" y="18" width="684" height="465" rx="14" fill="none" stroke="#6d9b94" stroke-width="1.4"/>';
    out+=glyph('medical',628,30,.75,a,.8);
    out+=line('M18 449h684m-669-314v172c0 43 39 43 39 6v-66',a,3,.5);
    out+='<circle cx="72" cy="244" r="8" fill="#d7e4e1" stroke="#38766c" stroke-width="3"/>';
    out+='<rect x="652" y="207" width="36" height="107" rx="7" fill="#eff7f2" stroke="#98b5ac"/><path d="M660 220h20m-20 9h20m-20 9h13" stroke="#8baaa1"/>';
  }else if(d.art==='firefighters'){
    for(let x=-15;x<720;x+=46)out+=`<path d="m${x} 483 18-22h24l-18 22Z" fill="${a}" opacity=".8"/>`;
    out+=`<g transform="translate(623 29) scale(.95)" stroke="${a}" stroke-width="2" fill="#464740">${helmet}</g>`;
    out+=line('M29 129v235c0 43 27 43 27 10V208',a,5,.8)+line('M29 129v235c0 43 27 43 27 10V208','#6d6b53',1,.8);
    out+='<rect x="663" y="166" width="23" height="77" rx="6" fill="#aa4139" stroke="#ea9e86"/><path d="M669 164v-9h17m-16 3h13m3-3v20" stroke="#d6bda1" fill="none"/>';
  }else if(d.art==='police'){
    out+=`<g transform="translate(631 25) scale(.94)" stroke="${a}" stroke-width="1.6" fill="#314a62">${shield}</g>`;
    for(let x=19;x<700;x+=20)out+=`<rect x="${x}" y="465" width="10" height="9" fill="${a}" opacity=".4"/><rect x="${x+10}" y="474" width="10" height="9" fill="${a}" opacity=".4"/>`;
    out+='<rect x="24" y="171" width="25" height="67" rx="4" fill="#172a3f" stroke="#a4bbd1"/><path d="M30 165v-21m-1 42h15m-15 8h15m-15 8h15M30 222h14" fill="none" stroke="#a4bbd1"/>';
  }else if(d.art==='classroom'||d.art==='students'){
    out+=line('M17 465h686',a,12,.4)+glyph('book',630,31,.92,a,.8);
    for(let i=0;i<3;i++)out+=`<g transform="translate(${27+i*9} ${178+i*11}) rotate(-8)"><path d="M0 0h6v105H0Z" fill="${['#dda26c','#d7cd7b','#a7c6ba'][i]}"/><path d="m0 105 3 9 3-9" fill="#eee4cf"/></g>`;
    out+='<rect x="651" y="361" width="36" height="21" rx="3" fill="#dbb9a1" transform="rotate(12 651 361)"/>';
  }else if(['composition','radio','vinyl','acoustic','jazz','festival','heavy','rap','pop','kpop'].includes(d.art)){
    out+=musicArt(d);
  }else if(d.kind==='country'){
    out+=countryScene(d,720,500);
  }else{
    out+=glyph(d.motif,626,32,.93,a,.85)+glyph(d.motif,23,189,.48,a,.65)+glyph(d.motif,665,359,.48,a,.65);
    const n=Number(d.id.slice(-3))||0;
    for(let i=0;i<14;i++)out+=n%3===0?`<circle cx="${28+i*51}" cy="471" r="${3+n%4}" stroke="${a}" fill="none" opacity=".4"/>`:n%3===1?line(`M${25+i*51} 468l9 6 9-6`,a,1,.5):`<rect x="${29+i*51}" y="467" width="9" height="9" rx="${n%4}" transform="rotate(45 ${33+i*51} 471)" fill="${a}" opacity=".35"/>`;
  }
  return out;
}
function musicArt(d){
  const a=d.accent;let out='';
  if(d.art==='composition'){
    for(let n=0;n<5;n++)out+=line(`M30 ${455+n*6}h660`,a,.8,.65);
    out+=`<g transform="translate(625 23) scale(.92)" color="${a}">${treble}</g>`;
    for(let n=0;n<12;n++)out+=`<rect x="${23+n*12}" y="477" width="11" height="15" fill="#eadfcb"/>`;
    out+=glyph('nib',671,204,.55,a,.7);
  }else if(d.art==='vinyl'||d.art==='jazz'){
    out+='<circle cx="646" cy="59" r="33" fill="#151c25" stroke="#998474"/>';
    for(const r of [13,19,25,29])out+=`<circle cx="646" cy="59" r="${r}" fill="none" stroke="#706357" stroke-width=".65"/>`;
    out+=`<circle cx="646" cy="59" r="8" fill="${a}"/>`;
    if(d.art==='jazz')for(let n=0;n<24;n++)out+=`<rect x="${25+n*28}" y="464" width="26" height="21" fill="#d9cbb3"/><rect x="${42+n*28}" y="464" width="9" height="12" fill="#202127"/>`;
  }else if(d.art==='heavy'){
    for(const x of [22,659]){out+=`<rect x="${x}" y="177" width="39" height="91" rx="4" fill="#202022" stroke="#84796c"/>`;for(const y of [203,240])out+=`<circle cx="${x+19}" cy="${y}" r="12" fill="none" stroke="#77746d"/>`;}
    out+='<path d="m646 22-20 23 16 2-13 27 34-35-17-1 13-16" fill="#caa28f"/>';
    out+=line('M27 468h666',a,4,.7);
  }else if(d.art==='rap'){
    for(let y=455;y<500;y+=15){out+=line(`M18 ${y}h684`,'#b07e66',1,.6);for(let x=y%2?30:50;x<705;x+=52)out+=line(`M${x} ${y}v15`,'#b07e66',1,.6);}
    out+=glyph('mic',634,27,.96,a,.9)+line('M27 361q-14-130 18-137',a,2,.6);
    out+='<path d="m38 94 10-32 8 13 22-37-5 50 14-5" fill="none" stroke="#b8b25e" stroke-width="3" opacity=".45"/>';
  }else if(d.art==='acoustic'){
    out+='<g transform="translate(625 17) rotate(20 30 38)"><path d="M27 6h9v40c29 2 27 38 2 42-30 4-34-33-11-41Z" fill="#bd8e52" stroke="#e3c69d"/><circle cx="32" cy="61" r="8" fill="#4f372d"/><path d="M29 9v64m4-64v64m-12 3h24" stroke="#f5dfb1" stroke-width=".7"/></g>';
  }else if(d.art==='radio'){
    out+='<rect x="609" y="28" width="77" height="53" rx="8" fill="#805844" stroke="#d4ab82"/><circle cx="631" cy="56" r="14" fill="#303b3d" stroke="#d4ab82"/><path d="M653 42h23m-23 7h23m-19 13h3m10 0h3M618 27l46-16" stroke="#d9c3a0" fill="none"/>';
  }else{
    for(let n=0;n<9;n++)out+=`<circle cx="${45+n*80}" cy="470" r="4" fill="${a}" opacity=".8"/>`;
    out+=line('M26 476q320-28 668 0',a,1,.5);
    out+=d.art==='kpop'?'<path d="m643 22 8 18 20 2-15 13 4 21-17-11-18 11 5-21-16-13 21-2Z" fill="#c6a0d6" stroke="#f2d0e9"/>':glyph('mic',637,29,.92,a,.85);
    if(d.art==='pop')out+='<path d="m38 110 40 64H16Zm645 0 25 65h-53Z" fill="#db8bb4" opacity=".15"/>';
  }
  return out;
}
const defaultNotes=d=>templates([d.category==='Viajes'?'Equipaje':'Mi próxima idea',...(d.category==='Viajes'?['Botella de agua','Toalla / documentación']:['Una idea por desarrollar','Un paso para empezar'])],['Para preparar','Revisar mis materiales','Confirmar la fecha'],['Mi agenda','Lo importante de hoy','Reservar un momento'],['Referencias','Lecturas y lugares','Guardar la inspiración'],['En marcha','Tarea / avance','Mi siguiente paso'],['Pequeños logros','Lo que aprendí','Lo que quiero repetir']);
export function designTemplates(design){return design?.noteTemplates||defaultNotes(design||{category:''});}
export function boardSvg(d,{preview=false}={}){
  const bg=d.background,a=d.accent,p=d.pattern||0;
  const isLight=['japan','medical','students'].includes(d.art);
  const text=isLight?'#334b47':a;
  const titleSize=d.title.length>35?19:24;
  let art=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="500" viewBox="0 0 720 500"><title>${xml(d.title)}</title><defs><pattern id="grain" width="${24+p*3}" height="${24+p*3}" patternUnits="userSpaceOnUse"><path d="M0 0h100M0 0v100" stroke="${a}" stroke-opacity=".04" fill="none"/></pattern><filter id="paper-shadow" x="-15%" y="-15%" width="140%" height="140%"><feDropShadow dx="1" dy="3" stdDeviation="2" flood-opacity=".17"/></filter></defs><rect width="720" height="500" rx="20" fill="${bg}"/><rect x="15" y="15" width="690" height="470" rx="12" fill="url(#grain)" stroke="${a}" stroke-opacity=".25"/>${borderArt(d)}<text x="42" y="51" fill="${text}" font-family="Georgia,serif" font-size="${titleSize}">${xml(d.title)}</text><text x="43" y="75" fill="${text}" opacity=".85" font-family="sans-serif" font-size="10">${xml(d.kind==='country'?'CUADERNO DE VIAJE · '+(d.edition==='crafted'?'EDICIÓN CULTURAL':'EDICIÓN EN DESARROLLO'):d.details.join(' · '))}</text>`;
  if(d.code&&countryFlags[d.code])art+=`<image href="${xml(svgUrl(countryFlags[d.code]))}" x="623" y="26" width="61" height="45.75"/>`;
  if(preview){
    const notes=designTemplates(d);
    for(let i=0;i<6;i++){
      const x=63+(i%3)*202,y=114+Math.floor(i/3)*175,note=notes[i];
      const angle=d.art==='medical'||d.art==='police'||d.art==='composition'?0:((p+i)%3-1)*1.6;
      const ink='#354b4d';
      // The material is the same SVG body used by the real notes, not a nested external image.
      art+=`<g transform="translate(${x} ${y}) rotate(${angle} 89 75)"><rect width="182" height="149" fill="#fff" filter="url(#paper-shadow)"/><svg width="182" height="149" viewBox="0 0 220 250" preserveAspectRatio="none">${paperContent(d.paper)}</svg><rect x="62" y="-5" width="57" height="13" rx="1" fill="${a}" opacity=".85"/>`;
      const top=d.paper==='prescription'||d.paper==='shift'||d.paper==='study'?38:31;
      art+=`<text x="13" y="${top}" fill="${ink}" font-family="Georgia,serif" font-size="11.5">${xml(note.title.length>27?note.title.slice(0,25)+'…':note.title)}</text>`;
      const lines=note.body.split('\n').slice(0,3);
      lines.forEach((body,j)=>{art+=`<text x="14" y="${top+24+j*18}" fill="${ink}" font-family="sans-serif" font-size="8.3" opacity=".82">${xml(body.length>33?body.slice(0,31)+'…':body)}</text>`;});
      art+='</g>';
    }
  }
  return art+'</svg>';
}
