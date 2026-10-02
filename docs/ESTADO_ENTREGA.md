# PostisPop — entrega de código del 2 de octubre de 2026

Esta entrega es código trabajado y verificado localmente. No certifica publicación, migración de Supabase ni una APK instalada. El commit exacto, las referencias Git y las huellas de los archivos están en el manifiesto del ZIP.

## Continuidad recuperada

Se conservaron los originales locales y se recuperó el historial remoto. Después se localizó el ZIP `PostisPop-respaldo-codigo-20261002.zip`: su SHA-256 coincide con `cb5b90b9314953ca4cd7ded9a06d566fb7e1800537357c9404bfdddd97c88469`. Se verificaron los 421 archivos de su manifiesto y se incorporó su historial, incluido `68e3074563f96cf47cfef582cbbccd2c6360c04d`, a referencias nuevas, sin sobrescribir ramas remotas actuales.

La rama de continuación es `feature/complete-postispop-20261002`. Las referencias originales se conservan también bajo `refs/recovered/20261002/`; el catálogo anterior está en `feature/catalogo-100-20261002`. Se conservaron correcciones posteriores de la rama principal para cierre de sesión, citas, búsqueda, accesibilidad y páginas legales. La pizarra heredada todavía contiene chunks compilados; no se ha recuperado su fuente React original.

## Funciones incorporadas

| Área | Resultado local |
|---|---|
| Catálogo | 100 temáticas iniciales, divididas en 50 recompensas y 50 Premium; 195 países y tres profesiones adicionales. Las 100 temáticas y las profesiones tienen escenas propias y seis ideas prácticas por diseño. |
| Países | 195 lugares y 195 propuestas culinarias ilustrados, con banderas locales, siluetas ornamentales y 390 referencias documentales. La ficha indica su estado y fuentes; el criterio de cobertura es 193 miembros de la ONU y dos observadores. Las tradiciones compartidas no se presentan como exclusivas. |
| Tienda | Packs, filtros, ampliación, inspección del diseño real, fuentes, papeles y trazos. Los ejemplos pueden copiarse para usarlos en las notas. Seleccionar un fondo conserva el contenido existente. |
| Herramientas | Seis fuentes locales con licencias, diez instrumentos diferenciados, doce papeles, cuatro paletas y estilos persistentes por nota. |
| Contraseñas | Texto, dibujos y adjuntos dentro del sobre cifrado; caja fuerte, edición cifrada del texto y bloqueo al cerrar o cambiar de sesión. Enlaces protegidos con caducidad y revocación; contraseña comunicada aparte. |
| Sin conexión | Notas locales y adjuntos, cola persistente por cuenta, aislamiento entre cuentas, detección de conflictos y recuperación explícita. La recarga offline está ensayada; la reapertura final sigue pendiente. No se almacenan respuestas de API en su caché. |
| Derechos y propietario | Migraciones para rachas de cinco días según Madrid, créditos sin duplicaciones, licencias, Pro histórico y propietario por UUID de cuenta verificada. Panel con consultas reales y sin acceso a notas privadas ajenas. |
| Android | Recursos físicamente empaquetados, manifiesto de integridad, CSP, R8 y proceso de firma con la clave existente. El empaquetado no equivale a un APK firmado. |
| Respaldo | Script para copiar código e historial, restaurarlos en un repositorio aislado y verificar su correspondencia con el commit. Procedimiento administrativo separado para Supabase. |
| Patrocinadores | Selección, contactos y propuesta documentados. No se han enviado mensajes ni se afirman acuerdos. |

## Pruebas y alcance

`npm test` reúne las pruebas de invitado, autenticación, catálogo, dibujos, cifrado, cobros existentes, cola, derechos firmados, importación heredada, empaquetado y respaldo. `npm run lint` comprueba sintaxis de módulos y funciones; el build verifica la tienda Astro y su índice público.

Resultado final de código: 85 pruebas unitarias aprobadas; sintaxis de 83 módulos comprobada; 28 comprobaciones SQL aprobadas. La compilación Astro pasó sin errores y generó siete páginas. Los paquetes web y Android contienen 554 archivos verificados cada uno; el service worker incluye 540 recursos públicos. Estas cifras corresponden al código local, no a pruebas en producción.

Huellas de contenido de los manifiestos finales:

- Web: `d6c8412e06c54eee4287a49f22c63bafeb9fb4cf998c7f3840d349710a5990d5`.
- Recursos Android: `19d8989264d316ed6161904f6e1eb23308254b00939a694841ece77edf2bd7f6`.

Los ensayos de navegador cubren edición y guardado offline, recarga, adjuntos, búsqueda, exportación, plantillas, caja fuerte, contraseña incorrecta, enlaces revocados, accesibilidad de diálogos y tamaños de móvil/escritorio. Una prueba con dos pestañas verifica que el cifrado espere al adjunto anterior, rechace una escritura posterior obsoleta y retire los originales sin dejar borradores en claro. El receptor de enlaces utiliza una respuesta RPC simulada para esa prueba.

En el último paquete aprobaron las pruebas de móvil, Premium, Atelier, enlaces protegidos y concurrencia entre dos pestañas. La repetición de la prueba general de experiencia se detuvo al capturar una imagen de página completa; esa prueba había aprobado en una ejecución anterior. La prueba final del service worker aprobó instalación, recarga offline, edición y exclusión de datos privados, pero Chromium se cerró al reabrir la última pestaña. Su causa no quedó confirmada y la prueba completa **no está aprobada**. Antes de publicar debe resolverse o completarse en un entorno estable, además de ensayarse en el teléfono real.

El SQL se ensayó con PostgreSQL/PGlite en un esquema de referencia: migraciones y semilla repetidas, RLS, propietario, licencias, rachas, créditos, revisiones, notas cifradas y revocación. Esto no acredita el esquema real de producción ni una prueba entre dos dispositivos conectados a Supabase.

La evidencia de empaquetado y del origen local de Android se obtiene en Chromium con la política CSP nativa. No se ha ejecutado una instalación real en Android. Las incidencias de espacio temporal del entorno se resolvieron retirando únicamente salidas generadas comprobadas y usando temporales de navegador separados; no se eliminaron respaldos ni claves.

## Lo que requiere acceso o decisión del propietario

1. **Supabase administrativo:** exportar y verificar base de datos, Auth, objetos de Storage y configuración; ensayar restauración aislada. Inspeccionar esquema, RLS e historiales reales antes de aplicar migraciones. No basta la clave pública.
2. **Cuenta propietaria:** obtener y comprobar el UUID real de `manetal@gmail.com` y vincularlo desde administración. No se concede ese acceso a partir de un correo o una casilla del navegador.
3. **Licencias offline:** configurar la firma ES256 en servidor, distribuir la clave pública y comprobar el flujo en staging. El fichero público empieza vacío; actualmente no simula derechos offline de pago.
4. **Compras nuevas:** definir precios y periodicidad y validar el proceso antes de activarlas. Se mantienen los cuatro productos anteriores y el Pro antiguo de pago único.
5. **Android:** aportar el almacén original de firma, sus credenciales mediante un canal privado y la huella verificada; compilar con SDK/Gradle, verificar la firma y probar instalación, modo avión y actualización en teléfono. No se ha generado una clave sustitutiva.
6. **Publicación:** disponer de acceso efectivo a GitHub y revisar una versión de staging con backend configurado antes de fusionar/desplegar. El código local y el ZIP no significan que la web pública haya cambiado.

## Límites que deben conservarse al continuar

- Los adjuntos de una nota protegida suman como máximo 2 MiB. Las capturas remotas requieren pasarse a archivo local. No hay recuperación de contraseña ni acceso administrativo al contenido. Esta versión conserva dibujos y adjuntos protegidos al editar texto; no añade su edición dentro de la caja fuerte ni elimina la contraseña.
- Cifrar no revoca capturas, copias o respaldos previos de otros dispositivos. Deben revisarse los historiales cloud reales antes de activar la función. Los archivos estándar de recuperación no se anuncian como cifrados.
- Importar una copia completa o aplicar varias notas de una plantilla en una cuenta cloud requiere la operación transaccional pendiente. La importación local añade únicamente a espacios vacíos, con validación y sin sustituciones parciales. Las ideas del catálogo sí pueden copiarse individualmente.
- Una cuenta necesita verificarse y abrir su pizarra con red antes de usarla offline. Primer acceso, compartición, pagos, estadísticas y sincronización requieren conexión. Los recibos de derechos offline duran como máximo siete días.
- Los contornos geográficos son decorativos y simplificados; pueden omitir islas y enclaves. No son mapas de navegación ni una declaración de fronteras. La revisión cultural documenta referencias concretas, no representa toda la diversidad de cada población.
- Google Analytics, recomendaciones de conciertos/viajes y un planificador Android nativo en segundo plano no se han añadido.

Procedimientos detallados: `BACKEND_OFFLINE_VALIDATION.md`, `LICENCIAS_OFFLINE.md`, `NOTAS_PROTEGIDAS.md`, `RESPALDO_Y_RESTAURACION.md`, `CATALOGO_CULTURAL.md` y `../android/README.md`.

## Continuación del 3 de octubre de 2026

La autorización solicitada para subir la rama quedó concedida. El intento de `git push` ya superó el control de permisos, pero GitHub respondió que falta una credencial de usuario. No se ha subido ni publicado esta versión. Los plugins de GitHub y Supabase siguen sin instalarse o conectarse. No hay acceso administrativo Supabase ni almacén original de firma Android disponible en esta sesión.

Se reforzó `tests/offline-shell-ui.cjs`: ahora detiene el servidor HTTP de prueba y verifica que sea inaccesible antes de comprobar offline. Añade diagnóstico de cierre de renderizadores con `POSTISPOP_SW_DIAGNOSTICS=1`. Pasó la comprobación de sintaxis y la revisión del diff. No pudo ejecutarse de nuevo: no hay Chromium disponible y el entorno carece de espacio para recuperarlo. No se atribuye a esa limitación la causa del cierre anterior, que sigue sin confirmar.

La aplicación y sus paquetes conservan los hashes documentados arriba. La revisión adicional de privacidad no encontró una omisión material nueva. La importación cloud transaccional continúa pendiente: no se añadió SQL sin poder ejecutarlo en PostgreSQL/PGlite. Se conservaron los originales, los paquetes comprobados y los respaldos.


## Continuación: importación y pruebas offline — 3 de octubre de 2026

Se recuperó íntegra la entrega `PostisPop-codigo-revisado-20261003.zip`, commit base `23bb88517007457f58a24b2985c31f78396ab1c1`; 517 entradas verificadas contra su manifiesto. La continuación está en `feature/continue-postispop-20261003`. El remoto público sigue en `3849f782aa4a958c96708500e907f9ff18a40c0c`. No se ha subido ni desplegado esta continuación.

### Incorporado y comprobado

- Importación de copias y plantillas en cuentas mediante una sola RPC transaccional. Conserva las notas existentes, usa huecos vacíos, revisa permisos y derechos en servidor y admite estilos, dibujos, imágenes por URL y sobres cifrados.
- Límite de esta operación: siete notas ocupadas sin Premium y hasta cien con derecho vigente, condicionado a los slots ya existentes. La RPC no crea slots ni impone por sí sola un límite global a todas las rutas antiguas.
- Vista previa con cantidad de notas y errores claros. Si falta la migración, muestra que el servidor aún no la habilita y no hace escrituras parciales de sustitución.
- Reintento persistente sin duplicar una petición ya confirmada; dos pestañas coordinan su UUID. Una importación deliberada posterior a la confirmación puede obtener un UUID nuevo. Se guarda únicamente la huella, UUID y estado, nunca el contenido de la copia.
- Copias locales con imágenes, espacios y estilos antiguos `drawing:[]` ya no se descartan ni se rechazan indebidamente. La misma validación alimenta previsualización y restauración.
- Adjuntos locales conocidos y notas protegidas quedan excluidos de los slots candidatos de la cuenta. Los adjuntos sin sincronizar de otro dispositivo siguen fuera de alcance.

Validación final: 94 pruebas unitarias aprobadas, cero fallos; sintaxis de 86 módulos; Astro con cero errores y siete páginas; integración SQL PGlite aprobada con esquema de referencia y reaplicación de migraciones. La prueba de interfaz usa módulos reales y un backend simulado, con RPC ausente, reintento, éxito y dos pestañas concurrentes. No equivale a una operación real en Supabase.

La prueba offline que estaba inconclusa ahora pasó completa con el servidor local apagado e inaccesible: recarga, edición, cierre de la última pestaña, reapertura con datos conservados, Atelier y página de compartir; sin API/Auth/Storage en caché. Chromium Headless 141.0.7390.37, Playwright 1.56.1. La causa del cierre anterior sigue sin demostrarse. La prueba no sustituye a Android o iPhone físicos.

Paquete web verificado: 555 archivos, 541 recursos públicos del service worker. Huella `16a92e320fa4eff6c2b068c12226c3d26ef018bcd7dbd2286839de53bc78342b`. No se ha regenerado ni firmado una APK en esta continuación.

### Próximo paso real

1. Recuperar acceso autenticado a GitHub; el `git push --dry-run` volvió a fallar porque no hay credencial. La autorización del propietario ya existe. El navegador de automatización no llegó a iniciar, incluso tras reinicio, por `Connection closed`.
2. Abrir Supabase con **Continuar con GitHub**, como indicó el propietario. Los conectores GitHub/Supabase siguen sin estar conectados. No se solicitaron contraseñas ni se simuló acceso.
3. Revisar/exportar el esquema real y obtener respaldo; probar `database/board-import.sql` con sus dependencias en staging y dos conexiones concurrentes. Aplicar después de esa comprobación y publicar por GitHub Pages.

Contrato y limitaciones adicionales en `CLOUD_IMPORT.md`. El paquete de continuación contiene el parche exacto desde el commit base, los archivos modificados, el estado y un manifiesto de huellas. Requiere recuperar la entrega base; no es una copia de Supabase ni de los secretos de firma.
