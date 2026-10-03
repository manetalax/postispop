# Notas con contraseña: comportamiento y límites

Cada nota tiene su propia contraseña, de al menos cuatro caracteres Unicode. Se permiten frases largas. El cifrado usa AES-256-GCM, una sal y un IV aleatorios y PBKDF2-SHA-256 con 600.000 iteraciones. La contraseña y la clave derivada no se escriben en almacenamiento ni se envían al servidor. Una contraseña corta sigue siendo vulnerable a intentos fuera de línea sobre una copia del sobre cifrado.

El sobre incluye texto, marcas, estilo, dibujo y adjuntos locales. Los adjuntos suman como máximo 2 MiB y el contenido serializado 3 MiB. Las capturas que apuntan a una URL externa requieren descargarse y añadirse como archivo local antes de proteger: una referencia externa no equivale a cifrar el archivo.

## Decisiones de acceso

- No existe recuperación de contraseña ni puerta administrativa para descifrar. El propietario de PostisPop no obtiene acceso al contenido de otras cuentas.
- El contenido se abre temporalmente en un diálogo. Cerrar, cambiar de aplicación, cerrar sesión o cambiar de cuenta lo vuelve a bloquear. No se guarda una sesión de descifrado permanente.
- Se puede editar y volver a cifrar el texto. Los dibujos, estilos y adjuntos existentes se conservan; esta versión no incorpora un editor de dibujo/adjuntos dentro del diálogo descifrado ni permite quitar la contraseña.
- La exportación de una nota protegida conserva el sobre cifrado. El buscador y la miniatura reciben «Nota protegida», no el texto. Los ficheros de recuperación de otras notas o de versiones anteriores no se presentan como cifrados.

## Compartir

Compartir exige una nota de cuenta y conexión. El servidor guarda un hash de un token aleatorio; el enlace lleva el token en su fragmento y nunca la contraseña. La interfaz prepara un enlace de WhatsApp para que la persona decida enviarlo; la contraseña debe comunicarse por separado.

La interfaz crea enlaces con siete días de vigencia. La lectura consulta de nuevo al servidor antes de cada apertura, de modo que la caducidad y la revocación se comprueban en ese momento. El enlace muestra la versión cifrada actual de la nota, no una instantánea permanente. Revocar todos los enlaces impide nuevas descargas desde el servidor, pero no retira copias, capturas o textos que un destinatario ya guardó.

## Datos anteriores y concurrencia

Antes de proteger se comprueban borradores, revisiones y cambios pendientes. Con consentimiento explícito se retiran las versiones locales anteriores de ese espacio y los adjuntos originales sólo después de confirmar el guardado del sobre cifrado. Un bloqueo Web Locks coordina la protección con escritores de adjuntos y evita que una pestaña obsoleta vuelva a guardar un archivo sin cifrar. La operación de protección se rechaza si no se puede obtener esa coordinación. Los editores heredados respetan un marcador reservado antes de derivar la clave.

La migración sustituye el texto y dibujo públicos, elimina el estilo anterior y oculta el texto de alarmas conocidas. No se ha inspeccionado el esquema real de producción: antes de activar hay que identificar también cualquier tabla de historial, integración, respaldo o archivo externo que conserve versiones anteriores. Proteger una nota no puede borrar copias ya descargadas en otros dispositivos ni respaldos externos previos.

## Validación

Las pruebas locales cubren cifrado, contraseña incorrecta, sobres alterados, exportación/importación, restricciones SQL, permisos, revocación y visualización móvil. Hay una prueba de navegador con dos pestañas para los adjuntos y borradores obsoletos. El receptor de enlaces se prueba con una respuesta RPC simulada y las funciones SQL con un esquema de referencia PostgreSQL. Esto no sustituye el ensayo de extremo a extremo en Supabase de staging ni una auditoría independiente.

No se ha desplegado esta función en producción ni migrado contenido real de usuarios.
