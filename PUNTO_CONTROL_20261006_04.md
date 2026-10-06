# Punto de control 04 · Exportaciones web y Android · 6 octubre 2026

## Prioridad vigente

Continúa PostisPop sobre la rama autorizada `review/notes-first-20261006`, PR #18; base remota `4bbfe5b`. Sólo web y Android. Apple y las demás plataformas siguen aplazadas hasta que el propietario pruebe y apruebe expresamente diseño y funcionamiento de ambas versiones.

Se conservan seis notas Gratis, doce visibles en escritorio Premium con páginas posteriores, edición centrada en escribir y compras «Próximamente». El PR sigue como borrador: no se fusiona, despliega, activa cobros ni aplica SQL con esta entrega.

## Correcciones

- La imagen de una pizarra de 24 notas tenía un lienzo fijo de 1600×1200: cortaba las notas 13–16 y dejaba fuera las 17–24. El lienzo ahora crece por filas, mantiene un único PNG e incluye hasta 100 notas (máximo 1600×8724). La vista sigue resumiendo texto, conserva trazos y colores, no incluye adjuntos ni abre notas protegidas. Más de 100 notas produce un error explícito, nunca una imagen parcial presentada como completa.
- El puente Android sólo admitía PNG: «Guardar una copia» enviaba JSON y podía anunciar éxito sin guardar. Ahora admite PNG y JSON, mantiene el origen local y el marco principal obligatorios, limita tamaño en JavaScript y Java, y usa nombres de archivo controlados.
- El código espera la respuesta del selector nativo: éxito sólo después de escribir y cerrar el archivo; cancelación y fallos tienen mensajes distintos. Mantiene el blob vivo hasta terminar y libera la memoria del lienzo antes de abrir el selector.
- Los contadores JSON usan el mismo guardado confirmado y gestionan los errores. Los mensajes nativos de archivo se actualizan en los ocho idiomas existentes.

## Validación del candidato

- 161 pruebas unitarias correctas; sintaxis de 115 módulos; build Astro y Pagefind correctos.
- Regresión de exportación: 3/3 en web y 3/3 en los recursos Android. Inspecciona el PNG real de 6, 24 y 100 notas, incluida la última tarjeta, trazos, texto protegido, errores de codificación y cancelación.
- Copia/restauración con adjuntos: 1/1 en web y 1/1 en Android, incluyendo integridad de bytes, almacenamiento lleno, reversión y reintento sin duplicados. En Android se ejecuta el puente JavaScript real y se simula únicamente el transporte/selector nativo.
- Recorrido general de experiencia web y autenticación Android tras recreación aprobados. El proveedor de autenticación de esa prueba es simulado.
- Android recompilado desde salidas de aplicación limpias, offline y con `-PunsignedBeta`: 98 tareas, 35 segundos, `BUILD SUCCESSFUL`. APK debug, APK release y AAB contienen exactamente los 198 recursos esperados. Lint: cero errores y una advertencia `SetJavaScriptEnabled` por variante. Un intento incremental previo encontró recursos dex duplicados; la compilación limpia completa resolvió ese residuo de construcción.
- Las comprobaciones de imagen se incorporan a QA y al workflow Android. La validación de guardado nativo se incorpora a `npm test`.

Huellas, artefactos y alcance exacto: [`docs/VALIDACION_EXPORTACIONES_20261006.json`](docs/VALIDACION_EXPORTACIONES_20261006.json).

## Límites y próximo paso

1. La app Android mantiene un máximo de **10.000.000 bytes por archivo exportado**; rechaza tamaños mayores con explicación y conserva las notas. La copia web permite 50 MiB. No confundir este límite de implementación con un límite general del sistema Android.
2. La muerte de la actividad/proceso mientras está abierto el selector obliga a reintentar; no se anuncia éxito. Pendiente verificar en un teléfono real guardado, cancelación, falta de espacio, retorno desde el selector, archivos grandes y restauración.
3. Los candidatos siguen sin firma de distribución. Recuperar la clave original, verificar App Links y probar instalación/actualización antes de entregar un instalador.
4. Supabase real, RLS y sincronización entre dos cuentas/dispositivos siguen pendientes del acceso administrativo operativo y staging. No se han vuelto a comprobar desde el panel en esta entrega.
5. Conservar las comprobaciones de GitHub tras subir todos los archivos de esta continuación; guardar cualquier progreso siguiente en la misma rama y en un nuevo punto de control. No ampliar plataformas antes de la aprobación del propietario.
