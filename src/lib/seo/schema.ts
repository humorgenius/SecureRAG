import { SITE } from '../../data/site';
import type { Lang } from '../../i18n/utils';

const abs = (p: string) => new URL(p, SITE.url).href;
const L = (lang: Lang) => (lang === 'zh' ? 'zh-Hans' : 'en');

export const orgSchema = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('/#org'),
  name: SITE.name,
  url: SITE.url,
  email: SITE.contactEmail,
  description:
    lang === 'zh'
      ? 'SecureRAG 是一个跨格式文件索引工具：支持 PDF、DOCX、TXT、Markdown、CSV、HTML、JSON 等格式，借助 AI 在浏览器本地统一检索文件内容，文件永不离开你的设备。'
      : 'SecureRAG is a cross-format file indexing tool: it searches PDF, DOCX, TXT, Markdown, CSV, HTML and JSON with AI entirely inside your browser. Files never leave your device.',
  sameAs: [SITE.repo, `https://huggingface.co/spaces`],
});

export const websiteSchema = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: SITE.name,
  url: SITE.url,
  inLanguage: L(lang),
  publisher: { '@id': abs('/#org') },
});

export const softwareAppSchema = (
  lang: Lang,
  override?: { name: string; description: string; path: string }
) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: override?.name ?? SITE.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any modern web browser',
  url: abs(override?.path ?? `/${lang}/app/`),
  ...(override?.description ? { description: override.description } : {}),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true,
  featureList:
    lang === 'zh'
      ? ['本地文档解析', '本地向量索引', '多文档管理', '段落级引用', '离线可用', '可导出问答记录']
      : [
          'Local document parsing',
          'Local vector index',
          'Multi-document collections',
          'Paragraph-level citations',
          'Offline use after caching',
          'Exportable session records',
        ],
});

export const faqSchema = (qa: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qa.map((x) => ({
    '@type': 'Question',
    name: x.q,
    acceptedAnswer: { '@type': 'Answer', text: x.a },
  })),
});

export const articleSchema = (o: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: o.title,
  description: o.description,
  inLanguage: L(o.lang),
  datePublished: o.datePublished,
  dateModified: o.dateModified ?? o.datePublished,
  mainEntityOfPage: abs(o.path),
  author: { '@type': 'Person', name: o.author ?? 'SecureRAG Team' },
  publisher: { '@id': abs('/#org') },
});

export const howToSchema = (o: {
  lang: Lang;
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: o.name,
  description: o.description,
  inLanguage: L(o.lang),
  step: o.steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
});

export const itemListSchema = (o: {
  lang: Lang;
  name: string;
  items: { name: string; path: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: o.name,
  inLanguage: L(o.lang),
  itemListElement: o.items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: abs(it.path),
  })),
});

export const definedTermSetSchema = (o: {
  lang: Lang;
  name: string;
  terms: { term: string; definition: string; path: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: o.name,
  inLanguage: L(o.lang),
  hasDefinedTerm: o.terms.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.term,
    description: t.definition,
    url: abs(t.path),
  })),
});
