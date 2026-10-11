# Compartir la nota completa — 11 de octubre de 2026

El botón principal y las acciones de adjuntos preparan una copia de la nota con
texto, formato, papel, dibujo, símbolos, captura y archivos locales. Audio y vídeo
viajan como archivos; los enlaces externos siguen siendo enlaces. La copia no
altera la nota original y no es una nota colaborativa que se actualice después.

Se obtiene un enlace `https://postispop.com/nota-compartida.html#TOKEN.CLAVE`.
El remitente puede mandarlo por el selector de aplicaciones, WhatsApp, correo o
copiarlo; también puede enviar un archivo HTML de acceso que conduce a esa página.
Ese archivo es un acceso a la copia alojada, no una copia sin conexión de sus datos.
El destinatario no necesita una cuenta. Ve texto y dibujo, reproduce los formatos
multimedia compatibles y puede descargar todos los archivos. La APK 0.6.3 incluye
el mismo lector y conserva el fragmento del enlace. Android App Links decide
app/web según instalación, verificación de dominio y preferencias del dispositivo.
Las APK antiguas necesitan actualizarse; no se puede añadirles código a distancia.

La copia se cifra antes de subirla. La clave va en el fragmento y no se manda al
servidor. Quien tenga el enlace completo puede verla, copiarla o reenviarla. Una
nota previamente protegida conserva su cifrado interior y sigue pidiendo su
contraseña; se incluyen sus últimos cambios cifrados incluso en modo invitado.
Los nuevos enlaces caducan en siete días y admiten una copia de hasta 50 MiB
(contando metadatos y codificación de adjuntos). Un exceso o error aborta la
creación del enlace sin omitir contenido ni enviar texto como alternativa.

## Validación

- 177 tests unitarios, incluida reserva privada, límite, repetición y cifrado.
- Migración nueva aplicada dos veces en PGlite; anon/authenticated no pueden
  leer sus tablas ni el bucket incluso con una política anterior permisiva.
- Prueba local entre dos navegadores sin sesión: texto/dibujo/foto/audio/vídeo,
  archivos generales, enlace y nota sin texto; bytes exactos y vídeo decodificable.
- Prueba de contraseña correcta/incorrecta, enlace caducado, subida fallida,
  cambios recientes de una nota protegida y puente nativo del destinatario.
- Guardado automático y compartición protegida anterior conservados.
- Diez plantillas en 320, 390 y 1366 px, incluyendo reapertura del editor.
- Lint, build y generación de paquetes web/Android con auditoría de recursos.

La prueba de navegador usa un transporte simulado aislado. Además, después de la
autorización explícita del propietario el 11 de octubre, se han aplicado las dos
migraciones y desplegado la función en producción. La comprobación independiente
`POSTISPOP_VERIFY_LIVE_SHARE=1 node scripts/verify-note-share-live.mjs` confirmó
subida/descarga real, texto, bytes de adjuntos, contraseña y bucket privado.
La limpieza autenticada por Vault respondió HTTP 200 y queda programada cada 15 minutos.
No había una rama independiente de staging; el esquema aditivo se validó primero
en PGlite. Los asesores no señalan WARN/ERROR nuevos de esta función; RLS sin
políticas es deliberado en sus tablas privadas con acceso de cliente revocado.

Las notas con hasta 300 caracteres y ocho líneas, sin cifrado ni dibujo, y con cero
o una foto raster generan una imagen PNG local: foto arriba y texto debajo. También
se comprueba que el texto ajustado cabe en ocho líneas con letra grande para móvil;
si no cabe, se usa el enlace completo sin cortar contenido. Además
se comparte un enlace y una indicación traducida en los ocho idiomas. Vídeo, audio,
documentos, varias fotos, dibujos o texto extenso usan solo el mensaje y el enlace.
Las imágenes no se publican como metadatos abiertos ni se generan para notas cifradas.
Cuando el navegador no permite compartir archivos, se conserva el enlace y se ofrece
descargar la imagen para adjuntarla. WhatsApp con imagen abre el selector de aplicaciones;
el usuario elige WhatsApp. Cada aplicación decide cómo presenta imagen y enlace.

Android utiliza App Links verificados; la PWA declara navegación a la instancia
existente cuando el navegador lo admite. Las preferencias del sistema y de las apps
pueden mantener el enlace en un navegador. No hay binario nativo iOS/Windows/macOS;
en esos sistemas se usa la web o PWA según su configuración. No se promete forzar
la apertura de una imagen adjunta como si fuera un enlace: este va visible en el mensaje.

La publicación web y la APK se tramitan mediante PR/main y el workflow firmado.
La APK se publica solo tras verificar firma, certificado asociado y archivos físicos.
Una comprobación en un dispositivo Android físico sigue pendiente.

Estado de publicación: PR #35 integrado, workflow Pages 38111685265 completado
con éxito y web 0.6.3 publicada. La prueba en producción confirma emisor y receptor
independientes con foto/texto; también se verificó vídeo WebM real con bytes exactos.
El build Android interno 38111685264 compila y verifica físicamente APK/AAB.
El release firmado 38111685280 está bloqueado: `POSTISPOP_KEYSTORE_BASE64` sigue
siendo inválido incluso admitiendo saltos de línea. El propietario debe corregir
ese secreto con su clave original; no se creó una identidad de firma nueva.
La comprobación de enlaces sucesivos detectó la necesidad de reaccionar a cambios
de fragmento sin recargar. La corrección invalida descargas y contraseñas anteriores,
limpia el contenido visible y vuelve a pedir la contraseña para una nota protegida.

## Publicación y verificación

1. Autorización del propietario, migraciones, función y limpieza programada: completadas.
2. Permisos privados, cuotas locales, transporte real y asesores: comprobados.
   El límite global limita abuso aunque la cabecera IP del gateway cambie; la cuota
   por IP es conservadora y puede agrupar usuarios detrás de un mismo proxy.
3. Publicar mediante PR/main y comprobar la subida/recepción real en la web.
4. Compilar y firmar 0.6.3 con la identidad vigente, verificar el contenido físico
   del archivo y probar un enlace en un dispositivo con APK y otro sin ella.
