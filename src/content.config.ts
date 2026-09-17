import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Long-form content lives in MDX so it can embed tables and callouts.
 * Entries are stored as `src/content/<collection>/<lang>/<slug>.mdx`; the loader
 * id therefore carries the locale, which is how the routes stay in sync.
 */
const article = z.object({
  title: z.string().max(72),
  description: z.string().min(60).max(180),
  lang: z.enum(['en', 'zh']),
  slug: z.string(),
  date: z.string(),
  updated: z.string(),
  minutes: z.number().int().positive(),
  author: z.string().default('SecureRAG Team'),
  /** optional FAQ pairs → FAQPage JSON-LD */
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  /** optional HowTo steps → HowTo JSON-LD (guides only) */
  steps: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  related: z.array(z.string()).default([]),
});

export const collections = {
  guides: defineCollection({ loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }), schema: article }),
  blog: defineCollection({ loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }), schema: article }),
};
