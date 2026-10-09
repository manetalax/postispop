# Pagos y pizarras compartidas — 9 de octubre de 2026

Repositorio: https://github.com/manetalax/postispop, rama main.
Supabase: htfyjefmviwlgmfqrwue (PostisPop Auth).

## Pagos actuales
GET /functions/v1/postispop-commerce/status devuelve checkoutReady: true.
Las cuatro tarifas activas son 2,95 €/mes, 5,95 €/trimestre, 19,95 €/año y 59,95 € vitalicio.
Los productos antiguos están inactivos.
Código: functions/postispop-commerce/index.ts; interfaz: atelier-checkout.js.
La comprobación de configuración no demuestra todavía cobro real, recepción del webhook y concesión de Premium de extremo a extremo. No realizar un cargo de prueba sin autorización específica.

## Situación de colaboración
supabase-bridge.js carga boards y board_members; las políticas de producción permiten leer a propietario y miembros.
postispop_private.can_access_note permite actualmente las mismas operaciones a cualquier miembro: no distingue lectura y edición.
share-tools.js comparte texto y archivos mediante WhatsApp/hoja de compartir: no concede acceso a una pizarra.
No existe en el puente un flujo completo de invitación, aceptación y revocación de miembros.

## Integración propuesta
1. Invitaciones creadas solo por el propietario, con token aleatorio cuyo hash se guarda en servidor, caducidad y revocación.
2. Aceptación con cuenta iniciada; nunca incluir contraseñas ni credenciales en el enlace.
3. Roles lector y editor. Separar permisos SELECT de INSERT/UPDATE/DELETE mediante RLS; solo el propietario administra miembros y elimina la pizarra.
4. Panel Compartir pizarra: crear enlace, seleccionar rol, mostrar colaboradores y retirar acceso. Compartir el enlace con la hoja nativa o WhatsApp únicamente al pulsar el usuario.
5. Usar revisiones de notas para detectar conflictos; evitar sobrescribir silenciosamente cambios simultáneos. Evaluar Realtime después de comprobar publicación y políticas.
6. Las notas cifradas mantienen su contraseña; la invitación no descifra contenido ni transmite contraseñas. Revisar el almacenamiento de adjuntos: los binarios locales actuales no se sincronizan automáticamente entre colaboradores.
7. Las reglas de prueba/Premium se calculan según el propietario de la pizarra, igual que la función actual; explicar límites a los colaboradores.
8. Traducir toda la interfaz a es, en, de, fr, pt, it, ja y ko; mantener web y Android coherentes.
9. Verificar con dos cuentas lector/editor, acceso ajeno denegado, invitación caducada, retirada de acceso, conflictos y notas cifradas antes de desplegar.

Archivos principales: supabase-bridge.js, board-preferences.js, share-tools.js, offline-sync.js, protected-notes.js, database/.
Este documento es un estudio de integración; el flujo colaborativo descrito aún no está implementado.
