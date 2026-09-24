import { init as initWishlist } from './wishlist.js';

export function init() {
  initWishlist();
  const update = () => {
    const grid = document.querySelector('[data-favorites-grid]');
    const empty = document.querySelector('[data-favorites-empty]');
    if (!grid || !empty) return;
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem('postispop:favorites:v1') || '[]'); } catch {}
    let visible = 0;
    for (const card of grid.querySelectorAll('[data-product-card]')) {
      const show = ids.includes(card.dataset.productId);
      card.hidden = !show;
      if (show) visible++;
    }
    empty.classList.toggle('hidden', visible > 0);
  };
  update();
  if (!document.documentElement.dataset.favoritesReady) {
    document.documentElement.dataset.favoritesReady = 'true';
    document.addEventListener('postispop:favorites-changed', update);
  }
}
