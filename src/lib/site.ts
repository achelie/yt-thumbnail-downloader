export const PRODUCTION_URL = 'https://www.ytthumbnaildownloader.org';
export const SITE_URL = (process.env.SITE_URL || PRODUCTION_URL).replace(/\/+$/, '');
export const INDEXABLE = process.env.INDEXABLE === undefined
  ? SITE_URL === PRODUCTION_URL
  : process.env.INDEXABLE === 'true';
export const SITE_NAME = 'YT Thumbnail Downloader';

const parsed = new URL(SITE_URL);
if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without a path, query, or fragment.');
}
if (INDEXABLE && SITE_URL !== PRODUCTION_URL) {
  throw new Error(`Indexing is only enabled for ${PRODUCTION_URL}.`);
}

export function absoluteUrl(path = '/'): string {
  return new URL(path, `${SITE_URL}/`).href;
}
