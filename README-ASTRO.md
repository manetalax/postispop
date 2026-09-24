# Tienda estática Astro de PostisPop

La aplicación de notas actual permanece en la raíz (`/`). Esta tienda Astro se publica en `/tienda/` para añadir catálogo, fichas de producto, favoritos locales y búsqueda Pagefind sin sustituir la app existente.

## Desarrollo y compilación

```sh
npm install
npm run dev
npm run build
```

`npm run build` valida tipos, genera páginas estáticas e indexa el HTML compilado con Pagefind. El catálogo fuente tipado está en `src/content/products/` y debe mantenerse sincronizado con los artículos activos de `postispop-commerce`.

## GitHub Pages

El workflow `.github/workflows/deploy.yml` compila Astro, coloca la tienda en `_site/tienda/`, conserva una lista explícita de archivos de la app existente en la raíz y publica `_site` con GitHub Actions. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente. El archivo `CNAME` debe continuar en la raíz del artefacto para `postispop.com`.

La búsqueda no necesita servidor: el paquete Pagefind crea `tienda/pagefind/` durante el build. Los favoritos se guardan localmente en el navegador.
