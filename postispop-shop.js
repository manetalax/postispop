const style = document.createElement("style");
style.textContent = `
  .pp-shop-trigger{position:fixed;right:18px;bottom:18px;z-index:40;border:0;border-radius:999px;padding:12px 18px;background:#1f2937;color:#fff;font:600 14px system-ui;box-shadow:0 8px 24px #0002;cursor:pointer}
  .pp-shop-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:#1118}
  .pp-shop-dialog{width:min(760px,100%);max-height:min(720px,90vh);overflow:auto;border-radius:24px;padding:24px;background:#fff;color:#172033;box-shadow:0 24px 80px #0004;font-family:system-ui}
  .pp-shop-head{display:flex;justify-content:space-between;align-items:start;gap:16px;margin-bottom:20px}.pp-shop-head h2{margin:0 0 6px;font-size:26px}.pp-shop-head p{margin:0;color:#667085}
  .pp-shop-close{border:0;background:#f1f3f5;border-radius:50%;width:36px;height:36px;font-size:22px;cursor:pointer}
  .pp-shop-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
  .pp-product{display:flex;flex-direction:column;gap:12px;border:1px solid #e5e7eb;border-radius:18px;padding:18px;background:#fff}.pp-product-icon{display:grid;place-items:center;width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#fff4c2,#ffd66b);font-size:36px;box-shadow:inset 0 0 0 1px #f2c94c66}.pp-product h3{margin:0;font-size:18px}.pp-product p{margin:0;min-height:48px;color:#667085;line-height:1.45}.pp-price{font-size:24px;font-weight:700}.pp-buy{display:block;text-align:center;text-decoration:none;border:0;border-radius:12px;padding:11px;background:#f2c94c;color:#172033;font-weight:700;cursor:pointer}.pp-buy.disabled{background:#eef0f2;color:#8b929e;cursor:default}
  @media (max-width:600px){.pp-shop-trigger{right:12px;bottom:12px}.pp-shop-dialog{padding:18px;border-radius:18px}}
`;
document.head.appendChild(style);

const money = product => new Intl.NumberFormat("es-ES", {
  style: "currency", currency: (product.currency || "eur").toUpperCase()
}).format((product.price_cents || 0) / 100);

async function loadProducts() {
  return [
    { slug: "pack-rebel", icon: "🎨", title: "Pack Rebel", description: "Un estilo más atrevido para tus pizarras y notas.", price_cents: 299, currency: "eur", stripe_payment_link: "https://buy.stripe.com/eVq5kDfPW1ffgXQd4E0oM04" },
    { slug: "pack-minimal", icon: "✨", title: "Pack Minimal", description: "Un estilo limpio y concentrado para organizarte.", price_cents: 299, currency: "eur", stripe_payment_link: "https://buy.stripe.com/bJe28r7jq1ff9vo3u40oM06" },
    { slug: "reloj-recordatorios", icon: "⏰", title: "Reloj y recordatorios", description: "Añade fechas y horas a tus notas para no olvidar nada.", price_cents: 499, currency: "eur", stripe_payment_link: "https://buy.stripe.com/aFa8wPeLSf656jcc0A0oM05" },
    { slug: "postispop-pro", icon: "🚀", title: "PostisPop Pro", description: "Todos los estilos, recordatorios y funciones premium.", price_cents: 999, currency: "eur", stripe_payment_link: "https://buy.stripe.com/00w00j1Z68HH4b43u40oM07" }
  ];
}

function openShop() {
  if (document.querySelector(".pp-shop-backdrop")) return;
  const backdrop = document.createElement("div");
  backdrop.className = "pp-shop-backdrop";
  backdrop.innerHTML = `<section class="pp-shop-dialog" role="dialog" aria-modal="true" aria-label="Tienda PostisPop">
    <div class="pp-shop-head"><div><h2>Tienda PostisPop</h2><p>Personaliza tu pizarra y desbloquea nuevas funciones.</p></div><button class="pp-shop-close" aria-label="Cerrar">×</button></div>
    <div class="pp-shop-grid"><p>Cargando productos…</p></div>
  </section>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector(".pp-shop-close").addEventListener("click", close);
  backdrop.addEventListener("click", event => { if (event.target === backdrop) close(); });
  loadProducts().then(products => {
    const grid = backdrop.querySelector(".pp-shop-grid");
    grid.innerHTML = products.map(product => `<article class="pp-product">
      <div class="pp-product-icon" aria-hidden="true">${product.icon || "🛍️"}</div><h3>${product.title}</h3><p>${product.description}</p><div class="pp-price">${money(product)}</div>
      ${product.stripe_payment_link ? `<a class="pp-buy" href="${product.stripe_payment_link}" target="_blank" rel="noopener">Comprar ahora</a>` : `<span class="pp-buy disabled">Próximamente</span>`}
    </article>`).join("") || "<p>No hay productos disponibles.</p>";
  }).catch(() => { backdrop.querySelector(".pp-shop-grid").innerHTML = "<p>No se pudo cargar la tienda. Inténtalo de nuevo.</p>"; });
}

function mountShop() {
  if (document.querySelector(".pp-shop-trigger")) return;
  const button = document.createElement("button");
  button.className = "pp-shop-trigger";
  button.textContent = "Tienda";
  button.setAttribute("aria-label", "Abrir tienda");
  button.addEventListener("click", openShop);
  document.body.appendChild(button);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountShop, { once: true });
else mountShop();
