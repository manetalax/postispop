# Activación de pagos de PostisPop

Configurar en Supabase Edge Function Secrets (nunca en archivos públicos):

- STRIPE_PAYMENTS_ENABLED=true para activar los cobros reales.
- STRIPE_SECRET_KEY: clave restringida Live (`rk_live_`) con Checkout Sessions (lectura y escritura), Customer Portal (escritura), Prices (lectura) y Subscriptions (lectura).
- STRIPE_WEBHOOK_SECRET: secreto de firma del endpoint Stripe Live de abajo.
- SUPABASE_SERVICE_ROLE_KEY debe estar disponible para la función; nunca se envía al navegador.

Endpoint del webhook:
https://htfyjefmviwlgmfqrwue.supabase.co/functions/v1/postispop-commerce/webhook

Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated` y `customer.subscription.deleted`.

El catálogo habilita Checkout solo si las cuatro tarifas Live están activas y sus ID, importe, moneda, periodicidad y modo coinciden. La función comprueba firma, fecha de firma, sesión pagada, modo de Stripe, cuenta, artículo, importe y moneda; los reintentos no duplican la concesión. La vuelta desde Stripe reconcilia con el proveedor; nunca desbloquea basándose solo en la URL.

La suscripción mensual cuesta 2,95 €, la trimestral 5,95 € cada tres meses y la anual 19,95 €; la tarifa vitalicia es un único pago de 59,95 €. Premium se concede solo tras un pago confirmado. Las suscripciones conservan acceso hasta el fin del periodo pagado y el portal permite administrarlas. Los eventos de factura fallida y cambios de suscripción actualizan el estado local; una factura fallida no amplía el periodo ya pagado.

El endpoint `/status` no devuelve credenciales. `checkoutReady` comprueba configuración y precios Live; por sí solo no demuestra un pago extremo a extremo.
