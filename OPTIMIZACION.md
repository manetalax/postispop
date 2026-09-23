# PostisPop: adaptación SEO para GitHub Pages

Dominio correcto: https://postispop.com/.

## Entrega

- `index.html`: documento completo de la aplicación con título, descripción, robots, canonical, Open Graph, Twitter y JSON-LD WebSite/WebApplication.
- `_next/static/css/postispop-optimized-080259749895.css`: CSS responsive existente con fondos WebP.
- `assets/board-scene.webp` y `assets/clay-tools.webp`: sustituyen las descargas PNG desde el CSS de portada; originales conservados.
- `assets/postispop-og.webp`: imagen social de 1200 × 630.
- `robots.txt`, `sitemap.xml`, `manifest.json`: documentos válidos en lugar de páginas de error guardadas.
- `nginx.postispop.conf`: ejemplo opcional para otro alojamiento; NO se aplica en GitHub Pages. Requiere certificados, módulo Brotli y validación de CSP antes de usarlo.

## Adaptaciones deliberadas

El repositorio contiene una exportación React/vinext compilada, sin proyecto fuente ni sistema de compilación. Se conserva su JavaScript para no eliminar la pizarra, sus herramientas e integraciones. No se modifican autenticación ni datos.

Se conserva el CSS bloqueante para evitar estilos tardíos y desplazamientos no comprobados. No se añade content-visibility a la pizarra interactiva ni se convierten indiscriminadamente sus listeners a pasivos: algunos necesitan impedir el scroll durante el arrastre. La fuente actual ya declara font-display: swap. No se ha realizado conversión WOFF2 ni AVIF.

Se mantienen botones, enlaces, imágenes y contenedores nativos junto a los elementos semánticos. Limitar todas las etiquetas a siete elementos impediría una interfaz accesible. No se inventan redes sociales, datos empresariales, valoraciones ni migas de pan para la portada.

GitHub Pages no ejecuta el archivo Nginx del repositorio. Las cabeceras personalizadas requieren un alojamiento/proxy que permita controlarlas; no se ha cambiado alojamiento ni DNS.

## Verificación y límites

Se han comprobado documentos SEO, dimensiones y ahorro de imágenes. No hay puntuación PageSpeed medida ni garantía de 100/100, LCP <1.2 s, CLS cero, INP <100 ms o posicionamiento. El navegador de pruebas local no está instalado. Quedan pendientes pruebas de hidratación, móvil/escritorio, login, notas, dibujo, compartir y compra en un entorno de ensayo; después, Lighthouse/PageSpeed sobre el despliegue real.

La entrega incorpora también `commerce-ui.js`, `commerce.css` y `guest-board.js`: tienda común, reloj y guardado local para invitados. El servidor mantiene la prueba de 30 días y los permisos de compra. Las alarmas requieren la web abierta y un dispositivo activo; no existe aún entrega push con la web cerrada.

Pruebas: `node --test tests/*.test.cjs` (11 casos). Se validaron en Supabase la prueba activa, caducidad y desbloqueo por compra mediante una transacción revertida. Las pruebas de Stripe usan respuestas simuladas: no sustituyen una compra de prueba con Stripe conectado. La venta queda desactivada si faltan secretos del proveedor.

Punto de reversión de la web: commit `96cfe07355491e8e9d04cdf85cd480fa673b8d4e`. Para una refactorización profunda y extracción fiable de CSS crítico se necesita recuperar el código fuente original.
