import { writeFile } from "node:fs/promises";
const guides = [
  [
    "bloc-de-notas-online",
    "Bloc de notas online: apunta una idea antes de perderla",
    "Escribe apuntes y listas en un bloc de notas online gratuito. Aprende a guardar una copia y a distinguir las notas locales de las de tu cuenta.",
    "Un bloc de notas resulta útil cuando escribir debe llevar menos tiempo que decidir dónde guardar algo. En PostisPop puedes abrir una nota vacía, escribir una idea y volver a ella después. La pizarra mantiene varias notas a la vista para que no tengas que abrir un documento distinto para cada asunto.",
    [
      "Reserva una nota para las ideas que todavía no tienen un destino. Evita ordenar cada frase en el momento de escribirla: primero captura la información.",
      "Al acabar el día, convierte cada idea útil en una acción concreta: llama a alguien, busca un dato o desarrolla un borrador. Elimina lo que ya no necesites solo después de revisarlo.",
      "Descarga una copia JSON antes de borrar datos del navegador o cambiar de dispositivo. Sin iniciar sesión, abrir la web en otro navegador no recuperará tus notas locales.",
    ],
    [
      "Llamar a la gestoría",
      "Idea para el próximo proyecto",
      "Preguntar por la fecha de entrega",
    ],
    "¿Las notas locales aparecen en otro dispositivo?",
    "No. Las notas locales pertenecen a ese navegador. Las notas de tu cuenta pueden consultarse después de iniciar sesión en otro dispositivo.",
  ],
  [
    "pizarra-virtual",
    "Pizarra virtual: organiza ideas que necesitan verse juntas",
    "Descubre cómo usar una pizarra virtual con notas de colores para ordenar información, comparar opciones y mantener tus próximos pasos a la vista.",
    "Una lista funciona bien cuando todo pertenece a una misma secuencia. Una pizarra virtual ayuda cuando necesitas ver relaciones: qué falta, qué depende de otra tarea y qué decisión debes tomar. Usa el espacio como una explicación de tu trabajo, no como un almacén de frases.",
    [
      "Empieza por una pregunta que la pizarra deba responder. Por ejemplo: ¿qué falta para entregar este proyecto? Escribe una respuesta breve en cada nota.",
      "Define una convención de colores sencilla y estable. Un color puede indicar preguntas abiertas y otro, acciones confirmadas. No dependas solo del color: añade también una palabra como PENDIENTE o HECHO.",
      "Reordena las notas por importancia. En PostisPop puedes arrastrar una nota sobre otra para intercambiar sus posiciones. La vista conjunta debería ayudarte a escoger el siguiente paso.",
    ],
    [
      "PENDIENTE · Revisar propuesta",
      "EN MARCHA · Preparar materiales",
      "HECHO · Confirmar fecha",
    ],
    "¿Es necesario usar todos los colores?",
    "No. Dos o tres categorías suelen ser suficientes. Añade una etiqueta escrita para que el significado siga siendo claro sin distinguir los colores.",
  ],
  [
    "notas-adhesivas-online",
    "Notas adhesivas online: una idea por nota",
    "Organiza apuntes con notas adhesivas online. Usa colores, frases breves y etiquetas escritas para revisar tus ideas con menos esfuerzo.",
    "Una nota adhesiva funciona mejor cuando expresa una sola cosa. Si reúne un recordatorio, un presupuesto y una conversación, será difícil reconocer qué hay que hacer con ella. Divide la información por intención y utiliza títulos que te permitan entenderla de un vistazo.",
    [
      "Empieza la nota con un verbo: revisar, enviar, decidir o preguntar. Añade debajo los detalles que necesitas para actuar.",
      "Usa etiquetas escritas como #casa, #trabajo o #estudio. El buscador puede localizar esas palabras sin crear carpetas ni ocultar el resto de tu pizarra.",
      "Dedica un minuto a revisar las notas antiguas. Una nota que ya no requiere acción puede exportarse antes de vaciarla; así mantienes visible lo que importa hoy.",
    ],
    [
      "ENVIAR · Propuesta #trabajo",
      "REVISAR · Tema 4 #estudio",
      "COMPRAR · Leche #casa",
    ],
    "¿Las etiquetas son una función separada?",
    "En esta versión se escriben dentro de la nota, por ejemplo #trabajo, y se encuentran con el buscador. No hay un catálogo independiente de etiquetas.",
  ],
  [
    "pizarra-colaborativa",
    "Pizarra colaborativa: prepara un espacio común con reglas claras",
    "Prepara objetivos, tareas y permisos para una pizarra colaborativa. Consulta el estado real de los enlaces y las invitaciones de PostisPop.",
    "Antes de invitar a otras personas, define qué se espera de ellas: leer información, aportar ideas o cambiar decisiones. Una pizarra compartida necesita un objetivo común y una forma de distinguir propuestas de acuerdos. Crear una cuenta no equivale por sí solo a compartir una pizarra.",
    [
      "Escribe el objetivo y el resultado esperado. Un ejemplo concreto es terminar la sesión con tres acciones y una persona responsable de cada una.",
      "Establece quién puede editar y quién solo necesita leer. Revisa los participantes cuando termine el proyecto y evita introducir datos que no deban conocer todos.",
      "En PostisPop, los enlaces y las invitaciones están en revisión. Mientras no estén habilitados y confirmados, puedes preparar el contenido y compartir una exportación. Esa copia no es colaboración en tiempo real.",
    ],
    [
      "Objetivo · Decidir prioridades",
      "Propuesta · Una idea por persona",
      "Acuerdo · Responsable y fecha",
    ],
    "¿Puedo crear ahora un enlace editable?",
    "La gestión de enlaces e invitaciones está en revisión. Esta versión no anuncia como activo un enlace que el servidor no haya confirmado.",
  ],
  [
    "organizador-visual-de-tareas",
    "Organizador visual de tareas: elige qué hacer después",
    "Organiza tareas con una pizarra visual sencilla. Separa pendientes, trabajo en marcha y tareas terminadas sin perder de vista el siguiente paso.",
    "Una pizarra de tareas debe ayudarte a decidir, no limitarse a recordarte cuánto falta. Si todas las notas parecen igual de urgentes, la organización no está resolviendo el problema. Empieza con pocos compromisos y escribe una acción que puedas terminar.",
    [
      "Clasifica las tareas como POR HACER, EN MARCHA y HECHO. Escribe el estado en la propia nota, además de utilizar un color.",
      "Limita el trabajo que tienes en marcha. Si una tarea se bloquea, añade el motivo y la próxima acción: esperar una respuesta, pedir información o reservar tiempo.",
      "Revisa los pendientes al empezar y terminar el día. Dedica una nota a cada siguiente paso y deja espacio para la información que realmente necesitas.",
    ],
    [
      "POR HACER · Pedir presupuesto",
      "EN MARCHA · Redactar propuesta",
      "HECHO · Enviar factura",
    ],
    "¿Necesito preparar una estructura antes de escribir?",
    "No. Abre una de tus seis notas gratuitas y escribe directamente. Puedes ordenar las ideas después, cuando sepas qué te resulta útil.",
  ],
  [
    "notas-para-estudiar",
    "Notas para estudiar: practica recordar, no solo releer",
    "Prepara notas de estudio con preguntas, ejemplos y pequeños repasos. Organiza cada sesión en una pizarra que puedas consultar desde el navegador.",
    "Copiar una página entera en una nota crea otra página que leer. Para estudiar de forma activa, transforma el contenido en preguntas. Una pizarra con conceptos breves facilita detectar qué sabes explicar y dónde necesitas volver a los materiales originales.",
    [
      "Escribe una pregunta concreta en cada nota: ¿qué diferencia hay entre estos dos conceptos? Intenta responderla antes de consultar el libro.",
      "Añade un ejemplo propio. Si solo recuerdas la definición, comprueba si puedes aplicarla a una situación nueva. Marca con #repasar las dudas que no hayas resuelto.",
      "Cierra la sesión con tres preguntas para el día siguiente. Adapta cada nota a tu asignatura y conserva copias de los apuntes importantes.",
    ],
    [
      "Pregunta · ¿Cómo funciona?",
      "Ejemplo · Aplícalo a un caso",
      "Repaso · Explicarlo mañana",
    ],
    "¿PostisPop corrige o verifica mis apuntes?",
    "No. Es una herramienta para organizar notas. Verifica el contenido con tus materiales de estudio y tus fuentes.",
  ],
  [
    "pizarra-para-reuniones",
    "Pizarra para reuniones: de los temas a los acuerdos",
    "Prepara una reunión con agenda, decisiones y próximos pasos. Usa una pizarra de notas para que cada acuerdo tenga responsable y fecha.",
    "Una reunión resulta más fácil de seguir cuando sus temas y sus decisiones están separados. La pizarra puede servir como agenda antes de empezar y como registro de acuerdos al terminar. Evita confundir una idea que alguien propone con una decisión que el equipo ya ha tomado.",
    [
      "Antes de la reunión, escribe para qué se convoca y qué decisión necesita resolverse. Limita la agenda a los puntos que requieren conversación.",
      "Durante la sesión, anota cada decisión con palabras concretas. Separa las preguntas sin resolver para que no desaparezcan entre los comentarios.",
      "Al terminar, asigna una persona responsable y una fecha a cada siguiente paso. Exporta el texto a PDF desde la opción de impresión si necesitas distribuir una copia; no contiene los archivos adjuntos.",
    ],
    [
      "Agenda · Revisar el lanzamiento",
      "Decisión · Priorizar la versión móvil",
      "Acción · Ana envía la propuesta el viernes",
    ],
    "¿La copia PDF se actualiza después de exportarla?",
    "No. Es una copia del texto guardado en ese momento. Vuelve a exportarla si necesitas compartir cambios posteriores.",
  ],
  [
    "lluvia-de-ideas-online",
    "Lluvia de ideas online: primero explorar, después elegir",
    "Prepara una lluvia de ideas con un reto claro, notas breves y una selección final. Organiza propuestas y conviértelas en un primer experimento.",
    "Una lluvia de ideas tiene dos momentos distintos: proponer posibilidades y escoger cuáles merece la pena probar. Si valoras cada idea inmediatamente, es fácil quedarse con las primeras opciones. Usa las notas para capturar alternativas antes de compararlas.",
    [
      "Formula un reto acotado. ¿Cómo podemos simplificar el registro? es más útil que mejorar toda la aplicación. Escribe una propuesta por nota, aunque todavía sea imperfecta.",
      "Agrupa las propuestas parecidas mediante palabras o colores. Busca opciones que resuelvan el mismo problema con distinto esfuerzo; no descartes una idea solo porque todavía falten detalles.",
      "Elige una prueba pequeña y escribe qué quieres aprender. Una decisión útil termina en una acción, una fecha de revisión y una señal observable de que la idea funciona.",
    ],
    [
      "Reto · Simplificar el registro",
      "Idea · Empezar con una nota",
      "Prueba · Observar la primera sesión",
    ],
    "¿PostisPop decide cuál es la mejor idea?",
    "No. Te permite ver y comparar tus propuestas. Tú eliges los criterios y decides qué experimento realizar.",
  ],
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const serializeSchema = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");
const site = "https://postispop.com";

// Reminder help describes the existing tool; it is not a separate sale or trial.
const reminderHelp = `
<section class="pp-section" id="recordatorios">
  <h2>Recordatorios para una nota</h2>
  <p>Si tu cuenta tiene acceso a recordatorios, abre esa opción, elige la nota y añade una fecha y hora. Comprueba que la aplicación confirma el guardado.</p>
  <p>Los avisos de la web requieren PostisPop abierto y el dispositivo activo. Cerrar el navegador o suspender el dispositivo puede impedir o retrasar el aviso.</p>
  <p>Puedes permitir las notificaciones del navegador para ver el aviso fuera de la pestaña. Los derechos que ya tuvieras se conservan; las nuevas activaciones de Premium estarán disponibles próximamente.</p>
</section>`;

for (const [
  slug,
  title,
  description,
  intro,
  steps,
  demo,
  question,
  answer,
] of guides) {
  const url = `${site}/${slug}.html`;
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      },
    ],
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "PostisPop", item: `${site}/` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };
  const related = guides
    .filter((guide) => guide[0] !== slug)
    .map(
      (guide) =>
        `<a href="/${guide[0]}.html">${escapeHtml(guide[1].split(":")[0])}</a>`,
    )
    .join("\n");
  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | PostisPop</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="/favicon.svg">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta name="theme-color" content="#f7f8f5">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="PostisPop">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}/assets/postispop-og.webp">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${site}/assets/postispop-og.webp">
  <link rel="stylesheet" href="/experience.css">
  <script type="application/ld+json">${serializeSchema(faq)}</script>
  <script type="application/ld+json">${serializeSchema(breadcrumbs)}</script>
</head>
<body>
  <main class="pp-guide">
    <nav aria-label="Navegación"><a href="/">← Mis notas</a><a href="/ayuda.html">Ayuda</a></nav>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(intro)}</p>
    <a class="pp-start-primary" href="/?action=create-note">Escribir una nota</a>
    <section class="pp-section">
      <h2>Un ejemplo para llevarlo a la práctica</h2>
      <div class="pp-guide-demo" aria-label="Ejemplo ilustrativo con tres notas">${demo.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</div>
    </section>
    <section class="pp-section"><h2>Cómo empezar</h2><ol>${steps.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ol></section>
    <section class="pp-section"><h2>Una duda habitual</h2><details open><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details></section>
    ${slug === "bloc-de-notas-online" ? reminderHelp : ""}
    <section class="pp-section">
      <h2>Tus ideas, a tu manera</h2>
      <p>Empieza con seis notas gratuitas en este dispositivo. Inicia sesión cuando quieras usar tu cuenta. Las notas locales solo se trasladan a la nube si confirmas su importación.</p>
      <a class="pp-start-primary" href="/">Volver a mis notas</a>
    </section>
    <nav class="pp-section" aria-label="Otras guías">${related}</nav>
    <footer class="pp-section"><a href="/privacy.html">Privacidad</a> · <a href="/terms.html">Condiciones</a> · <a href="/legal.html">Aviso legal</a> · <a href="/cookies.html">Cookies</a></footer>
  </main>
</body>
</html>
`;
  await writeFile(`${slug}.html`, html.replace(/[ \t]+$/gm, ""));
}

// Only canonical, public content belongs in the sitemap. Retired shop URLs are
// still redirected, but must never be promoted as products or indexed again.
const publicPaths = [
  "/",
  ...guides.map((guide) => `/${guide[0]}.html`),
  ...["atelier", "instalar", "privacy", "terms", "legal", "cookies"].map(
    (slug) => `/${slug}.html`,
  ),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPaths.map((path) => `  <url><loc>${site}${path}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile("sitemap.xml", sitemap);

// Keep public search in sync with the same guide source. This index contains no
// notes or account data, and no retired catalogue entries.
const searchIndex = [
  ...guides.map(([slug, title, description]) => ({
    title: title.split(":")[0],
    description,
    url: `/${slug}.html`,
  })),
  {
    title: "Recordatorios de notas",
    description:
      "Cómo programar avisos para tus notas y qué ocurre al cerrar el navegador.",
    url: "/bloc-de-notas-online.html#recordatorios",
  },
  {
    title: "Gratis y Premium",
    description:
      "6 notas gratis. Un Premium: 2,95 € al mes, 5,95 € cada 3 meses, 19,95 € al año o 59,95 € de por vida.",
    url: "/atelier.html",
  },
  {
    title: "Instalar PostisPop",
    description:
      "Consulta las opciones de instalación disponibles para tu dispositivo.",
    url: "/instalar.html",
  },
];
await writeFile(
  "search-index.json",
  JSON.stringify(searchIndex, null, 2) + "\n",
);
console.log(
  `Generated ${guides.length} use guides, ${publicPaths.length} public sitemap URLs and ${searchIndex.length} search entries.`,
);
