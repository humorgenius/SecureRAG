import type { ContentPage, PageSchemaFlags, PageCopy, Block, RelatedLink } from '../data/pages/types';
import { articleSchema, breadcrumbSchema, faqSchema, howToSchema, orgSchema, websiteSchema } from './schema';
import { faqItems, stepItems } from '../../data/pages/types';
import type { Lang } from '../i18n/utils';

interface Args {
  lang: Lang;
  path: string;
  copy: PageCopy;
  crumbs: { name: string; path: string }[];
  flags?: PageSchemaFlags;
}

/** Build the JSON-LD graph for any long-form page: org + site + Article (+HowTo/FAQ) + breadcrumbs. */
export function buildPageSchema({ lang, path, copy, crumbs, flags }: Args): Record<string, unknown>[] {
  const graph: Record<string, unknown>[] = [orgSchema(lang), websiteSchema(lang)];

  if (flags?.article !== false) {
    graph.push(
      articleSchema({
        lang,
        title: copy.title,
        description: copy.description,
        path,
        datePublished: copy.updated,
        dateModified: copy.updated,
      })
    );
  }

  if (flags?.howTo) {
    const steps = stepItems(copy.blocks);
    if (steps.length) {
      graph.push(
        howToSchema({
          lang,
          name: copy.h1,
          description: copy.intro,
          steps: steps.map((s) => ({ name: s.title, text: s.text })),
        })
      );
    }
  }

  if (flags?.faq) {
    const items = faqItems(copy.blocks);
    if (items.length) graph.push(faqSchema(items));
  }

  graph.push(breadcrumbSchema(crumbs));
  return graph;
}

/** Map a section's related links into the locale-correct shape ContentLayout expects. */
export function relatedFor(lang: Lang, related: RelatedLink[] | undefined) {
  return (related ?? []).map((r) => ({ path: r.path, label: lang === 'zh' ? r.labelZh : r.labelEn }));
}

export type { ContentPage, Block };
