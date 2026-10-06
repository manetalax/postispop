# SEO público en ocho idiomas

El sitio genera 17 documentos públicos por idioma (136 URL canónicas): español,
inglés, alemán, francés, japonés, portugués, italiano y coreano. Se mantienen las
direcciones españolas existentes; las otras versiones usan `/en/`, `/de/`,
`/fr/`, `/ja/`, `/pt/`, `/it/` y `/ko/` con las mismas rutas de página.

La portada, las ocho guías, Premium, instalación, ayuda, descargas y los cuatro
documentos legales tienen contenido traducido. Las páginas privadas, invitaciones,
buscadores y productos retirados quedan fuera del sitemap. La portada española
conserva el tablero y añade información pública en un desplegable debajo de las
notas; su HTML inicial y el componente React comparten exactamente ese contenido.

Cada documento contiene un título y una descripción propios, canonical a sí mismo,
nueve relaciones `hreflang` recíprocas (ocho idiomas y `x-default` español),
Open Graph, Twitter Card y datos estructurados con su idioma y dirección. El
sitemap final enumera todas las variantes e incluye ayuda y descargas.

Las portadas y guías se pueden leer sin JavaScript. Los enlaces para abrir la
pizarra llevan una preferencia explícita de idioma; React la aplica después de
hidratar y conserva la selección existente. No se modifica el contenido de las
notas. El núcleo de la aplicación admite los ocho idiomas; esto no afirma que
todos los complementos del editor hayan sido traducidos.

## Construcción y cambios de contenido

```sh
npm ci --no-audit --no-fund
npm test
npm run lint
npm run build
node scripts/stage-site.mjs
npm run test:seo
```

`scripts/stage-site.mjs` ejecuta `scripts/build-seo.mjs` antes de auditar los
recursos y crear el manifiesto y la caché pública. `_site/sitemap.xml` es el
sitemap completo que se publica. El `sitemap.xml` de la raíz pertenece a la fase
previa de generación de las guías españolas y no se publica sin este staging.
Android recibe el mismo sitio mediante `scripts/package-mobile.mjs`.

`scripts/seo-source.mjs` identifica las 17 páginas y extrae de forma reproducible
los textos y atributos públicos. Los catálogos `scripts/seo-content/*.json`
contienen las mismas claves. Una cadena nueva sin traducir o una clave ausente
detiene el staging: no se publica una página parcialmente española por omisión.
Después de cambiar el contenido fuente, regenerar el catálogo español con
`node scripts/seo-source.mjs _site scripts/seo-content/es.json`, actualizar los
siete catálogos restantes y volver a construir. No editar los HTML generados.

Las condiciones originales se conservan completas. Su sección de ruleta contiene
una nota visible que la identifica como función histórica fuera de la oferta
actual; no se modifican las condiciones de participaciones anteriores.

## Verificación

`tests/seo-ui.cjs` comprueba los 136 documentos generados, el sitemap, reciprocidad,
metadatos, JSON-LD y destinos HTTP locales. Abre ocho portadas y ocho guías con y
sin JavaScript; entra al tablero desde cada idioma y comprueba idioma del núcleo,
persistencia tras recargar y conservación exacta de las notas de prueba. Los
controles de idioma y de instalación tienen pruebas unitarias separadas.

La revisión de GitHub, el flujo de Android y el flujo de despliegue ejecutan esta
comprobación antes de producir sus artefactos. El informe reproducible queda en
`test-results/seo-ui/report.json`; el punto de control conserva el resumen de la
ejecución revisada en `docs/VALIDACION_SEO_20261006.json`.

Estas pruebas validan los archivos generados y el comportamiento local. No
certifican indexación o posicionamiento real en Google, sincronización con cuentas
reales ni instalación en un teléfono físico. La rama de revisión sigue separada
de producción.

Referencia técnica: [versiones localizadas de Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions).
