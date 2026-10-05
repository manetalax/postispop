# Migración de PostisPop a Cloudflare

Se publica el mismo paquete público auditado que utiliza GitHub Pages. Supabase
continúa gestionando cuentas, sincronización y comercio; sus funciones no se
copian ni sustituyen. Los paquetes Android y los demás fuentes permanecen en GitHub.

## Preparar y comprobar

```sh
npm ci
npm test
npm run lint
npm run build:cloudflare
npm run test:devices
npm run test:experience
npx wrangler deploy --dry-run
```

## Publicar

1. Acceder a la cuenta Cloudflare existente y utilizar Workers Free.
2. Ejecutar `npm run deploy:cloudflare` o conectar la rama de migración en
   Workers Builds con `npm run build:cloudflare` como build y
   `npx wrangler deploy` como comando de publicación.
3. Comprobar la URL real workers.dev: pizarra, edición, guardado, búsqueda,
   `/tienda/`, `/instalar.html`, login y sincronización con una cuenta de prueba.
   El entorno de prueba puede requerir autorizar su URL de retorno en Supabase;
   al mantener `https://postispop.com` los retornos actuales se conservan.
4. Registrar los valores DNS existentes y confirmar que postispop.com está en
   la cuenta Cloudflare correcta antes de asignarlo como dominio personalizado.
5. Tras verificar HTTPS y los flujos del dominio, retirar su asociación en
   GitHub Pages. No borrar el repositorio ni los datos de Supabase.
6. Si falla la validación, restaurar el DNS y la asociación anteriores.

No se activa un plan de pago. La publicación y el cambio DNS están pendientes
hasta disponer de acceso al panel Cloudflare. Las pruebas locales no acreditan
compras reales, login de producción ni sincronización real.
