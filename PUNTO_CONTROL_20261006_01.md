# PostisPop · Punto de control 01 · 6 octubre 2026

## Objetivo vigente
Notas protagonistas y poco ruido: 6 gratis; 3×2 grandes en escritorio y 2×3 en móvil. Premium con 12 visibles en escritorio y páginas mediante flechas, selector y deslizamiento. Escribir al abrir; dibujo en la misma nota. Un Premium: 2,95 €/mes, 9,95 €/año, 59,95 € vitalicio. Compra «Próximamente», sin checkout activo.

## Recuperación
Base GitHub: `993bd3c`. Rama local de implementación: `feature/notes-first-20261006`.
El punto anterior `d4caa44` no figura en las ramas accesibles; se han recuperado sus decisiones de los documentos del usuario y se han vuelto a implementar y verificar.
El archivo Git bundle que acompaña este documento conserva **todo el código cambiado**, incluidas eliminaciones y migraciones SQL, sobre la base indicada. No contiene contraseñas, firma Android, node_modules ni binarios de compilación.

Para recuperar sobre un clon del repositorio: `git fetch /ruta/PostisPop-20261006-checkpoint-01.bundle feature/notes-first-20261006:restore/checkpoint-01`. Después revisar/abrir esa rama. Verificar el bundle con `git bundle verify` desde el clon. La rama publicada con este documento es de revisión; este punto no confirma despliegue de la web.

## Completado
- ~~Reconstrucción del estado disponible y comparación de 10 competidores.~~
- ~~Cuadrícula adaptable, navegación sin páginas repetidas y búsqueda global.~~
- ~~Editor con iconos, escritura inicial y dibujo dentro de la nota.~~
- ~~Retirada de plantillas/tienda antigua y nuevos precios con compra desactivada.~~
- ~~Límite gratuito de 6, preservación de notas heredadas y migraciones SQL candidatas.~~
- ~~Android compila; corregido empaquetado que omitía `_next` y `_astro`.~~

## Evidencia de este punto
- 124 pruebas unitarias pasan y sintaxis de 108 módulos comprobada.
- 12 escenarios de cuadrícula/editor y axe sin infracciones en 10 estados.
- SQL ejecutado en PGlite aislado con esquema sintético: límite6, permisos, intercambio atómico, restauración, legado y degradación de Premium. **No aplicado a producción.**
- Pruebas anteriores de autoguardado, importación idempotente y recarga real offline pasan. Se repiten las afectadas tras cambios.
- PageSpeed público actual:58 móvil/72 escritorio. Última versión local estable medida: mediana83 móvil/99 escritorio; accesibilidad/buenas prácticas/SEO100. Son contextos distintos, no una prueba de superioridad frente a editores rivales.
- Android APK/AAB internos compilan y se verifican192 recursos; todavía sin firma. Deben reconstruirse con el paquete web final.

## Trabajo activo y límites reales
1. Cerrar ajuste de carga CSS sin alterar la cascada; repetir medición final.
2. Investigar carrera de hidratación detectada en la prueba de recarga; corregir y repetir.
3. Adaptar prueba de concurrencia cifrada al menú secundario y verificar su comportamiento.
4. Incluir adjuntos locales ordinarios en copias/restauración para evitar pérdidas al cambiar de dispositivo.
5. Completar integración GitHub y comprobaciones CI antes de desplegar.
6. Revisar esquema/seed/purga reales en staging antes de aplicar SQL. Compartición y sincronización reales requieren validación de cuentas.
7. Recuperar firma Android original por canal seguro, verificar asociación de dominio y probar instalación/actualización en teléfono. Un APK sin firma **no es un instalador distribuible**.

No se afirma ausencia absoluta de fallos, paridad con todas las funciones de los rivales ni que el producto esté listo para cobrar. Los detalles están en `docs/AUDITORIA_COMPETITIVA_20261006.md`, `docs/ANDROID_VALIDACION_20261006.md` y `database/DELIVERY_20261006.md`.
