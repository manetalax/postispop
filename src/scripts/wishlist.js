const KEY = 'postispop:favorites:v1';

function read() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}

function paint(scope = document) {
  const favorites = read();
  for (const button of scope.querySelectorAll('[data-wishlist]')) {
    const active = favorites.has(button.dataset.wishlist);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Añadir a favoritos');
  }
}

export function init() {
  paint();
  if (document.documentElement.dataset.wishlistReady) return;
  document.documentElement.dataset.wishlistReady = 'true';
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-wishlist]');
    if (!button) return;
    const favorites = read();
    const id = button.dataset.wishlist;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    localStorage.setItem(KEY, JSON.stringify([...favorites]));
    paint();
    document.dispatchEvent(new CustomEvent('postispop:favorites-changed'));
  });
}
