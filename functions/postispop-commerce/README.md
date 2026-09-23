# Activación de pagos

Configurar en Supabase Edge Function Secrets (nunca en archivos públicos):

- STRIPE_SECRET_KEY: clave del entorno elegido, con permiso para crear/leer Checkout Sessions.
- STRIPE_WEBHOOK_SECRET: secreto del endpoint Stripe correspondiente al mismo entorno.

Endpoint del webhook:
https://htfyjefmviwlgmfqrwue.supabase.co/functions/v1/postispop-commerce/webhook

Eventos: checkout.session.completed y checkout.session.async_payment_succeeded.

La función comprueba firma, fecha de firma, sesión pagada, modo de Stripe, cuenta, artículo, importe y moneda; los reintentos no duplican la concesión. La vuelta desde Stripe consulta nuevamente al proveedor; nunca desbloquea basándose solo en la URL. Las tablas impiden a los usuarios concederse artículos o ampliar su prueba.

Antes de activar cobros reales, probar en Stripe test: pago correcto, cancelación, pago pendiente, webhook repetido, recuperación en otro dispositivo y cuenta equivocada. Revisar también devoluciones: esta primera integración no revoca automáticamente permisos por reembolso. Las compras históricas de los enlaces anteriores sin identificación de cuenta requieren conciliación independiente.

El endpoint `/status` solo devuelve si están configurados los dos secretos; no devuelve sus valores. `checkoutReady` no constituye una prueba de pago extremo a extremo.
