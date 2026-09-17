import { LOCALES, isLang, type Lang } from '../../i18n/utils';

/** Pure routing helpers — no Astro imports, so they stay unit-testable. */

/** '/zh/guides/offline-rag-setup/' + 'en' -> '/en/guides/offline-rag-setup/' */
export function altLangPath(pathname: string, target: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLang(parts[0])) parts[0] = target;
  else parts.unshift(target);
  return '/' + parts.join('/') + '/';
}

export function isLocalePath(pathname: string): boolean {
  const seg = pathname.split('/').filter(Boolean)[0];
  return isLang(seg);
}

/** strip any locale prefix: '/zh/models/' -> '/models/' */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLang(parts[0])) parts.shift();
  return parts.length ? '/' + parts.join('/') + '/' : '/';
}

export function localesForSitemap(): Lang[] {
  return [...LOCALES];
}
