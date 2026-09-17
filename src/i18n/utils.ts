import { ui, type Lang, type UIKey } from './ui';

export const LOCALES: Lang[] = ['en', 'zh'];
export const DEFAULT_LANG: Lang = 'en';
export const HTML_LANG: Record<Lang, string> = { en: 'en', zh: 'zh-Hans' };
export const HREFLANG: Record<Lang, string> = { en: 'en', zh: 'zh-Hans' };

export function isLang(value: string | undefined): value is Lang {
  return value === 'en' || value === 'zh';
}

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return isLang(seg) ? seg : DEFAULT_LANG;
}

export function getLangFromParam(param: string | undefined): Lang {
  return isLang(param) ? param : DEFAULT_LANG;
}

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui.en[key];
}

export function useTranslations(lang: Lang) {
  return (key: UIKey) => t(lang, key);
}

/** '/guides/offline-rag-setup/' -> '/zh/guides/offline-rag-setup/' */
export function localizePath(lang: Lang, path = '/'): string {
  const rest = path.replace(/^\/?(en|zh)(?=\/|$)/, '');
  const clean = '/' + rest.replace(/^\/+/, '').replace(/\/+$/, '');
  return (clean === '/' ? `/${lang}/` : `/${lang}${clean}/`).replace(/\/{2,}/g, '/');
}
