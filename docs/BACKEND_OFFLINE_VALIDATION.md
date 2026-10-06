# Backend, licencias y sincronización — 2 de octubre de 2026

> **Documento histórico. Estado vigente: 6 de octubre de 2026.** La oferta, los límites y el orden actual de migración están en [dirección del producto](PRODUCTO_Y_DIRECCION.md) y [entrega de datos del 6 de octubre](../database/DELIVERY_20261006.md). Esos documentos prevalecen sobre las referencias siguientes a catálogo, recompensas, materiales de pago y despliegue. Conservar esta evidencia no reactiva esas funciones ni acredita que su SQL esté aplicado en producción.

En el cliente actual, Gratis admite seis notas y una pizarra propia; Premium conserva el límite técnico de cien notas por pizarra. Las notas y pizarras históricas no se recortan. La cola offline mantiene las notas ya disponibles y separa las cuentas; los límites nuevos deben quedar verificados también en el servidor mediante las migraciones vigentes. Hay una sola oferta Premium, con compra «Próximamente»; las referencias a productos anteriores describen únicamente compatibilidad de derechos y conciliación histórica.

La copia propia v2 ya incluye adjuntos locales y verifica SHA-256 al restaurarlos. Esto no sincroniza los binarios ordinarios con Supabase. La implementación se describe en [auditoría actual, evidencia local](AUDITORIA_COMPETITIVA_20261006.md#evidencia-local-y-límites-que-evitan-promesas-incorrectas); el respaldo administrativo del servicio es un proceso distinto en [respaldo y restauración](RESPALDO_Y_RESTAURACION.md).

## Lo escrito y probado el 2 de octubre

- `database/designs.sql` es una migración idempotente para catálogo, packs superpuestos, licencias, recompensas, apariencia, estilos y estadísticas. `database/design-catalog-seed.sql` siembra 298 entradas y sus packs; no concede compras. Se conserva la división de las 100 temáticas iniciales en 50 recompensas y 50 Premium, más 3 profesiones y 195 países.
- La racha usa la fecha del servidor en Europe/Madrid y bloqueo de la fila de recompensas. La quinta visita consecutiva concede un crédito; repetir check-in o reclamar lo ya adquirido no gasta ni duplica créditos. No se aceptan fechas del cliente.
- Los derechos históricos `postispop-pro` se reconocen como Premium permanente. La integración de pagos mantiene sus cuatro productos anteriores de pago único; rechaza artículos nuevos. No se han creado precios, suscripciones ni compras simuladas.
- El propietario se vincula administrativamente mediante `postispop_private.bind_owner(UUID)`. El UUID debe pertenecer a la cuenta confirmada `manetala@gmail.com`. Esa función no es ejecutable por clientes; un correo o metadato local no concede privilegios. Los cambios de propietario exigen revisión administrativa; no hay sustitución automática.
- El panel sólo muestra agregados y datos de cuenta. Ser propietario de la aplicación no permite leer notas privadas de otras personas ni eludir su cifrado.
- Estilos tienen revisión propia y escritura con comparación de revisión. Las operaciones de protección y estilo bloquean primero la nota. Un papel de una colección desbloqueada puede utilizarse cuando esa colección está seleccionada; los demás materiales requieren su licencia. Los packs médico/profesiones pueden compartir diseños.
- `offline-sync.js` usa una cola persistente de operaciones, separada por UUID y con una clave distinta para cada operación. El guardado se confirma sólo después de escribir al almacenamiento. Una cuota llena devuelve error, nunca un guardado ficticio.
- Una cuenta debe haberse verificado por red y la pizarra debe haberse abierto en el dispositivo. Después puede editar los espacios ya disponibles y sincronizar al volver la conexión. El ensayo original usaba doce espacios; desde el 6 de octubre las pizarras gratuitas nuevas tienen seis, sin eliminar notas históricas que excedan ese número. Las revisiones del servidor evitan reemplazar silenciosamente cambios de otro dispositivo. Los conflictos conservan las versiones y ofrecen una decisión explícita y un archivo de recuperación.
- La cola no comparte cachés entre cuentas. Las respuestas de red iniciadas antes de cerrar/cambiar sesión se descartan. Cerrar sesión funciona también sin red y no elimina cambios pendientes de esa cuenta.
- Las notas protegidas sólo entran a la cola como sobres cifrados. Al proteger localmente una nota, las ediciones pendientes bloquean la operación. Con consentimiento de retirar versiones anteriores, se borran los estilos y recuperaciones locales de esa nota y se sustituyen las cachés de todas las cuentas de ese dispositivo por la versión cifrada.
- Las licencias offline se obtienen de un recibo ES256 firmado por el servidor. Su vigencia máxima es siete días, limitada por el vencimiento más próximo de las licencias. `license-public-keys.json` permanece vacío hasta configurar la clave pública y desplegar la función correspondiente: actualmente no se conceden derechos offline de pago mediante una casilla local.

## Pruebas ejecutadas

`tests/database-integration.mjs` usa PostgreSQL WASM/PGlite con un esquema de prueba, roles, RLS y cuentas ficticias. Se ejecutaron ambas migraciones dos veces, se sembró el catálogo dos veces y se volvieron a aplicar las migraciones después de crear notas cifradas. Se comprobaron créditos, canjes, denegaciones RLS, Pro histórico, vinculación del propietario, estilo con revisión, papel del tema, eliminación de dibujo sin cifrar, bloqueo de modificaciones heredadas, enlaces cifrados, revocación y ausencia de acceso del administrador a textos privados.

Se ejecutaron también `tests/offline.test.cjs`, `tests/offline-bridge.test.cjs`, `tests/auth-logout.test.cjs` y `tests/commerce.test.cjs`: persistencia, cola ordenada, cuota, conflicto, aislamiento de cuenta, purga al proteger, reintento con respuesta perdida, vuelta de red, cierre de sesión y prohibición de cobros nuevos.

Para repetir la prueba de PostgreSQL sin tocar el servidor:

```sh
npm install --prefix /tmp/postispop-pg-test @electric-sql/pglite --ignore-scripts --no-audit --no-fund
PGLITE_MODULE=/tmp/postispop-pg-test/node_modules/@electric-sql/pglite/dist/index.js node tests/database-integration.mjs
```

## Límites y pasos de despliegue registrados el 2 de octubre

No se ha conectado a Supabase administrativo, exportado su estado real, vinculado el UUID del propietario ni aplicado estas migraciones allí. Las pruebas son locales sobre un esquema de referencia; no sustituyen una validación con el esquema/RLS real ni una prueba multicliente en staging.

Orden previsto en aquella entrega, conservado como historial: comprobar prerrequisitos de `commerce.sql` existentes, aplicar `designs.sql`, `design-catalog-seed.sql` y `protected-notes.sql`, vincular el propietario comprobado, desplegar funciones y verificar con cuentas independientes. **No utilizar esa secuencia como receta de la entrega actual**: seguir el preflight y las migraciones de [entrega de datos del 6 de octubre](../database/DELIVERY_20261006.md). `commerce.sql` heredado no es idempotente: no repetirlo ciegamente en producción.

Crear una cuenta, abrir por primera vez una pizarra, crear una pizarra adicional, compartir por enlace, hacer compras y ver estadísticas requieren Internet. No se ha probado una APK instalada en un teléfono. La persistencia del navegador no es un respaldo externo y puede perderse si el usuario borra los datos de la aplicación; los errores de almacenamiento se muestran.

Proteger una nota en un dispositivo no puede revocar copias previas, capturas o borradores ya descargados en otro dispositivo. Si un borrador offline anterior entra en conflicto con una nota que se protegió remotamente, no se envía ni se superpone como texto a la nota cifrada. Se conserva como una recuperación local anterior a la protección, identificada como no cifrada, hasta que la persona decida qué hacer. El archivo de recuperación estándar tampoco se presenta como archivo cifrado.

La cola usa bloqueos Web Locks cuando están disponibles. En plataformas que no los ofrecen, las revisiones del servidor impiden sobrescrituras y los reintentos pueden aparecer como conflictos revisables. No se afirma una prueba de concurrencia entre dos procesos reales de Supabase sólo por el ensayo WASM.
