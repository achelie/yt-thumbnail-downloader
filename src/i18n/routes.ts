import type { Locale, PageId } from './types.ts';

export const locales = [
  { id: 'en', lang: 'en', name: 'English', og: 'en_US' },
  { id: 'ja', lang: 'ja', name: '日本語', og: 'ja_JP' },
  { id: 'es', lang: 'es', name: 'Español', og: 'es_ES' },
  { id: 'fr', lang: 'fr', name: 'Français', og: 'fr_FR' },
  { id: 'de', lang: 'de', name: 'Deutsch', og: 'de_DE' },
  { id: 'it', lang: 'it', name: 'Italiano', og: 'it_IT' },
  { id: 'ko', lang: 'ko', name: '한국어', og: 'ko_KR' },
  { id: 'pt-br', lang: 'pt-BR', name: 'Português', og: 'pt_BR' },
  { id: 'ru', lang: 'ru', name: 'Русский', og: 'ru_RU' },
  { id: 'zh-tw', lang: 'zh-TW', name: '繁體中文', og: 'zh_TW' },
] as const satisfies readonly { id: Locale; lang: string; name: string; og: string }[];
export const publicPages = ['home', 'about', 'privacy', 'terms'] as const;
export function pagePath(locale: Locale, page: PageId = 'home'): string {
  const prefix = locale === 'en' ? '/' : `/${locale}/`;
  return page === 'home' ? prefix : `${prefix}${page === 'notFound' ? '404' : page}/`;
}
export const publicRoutes = locales.flatMap(({ id: locale }) => publicPages.map((page) => ({ locale, page, path: pagePath(locale, page) })));
export function pageFile(locale: Locale, page: PageId): string {
  return page === 'notFound' ? `${locale === 'en' ? '' : `${locale}/`}404.html` : `${pagePath(locale, page).slice(1)}index.html`;
}
