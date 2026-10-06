# Android 0.5.0 — validación de la continuación del 6 de octubre de 2026

Esta validación corresponde a la integración de esta continuación sobre el remoto `dfbbf13`, conservando su creación atómica de pizarras, los cambios de interfaz y los nuevos recursos de marca. Se ejecutó en la worktree aislada `/workspace/scratch/02c0d275caa6/postispop-integration`. Sustituye las huellas de la primera compilación de esta continuación. No modifica ni valida de nuevo los candidatos descritos en `ANDROID_VALIDACION_20261006.md`: los hashes siguientes identifican estos archivos nuevos.

## Compilación nativa

Herramientas: Temurin OpenJDK 17.0.20.1, Gradle 8.13, Android SDK 36 y Build Tools 36.0.0. Se reutilizó la instalación de herramientas existente, sin modificar el otro checkout. La compilación usó las dependencias ya almacenadas y no necesitó red.

```sh
gradle -p android --offline --no-daemon --max-workers=1 --console=plain \
  assembleDebug assembleRelease bundleRelease lintDebug lintRelease -PunsignedBeta
```

El proceso terminó con **código 0 en 36,56 segundos**, `BUILD SUCCESSFUL` y **97 tareas ejecutadas**. Produjo APK debug, APK release y AAB release. El proyecto conserva la versión `0.5.0`, código `5`; la variante debug usa `0.5.0-beta` y el identificador `com.postispop.android.beta`.

Los informes `lintDebug` y `lintRelease` contienen cada uno **0 errores y 1 advertencia**, `SetJavaScriptEnabled`, por el JavaScript necesario para la interfaz local. La advertencia permanece visible. Javac también informa de uso de una API obsoleta; no impidió la compilación.

## Verificación de los archivos producidos

```sh
python3 android/verify-archive.py \
  android/app/build/outputs/apk/debug/app-debug-unsigned.apk \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  android/app/build/outputs/bundle/release/app-release.aab
```

Los tres archivos pasan la comparación del contenido físico contra `android/app/src/main/assets/www/bundle-manifest.json`: **198 de 198 recursos**, rutas, tamaños y SHA-256 correctos, sin recursos adicionales ni entradas ZIP duplicadas. Esto incluye las carpetas `_next` y `_astro`.

Huella del contenido móvil comprobado: `33098cda8313f36eb0afeb44097eb2b83773b6546b9772e3efc29e7c8c1e1096`.

| Archivo interno | Bytes | SHA-256 |
| --- | ---: | --- |
| APK debug sin firma | 13.624.267 | `63350b9d8eca345cf9677a42fb15fc2b48548731db94865031b3c96baf0657d9` |
| APK release sin firma | 11.069.083 | `4899d7339f79423857c48cf09624edf0825e87332e490f510ee430a836d3f62c` |
| AAB release sin firma | 11.016.106 | `9f07a2529d691ace5d1f6cd8c9ae513407ab71c9518b4b1c5774474527bd25b0` |

## Estado de firma

Se retiraron del entorno del proceso las cuatro variables `POSTISPOP_KEYSTORE`, `POSTISPOP_STORE_PASSWORD`, `POSTISPOP_KEY_PASSWORD` y `POSTISPOP_KEY_ALIAS`. `-PunsignedBeta` desactiva también la firma debug. No se creó ni se sustituyó ninguna clave.

- `apksigner verify --verbose` devuelve código 1 para ambos APK: `DOES NOT VERIFY`, con `Missing META-INF/MANIFEST.MF`.
- `jarsigner -verify` informa `jar is unsigned` para el AAB. Su código 0 no acredita una firma.
- Ninguno contiene entradas JAR de firma `.SF`, `.RSA`, `.DSA` o `.EC`.

**Son candidatos internos sin firma, no instaladores de distribución.** La verificación del contenido no certifica una firma ni una instalación.

## Evidencia local y alcance

Los candidatos permanecen en `android/app/build/outputs/` y los informes lint en `android/app/build/reports/`. La evidencia adicional, excluida de Git, está en:

- `android/build/continuacion-native-build.log` y `continuacion-native-build.json`.
- `android/build/continuacion-archive-verification.json`.
- `android/build/continuacion-signature-checks.json`.
- `android/build/continuacion-lint.json`.

No se realizó instalación en dispositivo, prueba real de Google/Supabase, prueba de actualización ni publicación. Para distribuir siguen pendientes la clave original, la verificación de App Links para esa firma y las pruebas en Android real descritas en `ANDROID_VALIDACION_20261006.md`. Cualquier cambio posterior del bundle exige volver a compilar y verificar los APK/AAB finales; estos resultados sólo corresponden a la huella de contenido indicada.
