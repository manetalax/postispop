# Identidad visual de PostisPop

Versión del 6 de octubre de 2026. Una interfaz serena y reconocible que deja el protagonismo a las notas. La marca acompaña el trabajo; no compite con él.

## Marca y geometría

El símbolo original representa una nota con la esquina doblada. Tres trazos de distinta longitud evocan contenido reconocible de un vistazo. La retícula de 64 unidades permite reutilizar las mismas proporciones en favicon, icono de aplicación y marca completa. No usa una cara, pines decorativos ni efectos tridimensionales.

El wordmark usa Nunito con peso 760, convertido a contornos vectoriales para que su apariencia no dependa de la carga de fuentes. La fuente ya forma parte del repositorio; su licencia SIL Open Font License está en `assets/fonts/nunito-OFL.txt`. La conversión no cambia los archivos de la fuente. El SVG principal pesa aproximadamente 6,3 kB, no contiene imágenes incrustadas ni recursos externos.

## Paleta y jerarquía

| Función | Color |
| --- | --- |
| Fondo marfil | `#F6F5F1` |
| Texto grafito | `#283633` |
| Acento jade | `#315C50` |
| Texto secundario | `#66716A` |
| Superficie clara | `#FFFEFA` |
| Pliegue del símbolo | `#AEC6BA` |

La superficie marfil reduce la diferencia visual con los papeles pastel. El jade se reserva para marca, foco y acciones; no colorea toda la interfaz. No se afirma que estos colores garanticen ventas o una respuesta emocional universal. La utilidad, legibilidad y coherencia guían la elección.

La cabecera es plana, compacta y sin una segunda zona promocional. El título de la pizarra conserva una jerarquía útil. Las notas mantienen su formato cuadrado, la capacidad de seis o doce por página y sus códigos de color originales. Las notas sin estilo propio reciben una mezcla visual suave del color guardado; no se modifica el dato. Los papeles personalizados, los dibujos y las tintas marcadas conservan sus reglas.

## Accesibilidad

Los pares básicos calculados superan el umbral de 4,5:1 para texto normal: grafito/marfil 11,56:1, texto secundario/marfil 4,66:1 y marfil/jade 6,93:1. El foco de teclado es visible; los principales controles de icono mantienen objetivos de 44 píxeles. Las etiquetas accesibles describen las acciones aunque no se vean nombres junto al icono.

Estos criterios siguen las explicaciones primarias de W3C sobre [contraste mínimo, WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) y [tamaño mínimo de objetivos, WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum). El segundo criterio establece 24 × 24 píxeles CSS con excepciones; 44 píxeles es la decisión de diseño de los controles principales, no una afirmación de que ese sea el mínimo AA.

Los cálculos de paleta no sustituyen revisar la interfaz completa, los estilos elegidos por cada usuario ni las pruebas con teclado y tecnologías de asistencia. Los resultados automatizados y las capturas deben comprobarse sobre la versión generada.

## Archivos

- `assets/postispop-logo.svg` y `assets/postispop-logo-light.svg`: versiones vectoriales para fondos claro y oscuro.
- `assets/postispop-logo.png`: compatibilidad con referencias existentes.
- `assets/brand/postispop-symbol.svg`: símbolo original para interfaces y recursos nativos.
- `assets/brand/postispop-app.svg` y `postispop-maskable.svg`: fuentes vectoriales de los iconos de instalación; `favicon.svg` usa la versión con fondo marfil para ser visible también en pestañas oscuras.
- `assets/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-64.png` y `favicon.ico`: recursos raster derivados.
- `assets/brand/postispop-social.svg` y `assets/postispop-og.webp`: vista previa al compartir.
- `workspace.css` y `atelier.css`: aplicación del sistema a la pizarra y a Premium.

Las versiones maskable conservan el símbolo dentro de la zona central segura. La migración del icono nativo Android debe utilizar los mismos paths, sin crear una marca diferente.
