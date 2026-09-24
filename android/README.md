# PostisPop para Android — beta 0.1.0

Aplicación Android basada en Trusted Web Activity (Android Browser Helper 2.7.3). Abre la web real https://postispop.com/ usando un navegador compatible; conserva los datos y la sesión de ese navegador. Si no se valida el dominio o el navegador no admite TWA, se muestra la interfaz segura del navegador.

## APK de prueba

- Paquete: `com.postispop.android.beta`.
- Android 6.0 o posterior (API 23); destino y compilación API 36.
- Descarga el APK, ábrelo desde Archivos y autoriza temporalmente «Instalar aplicaciones desconocidas» para esa aplicación. Después de instalar puedes retirar ese permiso.
- Mantén Chrome u otro navegador compatible actualizado. Necesita conexión a Internet.
- No publiques esta beta firmada con clave de prueba en Google Play.

## Compilación

Requiere JDK 17, Gradle 8.13, SDK Platform 36 y Build Tools 36.0.0.

```sh
cd android
# Define ANDROID_HOME o sdk.dir en local.properties.
mkdir -p app/.signing
# Para actualizar el APK entregado, restaura SU beta.keystore del respaldo privado.
# Solo para una instalación de desarrollo nueva:
keytool -genkeypair -keystore app/.signing/beta.keystore -storepass android \
  -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 \
  -validity 10000 -dname 'CN=PostisPop Android Beta,O=PostisPop,C=ES'
gradle assembleDebug lintDebug
# Salida: app/build/outputs/apk/debug/app-debug.apk
```

Una clave nueva produce otra firma. No se podrá actualizar una instalación anterior sin desinstalarla; también hay que publicar su huella en `.well-known/assetlinks.json`. La clave de la beta entregada se guarda en el respaldo privado, nunca en el repositorio ni en el sitio web. Su contraseña estándar de desarrollo es `android`; NO usar esta clave para producción.

## Estado y límites

- La envoltura Android no cambia la lógica de pagos, cuentas ni productos de la web.
- Los pagos Stripe y la concesión de mejoras siguen pendientes de una prueba completa; no se certifican por compilar este APK.
- No incluye un planificador nativo de alarmas ni garantiza avisos con la aplicación cerrada, el móvil bloqueado o sin conexión. Hay que implementar y probar notificaciones/push o alarmas nativas antes de prometer ese comportamiento.
- Los datos web viven en el perfil del navegador, no en un WebView independiente. Borrar los datos de ese navegador puede borrar notas locales sin sincronizar.
- Esta entrega se verifica por compilación, análisis estático, manifiesto y firma; la prueba en un móvil físico queda pendiente.

## Preparación para Google Play

La variante release usa `com.postispop.android`. `gradle bundleRelease` genera un AAB candidato SIN FIRMAR; no está listo para subir ni aprobado por Google.

Antes de publicar:

1. Configurar Play Console, Play App Signing y una clave de subida de producción propia, distinta de la beta.
2. Implementar Play Billing para mejoras digitales o completar un programa de pagos alternativos aplicable. La web usa Stripe y no se da por válida para Play automáticamente.
3. Añadir al assetlinks público el paquete de producción y la huella de **firma de aplicación de Google Play**, conservando las asociaciones necesarias.
4. Completar ficha, capturas, política de privacidad, seguridad de datos, clasificación y eliminación de cuenta si corresponde.
5. Validar login, compra, restauración de derechos, enlaces de retorno, accesibilidad y alarmas en dispositivos; realizar las pruebas exigidas por la cuenta de Play.

Referencias oficiales:
- https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://developer.android.com/google/play/requirements/target-sdk
