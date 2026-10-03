# Importación de copias a una cuenta

## Estado

Implementación candidata validada en PostgreSQL embebido (PGlite), sin aplicar en Supabase de producción. La prueba usa un esquema base representativo, no una exportación verificada del esquema real. Aplicar `database/board-import.sql` solamente después de revisar ese esquema, obtener su respaldo y probar en staging. Requiere `commerce.sql`, `designs.sql` y `protected-notes.sql`.

## Contrato

RPC `postispop_import_board(p_board_id uuid, p_request_id uuid, p_notes jsonb, p_excluded_note_ids uuid[] default '{}')`.

Cada nota admite exclusivamente `text`, `marks`, `paper`, `doodle`, `image`, `style`, `protectedEnvelope`. No acepta IDs, autor, permisos ni revisiones del archivo. `image` es `null` o `{ "url": "https://…" }`; se admiten URL HTTP/HTTPS de hasta 2.048 caracteres. Los adjuntos locales de IndexedDB no se transfieren a la nube. `style` admite `font`, `size` entera, `italic`, `underline`, `ink`, `paper`, `drawing`; sus derechos se comprueban con las funciones existentes de licencias y materiales. Un sobre cifrado válido sólo puede acompañarse de metadatos vacíos o de la etiqueta `Nota protegida`.

Máximo 100 entradas y 24 MiB de JSON; texto de hasta 10.000 unidades UTF-16, marcas dentro de ese texto, color de nota 0–5. Los espacios se conservan como contenido. Las entradas completamente vacías se validan y omiten. Los dibujos y las notas cifradas se conservan. Un fallo en cualquier entrada impide toda la importación.

Respuesta de ejemplo:

```json
{"ok":true,"requestId":"UUID de la petición","imported":2,"noteIds":["UUID destino 1","UUID destino 2"],"replayed":false}
```

La misma cuenta, pizarra, petición UUID y contenido JSON canónico devuelven el recibo original con `replayed:true`. Un contenido diferente con la misma petición falla con `IDEMPOTENCY_CONFLICT`. La huella no incluye las exclusiones: éstas sólo restringen el primer intento que se confirma, para que una respuesta perdida pueda recuperarse aunque cambien las reservas locales. El cliente debe conservar UUID y payload hasta saber si la operación se confirmó; no crear una petición nueva automáticamente después de un error de red.

## Conservación y permisos

Sólo el propietario real de la pizarra puede importar. El administrador de la aplicación no obtiene acceso a pizarras ajenas. La capacidad de esta importación por pizarra es 7 notas ocupadas para una cuenta gratuita y 100 con `postispop_has_license('premium')`, que reconoce las licencias vigentes, Pro histórico y al propietario verificado de la aplicación. No se conceden derechos a partir del respaldo.

Se reutilizan únicamente filas de notas ya existentes y vacías. Texto, marcas, doodle, imagen, sobre cifrado o trazos de cualquier autor reservan la nota. Se excluyen los bloqueos de edición futuros y los IDs de `p_excluded_note_ids` —útiles para adjuntos y reservas protegidas locales—. No se crean nuevos slots; una pizarra con 12 filas sólo dispone de esas 12 posiciones aunque la cuenta sea Premium. Se reemplaza el formato sin contenido del slot seleccionado, incrementando las revisiones de nota y estilo para rechazar editores obsoletos.

La fila de pizarra serializa las importaciones, y todas sus notas existentes se bloquean en orden estable antes de comprobar capacidad o escribir. Las escrituras de nota y los RPC existentes de estilo/cifrado usan esos mismos bloqueos. Notas, estilos, revisión de pizarra y recibo se confirman en una transacción. La tabla privada de recibos guarda huella, IDs y cantidades, sin copiar texto ni sobres cifrados, y no está accesible a `anon`/`authenticated`.

Esta RPC limita sus propias importaciones: no sustituye las políticas de las rutas antiguas de escritura, ni detecta adjuntos locales de otros dispositivos. Los cambios concurrentes en la composición de la pizarra (insertar/eliminar filas directamente) requieren verificación de las políticas y triggers reales en staging. El orden de bloqueos de rutinas externas puede causar un conflicto/deadlock transitorio; PostgreSQL revierte la petición entera y se reintenta con el mismo UUID.

## Errores relevantes

| Mensaje | Significado |
|---|---|
| `SESSION_REQUIRED` | Falta identidad autenticada. |
| `OWNER_REQUIRED` | La pizarra no existe o pertenece a otra cuenta. |
| `INVALID_BACKUP` / `INVALID_STYLE` / `INVALID_ENVELOPE` | Contenido o estructura inválidos. |
| `STYLE_LOCKED` | La cuenta no tiene el derecho requerido. |
| `PROTECTED_NOTE_REQUIRES_ENCRYPTION` | Un sobre cifrado va acompañado de contenido abierto. |
| `BOARD_FULL` | Se excede el límite o no quedan suficientes slots disponibles. |
| `IDEMPOTENCY_CONFLICT` | El UUID ya se confirmó con otro contenido. |

## Prueba reproducible

```sh
PGLITE_MODULE=/ruta/a/@electric-sql/pglite/dist/index.js node tests/database-integration.mjs
```

La integración aplica la migración varias veces y comprueba conservación, validación completa, permisos, límites 7/100, derechos caducados/revocados, estilos con revisión, notas cifradas, marcas UTF-16, exclusiones, locks y reintentos. PGlite usa una sesión: no demuestra contención real entre dos conexiones. Antes de producción, ejecutar en staging dos importaciones simultáneas de los últimos slots, un retry simultáneo de la misma petición y un guardado de estilo/texto concurrente, y confirmar que no hay sobrescrituras ni duplicados.


## Integración de la interfaz

`backup-import.js` normaliza copias y valida toda la entrada antes de enviar. `board-tools.js` muestra una vista previa y envía una sola operación; `supabase-bridge.js` comprueba identidad, propietario, sincronización pendiente, adjuntos del dispositivo y disponibilidad de la RPC. No hay fallback a escrituras nota por nota.

El UUID pendiente se conserva por cuenta, pizarra y huella. Web Locks coordina su creación entre pestañas; una marca temporal conserva el mismo UUID para peticiones simultáneas iniciadas antes de la confirmación. Un envío deliberado posterior recibe otro UUID. La marca de finalización sólo se escribe tras la confirmación del servidor; errores de red conservan el reintento. No se guarda texto en este registro.

Prueba de interfaz: `npm run test:cloud-import`, después de construir `_site`. Usa módulos reales y Supabase simulado; no prueba acceso a producción. La prueba de reapertura offline real es `npm run test:offline-shell`.
