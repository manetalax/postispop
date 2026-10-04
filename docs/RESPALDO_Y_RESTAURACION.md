# Respaldo y restauración de PostisPop

Estado del 2 de octubre de 2026: no se ha realizado una exportación administrativa de Supabase ni un ensayo de restauración. El código recuperado y los SQL del repositorio no son una copia de los datos desplegados. Este documento y el script preparan el procedimiento; no certifican un respaldo existente. Proyecto de origen: `htfyjefmviwlgmfqrwue`.

Validación local: sintaxis del script y cuatro pruebas de rechazo (credenciales ausentes, destino/proyecto incorrectos, TLS inseguro e integridad/manifiesto alterados). No se ha comprobado todavía una exportación contra PostgreSQL real; el primer respaldo autorizado debe verificarse y ensayarse según este documento.

## Inventario necesario

| Componente | Qué conservar | Cobertura del script |
|---|---|---|
| PostgreSQL | Esquemas, tablas, datos, secuencias, funciones SQL, triggers, RLS, grants, extensiones y versiones | Archivo lógico completo sin filtros de esquema, sujeto a permisos; falla si PostgreSQL no puede exportarlo |
| Roles | Definiciones y pertenencias; credenciales de roles en custodia separada | `roles.sql`, sin contraseñas de inicio de sesión; se obtiene en una transacción distinta |
| Auth | Tablas de usuarios e identidades, UUID, hashes y metadatos | Incluidas en la base; no exporta configuración del servicio ni garantiza sesiones portables |
| Storage | Buckets/configuración, permisos, metadatos **y cada archivo binario** | Solo metadatos SQL; faltan todos los binarios |
| Edge Functions | Lista desplegada, versiones, fuente real, dependencias, import maps, configuración y JWT | No exportadas; los archivos locales no prueban lo desplegado |
| Configuración | Proveedores OAuth, redirects, SMTP, plantillas, límites, dominios, Realtime, webhooks, cron, extensiones | Inventario administrativo pendiente; revisar también configuraciones externas |
| Secretos y cifrado | Secretos de Functions, OAuth, pagos, SMTP, claves de cifrado/Vault y Android | Custodia cifrada separada; nunca incluirlos en el repositorio ni en capturas |
| GitHub y web | Git completo con ramas/etiquetas, cambios locales, LFS/submódulos si existen, assets y manifiesto | Fuera del alcance del script |
| Servicios de GitHub | Issues/PR, ajustes, workflows, artefactos, permisos, secrets | No quedan incluidos por clonar Git; requieren inventario separado |
| Servicios externos | DNS, alojamiento, pagos/webhooks, Google/OAuth, clave Android original | No incluidos; no cambiar identidades ni credenciales para obtener acceso |

## Exportación autorizada de base de datos

Requisitos: Node.js, herramientas `pg_dump`, `pg_dumpall` y `pg_restore` compatibles con la versión del servidor, credencial PostgreSQL administrativa existente y conexión autorizada. Reservar espacio suficiente en un directorio privado fuera del repositorio. Una clave pública `anon` no sirve. No restablecer contraseñas ni usar el pooler de transacciones.

El operador inyecta `SUPABASE_DB_URL` desde su gestor de secretos, sin pegarla en el chat, archivos del proyecto o línea de comandos. Debe ser la conexión directa del proyecto o el Session pooler, puerto 5432, base `postgres`. Se verifica la referencia del proyecto y se exige TLS `verify-full`. Si corresponde, suministrar `PGSSLROOTCERT` apuntando al certificado CA oficial verificado. No rebajar TLS para resolver un error.

Con autorización administrativa ya concedida, establecer `POSTISPOP_BACKUP_AUTHORIZED=1` en ese entorno y ejecutar:

```sh
node scripts/backup-supabase.mjs --output /ruta/privada/postispop-20261002
node scripts/backup-supabase.mjs --verify /ruta/privada/postispop-20261002
```

La carpeta padre debe existir y el destino debe ser nuevo. El script no modifica tablas ni restaura nada; utiliza sesiones de solo lectura. No muestra la URL, contraseñas ni diagnósticos privados de PostgreSQL. Las credenciales solo se transmiten al proceso PostgreSQL mediante su entorno. No ejecutar en una máquina multiusuario no confiable.

Produce `database.dump`, `roles.sql`, `database.toc` y `manifest.json`. Comprueba presencia de datos para `auth.users`, `auth.identities`, `storage.buckets` y `storage.objects` en el índice del archivo; esto no valida todos los datos ni su uso real. Rechaza salidas vacías y no reemplaza respaldos existentes. Un error elimina únicamente la carpeta temporal creada por esa ejecución. Una interrupción abrupta puede dejar `.postispop-backup-partial-*`: tratarla como confidencial e incompleta.

Los permisos locales son restrictivos, pero los archivos **no están cifrados** y contienen datos privados; pueden contener secretos almacenados en SQL. Cifrarlos con el sistema aprobado del propietario antes de transferirlos o conservarlos fuera del equipo. Guardar la clave de descifrado separadamente. La exclusión de contraseñas de roles no elimina hashes de usuarios Auth ni otros secretos que existan en tablas.

`--verify` recalcula tamaño y SHA-256, rechaza enlaces/archivos no inventariados y comprueba que `pg_restore` reconoce el archivo. La verificación no contacta con Supabase. El manifiesto acredita integridad si su copia de referencia es confiable; no aporta firma ni prueba de autenticidad. Mantener una copia del manifiesto en ubicación independiente y registrar su hash mediante el sistema de custodia elegido.

## Completar el resto de Supabase

1. Con acceso autorizado, inventariar cada bucket y descargar todos los objetos, incluidos privados, paginando hasta agotar resultados. Guardar bucket, clave exacta, tamaño, MIME y SHA-256 por archivo. Comparar totales y verificar hashes al restaurar. Un directorio vacío no acredita un bucket vacío.
2. Obtener un inventario del despliegue de Edge Functions y descargar cada función. Conservar también dependencias y configuración desde las fuentes verificadas; una descarga de función puede omitir archivos auxiliares. Registrar nombres/versiones y hashes, sin publicar secretos.
3. Exportar o documentar la configuración de Auth/proveedores, redirects, SMTP, dominios, Realtime y demás servicios. Inventariar **nombres y referencias de custodia** de secretos, nunca sus valores en el informe. Si un valor no se puede recuperar, declararlo pendiente; no rotarlo por iniciativa propia.
4. Si se emplean Vault o cifrado de columnas, comprobar cómo preservar las claves necesarias antes de dar la restauración por viable. Las claves de la nota protegida o contraseñas del usuario no aparecen por arte de magia en el respaldo.
5. Coordinar una ventana coherente entre base, archivos y configuración: el volcado SQL tiene su propio snapshot; Storage/roles/Functions no comparten ese instante. Registrar inicio/fin y reconciliar cambios durante la copia. Sin esa conciliación no existe una copia exacta de todo el servicio.
6. Añadir todos los componentes al manifiesto ampliado con hashes/tamaños, cobertura y fecha. El verificador actual solo admite sus tres archivos de exportación; para el paquete ampliado utilizar un manifiesto independiente que cubra cada componente.

## Ensayo de recuperación aislado

Crear un proyecto de prueba autorizado, con referencia diferente al origen, misma compatibilidad de PostgreSQL/extensiones y sin usuarios reales accediendo. No usar `--clean` ni importar archivos sobre producción. Desactivar tráfico de pago, correos, tareas y webhooks en el **destino** hasta revisar sus configuraciones; nunca disparar acciones externas al importar datos.

Comparar primero inventarios de esquemas/roles gestionados. El archivo bruto de `pg_dump` conserva objetos administrados por Supabase y no es un instalador directo para un proyecto nuevo: hay que preparar una selección de restauración compatible, siguiendo la guía oficial y revisando diferencias. No ignorar errores, eliminar RLS ni conceder privilegios globales para que una importación termine. Preservar UUID, licencias y relaciones existentes.

Restaurar en orden controlado: configuración compatible y roles revisados; esquema de la aplicación; datos/Auth; secuencias, constraints, permisos y políticas; binarios de Storage y configuración de buckets; funciones/configuración externa revisada. No restaurar contraseñas de roles inventadas. Registrar exactamente cualquier ajuste respecto del archivo original.

Validar como mínimo: recuentos por tabla, claves foráneas, propietarios/UUID, usuarios de prueba, RLS de anónimo/usuario/propietario, compras y créditos sin duplicaciones, hashes de cada objeto Storage, Functions y recuperación de una nota protegida con la contraseña correcta. Probar que otra cuenta no lee notas ajenas. No usar correos ni pagos reales para estas pruebas.

Registrar proyecto destino, versiones, fecha, hashes de entrada, pruebas, incidencias y resultado. **Solo después** se puede describir qué componentes son recuperables. La inspección del índice no es una restauración probada. Cambiar DNS o sustituir producción requiere un plan específico de corte y reversión, separado de este ensayo.

## Referencias oficiales consultadas el 2 de octubre de 2026

- [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups): los objetos binarios de Storage se respaldan separadamente.
- [Supabase: Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore): compatibilidad de restore, Auth/Storage, Functions y cifrado.
- [PostgreSQL: pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) y [pg_dumpall](https://www.postgresql.org/docs/current/app-pg-dumpall.html): archivo lógico y exportación de roles.
