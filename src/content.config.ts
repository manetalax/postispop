import { defineCollection } from 'astro:content';

// Explicit empty collection prevents old cached product metadata from resurfacing.
export const collections = {
  products: defineCollection({ loader: async () => [] }),
};
