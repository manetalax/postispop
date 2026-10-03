# Recibos de derechos sin conexión

Los derechos de pago sin conexión se verifican con una firma ES256. Editar un valor de `localStorage` no concede Premium: el cliente comprueba firma, emisor, audiencia, UUID de cuenta, fecha y duración máxima. La clave privada pertenece exclusivamente a la función del servidor. No es la clave de firma de Android.

## Estado actual

Se ha implementado y probado la verificación local y su integración con la cola. La función `functions/postispop-offline-license/index.ts` está preparada, pero no desplegada. `license-public-keys.json` contiene `{}`; mientras siga así, la aplicación no concede derechos de pago sin conexión. Las notas estándar de invitado y la cola de cuentas previamente verificadas no dependen de esta activación.

## Configuración administrativa pendiente

1. Hacer y verificar el respaldo real de Supabase y validar las migraciones con su esquema en staging. Aplicar `database/designs.sql` y su semilla mediante el proceso de despliegue revisado.
2. Crear una clave de recibos ECDSA P-256 en un entorno administrativo seguro. Conservar su parte privada JWK fuera del repositorio, artefactos públicos y registros. Asignar un identificador de versión estable.
3. Configurar en la función `POSTISPOP_LICENSE_PRIVATE_JWK` y `POSTISPOP_LICENSE_KID`. Las variables Supabase estándar deben estar presentes. El servidor consulta los derechos de la cuenta autenticada; no acepta una lista de derechos enviada por el cliente.
4. Añadir únicamente la JWK pública al objeto `license-public-keys.json`, bajo el mismo identificador. La parte pública tiene `kty`, `crv`, `x` e `y`; nunca `d`. Empaquetar esa versión tanto en web como en Android.
5. Desplegar la función y comprobar con cuentas independientes: acceso válido, otra cuenta, firma alterada, vencimiento, licencia temporal que vence antes de siete días, cierre/cambio de sesión y regreso de la red.

La vigencia máxima de cada recibo es de siete días y nunca supera el vencimiento de los derechos que lo originan. Después hay que volver a conectarse para renovar. Una revocación administrativa no puede invalidar inmediatamente un recibo ya descargado en un dispositivo sin conexión; su vencimiento limita ese intervalo. El reloj local interviene en la comprobación offline: un cliente bajo control de su propietario no ofrece protección anticopia absoluta.

Al rotar claves, distribuir primero la clave pública nueva. Conservar temporalmente la anterior permite verificar recibos ya emitidos hasta su vencimiento; eliminarla los invalida en clientes actualizados. No rotar ni sustituir la clave Android para esta operación.

## Pruebas reproducibles

`node --test tests/offline-license.test.cjs` verifica firma, identidad de cuenta, alteración del contenido, clave desconocida y duración/vencimiento. Son pruebas locales; no acreditan configuración de producción.
