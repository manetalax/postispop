// Original stationery compositions: history and professional routines.
// All illustrations are decorative and all templates are optional personal notes.
const notes=(...rows)=>rows.map(([title,...body])=>({title,body:body.join('\n')}));
const profile=(composition,paper,background,accent,details,noteTemplates)=>({composition,paper,background,accent,details,noteTemplates,edition:'crafted'});
export const themeProfilesC={
 'theme-041':profile('library','ruled','#423a32','#e2c498',['Estanterías de biblioteca','Lomos y escalera de madera','Lecturas y citas propias'],notes(['Mi lectura actual','Libro / autor','Página por continuar'],['Ideas del capítulo','Concepto principal','Una pregunta pendiente'],['Referencias','Título y edición','Página o enlace'],['Lista de lecturas','Quiero leer','Dónde conseguirlo'],['Citas y apuntes','Anotar la fuente','Escribir mi comentario'],['Esta semana','Reservar tiempo de lectura','Compartir un hallazgo'])),
 'theme-042':profile('letters','plain','#5b4140','#ebc9a3',['Correspondencia y lacre','Pluma, sobre y cinta postal','Borradores con intención'],notes(['A quién escribo','Nombre','Motivo de la carta'],['Lo que quiero decir','Mi idea principal','Un detalle personal'],['Primer borrador','Saludo / mensaje / cierre','Revisar el tono'],['Para enviar','Dirección / contacto','Fecha de envío'],['Correspondencia','Respuesta pendiente','Recordatorio'],['Frases para guardar','Una despedida','Una palabra que inspira'])),
 'theme-043':profile('archaeology','grid','#4d4639','#dcc39b',['Estratos y cerámica','Regla de campo y fragmentos','Fuentes y observaciones'],notes(['Pregunta de estudio','Periodo / lugar','Qué quiero comprender'],['Ficha de referencia','Objeto / material','Procedencia de la fuente'],['Observaciones','Dibujo o descripción','Detalles por comprobar'],['Cuaderno de visita','Museo / exposición','Fecha y sala'],['Cronología','Fecha aproximada','Contexto y bibliografía'],['Próxima investigación','Comparar dos fuentes','Anotar lo que falta'])),
 'theme-044':profile('castle','plain','#3d4651','#dbbf87',['Torres de piedra','Pendones y puente decorativo','Historia y narración'],notes(['Mi reino de ideas','Proyecto / propósito','Primer paso'],['Personajes y lugares','Nombre / papel','Detalle de ambientación'],['Cronología','Periodo histórico','Fuente consultada'],['Por investigar','Edificio / técnica','Pregunta pendiente'],['Escenas y bocetos','Situación / conflicto','Qué sucede después'],['Tareas de la semana','Revisar un capítulo','Guardar referencias'])),
 'theme-045':profile('clockwork','ruled','#403d38','#d4b287',['Mecanismos y esferas','Engranajes de latón','Rutinas y tiempo creativo'],notes(['Mi tiempo hoy','Prioridad principal','Tiempo reservado'],['Rutina de mañana','Primer hábito','Preparar el material'],['Proyecto en marcha','Duración prevista','Siguiente bloque'],['Pausa y revisión','Qué me ha funcionado','Qué puedo simplificar'],['Agenda','Hora / encuentro','Preparativos'],['Cierre del día','Tarea completada','Pendiente para mañana'])),
 'theme-047':profile('greece','plain','#36545b','#e0d3af',['Columnas y olivo','Friso geométrico continuo','Lectura y reflexión'],notes(['Pregunta del día','Qué quiero entender','Mi primera hipótesis'],['Una lectura','Obra / autor','Pasaje por comentar'],['Ideas en diálogo','Argumento','Otra perspectiva'],['Historia y contexto','Lugar / periodo','Fuente consultada'],['Mi cuaderno','Boceto / observación','Referencia'],['Próximo paso','Buscar una fuente','Revisar mi conclusión'])),
 'theme-048':profile('rome','journal','#663f37','#e4caa2',['Teselas y arquerías','Friso de mosaico','Rutas e historia cotidiana'],notes(['Mi ruta','Lugar / fecha','Puntos de la visita'],['Historia del lugar','Periodo','Fuente que consultar'],['Arquitectura','Detalle observado','Boceto / fotografía'],['Vida cotidiana','Objeto / costumbre','Contexto de la lectura'],['Preparar la visita','Entradas / horario','Agua y calzado'],['Después de la ruta','Ordenar apuntes','Guardar referencias'])),
 'theme-050':profile('historical-maps','grid','#414c3d','#d1c49a',['Curvas cartográficas','Brújula y rutas de estudio','Historia con contexto'],notes(['Tema de investigación','Periodo / región','Pregunta de estudio'],['Cronología','Acontecimiento','Fuente y fecha'],['Lectura del mapa','Escala / orientación','Contexto histórico'],['Perspectivas','Comparar testimonios','Anotar incertidumbres'],['Bibliografía','Autor / edición','Páginas relevantes'],['Síntesis personal','Qué cambió','Qué falta por comprobar'])),
 'theme-062':profile('journalism','ruled','#334653','#d6c4a5',['Cuaderno de reportería','Grabadora y tiras de prensa','Preguntas y verificación'],notes(['Ángulo de la historia','Qué quiero explicar','Por qué importa'],['Preguntas','Pregunta abierta','Dato que falta'],['Fuentes','Contacto / referencia','Consentimiento pendiente'],['Verificación','Afirmación por revisar','Fuente independiente'],['Borrador','Entrada / contexto / cierre','Revisar citas'],['Entrega','Fecha / formato','Última lectura'])),
 'theme-063':profile('woodwork','grid','#584431','#e8c194',['Vetas y escuadra','Regla lateral de taller','Medidas y proyecto'],notes(['Mi proyecto','Pieza / uso','Boceto inicial'],['Medidas','Largo / ancho / alto','Unidad de medida'],['Materiales','Madera / herrajes','Cantidad por preparar'],['Orden de trabajo','Primer paso','Revisar uniones'],['Acabado','Prueba de color','Tiempo de secado'],['Lista del taller','Herramientas necesarias','Ordenar al terminar'])),
 'theme-064':profile('fashion','dots','#563d4b','#eac3ca',['Cinta de costura','Carrete y patrón de papel','Diseño y confección'],notes(['Concepto','Prenda / ocasión','Referencia visual'],['Boceto','Forma / detalles','Variantes por probar'],['Materiales','Tejido / forro','Hilo / botones'],['Patrón','Pieza por revisar','Margen / ajuste'],['Prueba','Qué ajustar','Nueva comprobación'],['Acabados','Costuras / remates','Foto del resultado'])),
 'theme-065':profile('veterinary','ruled','#3e5d56','#d9d8ad',['Huellas y correa','Siluetas de perro y gato','Agenda personal de cuidados'],notes(['Mi compañero','Nombre','Recordatorio personal'],['Próxima consulta','Fecha / lugar','Preguntas que llevar'],['Documentos','Cartilla / informes','Preparar transportín'],['Rutina','Paseo / juego','Material por reponer'],['Observaciones','Fecha','Qué quiero comentar'],['Organización','Cita o tarea pendiente','Próximo recordatorio'])),
 'theme-067':profile('architecture','blueprint','#294959','#bbd7df',['Plano y compás','Cotas y escuadra','Bocetos de arquitectura'],notes(['Idea del proyecto','Uso / necesidades','Referencia espacial'],['Programa','Espacios necesarios','Relaciones entre áreas'],['Bocetos','Escala: ____','Cotas por comprobar'],['Materiales','Acabado / textura','Muestra por revisar'],['Reunión','Preguntas del proyecto','Acuerdos y siguiente paso'],['Entrega','Plano / documento','Fecha y revisión'])),
 'theme-068':profile('laboratory','grid','#354d58','#b9d9d2',['Vidrio y gradillas','Pipeta y escala lateral','Cuaderno de estudio'],notes(['Pregunta','Qué quiero estudiar','Hipótesis de trabajo'],['Lecturas','Artículo / fuente','Conceptos que repasar'],['Plan de estudio','Objetivo de la sesión','Material autorizado'],['Observaciones','Fecha / condiciones','Registro de resultados'],['Revisión','Comparar con la fuente','Anotar incertidumbres'],['Próxima sesión','Ordenar mis apuntes','Consultar una duda'])),
 'theme-069':profile('legal','ruled','#443c3b','#dac49a',['Balanza y biblioteca','Carpetas y marcapáginas','Estudio y agenda jurídica'],notes(['Asunto de estudio','Tema / pregunta','Alcance de la revisión'],['Fuentes','Norma / resolución','Versión y fecha'],['Lectura','Punto principal','Referencia exacta'],['Argumentos','Idea / apoyo','Cuestión por comprobar'],['Agenda personal','Reunión / entrega','Documentos por preparar'],['Próximo paso','Revisar vigencia','Consultar una duda'])),
 'theme-070':profile('automotive','grid','#3c4449','#ddc29a',['Rueda y herramientas','Llaves y piezas de taller','Mantenimiento personal'],notes(['Mi vehículo','Modelo / referencia','Recordatorio personal'],['Agenda del taller','Fecha / cita','Qué quiero consultar'],['Observaciones','Cuándo lo noté','Descripción del detalle'],['Documentos','Factura / revisión','Fecha y kilometraje'],['Materiales','Referencia de la pieza','Confirmar compatibilidad'],['Seguimiento','Próxima revisión','Guardar el comprobante']))
};
const rect=(x,y,w,h,fill,stroke,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const circle=(x,y,r,fill,stroke)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>`;
function gear(x,y,r,c){let teeth='';for(let n=0;n<12;n++)teeth+=`<path d="M-3 ${-r-4}h6v7h-6Z" transform="rotate(${n*30})" fill="${c}"/>`;return `<g transform="translate(${x} ${y})">${teeth}<circle r="${r}" fill="none" stroke="${c}" stroke-width="4"/><circle r="${r*.38}" fill="none" stroke="${c}" stroke-width="2"/></g>`;}
function bookRow(y,a){let s='';for(let n=0;n<20;n++){const h=13+n%4*3,x=25+n*34;s+=rect(x,y-h,26,h,n%3?'none':a,a,1)+`<path d="M${x+5} ${y-h+4}h16m-16 ${h-8}h16" stroke="${a}" opacity=".6"/>`;}return s;}
export function renderThemeC(d,{glyph,line}){
 const a=d.accent;let s='';
 switch(d.composition){
 case 'library':
  s+=bookRow(483,a)+line('M18 486h686',a,3,.9);
  for(const x of [23,666]){for(let row=0;row<4;row++){const y=142+row*72;s+=line(`M${x} ${y+46}h29`,a,2,.7);for(let n=0;n<4;n++)s+=rect(x+n*7,y+4+n%2*9,5,42-n%2*9,'none',a,1);}}
  s+=`<g transform="translate(607 23)">${rect(0,0,78,67,'#332f2a',a,3)}${line('M10 21h58M10 45h58M18 4v15m11-15v15m13-15v15m13-15v15M18 26v17m12-17v17m11-17v17m16-17v17',a,3,.8)}</g>`;
  break;
 case 'letters':
  s+=glyph('letter',620,32,1.25,a,.9)+glyph('nib',26,169,.55,a,.8);
  for(let n=0;n<22;n++)s+=line(`M${22+n*31} 477l12-10`,n%2?'#a7796b':'#94a8a5',5,.8);
  s+=circle(674,351,17,'#965346','#c18466')+circle(674,351,11,'none','#cc9d72')+line('M668 349l5 6 9-10','#e5be8f',1.8,.9);
  s+=`<path d="m661 366-5 37 12-7 6 9 7-39" fill="#a65a4c" opacity=".75"/>`;
  break;
 case 'archaeology':
  s+=glyph('archaeology',617,26,1.28,a,.9);
  for(let row=0;row<5;row++){const y=456+row*7;s+=`<path d="M18 ${y}q65 ${row%2?8:-7} 120 1t130 0 140 0 140 1 140-1" fill="none" stroke="${['#b78e6b','#d1b590','#9f825e','#e2c39b','#a79172'][row]}" stroke-width="5"/>`;}
  s+=line('M32 111v299',a,1,.6);for(let y=115;y<408;y+=12)s+=line(`M32 ${y}h${y%24?7:14}`,a,1,.6);
  s+=`<path d="m659 176 30 8-8 39-28-17Z" fill="#a77f60" stroke="${a}"/><path d="m661 251 25 4 5 29-36 2Z" fill="#91795f" stroke="${a}"/>`;
  break;
 case 'castle':
  for(const x of [22,663]){s+=rect(x,141,35,277,'#48535b',a,1);for(let y=156;y<417;y+=22){s+=line(`M${x} ${y}h35`,a,.6,.5);s+=line(`M${x+(y%44?12:24)} ${y}v22`,a,.6,.5);}for(let n=0;n<4;n++)s+=rect(x+n*9,132,6,16,'#48535b',a);s+=`<path d="M${x+12} 190a6 6 0 0 1 12 0v24h-12Z" fill="#27343d" stroke="${a}"/>`;}
  s+=glyph('castle',620,27,1.23,a,.9)+line('M18 482h684',a,3,.7);
  for(let x=39;x<701;x+=36)s+=line(`M${x} 481v-12h16v12`,a,1,.65);
  break;
 case 'clockwork':
  s+=circle(649,58,31,'#2f302d',a)+circle(649,58,26,'none',a)+line('M649 39v19l14 9',a,2.5,1);
  for(let n=0;n<12;n++)s+=`<path d="M649 34v4" transform="rotate(${n*30} 649 58)" stroke="${a}"/>`;
  s+=gear(38,176,14,a)+gear(40,215,20,'#977854')+gear(676,360,18,a)+gear(44,378,12,'#b1956d');
  for(let n=0;n<10;n++)s+=gear(42+n*70,473,6+n%3,a);
  break;
 case 'greece':
  for(const x of [27,669]){s+=line(`M${x-6} 129h29m-26 9h24m-23 290h24m-26 8h29`,a,3,.85);for(let n=0;n<4;n++)s+=line(`M${x+n*6} 141v283`,a,1,.6);}
  s+=glyph('columns',621,27,1.2,a,.9);
  for(let x=24;x<690;x+=32)s+=line(`M${x} 477v-19h23v13h-14v-7h8`,a,1.6,.8);
  s+=glyph('olive',26,76,.45,a,.7);break;
 case 'rome':
  s+=glyph('columns',623,24,1.12,a,.65);
  for(let n=0;n<14;n++){const x=22+n*49;s+=`<path d="M${x} 485v-20a19 19 0 0 1 38 0v20m-34 0v-16a15 15 0 0 1 30 0v16" fill="none" stroke="${a}" stroke-width="1.5"/>`;}
  for(const x of [27,669])for(let y=124;y<424;y+=18)s+=rect(x,y,15,15,(y/18)%2?'#aa725a':'#bc916e',a,1);
  s+=line('M610 83h83',a,2,.65);break;
 case 'historical-maps':
  for(let n=0;n<7;n++)s+=`<path d="M18 ${140+n*38}c38-20 32 26 14 41s11 25 24 13M701 ${148+n*36}c-34-20-35 23-19 36s-11 27-29 20" fill="none" stroke="${a}" stroke-width=".7" opacity=".35"/>`;
  s+=glyph('compass',621,27,1.2,a,.9);
  s+=`<path d="M28 473c72-33 121 13 179-7s99 25 171 2 170 25 316-5" fill="none" stroke="${a}" stroke-dasharray="5 5" stroke-width="1.5"/>`;
  for(const x of [48,211,384,580])s+=circle(x,470,4,'#b29764',a);
  break;
 case 'journalism':
  s+=glyph('news',624,24,1.2,a,.9);
  s+=rect(25,149,29,69,'#27363e',a,4)+circle(40,167,7,'none',a)+line('M31 185h18m-18 7h18M34 207h4m6 0h4',a,1.5,.8);
  s+=rect(663,319,28,71,'#e3d7bd','#9b8d75',1)+line('M667 328h20m-20 5h20m-20 8h8m4 0h8m-20 5h8m4 0h8m-20 5h8m4 0h8m-20 8h20','#5f625e',1,.7);
  for(let n=0;n<10;n++)s+=rect(28+n*69,459,61,23,'none',a,1)+line(`M${33+n*69} 466h49m-49 7h37`,a,.8,.5);
  break;
 case 'woodwork':
  for(const x of [25,664]){s+=rect(x,113,27,317,'#bb925b','#dcb884',2);for(let y=121;y<426;y+=8)s+=line(`M${x} ${y}h${y%16?9:16}`,'#5b4734',.8,.85);}
  s+=glyph('ruler',621,26,1.18,a,.9);
  s+=rect(18,457,684,25,'#8e6842',a,2);
  for(let n=0;n<3;n++)s+=line(`M24 ${463+n*7}q85-7 150 0t150 0 150 0 220 0`,'#d2a973',1,.6);
  s+=`<ellipse cx="549" cy="470" rx="28" ry="6" fill="none" stroke="#d2a973"/><ellipse cx="549" cy="470" rx="15" ry="3" fill="none" stroke="#d2a973"/>`;break;
 case 'fashion':
  s+=glyph('dress',622,25,1.19,a,.9);
  s+=`<path d="M35 113q27 75 0 149t3 164" fill="none" stroke="#d6cbb1" stroke-width="19"/>`;
  for(let y=119;y<426;y+=12)s+=line(`M33 ${y}h9`,'#645950',.8,.8);
  s+=rect(659,253,28,40,'#c4a4ae',a,5)+rect(654,247,39,8,a,a,2)+rect(654,293,39,8,a,a,2);
  s+=`<path d="M674 304c-25 61 32 92-8 127M29 473q70-19 138 0t138 0 138 0 138 0 115 0" fill="none" stroke="${a}" stroke-width="1.3" stroke-dasharray="3 4"/>`;break;
 case 'veterinary':
  s+=glyph('paw',622,27,1.16,a,.9);
  s+=`<path d="M35 120v180c0 38 18 50 18 82s-33 42-30 0" fill="none" stroke="#adba9b" stroke-width="4"/><path d="M30 117h10v-12H30Z" fill="none" stroke="${a}" stroke-width="2"/>`;
  s+=`<path d="M660 411v-46l6-13 8 8 8-8 7 13v46m-29-6c-15-23-15-46-4-42m4 42h29" fill="#87998a" stroke="${a}"/>`;
  for(let n=0;n<12;n++)s+=glyph('paw',27+n*56,462,.34,a,.7);break;
 case 'architecture':
  s+=glyph('ruler',619,24,1.2,a,.95)+line('M34 112v320m-12-319h27m-27 319h27',a,1,.6);
  for(let y=122;y<431;y+=25)s+=line(`M30 ${y}h8`,a,.8,.65);
  s+=`<path d="M675 152 660 244m15-92 17 92m-18-92v-17" fill="none" stroke="${a}" stroke-width="2.4"/><circle cx="675" cy="152" r="5" fill="${a}"/>`;
  s+=line('M25 478h670m-650-20v26m631-26v26M34 466h613',a,1,.65)+`<path d="m42 462-8 4 8 4m597-8 8 4-8 4" stroke="${a}" fill="none"/>`;break;
 case 'laboratory':
  s+=glyph('flask',621,25,1.2,a,.9);
  s+=rect(25,165,25,185,'none',a,12)+rect(28,262,19,75,'#89b3a5','none',8);
  for(let y=185;y<327;y+=15)s+=line(`M27 ${y}h${y%30?9:16}`,a,.8,.7);
  s+=`<path d="M670 126h10v99l-5 14-5-14Z" fill="none" stroke="${a}" stroke-width="1.5"/>`;
  for(let n=0;n<16;n++){const x=28+n*42;s+=rect(x,452,12,29,'none',a,6)+rect(x+2,466+n%3*3,8,12-n%3*3,['#b7be8f','#85a6ba','#bc9c9c'][n%3],'none',3);}
  s+=line('M22 465h678m-678 19h678',a,2,.7);break;
 case 'legal':
  s+=glyph('scales',620,26,1.26,a,.9)+bookRow(483,a);
  for(const x of [25,666])for(let n=0;n<5;n++){const y=130+n*59;s+=rect(x,y,26,50,'#655044',a,2)+line(`M${x+5} ${y+9}h16m-16 30h16`,a,1,.7);}
  s+=`<path d="M640 90h27v28l-13-8-14 8Z" fill="#a68169"/>`;break;
 case 'automotive':
  s+=circle(650,58,31,'#2b3034','#bba88b')+circle(650,58,19,'none',a)+circle(650,58,6,'none',a);
  for(let n=0;n<8;n++)s+=`<path d="M650 38v14m-9-23h18" transform="rotate(${n*45} 650 58)" fill="none" stroke="${a}" stroke-width="2"/>`;
  s+=glyph('wrench',23,151,.66,a,.8)+glyph('wrench',660,317,.7,a,.8);
  for(let n=0;n<20;n++)s+=`<path d="m${25+n*34} 463 11 14 11-14" fill="none" stroke="#9aa09b" stroke-width="4" opacity=".65"/>`;
  s+=line('M37 254v94m-10-88 20 8-20 8 20 8-20 8 20 8-20 8 20 8-20 8 20 8',a,1.7,.7);break;
 }
 return s;
}
