# PostisPop · Punto de control 03 · 6 octubre 2026

Continúa los puntos 01 y 02. Conserva también los cambios que aparecieron después en GitHub (`297f263`, `6a7fc63`, `92b582c`), revisados e incorporados sin sobrescribirlos. La rama de revisión es `review/notes-first-20261006`; PR #18. No se ha fusionado ni desplegado.

## Prioridad confirmada por el usuario · 6 octubre, 10:05 (Madrid)

- Trabajar exclusivamente en la versión web y Android hasta completar su funcionamiento, diseño y pruebas.
- El usuario debe probar personalmente ambas versiones y aprobar expresamente el diseño y el funcionamiento antes de ampliar plataformas.
- Apple (iOS, iPadOS y macOS), Windows, aplicaciones nativas para distribuciones Linux y cualquier otro sistema quedan en la lista de pendientes. No compilar, empaquetar ni publicar esas versiones hoy ni antes de esa aprobación.
- Priorizar notas protagonistas, edición intuitiva, adaptación a móvil/escritorio, accesibilidad, rendimiento y fiabilidad de guardado, sincronización y copias. La meta «un 10» es de calidad; no sustituye la aceptación del usuario ni acredita superioridad universal.
- Las máquinas Linux utilizadas para CI de web/Android son infraestructura de pruebas, no una nueva versión del producto para Linux.

## Mantenimiento de GitHub Actions

El commit `6e4b408` actualiza los tres workflows a acciones oficiales con runtime Node 24 y fija sus cuatro jobs a Ubuntu 24.04. Conserva Node 22 de la aplicación, Java 17, Gradle 8.13, SDK 36, las herramientas de línea de comandos Android existentes, permisos, disparadores y pruebas. Se comprobaron los manifiestos de las acciones y la dependencia interna de Pages. QA pasó en la ejecución `37433564894` (2 min 14 s), sin las anotaciones de obsolescencia y cambio de Ubuntu. Android pasó en `37433931127` (2 min 2 s), con Gradle 8.13. Ambas ejecuciones corresponden a `6e4b408` en la rama de revisión. El workflow de Pages no se ejecuta durante esta revisión porque publicaría la web.

## Cierre de código

- ~~Diseño despejado, identidad nueva, seis notas grandes y páginas de doce para Premium en escritorio.~~
- ~~Texto al abrir, dibujo dentro de la nota, navegación táctil y búsqueda global.~~
- ~~Precios únicos 2,95 €/mes, 9,95 €/año y 59,95 € de por vida, con «Próximamente».~~
- ~~Copias con adjuntos, dibujos y cambios pendientes; bloqueo de una copia incompleta.~~
- ~~Creación atómica de pizarras y reintentos idempotentes.~~
- ~~Lectura de estilos paginada y comprobada mediante Content-Range exacto: un límite de respuesta del servidor no elimina dibujos del respaldo.~~

Las cinco últimas regresiones cubren 1005 estilos con un servidor que devuelve sólo 50 por página, fallos en páginas posteriores, rangos inconsistentes, certificados antiguos de caché y cambio de cuenta. Los datos anteriores permanecen intactos si no puede completarse la lectura.

## Evidencia por versión

- **152/152 pruebas automatizadas** en una copia limpia, sin omisiones; sintaxis de 111 módulos y construcción correctas.
- Respaldo con adjuntos en la interfaz: **1/1**; importación cloud con dos pestañas, reintentos y errores controlados: **correcta**, sobre el paquete final. El backend de esas pruebas está simulado.
- **15 estados Axe, cero violaciones detectadas**: cinco tamaños × pizarra, editor con texto y editor vacío. Hash visual `5fa2d304a9e9a7134a636abeb8119accc41b61c33fdf892f849e927c422e3b1c`; la última paginación no modifica HTML ni CSS. Esta comprobación automática no certifica accesibilidad manual completa.
- Las métricas Lighthouse mantienen su procedencia anterior: mediana de tres **85 móvil / 100 escritorio**, y 100 en accesibilidad, buenas prácticas y SEO. No se vuelven a atribuir al nuevo hash ni a producción. Detalles y capturas en `docs/VALIDACION_WEB_20261006.md`.
- La revisión de GitHub `92b582c` pasó la suite integrada. La actualización posterior añade la paginación y sus pruebas; consultar el estado del último commit en el PR.

Paquete web tras la paginación, anterior al pulido del editor: **198 archivos**, hash `c73b17b5b626cf0c23950f6a286f08800ab413b5d12598a38f315a723c9420ea`.

Recursos Android tras la paginación, anteriores al pulido del editor: **198 archivos**, hash `0a2bb9cdda8dc831554fc59cbfd38565ee2f6b785cdfb1bbcc7d8dc56e04fdec`. La comprobación de los archivos compilados, sus huellas, firma e instalación se registra por separado en `docs/ANDROID_VALIDACION_20261006.md`.

## Pulido del editor · web y Android

- El menú inferior muestra «Opciones» (traducido a ocho idiomas), diferenciándose del menú de herramientas. Cabe en una sola fila también a 320 px.
- Las notas largas muestran una barra de desplazamiento discreta. Se corrigió además la altura mínima heredada de la capa de texto: textarea y texto visible alcanzan ahora el mismo final, sin ocultar las últimas líneas.
- Se conservan la cuadrícula, el tamaño de las notas y las herramientas de dibujo. Las notas sin desbordamiento conservan todo su ancho.

Verificación del paquete final: build sin errores ni warnings; 13/13 escenarios de pizarra/editor, 5/5 de creación de notas, 6/6 de herramientas y 15 estados Axe sin infracciones detectadas. Se comprobaron las ocho etiquetas a 320 px y la coincidencia del desplazamiento al final (135 px en textarea y espejo). Sigue pendiente la prueba manual del usuario en Android real.

Paquete web de este pulido: `0b7e66728eaf3eb7bdbaa833239e626e592df70ebb8c14b22b81d8b925aa0cc1`. Recursos Android: `a6f5e807d01bb5e314d7243149061529ef61b615533673e0d53ff8a173712a9a`. Los resultados nativos se añaden a `docs/ANDROID_VALIDACION_CONTINUACION_20261006.md`, identificados por este hash y conservando la evidencia anterior.

## Bloqueos reales de publicación

Supabase reconoce la sesión y el proyecto, pero el panel se queda en `Checking…` con las operaciones desactivadas. No se obtuvo el esquema ni resultados SQL; no se modificó la base. `database/READONLY_REVIEW_20261006.md` conserva la revisión y los pasos necesarios antes de desplegar.

No se dispone de la firma privada original de Android. GitHub Actions no tiene secretos ni variables configurados que permitan reutilizarla. No se ha generado una identidad de sustitución. Los candidatos sin firma no son instaladores de distribución y aún requieren prueba en un teléfono.

La web pública no se ha reemplazado mientras esas dependencias del servidor sigan sin validar. Los pagos continúan desactivados. Esta entrega no acredita todas las funciones de la competencia, superioridad universal ni ausencia absoluta de fallos.

## Recuperación

`PostisPop-20261006-checkpoint-03.bundle` contiene los commits de implementación sobre `993bd3c`, sin claves, contraseñas ni datos de usuarios. Desde un clon con esa base:

```sh
git bundle verify /ruta/PostisPop-20261006-checkpoint-03.bundle
git fetch /ruta/PostisPop-20261006-checkpoint-03.bundle feature/notes-first-20261006:restore/checkpoint-03
```
