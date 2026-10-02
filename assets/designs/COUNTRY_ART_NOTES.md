# Ilustraciones de países

`country-scenes.js` contiene dibujos SVG originales hechos para PostisPop. Los monumentos, paisajes y platos son ejemplos de lugares y tradiciones concretas; no pretenden resumir a toda la población de un país. La paleta de tinta y papel mantiene coherencia con la papelería y no sustituye la identidad de cada dibujo.

## Cobertura y estados

La cobertura exacta se exporta en `countryArtCoverage`. La revisión del 2 de octubre de 2026 contiene **195 lugares y 195 ejemplos gastronómicos ilustrados**, con correspondencia exacta entre cada motivo y su referencia editorial: las 195 fichas alcanzan `edition: 'crafted'`. Este estado describe la composición ilustrada, no una representación exhaustiva de la cultura del país. `foundation` sigue disponible para una ficha cuyo motivo se sustituya o pierda su referencia y todavía no tenga un dibujo correspondiente.

Los nombres de los motivos dibujados se cotejan con el registro editorial. Cambiar la comida o el lugar en el registro sin actualizar el dibujo no reutiliza silenciosamente una imagen errónea: el campo deja de anunciarse como ilustrado hasta revisar su correspondencia.

Los 195 pares de lugar y alimento se rasterizaron y revisaron por regiones, además de comprobar su composición conjunta en `test-results/Catalogo_Paises_195.svg` y su versión PNG. Son estudios gráficos simplificados, no levantamientos arquitectónicos ni fotografías de platos. Algunos alimentos pertenecen a tradiciones compartidas por varios países y usan el mismo dibujo cuando la fuente describe ese patrimonio compartido. Algunas referencias de Oceanía corresponden a cultivos comestibles documentados y se ilustran como tales, sin inventar una receta; la referencia del Vaticano documenta una oferta contemporánea del museo, no una gastronomía nacional.

## Fuentes culturales

Registro editorial principal: `assets/country-cultural-data.json`; módulo de uso offline: `assets/designs/country-cultural-data.js`. La tabla de fuentes y matices culturales está en `docs/CATALOGO_CULTURAL.md`. Sólo los campos con referencia comprobada y nombre coincidente activan un motivo cultural. Las fichas distinguen páginas consultadas, resultados institucionales indexados y listas indicativas; no todos los lugares de fuentes UNESCO son bienes inscritos.

## Geografía ornamental

Las 195 siluetas de `country-outlines.js` proceden de Natural Earth, datos de dominio público. Se utiliza únicamente el polígono de mayor superficie de cada entrada, con proyección local y simplificación para funcionar como grabado diminuto en el margen. No se muestran islas o enclaves separados ni fronteras interiores; no constituye un mapa completo, una herramienta de navegación ni una declaración territorial. Para archipiélagos, la silueta puede corresponder a una sola isla.

La selección editorial de 195 entradas sigue el criterio solicitado de 193 Estados miembros de la ONU y dos Estados observadores. El archivo conserva la atribución, URL, fecha y SHA-256 del conjunto de datos descargado en `NATURAL_EARTH_SOURCE.txt`.

## Integración y revisión

`countryScene(design, width=720, height=500)` devuelve un fragmento SVG sin envoltorio. No incluye texto de notas ni recursos externos. Sus imágenes se colocan en los márgenes y el pie: queda libre la zona de notas x=63–649, y=114–438. `countrySceneProfiles` aporta la información editorial a la tienda; la vista de la pizarra utiliza exactamente el mismo fragmento.

`tests/country-scenes.test.cjs` verifica 195 grabados distintos, la separación de notas y adornos, ausencia de recursos remotos, la cobertura exacta de 195 pares y los cinco destinos prioritarios. Una prueba independiente modifica el registro editorial y comprueba que se retira la imagen incompatible del perfil y del SVG. Las nuevas escenas requieren además revisión visual, no sólo validación sintáctica.

Los módulos regionales (`country-scenes-asia`, `country-scenes-africa`, `country-scenes-middleeast`, `country-scenes-europe-extra` y `country-scenes-americas-oceania`, con sus módulos de alimentos) se ensamblan en `country-scenes.js`. Todos los SVG, banderas, siluetas y referencias se distribuyen localmente y funcionan sin CDN.
