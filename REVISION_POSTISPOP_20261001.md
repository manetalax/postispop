# PostisPop · Revisión del 1 de octubre de 2026

Estado: implementación parcial preparada en rama separada; no desplegada. Base: `614d7cbd1d20f04035e8fa8188f792a7b3ae7fab`.

## Auditoría y arquitectura

- Pizarra: exportación estática React/vinext compilada, JavaScript; falta el proyecto fuente original de la pizarra. El componente principal pesa aproximadamente 2,38 MB sin comprimir.
- Tienda: Astro 5, TypeScript y JavaScript, Tailwind 4, Pagefind; fuentes en `src/`, salida en `/tienda/`.
- Rutas de la pizarra: documento exportado y navegación original. Las guías nuevas son documentos HTML independientes.
- Autenticación: Supabase Auth con correo y Google; sesión existente gestionada por `supabase-bridge.js`. No se cambió su lógica.
- Base de datos: PostgreSQL/Supabase. Puente REST, tablas de notas/pizarras/miembros y comercio. No se modificaron tablas, datos, políticas ni permisos.
- Almacenamiento: notas de invitado en localStorage, adjuntos locales en IndexedDB; notas de cuenta en Supabase. Los adjuntos locales no forman parte de la copia JSON de notas.
- Pagos: Stripe mediante Edge Function `postispop-commerce`; verificación de firma, estado de pago, importe y propietario. Productos individuales de pago único y prueba de reloj de 30 días ya existentes.
- Despliegue: GitHub Actions → GitHub Pages al modificar main. Supabase muestra el proyecto `PostisPop Auth`, saludable; el panel indica que no hay repositorio conectado a Supabase.
- Variables: ninguna nueva. Se conservan las variables documentadas `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`; no se obtuvieron ni cambiaron sus valores.
- Pruebas previas: 12 casos de comercio y notas de invitado; prueba Android de interfaz disponible.

## Problemas confirmados antes de editar

| Prioridad | Problema | Impacto | Archivos principales |
|---|---|---|---|
| P0 | Interfaz pública en portugués y español simultáneamente | Confusión al entrar | `Board-BrRAatyY.js`, `index.html` |
| P0 | Visitante sin cuenta veía guardado en la nube | Expectativa falsa de recuperación | Componente de pizarra, `guest-status.js`, despliegue |
| P0 | `/favicon.ico`, `/guest-status.js?v=1` y `/manifest.webmanifest` devolvían 404 | Recursos rotos e instalación incompleta | Workflow, manifest, iconos |
| P0 | El componente interrumpía guardado local si navigator.onLine era false | Pérdida de persistencia sin Internet | Componente de pizarra |
| P0 | El empaquetado público copiaba snapshots capturados de `/api` | Datos de muestra expuestos innecesariamente | Workflow, staging |
| P1 | Controles originales de compartir invocaban operaciones no implementadas en el puente | Acciones fallidas | Puente y componente original |
| P1 | Importación JSON local y exportación de cuenta incompletas | Copias de seguridad poco útiles | `guest-board.js`, `supabase-bridge.js` |
| P1 | Canónicas legales diferentes del sitemap | URLs duplicadas | Páginas legales y sitemap |
| P2 | Pizarra sin fuentes y bundle grande | Mantenimiento y rendimiento | Recuperación del proyecto original |

## Implementado en esta rama

- Título/description/social/canónica de portada coherentes, H1 único y español inicial, con contenido estático y React coincidentes.
- Mensaje principal, botones para probar/registrarse, cómo funciona, casos de uso, modos local/cuenta, comparativa de productos y preguntas frecuentes. La pizarra real sigue en la portada.
- Guía inicial existente ajustada y cerrable; conserva su marca local de finalización.
- Estado de guardado local/nube y errores con hora del último guardado en el título del indicador.
- Guardado del invitado permitido cuando el navegador está sin conexión.
- Manifest standalone, iconos PNG 192/512 y Apple Touch 180, favicon ICO válido. Se conserva `manifest.json` como alias compatible. Instalación cuando el navegador la ofrezca; no se promete funcionamiento completo offline ni push.
- Ocho guías con contenido distinto, ejemplos ilustrativos, FAQ visibles, BreadcrumbList, metadatos y enlaces internos. Son ejemplos HTML, no capturas ficticias.
- Sitemap con 18 URLs únicas; canónicas legales `.html`; exclusión de API y enlaces privados en robots. No se han configurado redirecciones HTTP 301: requieren un proveedor que permita reglas de servidor/proxy.
- Búsqueda por texto/hashtags y filtro por color; atajos `/` y Ctrl+Mayús+E.
- Copia JSON de texto, marcas, colores y dibujos compatibles; importación local validada y atómica sobre espacios vacíos. La importación nunca sustituye notas existentes y falla sin cambios si falta espacio.
- PNG de texto resumido y colores, e impresión/PDF de texto. Se informa de los límites sobre dibujos, imágenes y adjuntos.
- Ocho plantillas locales; en cuenta permiten descargar la plantilla para conservarla, sin fingir una importación de nube implementada.
- Contadores locales opcionales, sin red, contenido de notas ni identificadores de cuenta; respetan GPC/DNT. No constituyen un panel de analítica agregada del negocio.
- Pack Pro de 9,99 € identificado como pago único; precios existentes conservados. No se activan suscripciones nuevas.
- Empaquetado web/Android incluye los recursos nuevos y excluye snapshots públicos de API.
- Workflow de QA separado de producción, con pruebas de navegador y capturas.

## Validación

- `npm test`: 19/19 casos correctos en el entorno local, incluidos importación atómica, no sobrescritura, exportación ordenada, privacidad de contadores, metadatos y manifest.
- `npm run lint`: comprobación sintáctica de los módulos modificados, correcta. No es una auditoría ESLint completa.
- `npm run build`: Astro check sin errores, advertencias ni hints; tienda y Pagefind compilados.
- `git diff --check`: correcto.
- Chromium local no pudo arrancar debido a una restricción del entorno sobre sockets. Las pruebas visuales/móviles y de interacción se ejecutarán en el workflow `Review PostisPop changes`.
- No se ha medido Lighthouse ni Web Vitals reales. No se afirma 90+, LCP/CLS/INP objetivo ni ausencia de errores de consola hasta validar navegador.
- No se realizaron cobros, registros reales, invitaciones ni cambios en producción durante las pruebas.

## Pendientes y decisiones del propietario

- Compartir editable/lectura, invitaciones, revocación y protección contra abuso: requieren diseño y revisión de RLS/RPC y rutas. El puente actual no los implementa; se muestra un aviso honesto. Debe coordinarse con la PR #3 abierta sobre papelera/reordenación de cuentas.
- Importación transaccional y duplicado de pizarras de cuenta; historial, notas fijadas, archivo y papelera de cuenta: pendientes de backend. La papelera local existente se conserva.
- Adjuntos en copias portables: pendientes; IndexedDB local no se exporta con las notas.
- Notificaciones con web cerrada, push, entrega por correo y tareas recurrentes: pendientes de proveedor y ejecución servidor. La limitación actual de alarmas abiertas sigue visible.
- Suscripción 2,99 €/mes y 24,99 €/año: requiere decidir convivencia con el pack Pro y sus compradores, precios Stripe, permisos, cancelación, reembolsos y textos legales. No se han creado productos ni promesas de funciones inexistentes.
- Analítica global y métricas de compra/cancelación: pendientes de un destino y modelo de privacidad aprobados. Los contadores locales no miden ingresos del negocio.
- Dark mode completo y accesibilidad exhaustiva de la pizarra original: pendientes de fuentes y pruebas adicionales.
- Recuperar fuentes originales para sustituir las ediciones puntuales del bundle. Cambiar el bundle exportado puede perderse si se vuelve a exportar una versión antigua.

## Despliegue y reversión

1. Revisar el diff y los resultados del workflow de QA en la PR; resolver fallos antes de fusionar.
2. Confirmar con el propietario la publicación: su documento exige revisión final y detenerse ante decisiones de producción.
3. Fusionar en main dispara `Build and deploy PostisPop to GitHub Pages`.
4. Comprobar portada, tienda, guías, login, iconos, manifest y persistencia local desde un navegador limpio.
5. No hay migraciones ni nuevas variables para esta entrega.
6. Para revertir, revertir el commit de integración de esta PR y dejar que Pages republique; no borrar tablas ni datos.
