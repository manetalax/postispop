let pagefind;
const base = import.meta.env.BASE_URL;

async function loadIndex() {
  if (!pagefind) pagefind = import(/* @vite-ignore */ `${base}pagefind/pagefind.js`).then(async (mod) => {
    await mod.init();
    return mod;
  });
  return pagefind;
}

export function init() {
  const form = document.querySelector('[data-pagefind-form]');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = 'true';
  const input = form.querySelector('input[name="q"]');
  const status = document.querySelector('[data-search-status]');
  const results = document.querySelector('[data-search-results]');
  let timer;
  const search = async () => {
    const query = input.value.trim();
    results.replaceChildren();
    if (!query) { status.textContent = 'Escribe para buscar en el catálogo.'; return; }
    status.textContent = 'Buscando…';
    try {
      const index = await loadIndex();
      const response = await index.search(query);
      const matches = await Promise.all(response.results.slice(0, 12).map((result) => result.data()));
      for (const item of matches) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'block rounded-2xl border border-line bg-white p-4 hover:border-pop';
        const title = document.createElement('span');
        title.className = 'block font-bold';
        title.textContent = item.meta.title || 'Producto PostisPop';
        const excerpt = document.createElement('span');
        excerpt.className = 'mt-1 block text-sm text-muted';
        excerpt.textContent = item.excerpt;
        link.append(title, excerpt);
        li.append(link);
        results.append(li);
      }
      status.textContent = matches.length ? `${matches.length} resultado${matches.length === 1 ? '' : 's'}.` : 'No encontramos coincidencias.';
    } catch {
      status.textContent = 'No se pudo cargar la búsqueda. Recarga la página e inténtalo de nuevo.';
    }
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(timer); void search(); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 180); }, { passive: true });
  if (input.value) void search();
}
