import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://securerag.app',
  /**
   * Astro's dev server binds `localhost`, which on Windows resolves to the IPv6
   * loopback `[::1]` only. Anything probing 127.0.0.1 (health checks, CI
   * readiness gates, some proxy setups) then gets "connection refused" from a
   * server that is actually running. Pinning the dev host to 127.0.0.1 makes the
   * dev server reachable on both spellings; the built output is unaffected.
   */
  server: { host: '127.0.0.1', port: 4321 },
  /** Same host pinning for the preview server, which serves the built output. */
  preview: { host: '127.0.0.1', port: 4321 },
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    mdx(),
    preact({ compat: false }),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hans' } },
      filter: (page) => !page.includes('404') && page !== 'https://securerag.app/',
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
