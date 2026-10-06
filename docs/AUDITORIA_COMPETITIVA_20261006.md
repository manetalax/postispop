# PostisPop — auditoría competitiva y línea base externa

Fecha: 6 de octubre de 2026. La premisa del producto es mostrar el máximo contenido legible de varias notas de un vistazo, con escritura inmediata y poco ruido visual.

Este documento separa tres cosas: funciones descritas por los fabricantes, implementación local de PostisPop y mediciones externas de URLs públicas. No acredita paridad con las diez aplicaciones, superioridad del producto, ausencia de fallos ni publicación de los cambios locales.

## 1. Alcance y procedencia

- Investigación funcional: documentación y páginas oficiales de diez aplicaciones, consultadas el 6 de octubre de 2026. Es una selección de referencias relevantes; no un ranking verificado de ingresos o cuota de mercado.
- Auditoría externa: PageSpeed Insights (PSI), ejecutado desde su interfaz pública. La API anónima respondió `429 RESOURCE_EXHAUSTED` por cuota diaria agotada; no produjo métricas. La interfaz pública sí permitió obtener los informes siguientes, sin credenciales ni servicios de pago.
- Captura de PostisPop: 6 de octubre, 06:59 UTC / 08:59 Europe/Madrid. Rivales: aproximadamente 07:00 UTC / 09:00 Europe/Madrid. El reintento de Milanote comenzó a las 07:02 UTC.
- Revisión del código local: árbol de trabajo basado en `993bd3c37c7e4c472fcaa6f143e0fd45eb4d5c86`, con modificaciones en curso. Leer el código acredita que existe una implementación; no equivale a ensayar todos sus recorridos ni a verificar el servidor desplegado.
- La auditoría pública pertenece a la versión que servía `https://postispop.com/` en ese momento. No atribuir sus resultados a los cambios locales del 6 de octubre ni reutilizarlos como una medición posterior al despliegue.

Referencias vigentes del proyecto: [dirección del producto](PRODUCTO_Y_DIRECCION.md), [reglas del producto](../product-rules.json), [entrega de datos y límites](../database/DELIVERY_20261006.md) y [validación Android](ANDROID_VALIDACION_20261006.md). El estado de compilación, firma e instalación Android debe consultarse en ese último documento; esta auditoría no lo certifica.

## 2. PageSpeed Insights: resultados reales

Todos los resultados numéricos siguientes corresponden a Lighthouse **13.5.0** y HeadlessChromium **153.0.8010.36**. Perfil móvil: Moto G Power emulado y limitación de 4G lenta. Perfil escritorio: escritorio emulado y limitación personalizada. Se midió la carga inicial de una página, sin autenticar un editor ni cargar una colección equivalente de notas.

Cada grupo de cuatro valores está en el orden **Rendimiento / Accesibilidad / Buenas prácticas / SEO**, sobre 100.

| Aplicación y URL solicitada | Móvil | Escritorio | Tipo de página |
| --- | --- | --- | --- |
| PostisPop — `https://postispop.com/` | **58 / 100 / 100 / 100** | **72 / 100 / 100 / 100** | Tablero público inicial |
| Evernote — `https://evernote.com/` | 43 / 66 / 58 / 100 | 64 / 75 / 58 / 100 | Portada comercial |
| Google Keep — `https://workspace.google.com/intl/pt-BR/products/keep/` | 48 / 100 / 100 / 100 | 69 / 100 / 96 / 100 | Página comercial en portugués |
| OneNote — `https://www.microsoft.com/en-us/microsoft-365/onenote/digital-note-taking-app` | 9 / 100 / 77 / 85 | 48 / 100 / 54 / 85 | Página comercial |
| Notion — `https://www.notion.com/` | 50 / 92 / 92 / 100 | 68 / 92 / 92 / 100 | Portada comercial |
| Obsidian — `https://obsidian.md/` | 99 / 82 / 100 / 100 | 71 / 82 / 100 / 100 | Portada comercial; no aplicación nativa |
| Standard Notes — `https://standardnotes.com/` | 70 / 98 / 100 / 100 | 89 / 98 / 100 / 100 | Portada comercial |
| Joplin — `https://joplinapp.org/` | 63 / 80 / 88 / 91 | 61 / 80 / 92 / 91 | Portada comercial; no aplicación nativa |
| Apple Notes — `https://www.icloud.com/notes` | 38 / 100 / 88 / 100 | 66 / 100 / 88 / 100 | Acceso público de iCloud, sin notas de una cuenta |
| Milanote — `https://milanote.com/` | Sin resultado válido | Sin resultado válido | Lighthouse informó que la página dejó de responder |
| Zoho Notebook — `https://www.zoho.com/notebook/` | 61 / 90 / 69 / 85 | 76 / 83 / 69 / 85 | Página comercial |

Milanote no se considera un cero. El primer informe falló en ambos perfiles. Se hizo un único reintento; el laboratorio seguía sin resultados disponibles al cerrar la recogida. No se reemplazó por una cifra estimada.

### Media descriptiva de las portadas disponibles

Se incluyen ocho portadas rivales con medición válida. Se excluyen PostisPop, el acceso de iCloud y Milanote. La media es aritmética, con el mismo peso por página, calculada por categoría y perfil. No se mezclan las cuatro categorías en una supuesta puntuación global de producto.

| Categoría | Media móvil, n = 8 | PostisPop móvil | Media escritorio, n = 8 | PostisPop escritorio |
| --- | ---: | ---: | ---: | ---: |
| Rendimiento | 55,38 | 58 | 68,25 | 72 |
| Accesibilidad automática | 88,50 | 100 | 88,75 | 100 |
| Buenas prácticas | 85,50 | 100 | 82,63 | 100 |
| SEO técnico básico | 95,13 | 100 | 95,13 | 100 |

Los valores de PostisPop están por encima de esas medias en esta muestra. Eso **no es una victoria competitiva**: las páginas realizan trabajos diferentes, una ejecución tiene variabilidad y la media no demuestra rapidez del editor, calidad del producto, seguridad, sincronización ni satisfacción. Obsidian obtuvo 99 en rendimiento móvil y Standard Notes 89 en escritorio en sus portadas. PostisPop conserva dos problemas propios que necesitan atención aunque la media de otras páginas sea inferior.

### Métricas de PostisPop

| Métrica de laboratorio | Móvil | Escritorio |
| --- | ---: | ---: |
| First Contentful Paint | 6,3 s | 0,9 s |
| Largest Contentful Paint | **10,9 s** | 1,1 s |
| Total Blocking Time | 0 ms | 40 ms |
| Cumulative Layout Shift | 0,056 | **0,988** |
| Speed Index | 7,1 s | 1,3 s |

PSI no ofrecía datos CrUX de usuarios reales para PostisPop. Por tanto, no puede afirmarse que sus Core Web Vitals de campo estén aprobadas. Los resultados 100 de accesibilidad y buenas prácticas tampoco certifican accesibilidad completa ni seguridad integral.

### Informes reproducibles

Estos enlaces son los informes observados; no contienen sesiones de usuario ni credenciales.

| Aplicación | Informe móvil | Informe escritorio |
| --- | --- | --- |
| PostisPop | [Abrir](https://pagespeed.web.dev/analysis/https-postispop-com/se4gwbd6ol?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-postispop-com/se4gwbd6ol?form_factor=desktop) |
| Evernote | [Abrir](https://pagespeed.web.dev/analysis/https-evernote-com/1g8ecq1mf8?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-evernote-com/1g8ecq1mf8?form_factor=desktop) |
| Google Keep | [Abrir](https://pagespeed.web.dev/analysis/https-workspace-google-com-intl-pt-BR-products-keep/kpmzk558ox?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-workspace-google-com-intl-pt-BR-products-keep/kpmzk558ox?form_factor=desktop) |
| OneNote | [Abrir](https://pagespeed.web.dev/analysis/https-www-microsoft-com-en-us-microsoft-365-onenote-digital-note-taking-app/6ob6hdl840?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-www-microsoft-com-en-us-microsoft-365-onenote-digital-note-taking-app/6ob6hdl840?form_factor=desktop) |
| Notion | [Abrir](https://pagespeed.web.dev/analysis/https-www-notion-com/l4ve15adik?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-www-notion-com/l4ve15adik?form_factor=desktop) |
| Obsidian | [Abrir](https://pagespeed.web.dev/analysis/https-obsidian-md/pto05ic9lt?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-obsidian-md/pto05ic9lt?form_factor=desktop) |
| Standard Notes | [Abrir](https://pagespeed.web.dev/analysis/https-standardnotes-com/hhm2ycfhtd?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-standardnotes-com/hhm2ycfhtd?form_factor=desktop) |
| Joplin | [Abrir](https://pagespeed.web.dev/analysis/https-joplinapp-org/muhjvefcs3?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-joplinapp-org/muhjvefcs3?form_factor=desktop) |
| Apple Notes / iCloud | [Abrir](https://pagespeed.web.dev/analysis/https-www-icloud-com-notes/uzin6ebwoa?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-www-icloud-com-notes/uzin6ebwoa?form_factor=desktop) |
| Milanote, error inicial | [Abrir](https://pagespeed.web.dev/analysis/https-milanote-com/evbh4ku1nv?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-milanote-com/evbh4ku1nv?form_factor=desktop) |
| Zoho Notebook | [Abrir](https://pagespeed.web.dev/analysis/https-www-zoho-com-notebook/l6p74bgx1n?form_factor=mobile) | [Abrir](https://pagespeed.web.dev/analysis/https-www-zoho-com-notebook/l6p74bgx1n?form_factor=desktop) |

[Reintento de Milanote, sin laboratorio disponible al cierre](https://pagespeed.web.dev/analysis/https-milanote-com/qscoq14olj?form_factor=mobile).

### Diagnóstico de la versión pública medida

1. **Salto del tablero en escritorio.** PSI atribuye 0,715 y 0,267 de CLS a `section.board-frame`; `div.top-controls` suma 0,005. También señala cambios de fuentes. Reservar tamaño del tablero desde el primer render y evitar una redistribución tardía son prioridades que deben comprobarse de nuevo tras desplegar.
2. **CSS en el camino crítico.** Ocho hojas bloquean el primer render móvil: la hoja principal `postispop-wpo-ec7c1e6e6976.css` (30,6 KiB), `design-tools.css`, `wpo-features.css`, `arcade-theme.css`, `commerce.css`, `protected-notes.css`, `experience.css` y `fonts.css`. El ahorro estimado por PSI es de 2.230 ms; es una estimación, no una mejora ya conseguida.
3. **Recursos ajenos a la captura rápida.** Se descargan `DejaVuSans.ttf` (374,89 KiB), `designs/country-flags.js` (397,03 KiB) y `designs/country-outlines.js` (167,42 KiB), además de catálogos y escenas regionales. Los tres recursos citados suman aproximadamente 939 KiB. Eliminar su carga inicial y utilizar fuentes más pequeñas o del sistema encaja con la eliminación de plantillas solicitada.
4. **El mayor contenido es secundario.** El elemento LCP móvil es `span.pp-quote-copy`, la frase del día. El diagnóstico muestra 2.410 ms de retraso de renderizado de ese elemento; no debe confundirse ese desglose con el LCP simulado global de 10,9 s. Las notas del usuario deberían dominar el primer estado útil.
5. **Caché y código.** PSI estima 1.991 KiB mejorables mediante políticas eficientes de caché y 74 KiB de JavaScript no utilizado. No reducir seguridad o aislamiento de datos para mejorar una puntuación; la caché pública no debe incluir respuestas privadas de API, Auth o Storage.

Metodología oficial: [qué mide PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about), [variabilidad y cálculo de Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/) y [API de PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started). Google distingue los datos de laboratorio de los de campo y advierte de la variación entre ejecuciones.

## 3. Diez referencias funcionales frente a PostisPop

La columna «PostisPop local» describe implementaciones observadas en el código y su documentación vigente. «Pendiente» significa que no se ha acreditado una función equivalente o que necesita integración/validación antes de anunciarse. La disponibilidad de un competidor puede variar por plataforma y plan; esta tabla no presupone que todas sus funciones sean gratuitas.

| Referencia y fuente oficial | Funciones verificadas en la fuente | PostisPop local | Pendiente o diferencia material |
| --- | --- | --- | --- |
| [Evernote](https://evernote.com/en-us/features/notes-app) | Notas y adjuntos, búsqueda por texto/etiquetas, tareas dentro de notas, sincronización, offline y captura web. | Texto/dibujo, búsqueda por texto y color, adjuntos locales, autoguardado, cola offline y copias. | No acreditar búsqueda OCR/PDF, tareas estructuradas ni web clipper. Los adjuntos ordinarios son locales; no prometer sincronización completa de archivos. |
| [Google Keep](https://support.google.com/keep/answer/2888240?hl=en), [organización](https://support.google.com/keep/answer/6191044?co=GENIE.Platform%3DDesktop&hl=en) | Notas, listas, dibujo, colores, etiquetas, fijar, archivo y compartir. | Cuadrícula visual, dibujo, colores, búsqueda en todas las páginas y papelera/restauración. `#etiqueta` se busca como texto de la nota. | Fijar, archivo independiente, listas con casillas y gestión estructurada de etiquetas no quedan acreditados. Compartir exige verificar permisos y recorridos reales del backend. |
| [OneNote](https://support.microsoft.com/en-us/onenote/take-and-format-notes) | Texto y escritura manual en una página, imágenes, listas, enlaces, audio/vídeo, etiquetas y guardado continuo. | Editor listo para texto; lápiz, pincel, goma y deshacer/rehacer de dibujo en la nota; adjuntos y grabación de voz en navegador compatible. | No equivale a un cuaderno de página libre ilimitada, organización por secciones, tablas ni tinta reconocida. Comprobar permisos de micrófono/archivos en Android real. |
| [Notion](https://www.notion.com/help/intro-to-databases), [offline](https://www.notion.com/en-gb/help/use-pages-offline) | Páginas, propiedades, filtros, varias vistas, comentarios, vínculos y trabajo offline en aplicaciones. | Paginación, salto de página, filtro textual/color, opciones secundarias en menú y recuperación de conflictos offline. | No hay paridad con bases de datos, relaciones, automatizaciones o comentarios. La existencia de una cola no certifica edición simultánea avanzada. |
| [Obsidian: almacenamiento](https://obsidian.md/help/data-storage), [Canvas](https://obsidian.md/help/Plugins/Canvas), [backlinks](https://obsidian.md/help/plugins/backlinks) | Archivos Markdown locales, enlaces entrantes y canvas con diversos contenidos. | Notas guardadas en el dispositivo, dibujo, recursos Android empaquetados y exportación propia. | La persistencia actual no es una carpeta Markdown interoperable. Enlaces entre notas, backlinks y canvas infinito son trabajos separados. |
| [Standard Notes](https://standardnotes.com/features), [offline](https://standardnotes.com/help/59/can-i-use-standard-notes-totally-offline) | Cifrado de extremo a extremo, acceso offline, distintos editores, revisiones y copias. | Protección por contraseña de notas concretas, cola offline por cuenta, copias y recuperación de conflictos. | No afirmar cifrado global por defecto ni equivalencia de su auditoría de seguridad. Los sobres protegidos, copias, historial y compartición tienen límites propios; revisar [notas protegidas](NOTAS_PROTEGIDAS.md). |
| [Joplin](https://joplinapp.org/help/), [sincronización](https://joplinapp.org/help/dev/spec/sync/) | Offline first, búsqueda completa, libretas, etiquetas, importación Evernote/Markdown y sincronización con varios servicios. | Invitado local, cola persistente, reintentos y conflictos, importación/exportación del formato PostisPop. | Sin importador ENEX/Markdown ni múltiples proveedores de sincronización acreditados. Supabase real y continuidad entre dos dispositivos siguen siendo una puerta de validación independiente. |
| [Apple Notes: filtros](https://support.apple.com/guide/notes/use-smart-folders-apd58edc7964/mac), [búsqueda](https://support.apple.com/en-ae/guide/ipad/ipad64863a98/ipados), [escáner](https://support.apple.com/en-ca/108963) | Carpetas inteligentes, etiquetas, búsqueda en escritura/documentos, escáner y firmas. | Búsqueda textual/color, dibujo, imágenes/archivos locales y protección por nota. | No hay escáner con corrección de perspectiva, OCR, búsqueda manuscrita ni carpetas inteligentes acreditados. |
| [Milanote: dibujo](https://help.milanote.com/en/articles/5537688-drawing), [compartir](https://help.milanote.com/en/articles/4324593-sharing-a-board) | Tableros visuales, dibujos, notas/medios, enlaces de lectura y colaboración. | Pizarra de notas cuadradas, páginas, dibujo y rutas de compartición/protección. Reordenación cloud preparada como RPC transaccional. | Validar permisos/compartición con el servidor real. No equiparar a comentarios, presencia, conectores ni colaboración simultánea en canvas infinito. |
| [Zoho Notebook: tarjetas](https://help.zoho.com/portal/en/kb/notebook/find-and-organize-your-notes/articles/organizing-notes-in-zoho-notebook), [offline](https://help.zoho.com/portal/en/kb/notebook/mobile-and-desktop-apps/articles/using-notebook-offline) | Tarjetas de texto, listas, imágenes, audio, vídeo, dibujos y archivos; offline y sincronización. | Nota combinada de texto/dibujo, archivos multimedia locales, voz y exportación de texto/imagen. | Adjuntar un archivo no equivale a editarlo ni indexarlo. Tarjetas inteligentes, transcripción y nube completa de archivos no están acreditadas. |

### Evidencia local y límites que evitan promesas incorrectas

| Área | Evidencia en el repositorio | Alcance de la afirmación |
| --- | --- | --- |
| Tablero y navegación | `board-view-model.js`, `board-layout.js`, `workspace.css` | Seis notas por página móvil; seis o doce en escritorio según colección. Cuadrícula gratuita 3 × 2 y selección 4 × 3 / 6 × 2 para doce. Flechas, selector y gesto horizontal con exclusión de controles de edición. Requiere confirmar los tamaños efectivos con las pruebas visuales vigentes. |
| Crear sin perder contexto | `board-layout.js`, `tests/add-note-ui.cjs` | «+» abre para escribir la primera nota realmente vacía en el orden de la pizarra, aunque esté en otra página; limpia la búsqueda y el filtro de color para mostrarla. Excluye notas con archivos, dibujos, imágenes o protección. Si no hay un hueco, pide crear una nota respetando los límites; en gratuito completo conserva las seis y explica «Próximamente». Cinco escenarios automatizados cubren esos recorridos, incluido un resultado de creación autorizado simulado. |
| Presentación visual | `workspace.css`, `assets/postispop-logo.svg`, `assets/postispop-logo-light.svg` | Paleta de fondo cálido, superficies claras, acento verde y variante oscura; jerarquía discreta, iconos accesibles y controles secundarios en menús. Es una implementación de diseño, no una prueba de preferencia del mercado. Contraste y legibilidad se comprueban en la auditoría final de la versión preparada. |
| Editor | `design-tools.js`, `editor-catalog.js`, `style-model.js` | Modo inicial de texto, dibujo dentro de la nota, goma de trazos, historial de dibujo y opciones secundarias. No afirmar deshacer ilimitado de todos los tipos de contenido. |
| Encontrar notas | `board-tools.js`, `board-view-model.js` | Coincidencia textual y filtro de color sobre el conjunto completo, antes de paginar. No busca el contenido cifrado ni el texto dentro de archivos. `#etiqueta` no es todavía una entidad independiente. |
| Datos locales y recuperación | `guest-board.js`, `offline-sync.js`, `offline-ui.js`, `supabase-bridge.js` | Invitado local, papelera/restauración, cola por cuenta y revisión explícita de conflictos. No certificar producción a partir de pruebas con backend simulado. |
| Adjuntos | `note-attachments.js` | IndexedDB local, hasta 25 MiB por archivo admitido. Voz sujeta a compatibilidad y permiso. La protección por contraseña tiene un límite distinto para el conjunto de adjuntos. |
| Copias y exportación | `board-tools.js`, `backup-import.js`, `tests/attachment-backup.test.cjs` | La copia JSON v2 incluye texto, dibujos y adjuntos locales binarios/enlaces de las notas exportadas. Verifica tamaño y SHA-256 antes de restaurar binarios en IndexedDB, mantiene cifrados los sobres protegidos, admite copias v1 y protege los huecos que ya contienen archivos. Las pruebas cubren restauración offline, corrupción, cambio de cuenta, reintento y error de almacenamiento. No equivale a sincronización cloud de archivos. La imagen/PDF sigue siendo una vista resumida sin todo el multimedia; importar notas cloud depende de RPC y migraciones. |
| Protección | `protected-notes.js`, `note-crypto.js`, `attachment-lock.js` | Sobres cifrados por nota y coordinación con adjuntos. No recuperación de contraseña ni borrado retroactivo de copias anteriores; no anunciar cifrado integral de todas las notas. |
| Recordatorios | `commerce-ui.js` | Compatibilidad para cuentas con derechos vigentes. El aviso existente requiere mantener PostisPop abierto. No son alarmas Android nativas con la aplicación cerrada. |
| Android | `android/`, `auth-pkce.js`, `android/verify-archive.py` | Recursos locales, almacenamiento del dispositivo y preparación de autenticación/recuperación. Consultar el documento de validación para la compilación exacta; firma original, instalación, actualización y ensayos físicos son estados separados. |

Actualización de implementación del 6 de octubre: el respaldo de adjuntos v2 y el recorrido de «+» anteriores ya están implementados; no deben seguir presentándose como funciones pendientes. El respaldo tiene límites explícitos: 25 MiB por archivo, 50 MiB para la copia local serializada y 24 MiB para el payload cloud una vez retirados los binarios ordinarios. El sobre protegido conserva sus propios límites. SHA-256 detecta corrupción del contenido; no autentica el origen de una copia. Los binarios ordinarios se restauran en el dispositivo y no se envían al servidor como si existiera sincronización de archivos. La auditoría externa de la sección 2 continúa correspondiendo a la versión pública anterior.

## 4. Prioridades de producto

### Primero: completar y acreditar la experiencia central

1. **Ver y escribir rápido.** Notas grandes, casi cuadradas y legibles; abrir y escribir sin elegir un modo. Mantener texto/dibujo y los controles frecuentes dentro de la nota. Opciones secundarias en menús, con nombres accesibles y foco visible aunque se muestre sólo el icono.
2. **Moverse sin perder contexto.** Páginas estables, búsqueda en todas las notas, selector para saltar directamente y alternativas al gesto. Evitar que escribir o dibujar cambie de página. No reducir indefinidamente el texto para forzar más tarjetas en una ventana baja o con zoom.
3. **Confiar en el guardado.** Verificar crear/editar, errores de almacenamiento, recarga, modo avión, cierre del proceso, conflictos y cambio de cuenta. No mostrar «guardado en la nube» mientras sólo existe la copia local.
4. **Resolver los límites remotos.** Aplicar y probar las migraciones en staging con el esquema real antes de atribuir al servidor las nuevas reglas. No eliminar notas antiguas por exceder seis ni inventar derechos Premium en el cliente.
5. **Volver a medir la versión publicada.** Corregir CLS, CSS y recursos iniciales; obtener una nueva serie de PSI tras desplegar. Las cifras de este documento siguen siendo la línea base anterior.

### Después: funciones frecuentes que faltan, sin llenar la pantalla

Fijar notas, archivo separado de la papelera, duplicar de forma explícita, listas con casillas, etiquetas gestionables y ordenación por criterio son candidatas prioritarias. Deben tener modelo de datos, persistencia, migración y pruebas; no basta con añadir iconos. Su ubicación propuesta es el menú de la nota o de búsqueda, conservando a mano sólo las acciones de uso diario.

El respaldo de los adjuntos locales y su restauración verificable ya forman parte del formato v2. Antes de ampliar formatos, validar además su continuidad en dispositivos reales y mantener claros sus límites de tamaño y alcance local. Recordatorios fiables con la aplicación cerrada requieren implementación nativa y pruebas de permisos/ahorro de batería.

### Fases independientes que no se anuncian como entregadas

- **Interoperabilidad:** importar Markdown/ENEX, enlaces internos y exportación a formatos de terceros. El respaldo propio v2 con adjuntos locales ya existe; la sincronización cloud de archivos es un trabajo distinto.
- **Captura enriquecida:** escáner, OCR, indexación de PDF, voz transcrita y compartir contenido hacia Android.
- **Colaboración:** permisos finos, historial, comentarios, presencia y edición simultánea con resolución de conflictos bien definida.
- **Privacidad avanzada:** cifrado integral, gestión de claves y revisión de seguridad específica; distinto de la protección actual de notas individuales.
- **Integraciones y automatización:** web clipper, calendarios, conectores e IA. Evaluar coste operativo y necesidad real antes de incorporarlos a una oferta económica.

Las plantillas, ruleta, recompensas, ventas de fondos y compras separadas de herramientas quedan fuera por decisión explícita del usuario, aunque existan en competidores. No deben volver como consecuencia de esta comparación.

## 5. Oferta comercial y criterios de cierre

Gratis: **seis notas**. Un único Premium con las mismas funciones: **2,95 €/mes**, **9,95 €/año** o **59,95 € de por vida**. Los botones muestran **«Próximamente»** y no abren pagos. El límite técnico vigente de Premium es de **100 notas por pizarra**; no anunciar «ilimitadas». Conservar los derechos históricos sin simular activaciones nuevas.

Antes de comunicar una entrega final:

- Registrar el commit y el despliegue concretos, diferenciándolos de esta línea base pública.
- Repetir PostisPop tres veces por perfil en PSI y publicar la mediana con todos los informes. No seleccionar sólo la mejor ejecución ni comparar una mediana propia con una supuesta media del mercado sin explicar el muestreo.
- Registrar pruebas de tablero/editor con la misma colección de prueba: seis notas gratuitas, doce visibles en escritorio Premium, colección de cien, búsqueda, última página, teclado, zoom y tamaños representativos de móvil/portátil/escritorio. Una prueba sintética de carga no sustituye a comprobar el contenido legible.
- Comprobar funcionamiento con dos cuentas y dos dispositivos en staging, límites gratuitos, permisos, sincronización, protección, importación y restauración. Mantener visibles los fallos pendientes y su alcance.
- Entregar Android identificando qué se compiló, cómo se verificó el contenido del APK, qué firma tiene y dónde se instaló/probó. No confundir recursos empaquetados, APK sin firmar y aplicación de distribución comprobada.

Los umbrales de rendimiento y los recorridos aprobados son criterios verificables. «Mejor aplicación del mercado», «todas las funciones de la competencia» y «sin fallos» no son conclusiones acreditadas por esta auditoría.
