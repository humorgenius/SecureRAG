import type { Lang } from '../../i18n/utils';

/** A renderable content block. Data-driven so every long-form page shares one layout. */
export type Block =
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string; lead?: boolean }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'steps'; items: { title: string; text: string }[] }
  | { t: 'table'; caption?: string; head: string[]; rows: string[][] }
  | { t: 'callout'; kind?: 'info' | 'good' | 'warn'; title?: string; text: string }
  | { t: 'faq'; items: { q: string; a: string }[] }
  | { t: 'cards'; items: { href: string; title: string; text: string }[] };

export interface PageCopy {
  title: string;
  description: string;
  /** rendered as the `<h1>` */
  h1: string;
  intro: string;
  updated: string;
  blocks: Block[];
}

export interface RelatedLink {
  path: string;
  labelEn: string;
  labelZh: string;
}

export interface PageSchemaFlags {
  faq?: boolean;
  howTo?: boolean;
  article?: boolean;
}

/** A flat page served by /[lang]/[slug]/ */
export interface ContentPage {
  slug: string;
  nav?: string;
  related?: RelatedLink[];
  ads: number;
  schema?: PageSchemaFlags;
  copy: Record<Lang, PageCopy>;
}

/** A child page served by /[lang]/<section>/[item]/ */
export interface SectionItem {
  /** URL segment under the section, e.g. 'notebooklm' */
  slug: string;
  related?: RelatedLink[];
  ads: number;
  schema?: PageSchemaFlags;
  copy: Record<Lang, PageCopy>;
}

/** Hub copy + children for one section (e.g. compare, use-cases). */
export interface SectionModule {
  /** locale-specific section label, used in breadcrumbs and hub copy */
  label: Record<Lang, string>;
  copy: Record<Lang, PageCopy>;
  items: SectionItem[];
}

/** Pull the FAQ pairs a page needs for FAQPage JSON-LD. */
export function faqItems(blocks: Block[]): { q: string; a: string }[] {
  const block = blocks.find((b) => b.t === 'faq') as Extract<Block, { t: 'faq' }> | undefined;
  return block?.items ?? [];
}

/** Pull the HowTo steps a page needs for HowTo JSON-LD. */
export function stepItems(blocks: Block[]): { title: string; text: string }[] {
  const block = blocks.find((b) => b.t === 'steps') as Extract<Block, { t: 'steps' }> | undefined;
  return block?.items ?? [];
}
