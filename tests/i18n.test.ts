import assert from 'node:assert/strict';
import { test } from 'node:test';
import { translations } from '../src/i18n/index.ts';
import { locales, pagePath, publicRoutes } from '../src/i18n/routes.ts';
import { renderSitemap } from '../src/i18n/sitemap.ts';
import { formatMessage } from '../src/i18n/format.ts';

const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
function checkHomeStrings(value: unknown, path: string): void {
  if (typeof value === 'string') assert.ok(value.trim(), `${path} is empty`);
  else if (Array.isArray(value)) value.forEach((item, index) => checkHomeStrings(item, `${path}[${index}]`));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) checkHomeStrings(item, `${path}.${key}`);
  }
}
test('all locales have complete nonempty UI messages and compatible placeholders', () => {
  for (const { id } of locales) {
    const content = translations[id];
    for (const group of ['seo', 'nav', 'client'] as const) {
      assert.deepEqual(Object.keys(content[group]).sort(), Object.keys(translations.en[group]).sort(), `${id}.${group}`);
      for (const [key, value] of Object.entries(content[group])) {
        if (typeof value !== 'string') continue;
        assert.ok(value.trim(), `${id}.${group}.${key} is empty`);
        assert.deepEqual(placeholders(value), placeholders((translations.en[group] as unknown as Record<string, string>)[key]), `${id}.${group}.${key} placeholders`);
      }
    }
    assert.deepEqual(Object.keys(content.home).sort(), Object.keys(translations.en.home).sort());
    checkHomeStrings(content.home, `${id}.home`);
    const { linkGuide, downloadHelp } = content.home;
    assert.deepEqual(Object.keys(linkGuide).sort(), Object.keys(translations.en.home.linkGuide).sort(), `${id} link guide fields`);
    assert.deepEqual(Object.keys(linkGuide.rowLabels).sort(), ['embed', 'live', 'share', 'shorts', 'videoId', 'watch']);
    assert.equal(linkGuide.paragraphs.length, 2, `${id} link guide explanations`);
    assert.deepEqual(Object.keys(downloadHelp).sort(), Object.keys(translations.en.home.downloadHelp).sort(), `${id} download help fields`);
    assert.equal(downloadHelp.items.length, 3, `${id} download troubleshooting`);
    for (const item of downloadHelp.items) assert.deepEqual(Object.keys(item).sort(), ['body', 'title']);
    assert.deepEqual(Object.keys(content.client.qualities).sort(), ['high', 'maxres', 'medium', 'standard']);
    assert.equal(content.home.download, content.client.download, `${id} download label is consistent`);
    assert.equal(content.home.steps.length, 3);
    assert.equal(content.home.faqs.length, 8);
    assert.equal(content.home.faqs.filter((faq) => faq.privacyLink).length, 1);
    for (const page of ['about', 'privacy', 'terms'] as const) {
      assert.ok(content.documents[page].sections.length >= 3);
      assert.ok(content.documents[page].title && content.documents[page].description);
    }
    const privacy = JSON.stringify(content.documents.privacy);
    for (const provider of ['Clarity', 'Cloudflare', 'YouTube', 'i.ytimg.com']) assert.ok(privacy.includes(provider), `${id} privacy must disclose ${provider}`);
  }
});

test('forty unique routes preserve English URLs and map equivalent pages', () => {
  assert.equal(publicRoutes.length, 40);
  assert.equal(new Set(publicRoutes.map(({ path }) => path)).size, 40);
  assert.equal(pagePath('en'), '/');
  assert.equal(pagePath('en', 'privacy'), '/privacy/');
  assert.equal(pagePath('ja', 'privacy'), '/ja/privacy/');
  assert.equal(locales.find(({ id }) => id === 'pt-br')?.lang, 'pt-BR');
  assert.equal(locales.find(({ id }) => id === 'zh-tw')?.lang, 'zh-TW');
  assert.ok(publicRoutes.every(({ path }) => path.endsWith('/') && !path.startsWith('/en/')));
});

test('sitemap includes every canonical with reciprocal same-page alternates', () => {
  const origin = 'https://www.ytthumbnaildownloader.org';
  const xml = renderSitemap(origin);
  assert.match(xml, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  assert.equal(entries.length, 40);
  for (const [{ path, page }, entry] of publicRoutes.map((route, i) => [route, entries[i][1]] as const)) {
    assert.ok(entry.includes(`<loc>${origin}${path}</loc>`));
    for (const { id, lang } of locales) assert.ok(entry.includes(`hreflang="${lang}" href="${origin}${pagePath(id, page)}"`));
    assert.ok(entry.includes(`hreflang="x-default" href="${origin}${pagePath('en', page)}"`));
    assert.equal([...entry.matchAll(/<xhtml:link /g)].length, 11);
  }
  assert.ok(!xml.includes('/404'));
});

test('translated message interpolation preserves numbers and literal replacement text', () => {
  assert.equal(formatMessage('画像 {count}: {width} × {height}', { count: 4, width: 1280, height: 720 }), '画像 4: 1280 × 720');
  assert.equal(formatMessage('{quality} {quality}', { quality: '$&' }), '$& $&');
});
