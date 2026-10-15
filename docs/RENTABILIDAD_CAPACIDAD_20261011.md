# Rentabilidad de capacidad · 11 de octubre de 2026

Ultra preparado: 100 MB decimales por nota, 100 notas, 10 GB por cuenta y 19,90 €/mes, exactamente el doble de Max. Se añade al catálogo de propuestas; no activa cobros ni cambia el límite publicado de 10 MB. Antes de activarlo hay que sustituir el límite global y el borrado por cuotas verificadas según el plan, ampliar subida/cifrado/importación y probarlos.

## Todas las notas llenas

Supuesto conservador: todos los archivos se alojan en nube durante todo el mes, aunque hoy buena parte de los adjuntos permanece solamente en el dispositivo. Se cuentan las 100 notas activas permitidas en los planes de pago. No se presupone ahorro por compresión.

| Plan | €/mes | MB/nota | GB con 100 notas llenas | IDrive variable $/mes | R2 variable $/mes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Premium | 2.95 | 10 | 1 | 0.0060 | 0.0150 |
| Plus | 4.95 | 25 | 2.5 | 0.0150 | 0.0375 |
| Max | 9.95 | 50 | 5 | 0.0300 | 0.0750 |
| Ultra | 19.90 | 100 | 10 | 0.0600 | 0.1500 |

Las cifras de almacenamiento son marginales por usuario, no la factura completa de un proveedor. Plus se ajusta a 2,5 GB: 2 GB solo permitían llenar 80 notas. Max mantiene su cuota propuesta de 10 GB, aunque 100 notas de 50 MB solo pueden contener 5 GB activos. Ultra necesita 10 GB activos.

## Proveedores verificados

- IDrive e2 estándar: 6 USD/TB/mes, mínimo facturado de 1 TB (6 USD/mes). API sin cargos adicionales; salida gratuita hasta tres veces el volumen almacenado, después 0,01 USD/GB. Es el menor precio mensual de almacenamiento entre los servicios S3 con tarifas verificadas en esta comparación. La opción anual de 1 TB cuesta 59,50 USD/año a tarifa normal, equivalente a 4,96 USD/mes; el descuento de primer año no se utiliza para justificar rentabilidad recurrente. Las reservas anuales tienen escalones y exigen pagar capacidad por adelantado. [Fuente](https://www.idrive.com/s3-storage-e2/pricing).
- Backblaze B2: 6,95 USD/TB/mes, primeros 10 GB gratis, salida gratuita hasta tres veces el almacenamiento y después 0,01 USD/GB. Puede ser más barato para empezar con poca capacidad porque no tiene el mínimo de 1 TB de IDrive. [Fuente](https://www.backblaze.com/cloud-storage/pricing).
- Cloudflare R2 Standard: 0,015 USD/GB/mes y salida directa gratuita; operaciones A 4,50 USD/millón y B 0,36 USD/millón, antes de franquicias. Cuesta más por espacio, pero reduce el riesgo económico de vídeos muy compartidos. [Fuente](https://developers.cloudflare.com/r2/pricing/).
- Storj Standard: 7 USD/TB/mes de almacenamiento y 7 USD/TB de salida, mínimo mensual de 5 USD y retención facturable mínima de 30 días. No mejora el precio de espacio de IDrive y esa retención penaliza copias compartidas de siete días. [Fuente](https://www.storj.io/pricing/).
- Supabase Pro desde 25 USD/mes: 100 GB de archivos y 250 GB de salida incluidos; exceso de archivos 0,0213 USD/GB/mes y salida no cacheada 0,09 USD/GB. Para el modelo externo se reserva su base de 25 USD como cuentas/base de datos/servicio; el escalado de cómputo se presupuestaría aparte. [Fuente](https://supabase.com/pricing).

Hetzner Storage Box es un producto de copias con protocolos de archivos; requeriría una capa adicional para servir la aplicación. No equivale a sustituir directamente un almacén S3. Sus precios y los de Object Storage no quedaron legibles en la página oficial consultada, así que no se presentan cifras antiguas como actuales. No se afirma haber encontrado el proveedor más barato de todo el mercado.

## Prueba de estrés: copias y transporte

Reservar tres copias del contenido (original, copia independiente y una copia compartida simultánea), multiplicadas por 1,4 para metadatos/base64/holgura: 4,2 veces el contenido activo. Es un presupuesto conservador, no una medida del uso actual. Ultra lleno pasa de 10 a 42 GB físicos presupuestados. No cubre historial ilimitado ni un número ilimitado de copias compartidas.

Supuestos para comparar euros y dólares: 1 USD = 1 EUR únicamente como escenario de cálculo, no como tipo de cambio vigente. Precio de venta con IVA supuesto del 21 %; tarjeta estándar EEE de Stripe 1,5 % + 0,25 €, más Billing 0,7 %. Ingreso disponible = PVP/1,21 − PVP×0,022 − 0,25. El IVA aplicable depende del cliente y las tarjetas internacionales pueden costar más. [IVA general](https://www3.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/tipos-impositivos-iva.html) · [Stripe](https://stripe.com/es/pricing).

| Plan | Disponible después del IVA y Stripe supuesto | GB físicos presupuestados | IDrive variable $/mes | R2 variable $/mes |
| --- | ---: | ---: | ---: | ---: |
| Premium | 2.12 € | 4.2 | 0.025 | 0.063 |
| Plus | 3.73 € | 10.5 | 0.063 | 0.158 |
| Max | 7.75 € | 21 | 0.126 | 0.315 |
| Ultra | 15.76 € | 42 | 0.252 | 0.630 |

## Escala de Ultra con todos los usuarios al máximo

| Usuarios Ultra | Ingresos brutos €/mes | Espacio activo | Espacio físico presupuestado | IDrive + base backend $/mes | Margen tras IVA/Stripe y esos servicios, paridad supuesta |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 19.90 | 10 GB | 42 GB | 31.00 | -15.24 € |
| 10 | 199.00 | 100 GB | 420 GB | 31.00 | 126.59 € |
| 100 | 1,990.00 | 1000 GB | 4200 GB | 50.20 | 1,525.65 € |
| 1,000 | 19,900.00 | 10000 GB | 42000 GB | 277.00 | 15,481.50 € |
| 10,000 | 199,000.00 | 100000 GB | 420000 GB | 2,545.00 | 155,040.00 € |

Estos márgenes no son beneficio neto: faltan soporte, desarrollo, cómputo adicional, impuestos sobre beneficios, devoluciones, impagos, operaciones y tráfico que exceda franquicias. Un único cliente Ultra no cubre una base mensual de 31 USD; dos la cubrirían muy ajustadamente con los supuestos anteriores, antes de cualquier otro coste. No se garantiza que una instancia mínima soporte miles de usuarios concurrentes.

## El tamaño no limita cuántas veces se descarga

Una cuenta Ultra con 10 GB activos puede generar miles de GB de salida aunque su espacio no aumente. Para comparar solo la factura variable de esa copia primaria, sin backups ni mínimos:

| Salida por Ultra/mes | IDrive (almacenamiento + salida) | R2 (almacenamiento, sin operaciones) |
| --- | ---: | ---: |
| 30 GB | 0,06 USD | 0,15 USD |
| 100 GB | 0,76 USD | 0,15 USD |
| 1.000 GB | 9,76 USD | 0,15 USD |
| 10.000 GB | 99,76 USD | 0,15 USD |

Con IDrive, el tráfico abundante puede hacer perder dinero incluso a 19,90 €. Las condiciones de salida deben confirmarse y no debe contarse la copia de seguridad como franquicia del almacén primario. Para vídeos recomendaría R2 Standard o poner un límite mensual transparente al tráfico saliente y controlar las solicitudes. No prometería tráfico, versiones o almacenamiento ilimitados.

## Usuarios gratuitos

El análisis de ingresos utiliza suscripciones mensuales; no demuestra rentabilidad de las licencias actuales de por vida ni de descuentos anuales. Los usuarios gratuitos no aportan ingreso. Con seis notas de 10 MB: 60 MB activos por cuenta, 252 MB físicos bajo el presupuesto de 4,2 copias. Diez mil cuentas gratuitas llenas sumarían 2,52 TB físicos y unos 15,12 USD/mes variables en IDrive, además del backend y tráfico. Las notas de invitados que se quedan en su dispositivo no generan este coste. Si el periodo de prueba permite más de 100 notas, el ejemplo de 100 no es un techo real: hay que fijar una cuota de cuenta/ensayo antes de vender alojamiento permanente.

## Recomendación

Ultra de 19,90 €/mes tiene margen de almacenamiento incluso al llenar las 100 notas. Mantener cuentas y base de datos gestionadas; utilizar almacenamiento de objetos para archivos. IDrive es económico para tráfico moderado y volumen suficiente; Backblaze puede convenir al empezar; R2 es mi preferencia para vídeo compartido porque el ahorro de salida supera la pequeña diferencia de almacenamiento. No hace falta montar un servidor propio por este volumen. Validar rendimiento, copias y límites de tráfico antes de activar los nuevos planes.

Modelo numérico reproducible: rentabilidad-capacidad-20261011.json.
