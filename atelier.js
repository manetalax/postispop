/**
 * Compatibility entry for an older cached Atelier document.
 * The current page needs no JavaScript. Retire a cached catalogue in place,
 * avoiding a redirect loop when a service worker still serves its old HTML.
 */
if (document.querySelector('#at-grid')) {
  document.title = 'Gratis o Premium · PostisPop';
  document.body.className = '';
  document.body.innerHTML = `
    <header class="pricing-header"><a class="brand" href="/">Postis<span>Pop</span></a><a class="back-link" href="/">← Mis notas</a></header>
    <main id="contenido">
      <section class="pricing-intro"><p class="eyebrow">TUS IDEAS A LA VISTA</p><h1>6 notas gratis.<br>Un único Premium.</h1><p>Escribe y dibuja en la misma nota. Tus derechos anteriores se conservan.</p></section>
      <section class="premium-plan" aria-label="Premium">
        <h2>Más espacio para tus ideas</h2>
        <p>Las tres opciones incluyen el mismo Premium.</p>
        <div class="payment-options">
          <section class="payment-option"><h3>Mensual</h3><p class="price">2,95 <span>€</span></p><p class="period">al mes</p><button type="button" disabled>Elige tu plan</button></section>
          <section class="payment-option"><h3>Trimestral</h3><p class="price">5,95 <span>€</span></p><p class="period">cada 3 meses</p><button type="button" disabled>Elige tu plan</button></section>
          <section class="payment-option"><h3>Anual</h3><p class="price">19,95 <span>€</span></p><p class="period">al año</p><button type="button" disabled>Elige tu plan</button></section>
          <section class="payment-option"><h3>De por vida</h3><p class="price">59,95 <span>€</span></p><p class="period">pago único</p><button type="button" disabled>Elige tu plan</button></section>
        </div>
        <p class="purchase-status">Los pagos se completan de forma segura en Stripe.</p>
      </section>
      <p><a class="start-link" href="/">Volver a mis notas</a></p>
    </main>`;
}
