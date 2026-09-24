export function init() {
  const root = document.querySelector('[data-catalog]');
  if (!root || root.dataset.filtersReady) return;
  root.dataset.filtersReady = 'true';
  const chips = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-product-card]')];
  const empty = root.querySelector('[data-empty-filter]');
  root.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip || !root.contains(chip)) return;
    const value = chip.dataset.filter.toLowerCase();
    for (const button of chips) {
      const selected = button === chip;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('bg-pop', selected);
      button.classList.toggle('text-white', selected);
      button.classList.toggle('border-pop', selected);
      button.classList.toggle('bg-white', !selected);
    }
    let count = 0;
    for (const card of cards) {
      const show = value === 'all' || card.dataset.category === value || card.dataset.franchise === value;
      card.hidden = !show;
      if (show) count++;
    }
    if (empty) empty.classList.toggle('hidden', count > 0);
  });
}
