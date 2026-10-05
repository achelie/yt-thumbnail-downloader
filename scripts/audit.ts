import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { INDEXABLE, SITE_URL, absoluteUrl } from '../src/lib/site.ts';
import { locales, pagePath, pageFile, publicRoutes } from '../src/i18n/routes.ts';
import { translations } from '../src/i18n/index.ts';
import { renderSitemap } from '../src/i18n/sitemap.ts';

const output = new URL('../dist/', import.meta.url);
const pages = [
  ...publicRoutes,
  ...locales.map(({ id: locale }) => ({ locale, page: 'notFound' as const, path: pagePath(locale, 'notFound') })),
].map((route) => ({ ...route, file: pageFile(route.locale, route.page) }));

function attributes(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4]]));
}

function tags(html: string, name: string): Record<string, string>[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag));
}

function singleMeta(html: string, name: string, attribute = 'name'): string {
  const matching = tags(html, 'meta').filter((tag) => tag[attribute] === name);
  assert.equal(matching.length, 1, `Expected one ${name} meta tag`);
  assert.ok(matching[0].content, `${name} must have content`);
  return matching[0].content;
}

function rejectUnsupportedRatings(value: unknown): void {
  if (value === null || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!['aggregateRating', 'ratingValue', 'ratingCount', 'reviewCount'].includes(key), `Unsupported rating field: ${key}`);
    rejectUnsupportedRatings(child);
  }
}

const titles = new Set<string>();
const descriptions = new Set<string>();

for (const page of pages) {
  const html = await readFile(new URL(page.file, output), 'utf8');
  const config = locales.find(({ id }) => id === page.locale)!;
  const content = translations[page.locale];
  assert.equal(tags(html, 'html')[0].lang, config.lang, page.path);
  assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, page.path + ' needs exactly one H1');
  assert.equal([...html.matchAll(/ys07qa7u86/g)].length, 1, page.path + ' must include Clarity once');
  const matches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  assert.equal(matches.length, 1, `${page.path} needs one title`);
  const title = matches[0][1].trim();
  assert.ok(title.length > 0 && !titles.has(title), `${page.path} needs a unique title`);
  titles.add(title);
  const description = singleMeta(html, 'description');
  assert.ok(!descriptions.has(description), `${page.path} needs a unique description`);
  descriptions.add(description);

  const canonicals = tags(html, 'link').filter((tag) => tag.rel === 'canonical');
  assert.equal(canonicals.length, 1, `${page.path} needs one canonical`);
  assert.equal(canonicals[0].href, absoluteUrl(page.path), `${page.path} canonical must use SITE_URL`);
  assert.equal(singleMeta(html, 'og:url', 'property'), absoluteUrl(page.path));
  assert.equal(singleMeta(html, 'og:image', 'property'), absoluteUrl('/social-card.png'));
  const expectedRobots = !INDEXABLE || page.page === 'notFound' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  assert.equal(singleMeta(html, 'robots'), expectedRobots, `${page.path} robots must match the indexing mode`);

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attributes(match[1]).type !== 'application/ld+json') continue;
    const schema = JSON.parse(match[2]) as Record<string, unknown>;
    rejectUnsupportedRatings(schema);
    if (page.page === 'home' && schema['@type'] === 'WebApplication') {
      assert.equal(schema.inLanguage, config.lang);
      assert.equal(schema.url, absoluteUrl(page.path));
      assert.equal(schema.name, 'YT Thumbnail Downloader');
      assert.equal(schema.description, content.seo.description, page.path + ' schema description must match its locale');
    }
  }

  const icons = tags(html, 'link').filter((tag) => tag.rel === 'icon' || tag.rel === 'apple-touch-icon');
  assert.ok(icons.some((tag) => tag.href === '/favicon.svg'), `${page.path} must link its favicon`);
  for (const icon of icons) {
    assert.ok(icon.href.startsWith('/'), 'Icons should be served locally');
    const file = await stat(new URL(icon.href.slice(1), output));
    assert.ok(file.isFile() && file.size > 0, `Missing icon ${icon.href}`);
  }
  const alternates = tags(html, 'link').filter((tag) => tag.rel === 'alternate');
  if (page.page === 'notFound') {
    assert.equal(alternates.length, 0);
  } else {
    assert.equal(alternates.length, 11);
    for (const other of locales) {
      assert.equal(alternates.find((tag) => tag.hreflang === other.lang)?.href, absoluteUrl(pagePath(other.id, page.page)), page.path + ' hreflang ' + other.lang);
    }
    assert.equal(alternates.find((tag) => tag.hreflang === 'x-default')?.href, absoluteUrl(pagePath('en', page.page)));
  }
  const languageLinks = [...html.matchAll(/<a\b[^>]*hreflang=[^>]+>/gi)].map(([tag]) => attributes(tag));
  assert.equal(languageLinks.length, 10, page.path + ' language menu');
  for (const other of locales) assert.equal(languageLinks.find((tag) => tag.hreflang === other.lang)?.href, pagePath(other.id, page.page === 'notFound' ? 'home' : page.page));
  if (page.page === 'home') {
    const clientJson = html.match(/<script\b[^>]*id="downloader-messages"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(clientJson, page.path + ' missing client messages');
    assert.deepEqual(JSON.parse(clientJson), content.client, page.path + ' ships only its own messages');
    assert.match(html, /"@type":"WebApplication"/);
    const staticText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
    const escaped = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    assert.equal(title, escaped(content.seo.title));
    assert.equal(description, escaped(content.seo.description));
    assert.ok([...content.seo.title].length <= 60, page.path + ' homepage title should fit the editorial limit');
    assert.ok([...content.seo.description].length <= 160, page.path + ' homepage description should fit the editorial limit');
    assert.equal(singleMeta(html, 'og:title', 'property'), title);
    assert.equal(singleMeta(html, 'og:description', 'property'), description);
    assert.equal(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].trim(), escaped(content.home.h1), page.path + ' H1 must not append decoration');
    const preview = tags(html, 'img').find((tag) => tag.id === 'thumbnail-preview');
    assert.ok(preview, page.path + ' preview image');
    assert.equal(preview.width, '1280');
    assert.equal(preview.height, '720');
    const linksHtml = html.match(/<section\b[^>]*id="supported-links"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    const helpHtml = html.match(/<section\b[^>]*id="download-help"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(linksHtml && helpHtml, page.path + ' guides must be static');
    assert.equal([...linksHtml.matchAll(/<tr\b/gi)].length, 7, page.path + ' six supported-link examples plus header');
    assert.equal([...helpHtml.matchAll(/<h3\b/gi)].length, 3, page.path + ' three troubleshooting topics');
    for (const phrase of [content.home.h1, content.home.tableCaption,
      ...content.home.steps.flatMap((step) => [step.title, step.body]),
      content.home.linkGuide.title, content.home.linkGuide.intro, content.home.linkGuide.caption,
      ...Object.values(content.home.linkGuide.rowLabels), content.home.linkGuide.videoIdExample,
      ...content.home.linkGuide.paragraphs, content.home.downloadHelp.title, content.home.downloadHelp.intro,
      ...content.home.downloadHelp.items.flatMap((item) => [item.title, item.body]),
      ...content.home.faqs.flatMap((faq) => [faq.question, faq.answer])]) {
      assert.ok(staticText.includes(escaped(phrase)), page.path + ' missing static content: ' + phrase);
    }
    if (page.locale === 'en') {
      assert.equal(content.seo.title.length, 58);
      assert.equal(content.seo.description.length, 146);
      assert.match(content.seo.description, /YT Thumbnail Downloader/);
      assert.match(content.home.description, /^YT Thumbnail Downloader/);
      const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => match[1]);
      assert.equal(headings.filter((heading) => /YT Thumbnail Downloader/.test(heading)).length, 2);
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
      const editorial = main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<section\b[^>]*id="thumbnail-results"[^>]*>[\s\S]*?<\/section>/i, '')
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<[^>]+>/g, ' ').replace(/&[\w#]+;/g, ' ');
      const words = editorial.match(/\b[a-z0-9]+(?:['’-][a-z0-9]+)*\b/gi)?.length ?? 0;
      assert.ok(words >= 1200 && words <= 1400, `English homepage has ${words} editorial words; expected 1200–1400`);
      console.log(`English homepage: ${words} editorial words, title ${content.seo.title.length}, description ${content.seo.description.length}.`);
    }
  }
}


const social = await readFile(new URL('social-card.png', output));
assert.deepEqual(social.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), 'Social card must be a PNG');
assert.equal(social.readUInt32BE(16), 1200, 'Social card width must match its metadata');
assert.equal(social.readUInt32BE(20), 630, 'Social card height must match its metadata');
const robots = await readFile(new URL('robots.txt', output), 'utf8');
assert.match(robots, /^User-agent:\s*\*\s*$/m);
assert.match(robots, /^Allow:\s*\/\s*$/m);
assert.ok(!/^Disallow:\s*\S/m.test(robots), 'Crawlers must be able to read page robots metadata');
const headers = await readFile(new URL('_headers', output), 'utf8');
const globalHeaders = headers.split(/\r?\n(?=\S)/).find((block) => block.startsWith('/*\n') || block.startsWith('/*\r\n')) ?? '';
if (INDEXABLE) {
  assert.ok(!/X-Robots-Tag:.*noindex/i.test(globalHeaders), 'Production must not send a global noindex header');
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'Robots must announce the production sitemap');
  const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8');
  assert.match(sitemap, /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.equal(sitemap, renderSitemap(SITE_URL), 'Sitemap alternates must match the canonical route registry');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), pages.filter((page) => page.page !== 'notFound').map((page) => absoluteUrl(page.path)).sort(), 'Sitemap must contain exactly 40 public pages');
} else {
  assert.match(globalHeaders, /X-Robots-Tag:\s*noindex,\s*nofollow/i, 'Temporary deployment needs a global noindex header');
  assert.ok(!/^Sitemap:/im.test(robots), 'Temporary robots must not announce a sitemap');
  await assert.rejects(access(new URL('sitemap.xml', output)), { code: 'ENOENT' }, 'Temporary deployment must not contain a sitemap');
}

console.log(`SEO audit passed: ${pages.length} pages, static content, assets, structured data, and indexing rules (${SITE_URL}, indexable=${INDEXABLE}).`);
