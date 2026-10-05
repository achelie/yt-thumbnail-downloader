import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { redirectToHttps } from '../src/http-redirect.ts';

test('HTTP redirect preserves homepage, localized paths, encoded paths, and queries', () => {
  for (const path of ['/', '/zh-tw/?video=a%26b&source=seo', '/es/privacy/', '/missing%20page/?a=1&a=2']) {
    const response = redirectToHttps(new Request(`http://www.ytthumbnaildownloader.org${path}`));
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), `https://www.ytthumbnaildownloader.org${path}`);
  }
});

test('redirect handler cannot loop HTTPS or redirect another hostname', () => {
  for (const url of ['https://www.ytthumbnaildownloader.org/', 'http://example.com/', 'http://ytthumbnaildownloader.org/']) {
    const response = redirectToHttps(new Request(url));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('location'), null);
  }
});

test('redirect deployment is limited to HTTP and has no temporary public URLs', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.redirect.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.deepEqual(config.routes, [{ pattern: 'http://www.ytthumbnaildownloader.org/*', zone_name: 'ytthumbnaildownloader.org' }]);
  assert.equal(config.assets, undefined);
});
