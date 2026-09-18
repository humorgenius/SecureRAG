import type { Lang } from '../i18n/utils';

export const SITE = {
  name: 'SecureRAG',
  url: 'https://lilink.net',
  localeOf: { en: 'en_US', zh: 'zh_CN' } as const satisfies Record<Lang, string>,
  twitter: '@securerag',
  /** Replace before launch with the real AdSense publisher id. scripts/check-seo.mjs fails while this placeholder remains. */
  adsensePublisher: 'ca-pub-0000000000000000',
  adsenseClient: 'pub-0000000000000000',
  modelsHost: 'https://huggingface.co',
  repo: 'https://github.com/securerag/securerag',
  contactEmail: 'guweiicy@gmail.com',
  /** Cached, disclosed third-party request allow-list (used by CSP + the network shield UI). */
  allowedOrigins: ['huggingface.co', 'cdn-lfs.huggingface.co', 'cdn.jsdelivr.net'],
} as const;

export const PLACEHOLDER_ADSENSE = '0000000000000000';
