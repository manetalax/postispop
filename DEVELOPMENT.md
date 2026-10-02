# Desarrollo y continuidad de PostisPop

El código fuente debe permanecer legible, editable y versionado en este repositorio. Las protecciones de producción se aplican a artefactos de salida y nunca sustituyen los archivos fuente. Este requisito permite continuar el trabajo con otros asistentes y desarrolladores.

- R8 optimiza y renombra el código nativo únicamente al compilar `release`. Los archivos Java y Gradle originales permanecen intactos y legibles.
- No añadir ofuscadores agresivos al JavaScript de la web, bloqueos del inspector, trampas anti-depuración ni código auto-modificable. Mantener el rendimiento y la accesibilidad.
- Los módulos nuevos se conservan sin minificar en el repositorio. Parte de la pizarra heredada está recuperada en `_next/static/chunks`; no afirmar que ese código compilado equivale al proyecto fuente original.
- Mantener mapas de R8 y mapas de fuentes de producción en copias privadas para diagnosticar fallos, sin publicarlos junto a las descargas.
- Validar acceso de pago, recompensas y administración en servidor. Ocultar botones y ofuscar código no son controles de autorización.
- No guardar claves de firma, contraseñas, tokens ni credenciales privadas en este repositorio o en el cliente.

## Módulos de esta ampliación

- `design-catalog.js`: catálogo temático y por países, renderizado de vistas previas y papeles.
- `atelier.html`, `atelier.css`, `atelier.js`: explorador visual de colecciones.
- `design-tools.js`, `design-tools.css`: aplicación de estilos y herramientas de notas.
- `database/designs.sql`: migración de permisos, recompensas y funciones privadas del propietario. Requiere revisión y aplicación en Supabase; crear el archivo no equivale a desplegarlo.
- `supabase-bridge.js`: integración autenticada con las operaciones del servidor.

## Validación

Ejecutar `npm test`, `npm run lint`, `npm run build`, `node scripts/stage-site.mjs` y las pruebas de navegador pertinentes. Para Android, verificar la compilación `release`, su firma y su instalación antes de publicar una APK. Registrar por separado lo implementado, lo probado y lo desplegado.

El precio, la periodicidad de Premium y los importes de compras individuales necesitan configuración explícita: no convertir los productos antiguos de pago único en suscripciones ni simular cobros.

## Continuidad de la sesión del 2 de octubre, 19:45 Madrid

- GitHub Actions compiló la rama release/complete-web-20261002, commit 80bdc44918f2c4378cc58f682323bc4fa1aad51f: https://github.com/manetalax/postispop/actions/runs/37042230901. Resultado: Success, artefacto unsigned de 20,7 MB. La descarga al entorno no se completó; no hay APK firmada entregada.
- El control de permisos rechazó la subida de los archivos Android modificados. No intentar eludir esa negativa con otra interfaz. R8 sigue solo en el checkpoint local; no está en ese artefacto remoto.
- La clave de firma de producción se creó y verificó; su ZIP y contraseña se conservaron como archivos privados fuera del repositorio. No sustituye la identidad de la beta anterior.
- Nueva idea solicitada: contraseña individual de al menos cuatro caracteres (letras, números o símbolos); apariencia de nota encerrada con rejas/candado; compartir enlace por WhatsApp y pedir contraseña al destinatario. Contenido cifrado y contraseña fuera del enlace. Requisito confirmado explícitamente en el documento de continuidad del 2 de octubre: implementar contraseña individual y compartición cifrada. Esa confirmación posterior resuelve la frase ambigua anterior.
- El usuario solicita avances frecuentes durante el trabajo. Las automatizaciones no admiten una frecuencia de tres minutos; dar actualizaciones durante la sesión activa.

## Prioridad confirmada: Premium completo antes de entregar Android

El usuario ha pedido terminar primero el diseño Premium, la tienda visual y las colecciones; la APK de prueba que se entregue debe contener esos recursos, no solo la base compilada previamente. Orden de trabajo: diseños y vistas previas completas; integración de herramientas/desbloqueos; persistencia local y recursos incluidos; pruebas en modo avión; compilación y firma.

- Incluir físicamente dentro de la APK las pizarras, las banderas, los adornos, las miniaturas, los papeles, las fuentes y las herramientas. No depender de CDN para usar contenido instalado.
- Catálogo inicial: 50 diseños de recompensa, 50 Premium, más colecciones por países. Los registros del catálogo todavía no equivalen a diseños terminados.
- Permitir crear, editar y conservar notas sin conexión; la sincronización requiere diseñar una cola persistente y resolver conflictos sin pérdida de datos.
- Compras, primer acceso a la cuenta, sincronización y estadísticas del servidor requieren conexión. Los derechos adquiridos necesitan validación en línea y una política de uso local documentada. No simular pagos ni conceder Premium mediante un indicador local editable.
- La compilación Android existente no contiene la ampliación completa y no debe presentarse como la entrega solicitada.
