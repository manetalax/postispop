# PostisPop — dirección vigente del producto

Decisión del usuario: 6 de octubre de 2026. Sustituye las propuestas anteriores de tienda, diseños de pago, plantillas, paquetes, premios, ruleta y venta separada del reloj. Los archivos históricos sirven como historial; no deben reactivar esa oferta.

## Premisa

Las notas son el producto. La pizarra debe mostrar el máximo contenido legible de un vistazo, manteniendo la forma aproximadamente cuadrada de un post-it. Evitar paneles promocionales, barras redundantes y controles que resten espacio a las notas.

- Gratis: seis notas, sin tarjeta ni una prueba temporal obligatoria.
- Escritorio: una cuadrícula de tres columnas por dos filas para las seis notas gratuitas; doce notas por página para Premium cuando el espacio lo permita.
- Móvil: dos columnas, seis notas por página, con ajuste al espacio disponible. Navegación táctil lateral y controles accesibles de página.
- Al abrir una nota, escribir de inmediato. Cambiar a dibujo dentro de la propia nota, con las opciones frecuentes a mano y las secundarias en menús.
- Ningún cambio comercial debe borrar las notas existentes ni revocar derechos adquiridos.

## Un único Premium

| Modalidad | Precio en euros |
| --- | ---: |
| Mensual | 2,95 € al mes |
| Anual | 9,95 € al año |
| De por vida | 59,95 € en un pago |

Las tres modalidades comparten funciones. La capacidad técnica actual de Premium es de 100 notas por pizarra; no anunciar notas ilimitadas hasta que el almacenamiento y los controles de acceso realmente lo permitan.

Las compras siguen desactivadas. Los tres botones muestran «Próximamente» y no abren un pago, crean una sesión de compra ni conceden derechos. Se conserva la validación de compras antiguas y el acceso a recordatorios ya adquirido. La página pública de la oferta es `/atelier.html`, conservada para que los enlaces existentes sigan funcionando.

## Cambios de comercio en esta entrega

- `atelier.html` y `atelier.css`: una página estática con Gratis y Premium, sin scripts de compra ni catálogo.
- `src/pages/`: conserva `/tienda/`, búsquedas, favoritos y cuatro enlaces antiguos de producto como redirecciones `noindex` hacia la oferta actual. No incluye marcado de producto disponible ni precios antiguos.
- `premios.html`: redirección `noindex` a la pizarra, sin sorteos ni acciones simuladas.
- `commerce-ui.js`: recordatorios para cuentas con derechos vigentes y conciliación de compras históricas. No añade botones flotantes, publicidad, pulsos visuales ni una tienda.
- Integración del menú: `data-pp-action="shop"` abre Premium; `data-pp-action="alarms"` abre los recordatorios. Las etiquetas accesibles deben describir la acción incluso si el botón solo muestra un icono.

Los catálogos gráficos históricos pueden permanecer como datos de compatibilidad mientras existan notas que los referencien. Conservar esos datos no implica mostrarlos o venderlos.

## Aplicación Android

La aplicación debe incluir sus recursos y almacenar las notas en el dispositivo. El servidor se usa para iniciar sesión, guardar o sincronizar en la nube, compartir pizarras y verificar derechos. Registrar por separado la compilación, la firma, la instalación y las pruebas en un dispositivo real; una preparación del proyecto no equivale a entregar una APK comprobada.

## Verificación y activación futura

Verificar tamaños de pantalla, teclado, foco, persistencia, acceso gratuito y Premium, notas antiguas, desconexión y ausencia de llamadas de pago desde la oferta. Las pruebas de pago antiguas se mantienen para proteger derechos previos. Antes de activar Premium, validar pagos recurrentes, licencia permanente, cancelaciones, duplicados, reembolsos y aislamiento entre cuentas. La configuración y activación de cobros requieren una nueva autorización explícita del usuario.

La implementación local, las comprobaciones realizadas y el despliegue son hechos distintos y deben comunicarse por separado. No afirmar que no existen fallos sin evidencia ni publicar contraseñas, códigos o claves.
