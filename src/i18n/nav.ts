import type { UIKey } from './ui';

export interface NavItem {
  key: UIKey;
  /** path WITHOUT the locale prefix, always with trailing slash */
  path: string;
}

/** Primary header navigation (kept short — everything else lives in the footer). */
export const PRIMARY_NAV: NavItem[] = [
  { key: 'nav.how', path: '/how-it-works/' },
  { key: 'nav.tools', path: '/tools/' },
  { key: 'nav.compare', path: '/compare/' },
  { key: 'nav.models', path: '/models/' },
  { key: 'nav.trust', path: '/security/' },
  { key: 'nav.faq', path: '/faq/' },
];

export const FOOTER_PLATFORM: NavItem[] = [
  { key: 'nav.app', path: '/app/' },
  { key: 'nav.how', path: '/how-it-works/' },
  { key: 'nav.models', path: '/models/' },
  { key: 'nav.tools', path: '/tools/' },
  { key: 'nav.changelog', path: '/changelog/' },
];

export const FOOTER_RESOURCES: NavItem[] = [
  { key: 'nav.guides', path: '/guides/' },
  { key: 'nav.compare', path: '/compare/' },
  { key: 'nav.usecases', path: '/use-cases/' },
  { key: 'nav.glossary', path: '/glossary/' },
  { key: 'nav.blog', path: '/blog/' },
];

export const FOOTER_TRUST: NavItem[] = [
  { key: 'nav.privacy', path: '/privacy/' },
  { key: 'nav.terms', path: '/terms/' },
  { key: 'nav.trust', path: '/security/' },
  { key: 'nav.accessibility', path: '/accessibility/' },
  { key: 'nav.about', path: '/about/' },
  { key: 'nav.contact', path: '/contact/' },
];
