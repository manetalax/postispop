# Capacidad y propuesta de planes

Límite estándar: 10.000.000 bytes por nota, sumando texto UTF-8, dibujos, metadatos y todos los archivos almacenados. Base64 de transporte no se cobra como contenido duplicado. Por instrucción explícita posterior del usuario, las notas existentes mayores se eliminan y ninguna escritura puede superar 10 MB. La nube se comprueba al aplicar la migración; los archivos privados de dispositivos se comprueban al abrir su pizarra. El servidor de copias cifradas impone además 14 MB de transporte, para admitir base64 sin inspeccionar contenido privado; el límite lógico de 10 MB se comprueba en el cliente. Las notas protegidas conservan además sus límites de cifrado actuales, inferiores a 10 MB.

## Propuesta comercial, todavía sin cobros nuevos

| Oferta | Máximo por nota | Espacio de archivos por cuenta | Precio mensual propuesto |
| --- | ---: | ---: | ---: |
| Premium actual | 10 MB | Por definir antes de vender almacenamiento permanente | 2,95 € (actual) |
| Plus | 25 MB | 2 GB | 4,95 € |
| Max | 50 MB | 10 GB | 9,95 € |

Plus y Max serían planes completos que incluyen Premium, no suplementos acumulativos. Mantener el máximo actual de 100 notas. Estos precios son propuestas: no hay nuevos productos Stripe ni derechos de capacidad concedidos por el navegador. Activarlos requiere aceptar precios y desarrollar cuotas totales verificadas en servidor y renovación/cancelación. No ofrecer almacenamiento ampliado de por vida: sus costes siguen cada mes. Las copias compartidas caducan en siete días; no equivalen a almacenamiento permanente en la nube. Tras una bajada de plan, respetar la política de tamaño acordada y desarrollar avisos de cambio de cuota antes de activar los planes.

## Hosting recomendado

Mantener la web en GitHub Pages y Supabase para cuentas, base de datos y archivos. Actualmente organización Free: archivos 1 GB y base de datos 500 MB. Comprobación del 11 de octubre: archivos 367.907 bytes; base de datos 17.255.571 bytes (incluye estructuras e índices).

Pasar a Supabase Pro cuando se necesiten capacidad y servicio de producción: desde 25 USD/mes, 100 GB de archivos, disco de base de datos de 8 GB y 250 GB de tráfico de salida incluidos. El exceso de archivos cuesta 0,0213 USD/GB/mes. Vigilar también tráfico y cuotas de operaciones, no solamente espacio. Las copias de base de datos no sustituyen copias independientes de los archivos.

Si el vídeo crece mucho, estudiar Cloudflare R2 para archivos: almacenamiento estándar 0,015 USD/GB/mes, salida directa gratuita, operaciones facturadas por separado. Requiere integrar autorizaciones, subida, caducidad, migración y copias. Por ahora Supabase evita ese trabajo.

No montar un servidor propio todavía: obliga a mantener sistema, seguridad, disponibilidad y copias; el aumento actual de capacidad se resuelve ampliando servicio gestionado. Revisar esta decisión con uso real y costes mensuales.

Fuentes: https://supabase.com/pricing · https://supabase.com/docs/guides/storage/pricing · https://developers.cloudflare.com/r2/pricing/

## Alerta activa

Automatización de este chat `capacidad-de-postispop-al-80`, cada seis horas, consulta agregados de archivos y base de datos. Avisa al 80 %, 90 % y 95 %; ajusta cuotas si cambia el plan y evita repetir el mismo aviso. Depende de la ejecución local de Codex y de conexión a Supabase; no es un monitor externo permanente cuando el equipo está apagado.
