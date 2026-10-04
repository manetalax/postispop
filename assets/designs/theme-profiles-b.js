// Original PostisPop compositions: sports, arts and reflective stationery.
// Coordinates reserve all six note rectangles. Religious themes are creative
// motifs for personal organisation, not representations of every believer.
const notes = (...rows) => rows.map(([title,...body]) => ({title,body:body.join('\n')}));
const profile = (composition,paper,background,accent,details,noteTemplates) => ({composition,paper,background,accent,details,noteTemplates,edition:'crafted'});
export const themeProfilesB = {
 'theme-071':profile('football','grid','#203f37','#d4e6b4',['Campo táctico','Conos y camiseta','Agenda del equipo'],notes(['Próximo partido','Día / campo / hora','Confirmar convocatoria'],['Mi entrenamiento','Una habilidad por practicar','Duración prevista'],['Equipo preparado','Botas / ropa / agua','Revisar antes de salir'],['Organización','Reparto de tareas','Persona de contacto'],['Después del partido','Lo que salió bien','Una mejora para la semana'],['Agenda de equipo','Entrenamiento / encuentro','Avisar de cambios'])),
 'theme-072':profile('basketball','dots','#493225','#f1d7a5',['Tablero de canasta','Pista de madera','Seguimiento de práctica'],notes(['Próxima cancha','Lugar / horario','Con quién entreno'],['Tiro del día','Zona por practicar','Intentos / aciertos'],['Control del balón','Ejercicio elegido','Qué quiero mejorar'],['Mi equipo','Zapatillas / botella','Ropa de recambio'],['Partido próximo','Día / rival / lugar','Confirmar transporte'],['Aprendizajes','Una jugada que entendí','Repetir en la práctica'])),
 'theme-073':profile('running','ruled','#293f49','#c2e1d8',['Carriles de atletismo','Cronómetro lateral','Registro de sensaciones'],notes(['Ruta próxima','Salida / llegada','Revisar el recorrido'],['Sesión prevista','Tiempo disponible','Ritmo cómodo personal'],['Mi registro','Distancia / tiempo','Cómo me sentí'],['Antes de salir','Calzado / agua / llaves','Consultar el tiempo'],['Recuperación','Descanso programado','Anotar molestias para consultar'],['Pequeño avance','Algo que mejoró','Próximo objetivo realista'])),
 'theme-074':profile('yoga','plain','#4b3c4b','#ecd7c2',['Esterilla enrollada','Luz y vegetación','Espacio de práctica'],notes(['Mi momento','Día / hora / lugar','Reservar un rato tranquilo'],['Preparar el espacio','Esterilla / ropa cómoda','Agua y apoyo que necesite'],['Intención personal','Cómo llego hoy','Qué necesito cuidar'],['Clase o práctica','Profesor / sesión','Anotar dudas'],['Sensaciones','Qué me resultó cómodo','Qué consultar o adaptar'],['Cierre del día','Una pausa que agradezco','Mi siguiente encuentro'])),
 'theme-075':profile('swimming','grid','#173f55','#c8e6eb',['Corcheras y agua','Escalera de piscina','Bolsa de natación'],notes(['Mi sesión','Piscina / calle / hora','Consultar disponibilidad'],['Bolsa lista','Gafas / gorro / toalla','Ropa seca y agua'],['Objetivo personal','Técnica por practicar','Comentario del monitor'],['Registro','Largos / tiempo','Sensaciones al terminar'],['Próxima clase','Día / hora','Dudas por resolver'],['Cuidado del equipo','Aclarar y secar material','Reponer lo necesario'])),
 'theme-076':profile('cycling','journal','#3c4143','#e5dfa9',['Plato y cadena','Bomba de taller','Plan de ruta ciclista'],notes(['Mi ruta','Origen / destino','Distancia aproximada'],['Revisión previa','Ruedas / frenos / luces','Consultar a taller si hace falta'],['Lo que llevo','Casco / agua / kit básico','Documentación / teléfono'],['Salida en grupo','Hora / punto de encuentro','Contacto del grupo'],['Registro personal','Recorrido completado','Sensaciones y aprendizaje'],['Mantenimiento','Tarea pendiente','Fecha o cita de taller'])),
 'theme-077':profile('climbing','dots','#453a32','#dfc9a5',['Mosquetón y cuerda','Presas de color','Diario de rocódromo'],notes(['Próxima sesión','Rocódromo / horario','Compañía o instructor'],['Objetivo técnico','Movimiento por practicar','Consejo del instructor'],['Material','Lista del centro','Revisión con personal cualificado'],['Vías recordadas','Nombre / nivel del centro','Qué aprendí'],['Pausa y descanso','Cómo me encuentro','Planificar recuperación'],['Próxima pregunta','Una duda de técnica','Preguntar antes de intentar'])),
 'theme-078':profile('surf','journal','#244950','#ebd4a6',['Tabla con aletas','Olas y costa','Cuaderno de sesiones'],notes(['Próxima salida','Playa / hora','Consultar avisos oficiales'],['Mi equipo','Tabla / traje / toalla','Revisar con el instructor'],['Aprendizaje','Lo practicado en clase','Una duda por resolver'],['Diario de mar','Lugar / condiciones observadas','Sensaciones personales'],['Con quién voy','Grupo / escuela','Punto de encuentro'],['Después','Aclarar y guardar material','Próxima sesión'])),
 'theme-079':profile('martial','plain','#3c3437','#e3cebe',['Cinturón anudado','Tatami geométrico','Cuaderno de disciplina'],notes(['Mi próxima clase','Día / dojo / horario','Confirmar asistencia'],['Material listo','Uniforme / agua','Protecciones indicadas'],['Técnica de estudio','Nombre visto en clase','Corrección del instructor'],['Práctica consciente','Qué entiendo mejor','Qué debo preguntar'],['Agenda','Seminario / clase','Inscripción por confirmar'],['Progreso personal','Constancia esta semana','Objetivo para la siguiente'])),
 'theme-080':profile('motorsport','grid','#30383d','#e1d2ac',['Bandera a cuadros','Trazado de circuito','Cuaderno de competición'],notes(['Próximo evento','Circuito / fecha','Entrada o inscripción'],['Preparar visita','Transporte / agua / protección','Revisar normas del recinto'],['Mi seguimiento','Categoría / participantes','Horario publicado'],['Notas de carrera','Momento destacado','Dato que quiero comprobar'],['Proyecto de taller','Pieza o tarea','Profesional o proveedor'],['Mis referencias','Ficha / reglamento','Guardar fuente y fecha'])),
 'theme-081':profile('watercolour','washi','#455654','#ecdcbb',['Caja de acuarelas','Pinceles y lavados','Muestras de mezcla'],notes(['Motivo por pintar','Referencia propia','Qué quiero observar'],['Paleta de hoy','Pigmentos elegidos','Mezcla por probar'],['Preparación','Papel / agua / pinceles','Proteger la mesa'],['Ensayo pequeño','Carga de agua','Resultado de la prueba'],['Durante el proceso','Secado / siguiente capa','Decisión que quiero recordar'],['Archivo de obra','Título / fecha','Foto y materiales usados'])),
 'theme-082':profile('cinema','plain','#343339','#e6ccb0',['Claqueta numerada','Carretes y fotogramas','Diario de cine'],notes(['Próxima película','Título / año / dirección','Dónde verla legalmente'],['Mi observación','Escena que me interesa','Luz / montaje / sonido'],['Sin destripes','Qué me transmitió','Para quién la recomendaría'],['Cine compartido','Día / sala / hora','Con quién voy'],['Lista pendiente','Una película por descubrir','Por qué me llamó la atención'],['Mi proyecto','Idea para una escena','Primer paso de producción'])),
 'theme-083':profile('reading','ruled','#484038','#e8d4b6',['Estantería en miniatura','Marcapáginas tejido','Diario de lectura'],notes(['Lectura actual','Título / autor','Página en la que sigo'],['Mi rato de lectura','Momento / lugar','Preparar el libro'],['Idea que guardo','Resumen con mis palabras','Página o capítulo'],['Preguntas','Algo que quiero entender','Buscar una referencia'],['Club de lectura','Fecha / capítulos','Tema para conversar'],['Próximo libro','Título / recomendación','Biblioteca o librería'])),
 'theme-084':profile('chess','grid','#303e3d','#e4dbc1',['Tablero de estudio','Caballo y reloj','Registro de partidas'],notes(['Partida para revisar','Fecha / rival o motor','Guardar la notación'],['Posición de estudio','Turno de quién','Mi candidata y mi motivo'],['Táctica del día','Tema del ejercicio','Qué pasé por alto'],['Finales','Posición que practico','Idea que debo recordar'],['Próximo encuentro','Club / fecha / horario','Formato de juego'],['Aprendizaje','Un error recurrente','Qué observaré la próxima vez'])),
 'theme-085':profile('gardening','journal','#324a35','#d8e0b0',['Semillero y macetas','Etiquetas de cultivo','Diario del jardín'],notes(['Mis plantas','Nombre / ubicación','Condiciones observadas'],['Próxima tarea','Riego o cuidado pendiente','Comprobar necesidades reales'],['Semillero','Especie / fecha','Etiquetar cada recipiente'],['Observaciones','Brote / hoja / cambio','Tomar una foto'],['Material pendiente','Sustrato / herramienta','Consultar antes de comprar'],['Calendario personal','Revisión del jardín','Qué funcionó este mes'])),
 'theme-086':profile('painting','plain','#4a3f45','#ecd1b0',['Caballete de taller','Tarros y pinceles','Mesa de trabajo'],notes(['Mi obra','Tema / formato','Intención personal'],['Referencias','Foto propia o autorizada','Guardar origen'],['Preparación','Soporte / pintura / útiles','Ventilación según material'],['Decisión de color','Paleta principal','Una prueba antes de seguir'],['Próxima sesión','Parte por resolver','Tiempo disponible'],['Registro','Fecha / materiales','Lo que aprendí'])),
 'theme-087':profile('manga','dots','#3d3749','#e6cbdc',['Viñetas y tramas','Plumilla de entintado','Guion de página'],notes(['Mi personaje','Deseo / dificultad','Rasgo que lo distingue'],['Página de hoy','Qué ocurre primero','Qué cambia al final'],['Miniaturas','Distribuir las viñetas','Orden de lectura'],['Expresión','Emoción por mostrar','Referencia de gesto'],['Entintado','Herramienta / grosor','Prueba de trama'],['Revisión','Texto legible','Continuidad y siguiente página'])),
 'theme-088':profile('astrophoto','grid','#24324b','#d0d9ef',['Telescopio y horizonte','Carta celeste lateral','Plan de observación'],notes(['Mi objetivo','Cuerpo celeste o paisaje','Referencia para identificar'],['Salida prevista','Lugar / hora','Revisar acceso y meteorología'],['Equipo listo','Cámara / soporte / batería','Linterna y ropa adecuada'],['Prueba técnica','Ajustes iniciales','Revisar enfoque en la captura'],['Registro de sesión','Fecha / lugar / condiciones','Qué funcionó'],['Edición posterior','Seleccionar archivos','Guardar originales y copia'])),
 'theme-089':profile('calligraphy','ruled','#4a3935','#f0d6b1',['Plumín y tintero','Guías de escritura','Práctica de trazos'],notes(['Mi práctica','Estilo que estudio','Referencia de aprendizaje'],['Material','Papel / tinta / útil','Probar compatibilidad'],['Trazo básico','Forma por repetir','Ritmo y presión cómodos'],['Palabra de hoy','Texto breve elegido','Espaciado por observar'],['Mi muestra','Fecha / herramienta','Qué cambió en el resultado'],['Próxima sesión','Una mejora concreta','Preparar la hoja'])),
 'theme-090':profile('origami','washi','#3e4852','#e1d2c7',['Grulla de papel','Pliegues en abanico','Mesa de plegado'],notes(['Modelo elegido','Nombre / autor de instrucciones','Guardar la fuente'],['Papel preparado','Tamaño / color / textura','Cantidad necesaria'],['Paso que estudio','Pliegue por comprender','Marcar dónde retomar'],['Prueba de modelo','Qué salió bien','Dónde debo ajustar'],['Mi colección','Fecha / papel usado','Fotografiar la pieza'],['Próxima creación','Modelo que quiero aprender','Material disponible'])),
 'theme-091':profile('gratitude','journal','#484044','#ead9bb',['Cuaderno y flores','Tarjetas de gratitud','Pequeños momentos'],notes(['Un momento de hoy','Qué pasó','Por qué lo agradezco'],['Una persona','Algo que valoro','Un gesto para expresar gracias'],['Algo cotidiano','Un detalle que observé','Cómo me hizo sentir'],['Lo que aprendí','Una experiencia reciente','Qué quiero recordar'],['Cuidado personal','Un gesto amable conmigo','Reservar un momento'],['Para mañana','Algo sencillo que deseo hacer','Sin exigirme perfección'])),
 'theme-092':profile('family','plain','#59413b','#ecd5ae',['Guirnalda de reunión','Mesa compartida','Agenda de celebración'],notes(['Nuestro encuentro','Fecha / lugar / hora','Confirmar asistentes'],['Mesa compartida','Qué prepara cada persona','Preferencias y alergias consultadas'],['Preparativos','Material que necesitamos','Quién se encarga'],['Un recuerdo','Foto o anécdota elegida','Pedir permiso para compartir'],['Plan del día','Bienvenida / actividad','Dejar espacio para conversar'],['Después','Agradecimientos','Lo que queremos repetir'])),
 'theme-093':profile('calendar','shift','#3b4657','#e4d7bf',['Rueda de estaciones','Pestañas de calendario','Fechas elegidas por ti'],notes(['Fechas importantes','Evento / día','Confirmar calendario local'],['Preparar con tiempo','Una tarea previa','Cuándo empezar'],['Con quién celebrar','Personas que quiero invitar','Consultar disponibilidad'],['Mi tradición','Qué significa para mí','Cómo deseo recordarla'],['Lista práctica','Material / comida / traslado','Presupuesto previsto'],['Al terminar','Lo que disfrutamos','Idea para la próxima vez'])),
 'theme-094':profile('peace','plain','#3b5051','#d6e3c6',['Rama y ave estilizada','Ondas suaves','Pausa para reflexionar'],notes(['Mi pausa','Cómo me encuentro','Un momento para escucharme'],['Puedo cuidar','Una acción pequeña','Lo que depende de mí'],['Quiero comprender','Una pregunta abierta','Escuchar otra perspectiva'],['Conversación pendiente','Qué quiero expresar con respeto','Elegir buen momento'],['Un espacio tranquilo','Lugar / actividad','Reservar tiempo'],['Cierre del día','Algo que puedo soltar','Un paso amable para mañana'])),
 'theme-095':profile('hope','journal','#443f51','#eddaad',['Luz en una ventana','Semillas y brotes','Diario de esperanza'],notes(['Algo que espero','Una posibilidad cercana','Mi primer paso'],['Apoyos','Persona o recurso de confianza','Cómo pedir ayuda'],['Mi avance','Algo pequeño que logré','Reconocer el esfuerzo'],['Para un día difícil','Un recordatorio amable','Un contacto de apoyo'],['Proyecto con calma','Objetivo que me ilusiona','Próxima tarea posible'],['Lo que crece','Aprendizaje de esta semana','Qué quiero cuidar'])),
 'theme-096':profile('stainedglass','ruled','#343d55','#e7d3af',['Vidriera y arcos','Luz de color','Reflexión personal cristiana'],notes(['Mi lectura','Pasaje o libro elegido','Fuente y página'],['Reflexión personal','Qué me invita a pensar','Una pregunta para estudiar'],['Agradecimiento','Un detalle de hoy','A quién quiero agradecer'],['Mi comunidad','Encuentro / fecha / lugar','Consultar organización'],['Gesto de cuidado','Una ayuda que puedo ofrecer','Respetar lo que necesita el otro'],['Mi semana','Tiempo para lectura o silencio','Recordatorio personal'])),
 'theme-097':profile('islamicgeometry','dots','#254b4c','#e6d4a0',['Geometría de ocho puntas','Marco entrelazado','Estudio y reflexión personal'],notes(['Mi lectura','Texto o libro elegido','Fuente y página'],['Idea para estudiar','Qué quiero comprender','Consulta o referencia'],['Agenda personal','Encuentro / fecha / lugar','Confirmar con mi comunidad'],['Gratitud','Un momento que agradezco','Un gesto que quiero cuidar'],['Mi organización','Tarea importante de hoy','Tiempo que necesito'],['Gesto generoso','Algo que puedo compartir','Consultar qué será útil'])),
 'theme-098':profile('jewishstudy','study','#334454','#e9dbbd',['Libro abierto y márgenes','Granadas estilizadas','Estudio y memoria personal'],notes(['Mi estudio','Libro o texto elegido','Referencia exacta'],['Una pregunta','Qué quiero entender mejor','Con quién conversar'],['Idea que guardo','Resumen con mis palabras','Fuente o página'],['Memoria familiar','Historia que deseo recoger','Pedir permiso y anotar contexto'],['Mi comunidad','Encuentro / fecha','Confirmar información local'],['Gesto de cuidado','Una acción posible','Qué necesita la otra persona'])),
 'theme-099':profile('lotusgarden','plain','#3e4c43','#e4d6b5',['Loto y piedras','Arena rastrillada','Cuaderno de observación'],notes(['Mi pausa','Lugar y tiempo disponible','Cómo llego hoy'],['Observación','Un detalle que percibo','Sin tener que juzgarlo'],['Mi lectura','Texto elegido para estudiar','Fuente y pregunta'],['Gesto amable','Algo que puedo hacer','Escuchar lo que necesita el otro'],['Aprendizaje','Qué comprendí hoy','Qué quiero seguir explorando'],['Mi semana','Espacio para práctica personal','Ajustar a mis posibilidades'])),
 'theme-100':profile('flowerlights','journal','#593b49','#ecd29e',['Guirnalda floral','Lámparas y pétalos','Color y reflexión personal'],notes(['Mi lectura','Texto o referencia elegida','Qué deseo comprender'],['Reflexión','Una idea que me acompaña','Pregunta para estudiar'],['Encuentro','Fecha / lugar / comunidad','Confirmar detalles locales'],['Preparativos','Material o tarea acordada','Respetar preferencias del grupo'],['Gratitud','Algo que valoro hoy','Un gesto de cuidado'],['Memoria personal','Un momento significativo','Qué quiero conservar'])),
};

for (const id of ['theme-096','theme-097','theme-098','theme-099','theme-100']) {
 themeProfilesB[id].culturalNote='Inspiración creativa para una agenda personal. Los motivos elegidos no representan todas las prácticas ni identidades de esta tradición; no se incluyen textos sagrados inventados.';
}

const rect=(x,y,w,h,fill,stroke='none',r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const circle=(x,y,r,fill,stroke='none',sw=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,fill,stroke='none',sw=1)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const range=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
const flower=(x,y,size,fill,centre)=>range(6,i=>`<ellipse cx="${x}" cy="${y-size}" rx="${size*.45}" ry="${size*.75}" transform="rotate(${i*60} ${x} ${y})" fill="${fill}"/>`)+circle(x,y,size*.35,centre);


export function renderThemeB(design,{glyph,line}) {
 const a=/^#[0-9a-f]{6}$/i.test(design.accent)?design.accent:'#e6d8b5';
 const c=design.composition; let out='';
 if(c==='football') {
  out+=rect(610,29,78,56,'#2d5947',a,3)+rect(618,36,62,42,'none',a)+line('M649 36v42',a,1)+circle(649,57,9,'none',a);
  out+=line('M26 455h668v29H26Zm330 0v29M26 462h25v15H26m668-15h-25v15h25',a,1.1,.7)+circle(359,469,9,'none',a);
  out+=range(3,i=>path(`M25 ${181+i*40}h26l-7-24H32Z`,['#d88d60','#e5b076','#ce9d66'][i]))+path('M659 301l10-9h15l10 9-5 12-7-5v40h-16v-40l-7 5Z','#799a85',a);
 } else if(c==='basketball') {
  out+=rect(618,27,67,39,'#d8c6a5','#9c7658',3)+rect(640,40,23,17,'none','#825735')+line('M635 62h33m-30 1 5 20h18l5-20m-24 6h22m-20 7h18','#e9b881',2)+circle(625,85,8,'#c87946','#f0c090');
  out+=range(14,i=>rect(22+i*49,455,48,28,i%2?'#76583f':'#6c4e38'))+line('M34 470h120l-7-5m7 5-7 5M300 457v25m-10-12h20M516 470h126l-7-5',a,1.2,.8);
  out+=rect(23,175,31,68,'#292b2c',a,3)+range(3,i=>rect(29,183+i*17,18,10,'none','#c19d6e',1))+glyph('basket',661,325,.65,a,.7);
 } else if(c==='running') {
  out+=glyph('shoe',616,38,1.25,a,.9)+circle(39,189,17,'#d5e2dc','#769892',2)+line('M39 189v-11m0 11 7 5M35 165h8m-4 0v7','#496b6b',2);
  out+=range(4,i=>`<rect x="${25+i*7}" y="${454+i*3}" width="${666-i*14}" height="${30-i*6}" rx="${15-i*3}" fill="none" stroke="${a}" stroke-width=".8" opacity="${.35+i*.1}"/>`);
  out+=rect(665,286,21,77,'#b6cdc2','#d6e5d9',7)+rect(670,274,11,14,a,'none',3)+line('M669 318h13m-13 6h13','#4e7878',1);
 } else if(c==='yoga') {
  out+=circle(649,51,24,'none',a)+line('M617 82q31-14 63 0M623 87q27-10 52 0',a,2)+range(7,i=>{const angle=(i/6)*Math.PI;return line(`M${649+Math.cos(angle)*30} ${51-Math.sin(angle)*30}l${Math.cos(angle)*8} ${-Math.sin(angle)*8}`,a,1,.6);});
  out+=rect(88,455,527,27,'#8e7b87','#cab5bd',10)+range(7,i=>line(`M${119+i*71} 459v19`,'#cbb9c0',.7,.5))+circle(91,468,13,'#a68d9b','#dbc4cd')+circle(91,468,6,'none','#dbc4cd');
  out+=line('M37 159v163m0-118c-23 0-17-29 0-21m0 62c22 0 17-30 0-20m0 66c-20 0-19-29 0-21','#a7b7a5',1.6)+rect(665,338,24,42,'#e6d5b9','none',3)+path('M677 316c-16 17 13 24 0 0Z','#dfb67c');
 } else if(c==='swimming') {
  out+=path('M610 47q18-12 35 1h13q16-13 32-1l-6 26h-21l-11-15-11 15h-22Z','#9dbbc4',a,2)+line('M615 52h21m33 0h16',a,1);
  out+=range(22,i=>rect(26+i*30,460,25,10,i%3?'#9cc3ca':'#dfd4af','none',4))+line('M23 478q30-9 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0',a,1,.7);
  out+=line('M660 321v-137q0-18 12-18m10 155V184q0-18 12-18M660 211h22m-22 28h22m-22 28h22m-22 28h22','#b5d7d9',3)+rect(25,197,27,94,'#8ba8b3',a,3)+line('M30 204v78m6-78v78m6-78v78',a,1,.5);
 } else if(c==='cycling') {
  out+=circle(652,58,27,'none',a,2)+circle(652,58,16,'none',a)+circle(652,58,5,a)+range(12,i=>`<g transform="rotate(${i*30} 652 58)">${rect(649,26,6,7,a)}</g>`)+line('M652 58l25 17m-25-17-21-11',a,3);
  out+=range(29,i=>`<ellipse cx="${30+i*23}" cy="469" rx="13" ry="6" fill="none" stroke="${a}" stroke-width="1.3"/>`)+line('M674 189v168m-10-168h20m-24 173h28m-14-63h15v53',a,3,.8);
  out+=rect(25,186,27,181,'#242a2c',a,10)+range(15,i=>line(`M29 ${192+i*11}l8 7 11-7`,a,.7,.5));
 } else if(c==='climbing') {
  out+=`<g transform="rotate(23 650 58)"><rect x="629" y="27" width="41" height="66" rx="18" fill="none" stroke="${a}" stroke-width="5"/><path d="M668 45v24" stroke="#c88464" stroke-width="7"/></g>`;
  out+=line('M31 126v287m8-287v287',a,2,.65)+range(13,i=>line(`M30 ${135+i*20}l10 10`,a,1,.5));
  out+=range(12,i=>path(`M${29+i*56} 477q-8-19 8-20l13 5-7 15Z`,['#bb886c','#92a590','#d2bb91'][i%3]))+circle(674,253,15,'none',a,3)+line('M674 236c-22 13 21 39 0 54m0-54c22 13-21 39 0 54',a,2);
 } else if(c==='surf') {
  out+=path('M647 22c31 22 26 54-4 69-28-24-22-55 4-69Z','#ddc5a1',a)+line('M647 24l-3 64','#648a8a',2)+path('M643 72l12 5-11 3Z','#638582');
  out+=line('M23 464q24-18 47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0M23 477q24-11 47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0t47 0',a,1.2,.65);
  out+=path('M38 164c24 52 21 129 0 171-22-45-23-125 0-171Z','#b7bca0',a)+line('M38 173v151','#577d7b',2)+path('M659 363q15-49 31 0Zm15-1v-27m-7 24-3-15m18 15 3-15','#ddc6a5','#a78e72',1);
 } else if(c==='martial') {
  out+=path('M611 43h32l11 14 13-14h27v14h-24l-16 13-14-13h-29Z','#d8c9b2',a)+path('M648 63l-8 29 13-4 3-20 8 21 12-1-16-27Z','#d8c9b2',a);
  out+=range(11,i=>rect(24+i*61,455,60,28,i%2?'#918575':'#6a746b'))+line('M25 468h668',a,.8,.4);
  out+=path('M24 175l11-8 10 8 11 15-8 10-5-8v60H29v-60l-6 8-6-10Z','#c9c0a9',a)+line('M29 214h15m-10-38 6 34', '#71695d',2)+circle(675,342,15,'none',a,2)+line('M675 329v13l7 5m-13-24h12',a,2);
 } else if(c==='motorsport') {
  out+=line('M619 86l33-58m28 58-32-58',a,2)+range(4,i=>range(3,j=>rect(619+i*9,28+j*9,9,9,(i+j)%2?a:'#3c4549')))+range(4,i=>range(3,j=>rect(655+i*9,28+j*9,9,9,(i+j)%2?'#3c4549':a)));
  out+=path('M33 474h122q32 0 47-15h98q21 0 25 17h116q20 0 26-17h145q36 0 72 14','none','#b6b5aa',6)+line('M34 474h117q36 0 52-15h96q22 0 26 17h115q20 0 27-17h145q36 0 72 14','#3f474a',2);
  out+=rect(26,184,29,80,'#1b2428',a,3)+range(4,i=>line(`M32 ${198+i*15}h17`,a,2,.6))+range(4,i=>circle(676,267+i*31,13,'#20292c','#767e7c',3));
 } else if(c==='watercolour') {
  out+=path('M612 37q52-29 80 16 7 37-31 33-7-17-29-8-31 1-20-41Z','#ded0b7','#aa9e88',1)+range(5,i=>circle(624+i*12,49+(i%2)*13,5,['#b27b7c','#bc985c','#72908a','#7d8aaa','#aa86a0'][i]))+circle(674,70,5,'#4a5b59');
  out+=range(6,i=>rect(25,175+i*28,25,21,['#bd9672','#96a398','#8995b0','#bd9497','#c9b486','#8caeb1'][i],a,3));
  out+=path('M25 468q70-23 130-7t140 0 140 7 150-9l100 18H25Z','#91aba1')+path('M30 476q73-15 145-3t136-3 153 0 110-2 115 7v9H30Z','#b7c8b5');
  out+=line('M669 186l7 183m10-186-5 186',a,4,.8)+path('M671 371h16l-5 18-8-2Z','#a7c0ae');
 } else if(c==='cinema') {
  out+=rect(611,43,80,42,'#23282b',a,3)+path('M611 40l74-16 5 17-77 17Z','#303439',a)+range(5,i=>line(`M${619+i*14} ${36-i*3}l7 13`,a,6,.8))+line('M621 62h55m-55 10h35',a,1,.6);
  out+=rect(25,454,670,30,'#22262b',a)+range(24,i=>rect(31+i*27,458,16,4,a))+range(24,i=>rect(31+i*27,477,16,4,a))+range(12,i=>rect(34+i*55,465,42,8,'#787275'));
  out+=rect(25,171,28,180,'#282b31',a,3)+range(10,i=>rect(29,177+i*17,6,9,a))+range(10,i=>rect(44,177+i*17,6,9,a))+circle(675,228,18,'#a8988c',a)+range(5,i=>circle(675+Math.cos(i*1.256)*10,228+Math.sin(i*1.256)*10,4,'#4e4545'));
 } else if(c==='reading') {
  out+=glyph('book',615,30,1.36,a,.9)+line('M650 47v39','#b59d7c',1);
  out+=range(17,i=>rect(28+i*39,455-(i%4)*2,32+(i%2)*4,27+(i%4)*2,['#b49b76','#879790','#a58b7e','#bdb19a'][i%4],'#d7c5a7',2))+range(17,i=>line(`M${31+i*39} 474h25`,'#eee0c6',1,.8));
  out+=path('M27 161h23v137l-11-10-12 10Z','#b99a78',a)+range(7,i=>line(`M32 ${174+i*12}h12`,a,.8,.65))+glyph('cup',661,338,.7,a,.65);
 } else if(c==='chess') {
  out+=path('M625 87h59l-6-14h-41l-3-19 17-4-3-16 16-13 5 11 13 14-8 17-9 10h-10l4-28-12 11-9-1-8 16-9 15Z','#d8cfb5',a);
  out+=range(34,i=>rect(23+i*20,454,20,15,i%2?'#9fa69a':'#d8d3ba'))+range(34,i=>rect(23+i*20,469,20,15,i%2?'#d8d3ba':'#9fa69a'));
  out+=circle(39,200,9,a)+path('M34 209l-8 25h26l-8-25ZM26 238h26v7H26Z',a)+line('M39 174v17m-6-11h12',a,2)+rect(658,282,36,57,'none',a,4)+line('M661 286c0 15 30 28 30 49m0-49c0 15-30 28-30 49',a,1.5);
 } else if(c==='gardening') {
  out+=path('M618 54h31l-5 33h-21Z','#b88669','#dab093')+line('M633 56V34m0 13c-17 0-13-20 0-15m0 8c16-12 20 9 0 6','#bfd0a2',2)+path('M667 29h8v36l10 12-14 12-13-12 9-12Z','#a2b3aa',a);
  out+=rect(26,458,667,24,'#745c43','#a78b62',3)+range(24,i=>circle(35+i*28,474-(i%2)*8,1.5,'#c8b289'))+range(10,i=>line(`M${53+i*65} 466v-10m0 5c-8 0-7-7 0-6m0 2c8-8 10 4 0 3`,'#bdcc9c',1.5));
  out+=rect(24,182,30,51,'#d8cba7','#b89a77',2)+glyph('sprout',27,191,.5,'#536b43',1)+rect(664,307,25,46,'#b0b18b',a,5)+line('M670 313v34m6-34v34m6-34v34',a,1,.6);
 } else if(c==='painting') {
  out+=line('M619 88l21-66 31 66m-41-17h40m-20-45v66','#b38d68',4)+rect(622,34,50,39,'#e6d7ba','#c09a78',2)+path('M625 67l14-21 14 8 16-14v30Z','#94a49c')+circle(658,43,5,'#cba571');
  out+=rect(24,457,672,24,'#7a6053','#af8e72',3)+range(6,i=>rect(34+i*50,462,28,17,['#b7807f','#caab77','#849b91','#8394b4','#b29cbe','#cfba93'][i],a,2))+line('M376 466h140m-117 8h238',a,1,.4);
  out+=rect(25,298,30,63,'#ad9c8a',a,4)+line('M32 310l-8-89m15 89 1-116m7 113 8-95',a,4)+path('M665 168h19l5 20-8 18h-14l-7-18Z','#b58d75',a)+line('M674 206v154',a,5,.7);
 } else if(c==='manga') {
  out+=rect(611,26,77,62,'#e8ded2','#baa6b5',3)+line('M638 26v62M638 53h50','#756579',2)+range(7,i=>line(`M${614+i*3} 36l${15-i*2} 31`,'#978895',.7,.7))+path('M646 38l9-7 21 1 4 9-12 4-7-3-11 4Z','#faf3e6','#998691');
  out+=range(7,i=>rect(26+i*96,455,89,28,i%2?'#66586e':'#847088',a,2))+range(12,i=>line(`M${45+i*54} 459l-9 18`,a,.9,.5));
  out+=path('M37 178l13 36-12 18-12-18Z','#cbc0cd',a)+line('M38 203v154',a,3,.8)+circle(676,313,17,'#262831',a)+path('M663 285h27v12h-27Z','#aca0b0',a);
 } else if(c==='astrophoto') {
  out+=path('M614 35l18-14 51 37-13 18Z','#a8b5c4','#d9e0e8',2)+line('M622 28l54 41m-22-15 8 38m-8-38-21 38m21-38 31 31',a,2)+circle(686,25,2,a)+circle(605,78,1.5,a);
  out+=path('M22 482l45-18 37 9 49-16 42 18 37-22 51 24 63-17 56 21 50-22 34 18 50-25 68 23 39-20 61 24v6Z','#18293c')+range(24,i=>circle(31+i*28,454+(i%3)*5,i%4?1:1.8,a));
  out+=circle(39,229,18,'none','#b2c6e1')+circle(39,229,11,'none','#9baac7')+line('M21 229h36m-18-18v36M662 318l28 56m-14-56-13 56m13-56h-10',a,1,.7);
 } else if(c==='calligraphy') {
  out+=path('M651 22l30 42-29 26-25-27Z','#ccb594',a)+line('M651 23v43', '#6a5144',2)+circle(651,68,5,'#624a40')+path('M675 83l10-8 8 11-11 5Z','#a28062',a);
  out+=line('M26 456h667m-667 13h667m-667 14h667',a,.6,.5)+range(12,i=>line(`M${38+i*55} 478q-10-15 1-18 13-4 6 17 16-24 23-13 5 10-18 9`,a,1.4,.8));
  out+=rect(24,287,30,43,'#2c3033',a,7)+rect(29,278,20,12,'#b79873',a,2)+line('M665 176l15 176',a,5)+path('M663 170l11-23 3 25Z','#bfc6ba',a);
 } else if(c==='origami') {
  out+=path('M609 64l42-22 42-17-21 32 17 26-39-15-25 14 9-26Z','#dfc6b4',a)+path('M634 56l17-14-1 26m1-26 21 15-22 11m22-11 21-32','none','#ab8a79',1)+path('M650 68l-7 18 19-12Z','#b8a6a5',a);
  out+=range(10,i=>path(`M${25+i*67} 482l33-29 32 29Z`,['#a6b2b0','#cabfa8','#b69cab'][i%3],a))+range(10,i=>line(`M${58+i*67} 454v28`,a,.8,.6));
  out+=rect(25,190,29,41,'#b3c5bf',a)+line('M25 190l29 41m0-41-29 41',a,1)+path('M660 319l31-16-12 35-18 12 8-24Z','#d2bdb1',a);
 } else if(c==='gratitude') {
  out+=rect(613,32,66,51,'#b79b87',a,4)+line('M620 41h40m-40 11h30m-30 11h40m-40 11h24',a,.9,.7)+flower(680,35,9,'#d8ad9f','#e8ce9e');
  out+=range(8,i=>{const x=45+i*85;return line(`M${x-18} 477q18-27 39-8`,a,1,.5)+flower(x,465,7,['#b9c2a5','#d1ad9c','#c8b6c9'][i%3],a);});
  out+=path('M25 167h28v58l-14-8-14 8Z','#d3b6a2',a)+glyph('heart',28,179,.45,'#876859',1)+line('M675 278v80m0-29c-20-7-18-26 0-18m0 1c21-13 21 13 0 13','#bdc6a5',2);
 } else if(c==='family') {
  out+=line('M609 34q35 23 80 0',a,1)+range(6,i=>path(`M${614+i*12} ${38+(i<3?i:5-i)*3}l10 1-4 16Z`,['#c99884','#aabb9e','#d7bd89'][i%3]));
  out+=rect(24,461,672,20,'#8b6551',a,4)+range(9,i=>circle(64+i*74,470,8,'#e0caae','#af8d71'))+range(9,i=>line(`M${50+i*74} 463v14m28-14v14`,a,1,.7));
  out+=rect(26,176,27,59,'#cda789',a,3)+line('M30 186h18m-18 10h18m-18 10h12', '#785a46',1)+flower(675,316,11,'#d2a89b','#e7c994')+line('M675 327v37',a,2);
 } else if(c==='calendar') {
  out+=circle(651,58,29,'none',a,2)+line('M651 29v58m-29-29h58m-49-20 40 40m-40 0 40-40',a,1,.6)+range(4,i=>circle(651+Math.cos(i*Math.PI/2)*21,58+Math.sin(i*Math.PI/2)*21,5,['#b2c9aa','#d5b678','#c49a83','#9fbac9'][i]));
  out+=range(12,i=>rect(27+i*56,455,49,27,i%2?'#a59886':'#8b99a1',a,2))+range(12,i=>line(`M${32+i*56} 463h39m-32 6h4m7 0h4m7 0h4m-25 7h4m7 0h4m7 0h4`,a,1,.6));
  out+=rect(25,179,30,98,'#abb6b9',a,4)+range(5,i=>line(`M30 ${193+i*15}h19`,'#546372',1.2))+range(4,i=>rect(664,262+i*29,26,19,['#c6b899','#aaaec0','#a3b49d','#caa49a'][i],a,2));
 } else if(c==='peace') {
  out+=path('M615 77q25-19 7-45 29 3 41 27l22-4-14 14q-14 23-56 8Z','#d5dcc3',a)+line('M655 69q19 9 33 5m-13 1 3-11m-3 11 7 7','#aebfa4',1.4);
  out+=range(4,i=>line(`M25 ${457+i*7}q75-11 145 0t145 0t145 0t145 0t90 0`,a,.8,.3+i*.1));
  out+=line('M37 176v182m0-146c-16-1-17-25 0-19m0 62c17-3 17-26 0-17m0 59c-16 0-16-24 0-18','#b0c7af',1.8)+circle(675,237,17,'none',a,1)+circle(675,237,10,'none',a,.8);
 } else if(c==='hope') {
  out+=path('M619 87V52q0-30 28-30t28 30v35Z','#857d8d',a,2)+line('M647 23v63m-27-29h54',a,1.4)+path('M652 86l6-23 7 23Z','#e1be80')+circle(659,51,4,'#ebd295');
  out+=range(10,i=>{const x=44+i*68;return line(`M${x} 481v-${12+(i%3)*5}m0 6c-10-8-12 3 0 6m0-6c10-10 12 3 0 5`,'#b4c49a',1.8);});
  out+=rect(28,240,24,65,'#d6c1a1',a,4)+path('M40 221c-15 17 14 23 0 0Z','#deb980')+range(3,i=>line(`M${667+i*8} ${191-i*7}v${121+i*13}`,a,.7,.25+i*.15));
 } else if(c==='stainedglass') {
  out+=path('M615 89V53q0-29 34-29t34 29v36Z','#a7a1b8','#d7c1a0',2)+path('M620 82V54l23 13v15Z','#8aa6a8')+path('M653 82V65l25-14v31Z','#b8a184')+path('M623 45q23-33 51 0l-25 13Z','#bd8e92')+line('M649 29v54m-28-28h56',a,4);
  out+=range(15,i=>path(`M${23+i*45} 483v-15q20-25 40 0v15Z`,['#849ca9','#ad8993','#ab9d7b'][i%3],'#d7c29f',1));
  out+=range(3,i=>path(`M24 ${197+i*54}v-22q15-24 30 0v22Z`,'none',a,1.4))+line('M676 182v167m0-126c-17-8-17-28 0-19m0 68c16-8 15-27 0-18m0 57c-17-8-16-25 0-17',a,1.2,.65);
 } else if(c==='islamicgeometry') {
  out+=`<g transform="translate(650 57)"><rect x="-27" y="-27" width="54" height="54" fill="none" stroke="${a}"/><rect x="-27" y="-27" width="54" height="54" transform="rotate(45)" fill="none" stroke="${a}"/><path d="M0-35 10-10 35 0 10 10 0 35-10 10-35 0-10-10Z" fill="#789a8c" stroke="${a}"/></g>`;
  out+=range(14,i=>`<g transform="translate(${47+i*48} 469)"><path d="M-23 0-12-13 0 0 12-13 23 0 12 13 0 0-12 13Z" fill="none" stroke="${a}" stroke-width="1"/></g>`);
  for(const x of [39,677])out+=range(3,i=>`<g transform="translate(${x} ${182+i*83})"><rect x="-13" y="-13" width="26" height="26" fill="none" stroke="${a}"/><rect x="-13" y="-13" width="26" height="26" transform="rotate(45)" fill="none" stroke="${a}"/></g>`);
 } else if(c==='jewishstudy') {
  out+=path('M610 36q20-9 39 3 20-12 40-3v46q-20-8-40 3-20-11-39-3Z','#d6c8a9',a)+line('M649 40v42m-31-36h20m-20 8h20m-20 8h20m22-16h20m-20 8h20m-20 8h20','#62737a',1);
  out+=range(10,i=>rect(28+i*67,456,59,26,['#718b93','#8f8774','#a29580'][i%3],a,2))+range(10,i=>line(`M${33+i*67} 473h46`,a,1,.6));
  out+=path('M27 166h24v123l-12-12-12 12Z','#b6aa88',a)+line('M32 177h14m-14 10h14m-14 10h14',a,1)+circle(675,321,15,'#af827c',a)+path('M667 309l-3-9 8 3 4-8 3 8 9-3-5 10Z','#bba482',a)+range(5,i=>circle(669+(i%3)*6,317+Math.floor(i/3)*7,1.5,'#ead0ae'));
 } else if(c==='lotusgarden') {
  out+=glyph('lotus',620,25,1.18,a,.95)+path('M612 84q38-11 76 0q-38 10-76 0Z','#8b9d83');
  out+=range(5,i=>line(`M24 ${456+i*6}q93-13 164 0t164 0t164 0t173 0`,a,.8,.4))+`<ellipse cx="551" cy="469" rx="20" ry="10" fill="#879286"/><ellipse cx="585" cy="475" rx="15" ry="7" fill="#a4ac96"/>`;
  out+=range(3,i=>`<ellipse cx="40" cy="${343-i*20}" rx="${17-i*3}" ry="${10-i}" fill="${['#849186','#a1aa94','#b5bba6'][i]}" stroke="${a}" stroke-width=".6"/>`)+line('M675 174v170m-12-170h24m-24 0v-10m6 10v-10m6 10v-10m6 10v-10m6 10v-10',a,2,.8);
 } else if(c==='flowerlights') {
  out+=line('M610 30q40 49 80 0',a,1.3)+range(7,i=>flower(615+i*12,35+Math.sin(i*Math.PI/6)*24,6,['#d9ad70','#bd8b82','#d6b682'][i%3],'#f0d69e'));
  out+=range(9,i=>{const x=53+i*77;return path(`M${x-16} 469q16 23 32 0Z`,'#bf9272',a)+path(`M${x} 452c-11 13 10 17 0 0Z`,'#ead29a');});
  for(const x of [40,677])out+=line(`M${x} 165v197`,a,.8,.6)+range(6,i=>flower(x,180+i*32,9,['#c6a16f','#cd9c8d','#d3b882'][i%3],a));
 }
 return out;
}
