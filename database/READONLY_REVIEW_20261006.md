# Revisión de Supabase: 6 de octubre de 2026

## Resultado observado

Se abrió una pestaña propia del proyecto y su editor SQL usando la sesión ya autenticada del navegador. No se leyeron credenciales, cookies, notas, correos ni registros de usuarios. No se llamó a APIs desde scripts ni se ejecutaron instrucciones de modificación.

El resumen del proyecto permaneció en `Checking…`, con `Compute Unknown`. `Connect`, Table Editor, SQL Editor, Database y Authentication aparecieron deshabilitados. La ruta del editor SQL sí permitió escribir, pero Run no produjo resultados ni un error: el panel siguió mostrando `Click Run to execute your query`. Ocurrió tanto con un inventario de metadatos como con `select 1 as readonly_connection_check;`, después de una única recarga.

Por tanto, **no se obtuvo el DDL real ni se puede afirmar qué migraciones están instaladas**. La pestaña se conserva para continuar; no se hicieron más reintentos. La falta de carga no se clasificó como bloqueo de bots.

La captura de observación del panel queda en el historial de la revisión. No se exportó a archivo: la revisión automática de permisos rechazó la lectura de la documentación empaquetada necesaria para exportar archivos del navegador, alegando sensibilidad indeterminada. No se intentó eludir ese rechazo.

## Condiciones necesarias antes de publicar las funciones nuevas

1. Obtener resultados SQL reales. Ejecutar `six-notes-preflight.sql`, añadiendo inventario de columnas, valores por defecto, extensiones y funciones instaladas. Consultar exclusivamente metadatos y, si hicieran falta, recuentos agregados.
2. Revisar las funciones de los triggers de alta de usuario y de pizarra. El alta Gratis debe ser compatible con seis notas. `postispop_create_board` ya siembra sus propias notas; un trigger adicional no debe duplicar ese sembrado.
3. Revisar RLS de pizarras, notas, miembros y estilos; restricciones e índices de posición; permisos de las RPC; firma del helper `can_access_note`; y la representación real de papelera y licencias. Comparar las definiciones antes de reemplazarlas.
4. Si existe pg_cron, inspeccionar sus tareas para detectar purgas/caducidad antiguas. La nueva oferta no anuncia borrado de la pizarra Gratis. No desactivar trabajos por su nombre sin revisar su función.
5. Restaurar una copia en un entorno de staging autorizado y reproducir localmente las definiciones relevantes. Las pruebas actuales de PGlite usan una base sintética explícita y no sustituyen esta comprobación.
6. Verificar primero las dependencias existentes de comercio, diseños, notas protegidas y ciclo de vida. Aplicar solo los cambios que falten. Orden previsto de los candidatos nuevos: `simple-note-limits.sql`, `free-editor-tools.sql`, `board-import.sql`, `board-swap.sql`, `board-create.sql`.
7. En staging, comprobar alta, seis notas Gratis, doce iniciales Premium, licencias caducadas/revocadas, RLS entre cuentas, notas compartidas, restauración sin pérdida y creación concurrente en dos conexiones. Forzar un error de sembrado y verificar que no queden pizarra, notas ni recibo parciales. Probar repetición tras perder la respuesta.
8. Solo después de esas comprobaciones y del respaldo revisable, coordinar la activación del SQL y la web. La versión nueva rechaza creación, importación o intercambio cuando falta su RPC; nunca vuelve a escrituras parciales ni finge éxito.

No se ha aplicado ninguna migración a producción durante esta revisión. Sin DDL y resultados reales, el paso de publicación de las funciones cloud sigue pendiente.
