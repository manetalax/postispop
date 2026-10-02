# PostisPop Android 0.3.0-beta — ejecución local

Esta beta reemplaza la TWA anterior. Incluye la pizarra, JavaScript, CSS, imágenes y la tienda Astro/Pagefind en el APK. Android WebView ejecuta los archivos locales con WebViewAssetLoader. El origen lógico https://postispop.com se resuelve íntegramente contra los assets: ningún documento de la web pública se descarga, tampoco si falta un archivo. Así se conserva la política CORS de la API existente.

La misma API Supabase gestiona cuentas, pizarras, notas y derechos con las credenciales de cada usuario y RLS. Solo se incluye la clave publicable, nunca claves de servicio ni secretos de Stripe. Los archivos api/ recuperados de la web NO se empaquetan.

## Uso
- Android 6+; Android System WebView actualizado.
- Paquete com.postispop.android.beta, versión 0.3.0-beta, código 3.
- Para instalar como actualización, la APK debe firmarse con la misma clave privada de las betas anteriores. El repositorio no contiene esa clave ni una APK firmada.
- Las sesiones/notas de la beta TWA anterior residían en el navegador. La nueva app tiene almacenamiento independiente: iniciar sesión de nuevo para recuperar notas sincronizadas. Las notas de invitado del navegador no se migran automáticamente ni se borran.
- Sin Internet: la interfaz y la tienda arrancan; las notas de invitado se editan y conservan localmente. Una cuenta puede consultar la última pizarra leída en este dispositivo; guardar cambios en la cuenta requiere conexión. No existe aún una cola de cambios offline para cuentas.
- Login con correo, sincronización, catálogo actualizado, derechos y pagos necesitan conexión. Google y Stripe se abren en el navegador del sistema; los enlaces verificados de postispop.com vuelven a la app. El retorno OAuth depende de que Android tenga habilitado «Abrir enlaces compatibles» para esta app.
- Stripe se conserva sin adaptación a Play Billing, por petición del propietario. Los pagos no se habilitan si el backend los tiene desactivados.
- Las alarmas actuales requieren la app abierta; no se ha añadido un planificador nativo en segundo plano.

## Compilar
Requiere Node 22, JDK 17, Gradle 8.13, SDK 36 y Build Tools 36.0.0.

```sh
npm ci
npm run build
node scripts/package-mobile.mjs
# Restaurar la clave beta privada en android/app/.signing/beta.keystore.
# Configurar ANDROID_HOME o android/local.properties con sdk.dir.
gradle -p android assembleDebug lintDebug
```

La clave beta usa alias androiddebugkey y contraseña de desarrollo android. No usarla en producción ni subirla a GitHub. Sin clave, `-PunsignedBeta` genera un APK sin firmar para firmarlo después en un entorno privado.

GitHub Actions compila recursos y APK/AAB sin firmar. Esos artefactos no son descargas listas para instalar. El APK de entrega requiere restaurar la clave beta conservada en `android/app/.signing/beta.keystore`, firmar y comprobar la firma y la instalación en Android antes de publicar el enlace en `/descargas/`. No se debe generar una clave sustituta: los dispositivos con una beta anterior rechazarían la actualización.

La identidad pública esperada está en `.well-known/assetlinks.json`: paquete `com.postispop.android.beta`, huella SHA-256 `70:AB:26:96:E0:98:0E:B2:5A:3B:8D:39:D6:1A:29:A2:44:F7:D2:07:88:60:07:C3:14:EC:41:7E:31:56:08:1C`. Comprueba la huella del APK con `apksigner verify --verbose --print-certs` antes de distribuirlo. Para futuras versiones hay que actualizar versionCode/versionName.

## Verificación de la interfaz local

Después de empaquetar los assets: `npx playwright install chromium` y `npm run test:mobile`. La prueba bloquea todos los destinos externos y los service workers, comprueba arranque, edición y persistencia de notas de invitado, catálogo local, búsqueda Pagefind y las páginas locales de descargas e instalación. No sustituye las pruebas Android en móvil ni un pago real.

## Google Play e iOS
El AAB de release es un candidato sin firmar, NO listo para Play Console. Faltan firma de producción, pagos digitales admitidos por Play, ficha/políticas y validación en dispositivos. Esta entrega no incluye binario iOS. La carpeta mobile y los recursos empaquetados permiten reutilizar la interfaz, pero iOS requerirá host WKWebView/Capacitor, Xcode, firma y pruebas propias.
