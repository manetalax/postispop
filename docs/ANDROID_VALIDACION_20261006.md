# Android 0.5.0 — validación del 6 de octubre de 2026

## Cambios realizados

- Versión `0.5.0`, código `5`; se conserva `com.postispop.android` para release y `com.postispop.android.beta` para la variante debug existente.
- La pantalla usa archivos incluidos en el APK con `WebViewAssetLoader`; una dependencia que falta no se sustituye por la página remota.
- `singleTask` conserva la instancia al regresar desde Google. Abrir el icono sin un enlace ya no recarga la pizarra ni cierra el editor.
- Un enlace recibido al recrear la actividad tiene prioridad sobre el historial anterior. Su URI se consume para no repetir un código OAuth desde el intent después de otra recreación.
- El verificador PKCE se guarda mediante `auth-pkce.js` durante diez minutos, con comprobación de escritura, retorno interno validado, migración de un intento antiguo y limpieza al terminar. No contiene contraseñas ni tokens de sesión.
- Al pasar al fondo se emite `postispop:native-background`; el editor finaliza el trazo activo y guarda sus cambios pendientes.
- Si Android destruye el proceso de renderizado, la actividad libera la WebView inválida y ofrece abrir las notas de nuevo. La recuperación no borra almacenamiento local.
- Se excluyen explícitamente los datos privados de copias y transferencias automáticas del sistema, incluyendo Android 12+, conservando la política previa de copia/sincronización explícita.
- Los mensajes nativos están en recursos traducibles para español, inglés, portugués, francés, alemán, italiano, japonés y coreano.
- El icono nativo utiliza la misma nota jade y marfil que la web, como vector incluido en la aplicación.
- Se corrigió un fallo de empaquetado detectado **dentro del APK**: AAPT descartaba las carpetas `_next` y `_astro` por comenzar con guion bajo. Eso eliminaba los módulos de la interfaz aunque la compilación y la auditoría previa fueran correctas. `androidResources.ignoreAssetsPattern` los conserva y `android/verify-archive.py` comprueba el resultado físico.

## Pruebas completadas

`node --test tests/android-pkce.test.cjs`: **6 pruebas correctas**.

Cubren supervivencia del registro a la destrucción del contexto, caducidad, limpieza condicionada al intento, rechazo de destinos externos, registros malformados, migración de `sessionStorage` y almacenamiento bloqueado.

`node tests/android-auth-ui.cjs`: **correcto sobre el sitio preparado**.

La prueba inicia un intento en un contexto de navegador, conserva exclusivamente su almacenamiento persistente, destruye el contexto y abre otro. Comprueba el canje con el verificador, el retorno interno y la eliminación del registro y del código de la URL. También comprueba código rechazado y verificador caducado. El proveedor de identidad está simulado: esta prueba no certifica el enlace Android ni un inicio de sesión real de Google.

`node --check auth-pkce.js` y revisión de espacios del diff: correctos.

`node --test tests/android-archive.test.cjs`: **correcto**. Comprueba archivos APK y AAB, detectando omisión de `_next`, cambio de bytes y recursos adicionales no auditados.

La prueba OAuth también se ejecutó correctamente contra los recursos reales de `android/app/src/main/assets/www` mediante `POSTISPOP_TEST_ROOT`, incluida la copia aislada final con huella `0a2bb9cd` descrita abajo.

Las fuentes nativas de Android se integraron en la rama `review/notes-first-20261006`. Un `git fetch` y un diff completo contra los archivos locales confirmaron igualdad byte por byte, incluidos los siete idiomas adicionales y la eliminación del recurso TWA sin uso. Esta comprobación no implica publicación en `main`.

## Compilación

Se preparó fuera del repositorio una herramienta temporal con JDK 17, Gradle 8.13, plataforma Android 36 y Build Tools 36.0.0. El proyecto mantiene la receta reproducible en `.github/workflows/android.yml`.

Comando de validación nativa:

```sh
gradle -p android --no-daemon assembleDebug assembleRelease bundleRelease lintDebug lintRelease -PunsignedBeta
python3 android/verify-archive.py android/app/build/outputs/apk/debug/app-debug-unsigned.apk android/app/build/outputs/apk/release/app-release-unsigned.apk android/app/build/outputs/bundle/release/app-release.aab
```

**Compilación de la candidata definitiva terminada correctamente:** `clean`, `assembleDebug`, `assembleRelease` y `bundleRelease`, incorporando el RPC transaccional de creación de pizarras, las correcciones de respaldo y caché y la lectura paginada completa. Se partió de `postispop-release-paginated-20261006` y se creó una carpeta nueva de compilación exclusiva para esta huella. La compilación limpia terminó en 43 s: 83 tareas, 82 ejecutadas y 1 al día. `lintVitalRelease` pasó en esta compilación. Se confirmó que los 21 archivos nativos seguían idénticos a la compilación limpia previa de 98 tareas en 1 min 12 s, en la que también se ejecutaron `lintDebug` y `lintRelease`; sus informes se conservan como validación de esas mismas fuentes nativas.

El informe release contiene **0 errores y 1 advertencia**: la activación de JavaScript, necesaria para la interfaz local. Debug contiene **0 errores y 2 advertencias**: la anterior y la disponibilidad de una versión posterior de AndroidX WebKit. Se conserva la dependencia fijada y comprobada; no se han ocultado advertencias. La variante final sigue siendo una candidata interna sin firma, pendiente de la publicación coordinada del backend y de las pruebas de instalación.

Los tres archivos compilados pasan la verificación de **198 de 198 recursos**, incluida cada ruta `_next` y `_astro`, y todos sus tamaños y SHA-256 coinciden con el manifiesto, sin recursos adicionales. La copia aislada se comprobó antes y después de copiarla; contiene un único CSS consolidado con huella. Huella del contenido comprobado: `0a2bb9cdda8dc831554fc59cbfd38565ee2f6b785cdfb1bbcc7d8dc56e04fdec`.

| Candidato interno | Bytes | SHA-256 |
| --- | ---: | --- |
| APK debug 0.5.0-beta | 13.625.051 | `7aadada4a396beb40ef6ebe7d925f769af9fdc53eff104a37826907d617b61d2` |
| APK release 0.5.0 | 11.069.767 | `25a12e11876f1e28f6ecd3bf699675afabbf3ff6c35818325dd4b6092dfa425b` |
| AAB release 0.5.0 | 11.016.789 | `a5e05e36bfce960bab347299144b7c7c09c3e5314834e3aa4bce74be5514633b` |

Se conservaron candidatos, manifiesto e informes en `android/app/build/verified-internal/final-0a2bb9cd/`, excluidos de Git. Los resultados anteriores permanecen separados y no representan la candidata definitiva. **No están firmados**: `apksigner` confirma la ausencia de firma del APK release. Ningún candidato constituye un instalador de distribución. Si cambia el bundle, debe repetirse la compilación y la comparación del archivo final; estos hashes solo describen el contenido indicado.

La revisión de solo lectura de GitHub Actions confirmó que el repositorio y sus entornos no tenían secretos ni variables configurados para reutilizar una firma existente. No se leyó ningún valor ni se modificó la configuración de acceso o de firma.

No se ha ejecutado un APK instalado: este entorno no dispone de emulador Android, imágenes de sistema ni aceleración KVM, y no se ha aportado un dispositivo físico. Las pruebas de OAuth recrean el contexto de navegador con almacenamiento persistente; no sustituyen una instalación y pruebas de ciclo de vida en Android real.

## Validación que requiere el entorno de publicación

1. Restaurar la clave original fuera del repositorio y ejecutar `node mobile/build-release.mjs`. No se ha creado una clave de sustitución.
2. Añadir y verificar la huella pública release en `/.well-known/assetlinks.json`; el archivo existente identifica la beta. Confirmar el retorno de Google a la aplicación instalada.
3. Instalar el APK firmado en Android real y comprobar modo avión, escritura/dibujo/adjuntos, cierre forzado, reapertura, rotación, teclado y selector de archivos; actualizar conservando los datos con la misma firma.
4. Aplicar y verificar las migraciones revisadas en el entorno de publicación antes de activar el cliente que usa los RPC nuevos. Probar permisos Supabase con dos cuentas y dos dispositivos: creación atómica de pizarra, sincronización de cola, conflictos, protección, enlaces compartidos y cierre de sesión sin filtración de otra cuenta. Las pruebas SQL aisladas no acreditan que producción tenga ya esos procedimientos.
5. Verificar funcionamiento con el proceso del navegador externo cerrado y con Android eliminando la aplicación durante Google. La prueba de navegador cubre el almacenamiento, no las decisiones del sistema sobre enlaces verificados.

## Condiciones del producto

Una sola oferta Premium: 2,95 €/mes, 9,95 €/año o 59,95 € de por vida, con compra «Próximamente». Gratis: seis notas. No hay pagos nuevos activados. La aplicación no implementa todavía Play Billing ni alarmas nativas con la aplicación cerrada. La primera autenticación y las operaciones remotas necesitan conexión. El estado de autorización Premium debe proceder del servidor.

El navegador, la beta y el release tienen almacenes separados. La sesión o los datos de la web no aparecen automáticamente dentro del APK. Desinstalar o borrar los datos del sistema elimina los cambios locales que aún no se han exportado o sincronizado.

Referencias técnicas: [contenido local en WebView](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content), [recuperación del proceso WebView](https://developer.android.com/develop/ui/views/layout/webapps/handle-termination), [flujo PKCE de Supabase](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
