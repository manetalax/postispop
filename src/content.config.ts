import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1).max(80),
    price: z.number().nonnegative(),
    franchise: z.string().min(1),
    category: z.string().min(1),
    coverImage: image(),
    coverAlt: z.string().min(1),
    inStock: z.boolean(),
    featured: z.boolean().default(false),
    description: z.string().min(20).max(300),
    variants: z.array(z.object({
      name: z.string().min(1),
      price: z.number().nonnegative().optional(),
      inStock: z.boolean().default(true),
    })).default([]),
    sortOrder: z.number().int().default(0),
  }),
});

export const collections = { products };
