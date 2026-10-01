# PostisPop — entrega del segundo prompt

## Alcance aplicado

- Auditoría previa en `AUDITORIA-20261001.md`.
- Portada española con propuesta de valor, CTAs, uso sin cuenta, explicación local/nube, planes reales y preguntas frecuentes.
- Metadatos, canonical, OG/Twitter, manifest e iconos; ocho páginas de uso con contenido propio, sitemap y robots.
- Catálogo de citas separado por idioma; bundle principal de pizarra de 2.38 MB a aproximadamente 280 KB antes de compresión.
- Ocho plantillas; búsqueda por texto, color y etiqueta; notas fijadas y archivadas; modo oscuro; atajos.
- Copias JSON validadas, importación en pizarra nueva, duplicado; PNG y vista para guardar PDF con texto y colores. Adjuntos locales se descargan individualmente; no se incluyen en JSON/PNG/PDF. Los dibujos se conservan en JSON, no en exportaciones visuales.
- Enlaces de lectura o edición con vencimiento de 1–30 días, revocación, restricción opcional a un correo confirmado y límite de 30 enlaces activos. Edición exige cuenta. La vista compartida contiene texto y colores. No se envían invitaciones por correo automáticamente.
- Operaciones de nube transaccionales para creación, importación, papelera y reordenación. Conflictos de revisión y bloqueo respetados. No se reemplaza la política histórica de miembros.
- Estado de guardado diferenciado local/nube, errores y última sincronización de escritura confirmada.
- PWA: caché pública explícita; ninguna respuesta de API, sesión, Supabase ni pizarra compartida entra en la caché. Invitado funciona sin conexión después de cargar los recursos.
- Alarmas: fecha absoluta UTC y zona del dispositivo visible, confirmación, recuperación al volver a la pestaña y archivo .ics para calendario externo.
- Compras únicas y prueba existente de 30 días conservadas; restauración consulta derechos en servidor. No se han activado nuevos cobros.
- Métricas locales opcionales y agregadas; sin contenido de notas ni identificadores, con respeto de DNT/GPC y borrado al desactivar. No es un panel de analítica centralizado.

## Verificación

- `npm run lint`: JavaScript de módulos y scripts.
- `npm test`: 21 pruebas, incluyendo PostgreSQL/PGlite con RLS y roles reales, enlaces de lectura, edición, identidad, revocación, caducidad y no sobrescritura; validación de pagos; persistencia local.
- `npm run build`: Astro check y generación estática, Pagefind, contenido y paquete público.
- `npm run test:pwa`: 41 recursos públicos cacheados, recarga sin red conservando la nota y ninguna API/sesión en caché.
- `npm run test:site`: flujo de uso en 390 y 1366 px, hidratación sin errores de React, plantillas, búsqueda, etiquetas, persistencia, JSON y enlaces.
- `node scripts/package-mobile.mjs && npm run test:mobile`: inicio offline, texto, archivos y enlaces locales persistentes, catálogo y búsqueda en el paquete Android.
- Las pruebas de pagos usan respuestas simuladas; no se ha hecho ningún cargo real. Las de permisos utilizan una base aislada; no crean notas ni cuentas en producción.

## Migración y configuración

`database/roadmap.sql` es aditiva y transaccional. Añade `notes.metadata`, papelera, tabla privada de enlaces y funciones `pp_*`. Puede repetirse. No borra tablas, notas o miembros. Se aplica antes de publicar el cliente nuevo.

No requiere variables nuevas. Conserva las variables existentes de Supabase/Stripe; ninguna clave privada aparece en el cliente. `STRIPE_PAYMENTS_ENABLED` sigue gobernando checkout junto con la configuración del servidor.

Los planes de 2,99 €/mes y 24,99 €/año están definidos como propuesta en `app/plans.js`. No son ofertas activas. Para habilitarlos faltan precios reales de Stripe, ciclo de webhook de suscripciones, tabla y fuente de derechos del servidor, política comercial aprobada y pruebas con Stripe en modo test. El pack actual de 9,99 € sigue siendo una compra única de estilos y reloj; no se convierte en suscripción.

## Límites y trabajo futuro explícito

- Las alarmas internas requieren la web abierta y un dispositivo activo. El .ics permite delegar avisos al calendario, según su configuración. Push/correo de fondo, recurrencia y proveedores externos requieren otra entrega con infraestructura y consentimiento.
- GitHub Pages no ejecuta Nginx ni permite configurar 301 arbitrarios desde este repositorio. Se mantienen las páginas legales `.html` como canónicas; las reglas opcionales quedan en `nginx.postispop.conf` para un origen que sí las soporte.
- Integraciones externas, chat, historial avanzado, IA y otras mejoras P2 son posteriores, no aparecen como funciones activas.
- No hay una medición de Core Web Vitals de usuarios reales ni puntuación Lighthouse inventada.
- El JSX original no existe en el repositorio. Se conserva el motor recuperado; `render-board.mjs` regenera su HTML inicial con la misma versión React para evitar fallos de hidratación.
- La nueva caché de la PWA se activa al cerrar pestañas de la versión anterior; no fuerza una recarga que pueda interrumpir la escritura.

## Publicación y reversión

El workflow ejecuta lint y tests antes de build, y publica exclusivamente `_site`. No incluye las instantáneas `api`, dependencias, tests o documentos internos.

La reversión del cliente se hace reponiendo el commit anterior. La migración aditiva puede conservarse: no rompe el cliente anterior. No eliminar las tablas nuevas para revertir, pues podrían contener copias o enlaces creados después de la publicación.
