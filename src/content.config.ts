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

/**
 * One collection PER LANGUAGE, not one collection with `en/` and `zh/`
 * subfolders.
 *
 * A single `glob({ base: './src/content/guides' })` over both locales derives
 * the entry id from the file name and collapses `en/foo.mdx` with `zh/foo.mdx`
 * onto the same id ("foo"). Entry ids must be unique, so one locale silently
 * overwrites the other at build time — the build stays green while half the
 * content is simply absent. Splitting the collections removes the possibility
 * entirely, whatever the loader does with directory segments.
 */
const loader = (dir: string) => glob({ pattern: '**/*.mdx', base: `./src/content/${dir}` });

export const collections = {
  guidesEn: defineCollection({ loader: loader('guides/en'), schema: article }),
  guidesZh: defineCollection({ loader: loader('guides/zh'), schema: article }),
  blogEn: defineCollection({ loader: loader('blog/en'), schema: article }),
  blogZh: defineCollection({ loader: loader('blog/zh'), schema: article }),
};
