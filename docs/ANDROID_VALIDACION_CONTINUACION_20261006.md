# Android 0.5.0 — validación de la continuación del 6 de octubre de 2026

**Validación más reciente:** el bloque «Nueva validación: editor final, sólo web y Android» al final de este documento registra el bundle móvil `a6f5e807…3712a9a`. Los bloques iniciales conservan la validación anterior `33098cda…c1e1096` y no describen los candidatos actuales.

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

Los candidatos y los informes de esta validación anterior se preservaron, antes de compilar la siguiente, en `android/build/validacion-33098cda/outputs/` y `android/build/validacion-33098cda/reports/`. La evidencia adicional también está preservada dentro de `android/build/validacion-33098cda/`, excluida de Git, con los siguientes nombres originales:

- `android/build/continuacion-native-build.log` y `continuacion-native-build.json`.
- `android/build/continuacion-archive-verification.json`.
- `android/build/continuacion-signature-checks.json`.
- `android/build/continuacion-lint.json`.

No se realizó instalación en dispositivo, prueba real de Google/Supabase, prueba de actualización ni publicación. Para distribuir siguen pendientes la clave original, la verificación de App Links para esa firma y las pruebas en Android real descritas en `ANDROID_VALIDACION_20261006.md`. Cualquier cambio posterior del bundle exige volver a compilar y verificar los APK/AAB finales; estos resultados sólo corresponden a la huella de contenido indicada.

## Nueva validación: editor final, sólo web y Android

Se recompiló el paquete móvil final ya preparado, sin reempaquetarlo, después de los ajustes de accesibilidad y presentación del editor en `design-tools.js` y `design-tools.css`. La fuente local fue `c0957486e854a708b8485adad628f6b354f9a937` más los cambios de interfaz presentes en la worktree. La evidencia de esta sección corresponde a una compilación local de esos recursos finales; no atribuye las mejoras nuevas a ejecuciones anteriores de GitHub Actions.

La instrucción vigente del usuario limita el trabajo a **web y Android**. No se construyeron aplicaciones para otras plataformas.

| Fuente del editor comprobada | SHA-256 |
| --- | --- |
| `design-tools.js` | `cfbbbdbf7d3add6c441ff0d55956a8544a1e825ac25c275993d6e09edd26ce5b` |
| `design-tools.css` | `e17abec588ce4c5fb9cb72f50d4cdf1224aab545f7e6631defc7b322ba7aa350` |

Se repitió el comando Gradle de este documento con las mismas herramientas, `--offline` y `-PunsignedBeta`, retirando las variables de firma. Resultado: **`BUILD SUCCESSFUL`, código 0, 28,68 segundos, 97 tareas: 44 ejecutadas y 53 actualizadas**. Se completaron `assembleDebug`, `assembleRelease`, `bundleRelease`, `lintDebug` y `lintRelease`.

Los dos informes lint nuevos contienen cada uno **0 errores y 1 advertencia**, `SetJavaScriptEnabled`. Gradle mantiene su aviso de funciones obsoletas para una futura actualización a Gradle 9; la versión usada aquí fue 8.13.

`android/verify-archive.py` verificó los tres archivos físicos nuevos: **198 de 198 recursos**, con rutas, tamaños y hashes coincidentes, incluidas las carpetas `_next` y `_astro`, sin recursos extra ni entradas ZIP duplicadas.

**Huella móvil de esta nueva validación:** `a6f5e807d01bb5e314d7243149061529ef61b615533673e0d53ff8a173712a9a`.

| Candidato interno actual | Bytes | SHA-256 |
| --- | ---: | --- |
| APK debug sin firma | 13.675.976 | `046bbc3aa81b4b7af4229d0c4f2c09f8959c609ff194685da0e0cc4fdc577700` |
| APK release sin firma | 11.070.575 | `e7f948b8874372594654b73ec69614bcfa403e173e86492e64174cece99bee11` |
| AAB release sin firma | 11.017.597 | `a54bc8656132a6a5f8afae0c950e1e16f6990b95565931c27c45c3dbdaced463` |

La comprobación de firma también se repitió: `apksigner` devuelve código 1 y `DOES NOT VERIFY` para ambos APK, por ausencia de `META-INF/MANIFEST.MF`; `jarsigner` declara `jar is unsigned` para el AAB. No hay entradas JAR de firma en ninguno. El nombre de la tarea Gradle `signReleaseBundle` no acredita una firma; la inspección del AAB confirma que sigue sin firmar. No se creó ni sustituyó ninguna clave.

Los archivos actuales permanecen en las rutas de salida indicadas en el comando de verificación. Se conservó además una copia de los tres candidatos, manifiesto, informes y evidencia en `android/build/validacion-a6f5e807/`. Sus registros diferenciados son:

- `editor-final-native-build.log` y `editor-final-native-build.json`.
- `editor-final-archive-verification.json`.
- `editor-final-signature-checks.json`.
- `editor-final-lint.json`.
- `editor-final-source.json`, con el commit local y las huellas de los archivos fuente comprobados.

La validación local acredita compilación y contenido empaquetado. **No acredita instalación en Android real, autenticación real, actualización con la firma original ni distribución.** No se realizaron instalaciones ni publicaciones como parte de esta prueba. Los hashes de esta sección son los del editor final y no se deben mezclar con los de la validación anterior.
