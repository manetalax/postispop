import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://postispop.com',
  // The existing note board stays at /. Astro adds the static shop at /tienda/.
  base: '/tienda/',
  outDir: './astro-dist',
  prefetch: {
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
