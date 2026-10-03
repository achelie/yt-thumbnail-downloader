import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { INDEXABLE, SITE_URL, absoluteUrl } from '../src/lib/site.ts';

const output = new URL('../dist/', import.meta.url);
const pages = [
  { file: 'index.html', path: '/' },
  { file: 'about/index.html', path: '/about/' },
  { file: 'privacy/index.html', path: '/privacy/' },
  { file: 'terms/index.html', path: '/terms/' },
  { file: '404.html', path: '/404/' },
];

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
let home = '';
let homeSchemaFound = false;
for (const page of pages) {
  const html = await readFile(new URL(page.file, output), 'utf8');
  assert.match(html, /<html\b[^>]*\blang="en"/i, `${page.path} must declare English`);
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
  const expectedRobots = !INDEXABLE || page.file === '404.html' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  assert.equal(singleMeta(html, 'robots'), expectedRobots, `${page.path} robots must match the indexing mode`);

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attributes(match[1]).type !== 'application/ld+json') continue;
    const schema = JSON.parse(match[2]) as Record<string, unknown>;
    rejectUnsupportedRatings(schema);
    if (page.path === '/' && schema['@type'] === 'WebApplication') {
      homeSchemaFound = true;
      assert.equal(schema.url, absoluteUrl('/'));
      assert.equal(schema.name, 'YT Thumbnail Downloader');
    }
  }

  const icons = tags(html, 'link').filter((tag) => tag.rel === 'icon' || tag.rel === 'apple-touch-icon');
  assert.ok(icons.some((tag) => tag.href === '/favicon.svg'), `${page.path} must link its favicon`);
  for (const icon of icons) {
    assert.ok(icon.href.startsWith('/'), 'Icons should be served locally');
    const file = await stat(new URL(icon.href.slice(1), output));
    assert.ok(file.isFile() && file.size > 0, `Missing icon ${icon.href}`);
  }
  if (page.path === '/') home = html;
}

assert.equal([...home.matchAll(/<h1\b/gi)].length, 1, 'Homepage must have exactly one H1');
assert.match(home, /<h1\b[^>]*>YT Thumbnail Downloader/i);
const staticContent = home.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
for (const phrase of ['Copy the video link', 'Find your thumbnail', 'Common YouTube thumbnail sizes', 'How do I download a YouTube thumbnail?', 'Does this work with YouTube Shorts?', 'How do I save a thumbnail on my phone?']) {
  assert.ok(staticContent.includes(phrase), `Missing static SEO content: ${phrase}`);
}
assert.ok(homeSchemaFound, 'Homepage must include a WebApplication JSON-LD object');

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
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), pages.filter((page) => page.file !== '404.html').map((page) => absoluteUrl(page.path)).sort(), 'Sitemap must contain exactly the four public pages');
} else {
  assert.match(globalHeaders, /X-Robots-Tag:\s*noindex,\s*nofollow/i, 'Temporary deployment needs a global noindex header');
  assert.ok(!/^Sitemap:/im.test(robots), 'Temporary robots must not announce a sitemap');
  await assert.rejects(access(new URL('sitemap.xml', output)), { code: 'ENOENT' }, 'Temporary deployment must not contain a sitemap');
}

console.log(`SEO audit passed: ${pages.length} pages, static content, assets, structured data, and indexing rules (${SITE_URL}, indexable=${INDEXABLE}).`);
