# PostisPop Android 0.4.0 — recursos incluidos

La aplicación ejecuta archivos del APK con WebViewAssetLoader bajo el origen lógico `https://postispop.com`. No descarga la página pública como sustitución cuando falta un recurso. La pizarra, tienda, colecciones, 195 banderas, papelería, fuentes, herramientas y módulos de cifrado/offline forman parte del manifiesto obligatorio del empaquetado. Una dependencia local ausente o un CDN de código, imagen o fuente hace fallar la verificación.

## Identidad y estado real

- Release: `com.postispop.android`, versión `0.4.0`, código `4`. Android 6+ con WebView actualizado.
- Debug/beta: `com.postispop.android.beta`, identidad separada. Instalar release no migra ni reemplaza automáticamente los datos privados de la beta o del navegador.
- Se mantiene R8, reducción de recursos, depuración de WebView desactivada y bloqueo de tráfico HTTP. Los mapas privados no se incluyen en web ni APK; el JavaScript fuente permanece legible.
- El empaquetado de archivos no equivale a compilar, firmar, publicar ni instalar. Esta sesión no dispone de la clave original ni del SDK/Gradle. No se entrega un binario antiguo o sin firmar como instalador final.

## Datos y funcionamiento sin conexión

Las notas de invitado y sus adjuntos se almacenan en el dispositivo. Las cuentas usan el módulo compartido `offline-sync.js`: cambios pendientes persistentes, identificación del propietario y resolución explícita de conflictos. La sincronización nueva requiere aplicar y probar la migración del servidor; escribir el cliente no activa ese backend.

Las notas protegidas usan el módulo de cifrado común. Su contenido y contraseña nunca forman parte del bundle. `compartir.html#TOKEN` se incluye físicamente, pero obtener el contenido compartido y revocarlo requiere la API activa y conexión. La contraseña se comunica aparte.

El uso offline de derechos requiere un recibo firmado por el servidor y una clave pública configurada. Una casilla de localStorage no desbloquea Premium. El conjunto público de claves empieza vacío: sin infraestructura y validación inicial no se simulan derechos adquiridos. Primer acceso, pagos, sincronización, estadísticas y compartición remota requieren red. Las compras nuevas siguen desactivadas.

El almacenamiento del navegador, de la beta y del release es independiente. Desinstalar o borrar datos elimina notas locales y cambios aún no sincronizados. Las alarmas existentes necesitan la app abierta; no se añadió un planificador nativo en segundo plano.

## Empaquetar y verificar recursos

Requiere Node 22 y dependencias de `package-lock.json`:

```sh
npm ci
npm run build
node scripts/package-mobile.mjs
node --test tests/packaging.test.cjs
POSTISPOP_CHROME=/ruta/a/chromium npm run test:mobile
```

El script comparte `scripts/stage-site.mjs` con la web e incluye las optimizaciones presentes en la rama principal (documentos legales estáticos y catálogo de citas dividido por idioma). Genera `bundle-manifest.json` con ruta, tamaño y SHA-256 de cada archivo. Excluye datos capturados de API, mapas de depuración, claves y APK/AAB. Android no registra el service worker web: el host nativo ya dispone de todos los recursos.

Con poco espacio, `POSTISPOP_MOBILE_ASSET_LINKS=1 node scripts/package-mobile.mjs` permite enlaces duros únicamente entre las dos salidas generadas, `_site` y los recursos Android, dentro del mismo sistema de archivos. HTML y metadatos reciben copias independientes; nunca se enlazan archivos fuente. El APK sigue incluyendo los bytes locales de cada recurso. Tras empaquetar, conservar las salidas sin modificarlas y verificar sus manifiestos; para actualizar, volver a ejecutar el empaquetado completo.

## Compilar y firmar con la clave existente

Requiere JDK 17, Gradle 8.13, SDK 36 y Build Tools 36.0.0. Restaurar la clave privada original **fuera del repositorio**. No generar ni sustituirla. Configurar variables de entorno mediante el gestor privado del propietario:

- `ANDROID_HOME`: directorio del SDK.
- `POSTISPOP_KEYSTORE`: ruta absoluta al almacén existente.
- `POSTISPOP_STORE_PASSWORD` y `POSTISPOP_KEY_PASSWORD`: contraseñas privadas.
- `POSTISPOP_KEY_ALIAS`: alias existente; por defecto `postispop-release`.
- `POSTISPOP_CERT_SHA256`: huella pública previamente verificada, recomendada para comprobar la identidad.
- Opcionales: `POSTISPOP_GRADLE` y `POSTISPOP_APKSIGNER` si no están en las rutas habituales.

```sh
node mobile/build-release.mjs
```

El script recompila los recursos actuales, verifica el bundle, ejecuta `assembleRelease` y `lintRelease`, exige validación de `apksigner` y sólo entonces exporta el APK firmado a `android/app/build/verified/`, junto con SHA-256, huella de certificado y hash exacto de los recursos. No imprime contraseñas ni las escribe en el proyecto. Un build Gradle directo sin esas variables seguirá siendo un candidato interno sin firmar, no un instalador distribuible.

La antigua `.well-known/assetlinks.json` corresponde a la beta. Antes de dar por válido el retorno de Google al release, se debe añadir la huella pública de la clave release original en el sitio y comprobar «Abrir enlaces compatibles» en un dispositivo. No se inventa esa huella. Google/Stripe se abren en el navegador externo; no existe adaptación a Play Billing ni binario iOS.

## Prueba final pendiente en Android real

Instalación limpia firmada; creación y adjuntos en modo avión; cierre forzado y reapertura; cuenta validada previamente con cola pendiente; regreso de red y conflictos entre dos dispositivos; nota protegida sin filtraciones; revocación; enlaces Google; exportación PNG y actualización con la misma clave. Las pruebas de navegador sirven para el bundle y su persistencia, pero no certifican instalación ni comportamiento del sistema Android.
