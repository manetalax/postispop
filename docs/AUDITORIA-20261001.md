# Auditoría previa y plan — PostisPop (2026-10-01)

Base: commit 614d7cb. Acceso confirmado al repositorio manetalax/postispop y proyecto Supabase PostisPop Auth. Trabajo aislado en improvement/full-roadmap-20261001.

## Stack y arquitectura
- Pizarra: HTML estático recuperado de React/Vinext con bundles compilados; falta el fuente JSX original.
- Tienda: Astro 5, JavaScript/TypeScript, Tailwind 4, contenido Markdown y búsqueda Pagefind, rutas bajo /tienda/.
- Autenticación: Supabase Auth (correo, Google/PKCE), sesión en localStorage; puente fetch local transforma /api en REST Supabase.
- Datos: Postgres con RLS; invitado en localStorage; adjuntos locales en IndexedDB. Colaboración existente por sondeo, no afirmamos WebSocket.
- Pagos: Edge Function postispop-commerce, Stripe Checkout y webhook firmado, compras individuales y prueba de reloj desde servidor.
- Despliegue: GitHub Actions/GitHub Pages; nginx.postispop.conf es opcional, no activo en Pages.
- Configuración pública: URL y clave publicable Supabase ya presentes. Secretos existentes documentados: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PAYMENTS_ENABLED.
- Tests: Node guest y commerce, Playwright móvil; no lint ni test general conectados al workflow.

## Hallazgos
|Prioridad|Problema|Impacto|Archivos previstos|
|---|---|---|---|
|P0|Workflow no copia guest-status.js ni favicon.ico|404 y anuncio de nube incorrecto para invitados|.github/workflows/deploy.yml, scripts/stage-site.mjs|
|P0|Workflow publica instantáneas api y recursos capturados|Datos obsoletos o potencialmente personales en artefacto|scripts/stage-site.mjs|
|P0|Bundle de pizarra ~2,1 MB; gran catálogo de citas incrustado|Arranque móvil lento|_next/static/chunks/Board-*.js, assets/quotes.json|
|P0|Idioma automático cambia al del navegador|Mezcla de español con otras lenguas|bundle pizarra, index.html|
|P0|Puente sin implementar compartir/importar/papelera nube/intercambio|Botones anuncian acciones que fallan|supabase-bridge.js, database/roadmap.sql, app/*|
|P0|Guardado local se etiqueta como nube|Pérdida de confianza|guest-status.js, app/save-status.js|
|P1|Manifest browser, iconos ausentes, sin SW|Sin instalación/offline fiable|manifest.webmanifest, sw.js, assets/icons/*|
|P1|Portada poco explicativa, sin páginas de uso|Activación y SEO limitados|index.html, app/*, scripts/build-content.mjs|
|P1|Sin importación/exportación integral, búsqueda, etiquetas o plantillas|Baja recurrencia|app/board-tools.js, app/board-core.js|
|P1|Alarmas dependen de página activa|No son avisos de fondo fiables|commerce-ui.js, documentación de recordatorios|
|P1|No hay suscripción Pro; solo pack único|Riesgo de prometer funciones o cobros inexistentes|app/plans.js, funciones/SQL preparados, tienda|
|P1|Sin puerta de calidad antes de desplegar|Regresiones|tests/*, package.json, workflows|

## Riesgos y secuencia
1. Mantener motor de pizarra y tienda. Extensiones modulares, cambios puntuales al bundle documentados.
2. Corregir P0/SEO y validar build, rutas, idioma y primer guardado.
3. Añadir P1 con copias validadas, protección contra sobrescritura y permisos desde Postgres.
4. Conservar productos y trial; preparar suscripción sin activar precios/cobros sin decisión y configuración reales.
5. Revisión final: unitarios, integración UI móvil, permisos SQL, metadatos/enlaces y consola. Separar mediciones de laboratorio de datos reales.
6. No desplegar a producción antes de revisión final. No borrar tablas ni datos. Las migraciones nuevas se entregan para revisar antes de aplicarlas.

## Limitaciones identificadas antes de escribir código
- No es posible configurar 301 arbitrarios en GitHub Pages solo con un archivo Nginx; las rutas legales canónicas .html se conservan. Las redirecciones 301 requieren un origen/proxy que las ejecute.
- Web Push/correo recurrente necesitan infraestructura/credenciales y consentimiento. Se mejorará la fiabilidad de la función existente y se hará explícita su limitación.
- No se publicarán ofertas de suscripción o funciones no disponibles como si estuvieran activas.
