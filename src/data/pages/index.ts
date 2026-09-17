import type { ContentPage } from './types';

/**
 * Registry of flat long-form pages served by /[lang]/[slug]/.
 * Every *.ts file in this folder with a default export (or a single exported
 * ContentPage object) is picked up automatically — adding a page means adding
 * one file. No registry edits, no merge conflicts between parallel authors.
 */
const modules = import.meta.glob('./*.ts', { eager: true }) as Record<string, Record<string, unknown>>;

function asPage(mod: Record<string, unknown> | undefined): ContentPage | undefined {
  if (!mod) return undefined;
  const candidates = [mod.default, ...Object.values(mod)];
  return candidates.find(
    (c) => c && typeof c === 'object' && 'slug' in (c as object) && 'copy' in (c as object)
  ) as ContentPage | undefined;
}

export const PAGES: Record<string, ContentPage> = {};

for (const [path, mod] of Object.entries(modules)) {
  if (path.endsWith('/types.ts') || path.endsWith('/index.ts')) continue;
  const page = asPage(mod);
  if (!page?.slug) continue;
  if (!page.copy?.en || !page.copy?.zh) {
    throw new Error(`content page ${path} is missing en or zh copy`);
  }
  if (PAGES[page.slug]) throw new Error(`duplicate content page slug: ${page.slug}`);
  PAGES[page.slug] = page;
}

export const PAGE_SLUGS = Object.keys(PAGES).sort();

export type { ContentPage, Block, PageCopy, RelatedLink, SectionItem, SectionModule } from './types';
