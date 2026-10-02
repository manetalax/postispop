// Original PostisPop stationery: twenty technology and cooking workspaces.
// Illustrations stay outside the six note rectangles; templates are editable prompts.
const notes=(...rows)=>rows.map(([title,...body])=>({title,body:body.join('\n')}));
const profile=(composition,paper,background,accent,details,noteTemplates)=>({composition,paper,background,accent,details,noteTemplates,edition:'crafted'});
export const themeProfilesA={
 'theme-001':profile('circuit-lab','grid','#193e43','#a4dbcb',['Placa y pistas de cobre','Conectores y puntos de prueba','Cuaderno de circuitos'],notes(['Idea del circuito','Qué quiero que haga','Dibujo de bloques inicial'],['Componentes','Referencia / cantidad','Comprobar la ficha técnica'],['Conexiones de estudio','Señal de entrada / salida','Anotar lo que debo verificar'],['Mi prototipo','Versión / fecha','Qué cambié esta vez'],['Resultado observado','Condiciones de la prueba','Diferencia respecto a lo previsto'],['Próxima revisión','Una hipótesis pendiente','Consultar antes de modificar'])),
 'theme-002':profile('open-code','ruled','#263a42','#b9d8ac',['Terminal de código','Llaves y sangrías','Tareas de un proyecto abierto'],notes(['Objetivo del cambio','Problema que quiero resolver','Resultado que espero'],['Por explorar','Archivo / módulo','Pregunta sobre el código'],['Mi tarea pequeña','Primer cambio concreto','Cómo sabré que funciona'],['Comprobaciones','Caso normal / caso límite','Resultado observado'],['Revisión compartida','Resumen de mi aportación','Preguntas para quien revise'],['Para continuar','Rama / último paso','Dejar una nota clara'])) ,
 'theme-003':profile('robot-workbench','grid','#36424b','#e3c998',['Robot de sobremesa','Brazo articulado y batería','Bitácora de prototipos'],notes(['Mi robot','Función que imagino','Entorno de prueba previsto'],['Sensores y acciones','Qué debe detectar','Qué respuesta espero'],['Piezas del prototipo','Referencia / medida','Comprobar compatibilidad'],['Secuencia de prueba','Un paso cada vez','Registrar lo que ocurre'],['Lo que aprendí','Comportamiento inesperado','Posible explicación'],['Siguiente versión','Un ajuste pequeño','Material pendiente'])) ,
 'theme-004':profile('gaming-desk','dots','#32384d','#d5c4ef',['Mando y botones','Píxeles de inventario','Agenda de partidas'],notes(['Próxima partida','Juego / plataforma','Día y hora acordados'],['Con mi equipo','Personas / roles','Confirmar disponibilidad'],['Mi objetivo','Una habilidad por practicar','Partida o modo elegido'],['Para recordar','Configuración que me funciona','Ajuste por revisar'],['Biblioteca pendiente','Juego que quiero descubrir','Por qué me interesa'],['Pausa y cierre','Guardar el progreso','Preparar la próxima sesión'])) ,
 'theme-005':profile('photo-studio','grid','#344348','#dfceb3',['Cámara y objetivo','Tiras de contacto','Plan de una sesión fotográfica'],notes(['Mi próxima sesión','Tema / lugar / fecha','Intención de las fotografías'],['Lista de tomas','Encuadre que quiero probar','Detalle que no debo olvidar'],['Equipo preparado','Batería / tarjeta / óptica','Comprobar antes de salir'],['Luz y referencia','Momento del día','Permisos o referencias propias'],['Selección','Archivos que revisar','Criterio de la serie'],['Archivo seguro','Copia de originales','Carpeta y fecha de entrega'])) ,
 'theme-006':profile('ai-notebook','dots','#35384d','#c8d5e9',['Red de nodos','Curvas de evaluación','Cuaderno de experimentos'],notes(['Pregunta del experimento','Qué quiero averiguar','Qué resultado sería útil'],['Datos o ejemplos','Origen / permiso de uso','Evitar información sensible'],['Prueba inicial','Modelo / versión / fecha','Instrucción o configuración'],['Cómo lo evalúo','Ejemplos de comparación','Errores que debo observar'],['Resultados','Qué funcionó','Qué necesita verificación'],['Siguiente intento','Cambiar una variable','Guardar el resultado anterior'])) ,
 'theme-007':profile('streaming-booth','ruled','#313f47','#c6ded1',['Micrófono y soporte','Vúmetro y onda sonora','Guion de emisión'],notes(['Mi próxima emisión','Tema / fecha / hora','Objetivo para la audiencia'],['Guion breve','Bienvenida / bloques / cierre','Una transición por preparar'],['Antes de emitir','Audio / cámara / iluminación','Hacer una prueba privada'],['Material de apoyo','Escena / imagen / enlace','Revisar permisos de uso'],['Participación','Pregunta para la audiencia','Normas de conversación'],['Después del directo','Un momento que funcionó','Mejora para la próxima vez'])) ,
 'theme-008':profile('cyber-city','grid','#2c3446','#d4b8da',['Ciudad nocturna','Señales y pasarela geométrica','Cuaderno de mundos futuros'],notes(['Mi ciudad futura','Lugar / época imaginada','Qué la hace distinta'],['Personaje','Qué desea','Qué obstáculo encuentra'],['Tecnología del mundo','Qué permite hacer','Qué límites tiene'],['Escena visual','Luz / clima / arquitectura','Referencia para el boceto'],['Historia en marcha','Qué acaba de cambiar','Qué ocurre a continuación'],['Mi proyecto','Una pieza por terminar','Próximo paso creativo'])) ,
 'theme-009':profile('electronics-bench','grid','#304342','#dfd4a2',['Multímetro ilustrado','Resistencias y protoboard','Registro de electrónica'],notes(['Proyecto de estudio','Dispositivo o concepto','Pregunta inicial'],['Documentación','Componente / fabricante','Ficha y versión consultada'],['Inventario','Pieza / valor / cantidad','Referencia que falta'],['Prueba documentada','Qué observé','Condiciones de la medición'],['Por comprobar','Dato o conexión dudosa','Pedir ayuda antes de seguir'],['Orden del banco','Guardar componentes','Etiquetar la versión actual'])) ,
 'theme-010':profile('virtual-space','dots','#2e4050','#b9dbe0',['Visor y mandos','Retícula de profundidad','Diario de experiencias virtuales'],notes(['Experiencia elegida','Aplicación / plataforma','Qué quiero explorar'],['Preparar mi espacio','Zona despejada','Ajustes indicados por el fabricante'],['Antes de empezar','Batería / mandos','Tiempo previsto y pausas'],['Observaciones','Interacción que funciona','Algo que me resulta incómodo'],['Idea de diseño','Un espacio por imaginar','Qué hará la persona dentro'],['Al terminar','Guardar equipo y progreso','Recordatorio para la próxima vez'])) ,
 'theme-011':profile('family-recipes','ruled','#594638','#ecd0a6',['Recetario abierto','Cucharas medidoras','Fichas de cocina familiar'],notes(['Receta que guardo','Nombre / de quién la aprendí','Ocasión para prepararla'],['Ingredientes','Cantidad y unidad','Para cuántas personas'],['Antes de cocinar','Lo que debo preparar','Utensilios necesarios'],['Mi versión','Cambio que probé','Resultado que obtuve'],['Mesa compartida','Personas / horario','Consultar preferencias y alergias'],['Para repetir','Qué gustó más','Ajuste que quiero recordar'])) ,
 'theme-012':profile('coffee-counter','journal','#493a34','#e3c09a',['Taza y vapor','Molinillo de sobremesa','Registro de café'],notes(['Café de hoy','Origen / tostador','Fecha de apertura'],['Mi preparación','Método / cantidad','Ajuste de molienda usado'],['Lo que percibo','Aroma / sabor / textura','Una impresión personal'],['Prueba siguiente','Cambiar un solo ajuste','Comparar con mi nota anterior'],['Café para descubrir','Lugar o referencia','Por qué quiero probarlo'],['Rincón preparado','Limpiar y guardar el equipo','Reponer lo que falte'])) ,
 'theme-013':profile('kitchen-garden','journal','#344b38','#dae0b2',['Cesta de verduras','Hierbas en maceta','Del huerto a la cocina'],notes(['Lo que tengo','Verduras y hierbas disponibles','Revisar su estado'],['Idea para cocinar','Plato que puedo preparar','Qué ingrediente me falta'],['Mi pequeño huerto','Planta / ubicación','Observación de esta semana'],['Próxima tarea','Cuidado que necesita','Consultar según la especie'],['Lista de compra','Cantidades reales','Aprovechar lo que ya hay'],['Después de cocinar','Qué combinación gustó','Nota para otra ocasión'])) ,
 'theme-014':profile('bread-table','ruled','#514537','#e4ceab',['Barras y hogazas','Espigas y cesta de levado','Cuaderno de pan'],notes(['Pan que preparo','Nombre de la receta','Fuente que sigo'],['Mi fórmula','Harina / agua / otros','Anotar pesos y unidades'],['Plan de la sesión','Inicio / etapas previstas','Reservar tiempo disponible'],['Mi masa','Qué observo al trabajarla','Cambios respecto a la receta'],['Resultado del pan','Corteza / miga / sabor','Guardar una foto'],['Próximo intento','Un ajuste que probar','Conservar la receta anterior'])) ,
 'theme-015':profile('tea-corner','plain','#3f4a40','#e1d2b1',['Tetera y colador','Hojas sueltas y posavasos','Agenda de una pausa'],notes(['Té o infusión','Nombre / procedencia','Fecha de apertura'],['Preparación','Indicaciones del envase','Mi taza o tetera'],['Mi impresión','Aroma / sabor / color','Qué quiero recordar'],['Momento compartido','Con quién / cuándo','Algo sencillo para acompañar'],['Por descubrir','Variedad o tienda','Pregunta que quiero hacer'],['Rincón de la pausa','Lavar y guardar el material','Preparar el próximo momento'])) ,
 'theme-016':profile('chef-table','grid','#3c4442','#dfd0ad',['Sartén de autor','Batidor y espátula','Organización de un menú'],notes(['Idea del plato','Ingrediente protagonista','Resultado que imagino'],['Mi menú','Entrante / principal / cierre','Consultar preferencias'],['Preparación previa','Tareas que puedo adelantar','Utensilios y recipientes'],['Lista de ingredientes','Cantidad para la mesa','Revisar existencias'],['Prueba y ajuste','Sabor / textura / presentación','Qué cambio haría'],['Servicio','Hora de servir','Orden de los últimos pasos'])) ,
 'theme-017':profile('sushi-workspace','plain','#344745','#e3d3b6',['Maki y palillos','Esterilla y cuenco','Plan de una mesa de sushi'],notes(['Mi mesa','Número de personas','Preferencias y alergias consultadas'],['Menú elegido','Piezas que quiero preparar','Recetas de referencia'],['Ingredientes','Cantidades y procedencia','Seguir conservación del envase'],['Material preparado','Esterilla / cuencos / tabla','Ordenar antes de empezar'],['Prueba personal','Forma o combinación','Qué me resultó más sencillo'],['Para la próxima','Receta que repetiría','Un detalle de presentación'])) ,
 'theme-018':profile('pastry-atelier','dots','#55414a','#ecc7c1',['Manga y tartaleta','Rodillo y espátula','Cuaderno de pastelería'],notes(['Dulce del día','Receta / molde','Número de porciones'],['Pesos y medidas','Ingrediente / cantidad','Revisar antes de mezclar'],['Mi planificación','Etapas de la receta','Tiempo disponible'],['Decoración','Color / textura / acabado','Boceto de la presentación'],['Resultado','Qué salió como esperaba','Qué debo revisar'],['Próxima hornada','Un ajuste concreto','Anotar versión y fecha'])) ,
 'theme-019':profile('mediterranean-table','journal','#424d3e','#e4d5ae',['Aceite y plato de cerámica','Olivo y tomate','Cuaderno de cocina de temporada'],notes(['Mi mesa de temporada','Ingredientes disponibles','Plato que quiero preparar'],['Receta de referencia','Nombre / origen de la fuente','Mi adaptación personal'],['Lista de compra','Verduras / despensa / extras','Cantidades necesarias'],['Preparar la mesa','Personas / horario','Preferencias que consultar'],['Sabores que guardo','Una combinación que gustó','Cómo la preparé'],['Próxima comida','Aprovechar ingredientes','Una idea por probar'])) ,
 'theme-020':profile('cocoa-spices','ruled','#493933','#e8c29e',['Tableta de chocolate','Cacao y especias','Registro de mezclas dulces'],notes(['Chocolate elegido','Marca / porcentaje / origen','Fecha de apertura'],['Mi idea dulce','Receta o combinación','Qué sabor quiero destacar'],['Especias','Variedad / cantidad','Probar y anotar el ajuste'],['Preparación','Ingredientes pesados','Utensilios necesarios'],['Mi resultado','Aroma / textura / equilibrio','Comentario de la prueba'],['Para regalar o repetir','Porciones / presentación','Anotar ingredientes y alergias']))
};
const rect=(x,y,w,h,fill,stroke='none',r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const circle=(x,y,r,fill,stroke='none',sw=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,fill,stroke='none',sw=1)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ellipse=(x,y,rx,ry,fill,stroke='none')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}"/>`;
const repeat=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
const leaf=(x,y,s,fill)=>path(`M${x} ${y}q${-s} ${-s*1.5} 0 ${-s*2}q${s} ${s*.5} 0 ${s*2}Z`,fill);
const bean=(x,y,a,angle=0)=>`<g transform="rotate(${angle} ${x} ${y})">${ellipse(x,y,8,5,'#977553',a)}${path(`M${x-5} ${y+1}q4-4 10-1`,'none',a,.8)}</g>`;
const wheat=(x,y,a)=>path(`M${x} ${y}v-74m0 12-9-10m9 22 10-11m-10 24-10-11m10 22 10-10m-10 24-10-10`,'none',a,1.5);
const spoon=(x,y,a)=>ellipse(x,y,7,11,'none',a)+rect(x-2,y+10,4,54,a,'none',2);
export function renderThemeA(design,{glyph,line}){
 const a=/^#[0-9a-f]{6}$/i.test(design.accent)?design.accent:'#e5d1b0';let s='';
 switch(design.composition){
 case 'circuit-lab':
  s+=rect(612,27,79,61,'#28524d',a,5)+rect(635,43,31,29,'#22383a',a,2);
  s+=repeat(5,i=>line(`M${639+i*6} 38v5m0 29v6M629 ${47+i*5}h6m31 0h6`,a,1.5));
  for(const x of [26,674])s+=line(`M${x} 122v44h12v53h-8v56h11v70h-13v76`,a,1.4,.7)+repeat(5,i=>circle(x+(i%2?12:0),139+i*62,3,'#24504a',a));
  s+=repeat(8,i=>{const x=27+i*85;return line(`M${x} 478h22v-18h32v12h23`,a,1.4,.75)+circle(x+77,472,3,'#264f46',a);});break;
 case 'open-code':
  s+=rect(604,27,88,62,'#24323a',a,5)+line('M607 39h82',a,.8)+repeat(3,i=>circle(612+i*6,33,1.4,['#c18a87','#dfc689','#96b8a4'][i]));
  s+=line('M616 49l8 6-8 6m13 0h14M650 48h29m-29 7h20m-38 15h41m-35 7h22',a,1.5);
  for(const x of [39,676])s+=repeat(3,i=>path(`M${x+8} ${144+i*93}q-10-2-10 9v12q0 8-8 9 8 1 8 9v12q0 11 10 9`,'none',a,1.6));
  s+=repeat(5,i=>{const x=28+i*137;return line(`M${x} 458h21m-21 8h50m-37 8h71m-52 8h29`,a,1,.6);});break;
 case 'robot-workbench':
  s+=rect(623,41,54,35,'#748f91',a,8)+circle(637,54,5,'#263f45',a)+circle(663,54,5,'#263f45',a)+line('M641 68h19M650 40V29',a,2)+circle(650,27,3,a)+rect(614,50,7,17,a,'none',2)+rect(679,50,7,17,a,'none',2);
  s+=line('M36 136v53l12 28-18 38 15 35v56',a,7,.7)+repeat(5,i=>circle([36,36,48,30,45][i],[141,190,217,255,290][i],5,'#647d83',a));
  s+=rect(662,205,28,70,'#394e54',a,5)+rect(671,200,10,5,a)+repeat(4,i=>rect(668,214+i*13,16,8,['#95b59d','#a3be9e','#c3c89e','#d4c7a5'][i]));
  s+=line('M23 478h676',a,2,.7)+repeat(13,i=>rect(28+i*52,457,32,15,'none',a,3));break;
 case 'gaming-desk':
  s+=path('M625 43h47q11 0 17 32 1 10-8 10l-15-13h-33l-14 13q-10 0-8-11 4-31 14-31Z','#74738d',a,1.5)+rect(624,51,5,20,'#293142')+rect(617,58,19,5,'#293142')+circle(674,55,3,'#cf9ead')+circle(681,62,3,'#d6c78c')+circle(667,62,3,'#9fc5bb')+circle(674,69,3,'#9bafcf');
  s+=path('M34 160h11v12h12v11H45v12H34v-12H22v-11h12Z','#aaa1bc',a)+repeat(4,i=>circle(674+(i%2)*12,300+Math.floor(i/2)*15,5,['#b49eba','#d0b89c','#b9c8b2','#a3b8c7'][i]));
  s+=repeat(28,i=>rect(21+i*24,460+(i%3)*5,17,17,['#6c7894','#9d88a2','#99ada6','#b2a48e'][i%4],a,1));break;
 case 'photo-studio':
  s+=path('M609 43h17l6-12h31l7 12h22v43h-83Z','#71898b',a,1.3)+circle(651,62,21,'#263e47',a)+circle(651,62,14,'#537582',a)+circle(646,57,4,'#a6c0c4')+rect(616,49,12,6,a);
  s+=rect(23,131,31,260,'#25363b',a,2)+repeat(15,i=>rect(26,140+i*16,4,7,a))+repeat(15,i=>rect(47,140+i*16,4,7,a))+repeat(5,i=>rect(33,148+i*46,11,31,'#6f8989',a,1));
  s+=circle(676,271,16,'none',a)+repeat(8,i=>`<path d="M676 251v6" transform="rotate(${i*45} 676 271)" stroke="${a}"/>`)+line('M676 271l8-9',a,2);
  s+=repeat(10,i=>{const x=25+i*69;return rect(x,454,58,30,'#d9cdb7',a,1)+rect(x+4,458,50,20,['#778e8c','#8b9290','#9d9d8f'][i%3]);});break;
 case 'ai-notebook':{
  const nodes=[[614,43],[614,72],[646,33],[646,57],[646,82],[682,44],[682,72]];for(let left=0;left<2;left++)for(let mid=2;mid<5;mid++)s+=line(`M${nodes[left].join(' ')}L${nodes[mid].join(' ')}`,a,.8,.5);for(let mid=2;mid<5;mid++)for(let right=5;right<7;right++)s+=line(`M${nodes[mid].join(' ')}L${nodes[right].join(' ')}`,a,.8,.5);s+=nodes.map(([x,y],i)=>circle(x,y,6,['#9ba7ba','#c1b1ba','#a7bfc1'][i%3],a)).join('');
  for(const x of [39,677])s+=line(`M${x} 138v256`,a,.8,.45)+repeat(6,i=>circle(x+(i%2?9:-9),149+i*44,4,'#71899b',a)+line(`M${x} ${151+i*44}l${i%2?9:-9} -2`,a,1,.7));
  s+=line('M25 453v29h670',a,1,.6)+path('M29 456q33 3 55 15 40 13 95 4t99-7 95 3 89-3 99 2 130-6','none',a,1.8)+path('M29 479q100-23 177-18t143 3 169-3 175-4','none','#91b7b5',1.2);break;}
 case 'streaming-booth':
  s+=rect(631,27,28,40,'#809a9b',a,13)+repeat(5,i=>line(`M636 ${34+i*6}h18`,a,1,.8))+path('M624 50v9q0 17 21 17t21-17v-9M645 77v11m-16 0h33','none',a,2);
  s+=rect(24,157,29,141,'#243b42',a,4)+repeat(12,i=>rect(29,164+i*10,19,5,i<2?'#c5937f':i<5?'#c5bd88':'#8eaf9c'));
  s+=circle(676,337,4,a)+path('M666 327q-11 10 0 20m20-20q11 10 0 20m-25-27q-18 17 0 34m30-34q18 17 0 34','none',a,1.2);
  s+=repeat(84,i=>{const h=3+((i*11)%23);return line(`M${24+i*8} ${469-h/2}v${h}`,a,2,.4+(i%3)*.2);});break;
 case 'cyber-city':
  s+=repeat(7,i=>{const x=606+i*12,y=39+(i*17)%23;return rect(x,y,10,88-y,['#526a83','#716180','#577a82'][i%3],a)+repeat(3,j=>rect(x+3,y+5+j*8,3,3,a));})+line('M601 90h94',a,2);
  s+=rect(24,146,30,108,'#544961','#a7a0bd',3)+line('M31 157h15v18H31Zm0 29h15m-15 8h15m-15 8h8M29 227h19m-19 7h19',a,1.3,.9)+rect(663,287,27,99,'#355566','#a0b8c6',3)+line('M670 301h14m-14 8h14m-14 8h8M673 338v31m8-31v31',a,1.3,.8);
  s+=line('M24 455h674M24 482h674M147 455l-52 27m164-27-27 27m129-27v27m103-27 27 27m98-27 52 27M25 466h673M25 474h673',a,.9,.6);break;
 case 'electronics-bench':
  s+=rect(623,26,50,62,'#aeb491',a,6)+rect(630,34,36,16,'#2e4944',a,2)+circle(648,66,10,'#647c6d',a)+line('M648 66l5-6M629 87q-22-4-18-24m56 24q24 0 20-25',a,1.7)+circle(633,81,2,'#c79078')+circle(662,81,2,'#3b514c');
  s+=repeat(3,i=>{const y=167+i*67;return line(`M38 ${y-17}v17m0 24v18`,a,1.5)+rect(28,y,20,24,'#c7b892',a,5)+repeat(3,j=>rect(29+j*6,y+3,3,18,['#93684f','#6d7662','#8b5d55'][j]));});
  s+=rect(664,156,27,236,'#b8bdac',a,4)+repeat(24,i=>circle(670+(i%3)*7,166+Math.floor(i/3)*29,1.3,'#50655e'));
  s+=line('M25 470h70l5-9 9 18 9-18 9 18 9-18 5 9h88m37 0h84m43 0h98m36 0h77',a,1.2,.8)+circle(245,470,13,'none',a)+path('M361 471q4-17 8 0t8 0 8 0 8 0','none',a,1.4)+line('M519 457v26m7-26v26',a,2);break;
 case 'virtual-space':
  s+=path('M619 44q29-22 62 0M614 43h73l-6 37h-22l-9-8-9 8h-22Z','#75909e',a,1.6)+rect(624,50,51,15,'#2b465a',a,6)+line('M608 49v20m85-20v20',a,3);
  for(const [x,y] of [[38,182],[676,333]])s+=ellipse(x,y,15,22,'none',a)+path(`M${x-7} ${y+10}h14l-2 51h-10Z`,'#819ca4',a)+circle(x,y+3,3,a);
  s+=path('M26 482 242 452h234l218 30M101 482l170-30m-70 30 99-30m59 30v-30m155 30-99-30m198 30-170-30M96 473h533M163 464h397','none',a,.85);break;
 case 'family-recipes':
  s+=path('M609 34q21-8 40 3 22-11 42-3v49q-24-8-42 3-19-11-40-3Z','#e1cfac',a)+line('M649 38v45M617 45h23m-23 8h20m-20 8h23m-23 8h15m32-24h23m-23 8h23m-23 8h18m-18 8h23','#927e60',1.3);
  s+=spoon(32,167,a)+spoon(48,211,'#bba584')+rect(664,260,27,68,'none',a,3)+line('M669 272h16m-16 12h10m-10 12h16m-16 12h10',a,1);
  s+=repeat(9,i=>rect(27+i*76,456,65,27,['#978568','#a18b6b','#8c8167'][i%3],a,2)+line(`M${34+i*76} 463h45m-45 7h34m-34 7h40`,a,.8,.6));break;
 case 'coffee-counter':
  s+=path('M618 52h48v14q0 17-24 17t-24-17ZM666 55h6q18 0 12 15-6 6-18 1','none',a,2)+ellipse(642,83,39,6,'none',a)+path('M631 44c-12-13 10-10-1-24m14 24c-12-13 11-10 0-24m13 23c-10-12 9-9-1-19','none',a,1,.75);
  s+=rect(25,209,29,63,'#947456',a,4)+path('M26 209v-21q14-16 27 0v21Z','#b79b75',a)+line('M40 188v-20h16m-30 86h26',a,2)+circle(55,167,3,a);
  s+=rect(666,306,21,72,'none',a,5)+line('M670 322h13m-13 8h13m-13 8h13',a,1)+ellipse(676,302,12,4,'none',a);
  s+=repeat(24,i=>bean(33+i*28,466+(i%2)*10,a,i%2?27:-24));break;
 case 'kitchen-garden':
  s+=rect(609,57,79,29,'#83956d',a,3)+line('M613 66h72m-72 10h72M625 58v26m24-26v26m24-26v26',a,1)+path('M624 59l-9-27 18-3Z','#ca9f73',a)+leaf(620,31,7,'#95b388')+circle(650,50,13,'#bd897c',a)+leaf(650,39,7,'#9cae7c')+path('M668 59q-16-29 4-29t8 29Z','#a1b387',a);
  for(const [x,y]of [[39,205],[676,338]])s+=path(`M${x-13} ${y}h26l-5 29h-16Z`,'#b19473',a)+line(`M${x} ${y}v-59`,a,1)+repeat(4,i=>leaf(x+(i%2?6:-6),y-7-i*12,7,['#a4bc8d','#8fa780'][i%2]));
  s+=repeat(14,i=>path(`M${26+i*49} 479q20-15 39 0m-19-2v-17m0 6q-10-15-16-7 4 10 16 7m0 5q11-17 17-8-7 10-17 8`,'none',a,1.1));break;
 case 'bread-table':
  s+=ellipse(649,77,43,10,'#a28b66',a)+path('M616 65q0-29 24-30t20 35M638 73q8-31 29-25t16 30Z','#d2b087',a,1.2)+line('M627 42l14 10m-17 1 15 10m16-10 10 10m-12 0 11 9','#9b7550',2);
  s+=wheat(38,248,a)+wheat(48,275,'#b59c72')+wheat(29,288,'#cbb58b');
  s+=ellipse(676,331,20,39,'#b49d77',a)+repeat(5,i=>ellipse(676,331,5+i*3,11+i*6,'none',a));
  s+=rect(23,456,674,29,'#8e7e62','none',3)+repeat(44,i=>line(`M${26+i*15} 457v27`,'#bdab88',.6,.7))+repeat(5,i=>line(`M24 ${460+i*5}h672`,'#d1bb95',.6,.7));break;
 case 'tea-corner':
  s+=path('M626 47q-8-13 21-13t21 13q12 6 13 20-3 18-30 18t-32-18l-13-20 20 8M677 47q21-5 15 18-6 12-15 9','none',a,2)+ellipse(648,45,23,5,'#879681',a)+circle(648,32,4,a);
  s+=ellipse(39,199,13,18,'none',a)+line('M39 181v-27m0 63v65',a,2)+repeat(7,i=>line(`M${29+i*3} 189v21`,a,.5,.55));
  s+=path('M664 302h25v70h-25Z','#9eaa90',a)+leaf(676,345,10,'#596f57')+line('M662 298h29',a,3);
  s+=repeat(11,i=>{const x=43+i*62;return ellipse(x,470,24,10,'none',a)+leaf(x-5,479,9,'#b7bd98')+path(`M${x-9} 479l17-19`,'none',a,1);});break;
 case 'chef-table':
  s+=ellipse(642,60,31,22,'#879991',a)+ellipse(642,58,25,16,'#3c5550',a)+path('M669 56l22-13 3 7-22 14Z','#b4ad92',a)+path('M619 86q4-13 9-4 6-18 12-2 6-14 13-1 6-9 10 7','none','#cfb486',2);
  s+=path('M29 142h21v46l-7 9v94h-7v-94l-7-9Z','#b6a082',a)+line('M34 152v31m5-31v31m5-31v31','#665d4e',1);
  s+=ellipse(676,256,14,27,'none',a)+ellipse(676,256,6,27,'none',a)+line('M676 283v75',a,5);
  s+=rect(27,455,264,29,'#a48b66',a,6)+line('M38 477h238m-220-15h168','#75664e',1)+path('M336 463h154l-20 14H336Z','#bac0ad',a)+rect(299,463,37,14,'#7f765f',a,3)+repeat(3,i=>circle(307+i*10,470,1.5,a))+ellipse(610,469,65,11,'none',a);break;
 case 'sushi-workspace':
  s+=rect(607,60,80,28,'#aab39e',a,5)+repeat(3,i=>{const x=622+i*23;return ellipse(x,61,10,7,'#2f4c44',a)+rect(x-10,61,20,12,'#36564a',a,2)+ellipse(x,61,7,5,'#e0d5b7')+circle(x,61,3,['#d1a481','#a9b187','#cfa1a0'][i]);})+line('M611 26l77 21M616 21l74 20','#c9b99b',2.5);
  s+=rect(25,157,29,190,'#a4ad88',a,3)+repeat(15,i=>line(`M26 ${165+i*12}h27`,'#d1c5a3',1.4))+line('M33 158v187m13-187v187','#6c8a6e',.8);
  s+=path('M669 257h14v21l6 9v57h-26v-57l6-9Z','#718e7c',a)+rect(666,301,20,23,'#ddcfad',a,1)+ellipse(676,381,18,8,'none',a);
  s+=repeat(27,i=>rect(25+i*25,458,20,23,['#758d71','#8e9e7d','#a6ac88'][i%3],a,2))+line('M25 466h670m-670 11h670','#d0c6a6',.7);break;
 case 'pastry-atelier':
  s+=path('M625 25l45 5-23 40-9-5Z','#c6a4a3',a)+path('M638 65l9 5-10 10-4-3Z','#bfc3b5',a)+path('M654 88q-7-13 4-14 4-16 12-4 13-1 10 12Z','#d4b28f',a)+path('M650 88h36l-6 7h-24Z','#b88e86',a);
  s+=rect(30,184,19,113,'#bb9b8c',a,7)+line('M39 164v20m0 113v22',a,5)+line('M35 197v83','#e4c5ab',1,.6);
  s+=path('M665 243h22v83h-22Z','#b8beb3',a)+rect(672,325,8,64,'#aa8487',a,3);
  s+=repeat(28,i=>{const x=25+i*24;return rect(x,457,23,13,i%2?'#c3a8a4':'#9c8185')+rect(x,470,23,13,i%2?'#9c8185':'#c3a8a4');})+repeat(7,i=>circle(62+i*96,469,5,'#e3c5b1',a));break;
 case 'mediterranean-table':
  s+=path('M614 28h15v21l7 12v27h-29V61l7-12Z','#8a986e',a)+rect(607,66,29,17,'#dbcfaa',a)+ellipse(667,66,25,23,'#cac7a3',a)+ellipse(667,66,19,17,'none','#7a9279')+circle(667,66,8,'#b78671',a)+path('M662 60l5 3 5-3-2 6h-6Z','#6e8864');
  for(const x of [39,676])s+=line(`M${x} 190v184`,a,1.1)+repeat(7,i=>{const y=204+i*24;return path(`M${x} ${y}q-20-15-18-23 18 1 18 23m0 12q20-15 18-23-18 1-18 23Z`,['#a8b189','#8f9f78'][i%2])+ellipse(x+(i%2?8:-8),y+15,3,5,'#6a795c',a);});
  s+=repeat(21,i=>{const x=23+i*32;return rect(x,457,28,26,'#899b85',a,1)+path(`M${x+2} 470q12-18 24 0-12 17-24 0Z`,'none','#d9cdaa',1);});break;
 case 'cocoa-spices':
  s+=path('M612 33l61-7 13 57-62 7Z','#987257',a)+repeat(3,i=>repeat(2,j=>rect(620+i*18+j*3,39+j*22,15,18,['#b28b69','#a88160','#987454'][i],a,2)))+path('M672 28l14 6 7 48-10 4Z','#d5bd96',a);
  s+=ellipse(39,198,15,35,'#ad8763',a)+ellipse(39,198,7,35,'none',a)+line('M39 165v66',a,1)+rect(26,294,9,96,'#a87c5b',a,4)+rect(39,285,9,108,'#bc9471',a,4);
  s+=path('M676 273l5 12 13-3-8 12 9 11-14-2-5 13-4-13-14 2 9-11-8-12 13 3Z','#b7916c',a)+circle(676,294,4,'#75563f',a);
  s+=repeat(12,i=>rect(26+i*56,456,46,28,['#9d775a','#af8b67','#8c6951'][i%3],a,3)+rect(31+i*56,461,16,18,'none','#d9b58e',2)+rect(50+i*56,461,16,18,'none','#d9b58e',2));break;
 }
 return s;
}
