import { locales, pagePath, publicRoutes } from './routes.ts';

export function renderSitemap(origin: string): string {
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const url = (path: string) => escape(new URL(path, origin).href);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${publicRoutes.map(({ path, page }) => `  <url>\n    <loc>${url(path)}</loc>\n${locales.map(({ id, lang }) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url(pagePath(id, page))}" />`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url(pagePath('en', page))}" />\n  </url>`).join('\n')}\n</urlset>\n`;
}
