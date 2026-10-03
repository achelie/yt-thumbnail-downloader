export const PRODUCTION_URL = 'https://ytthumbnaildownloader.org';
export const SITE_URL = (process.env.SITE_URL || 'https://yt-thumbnail-downloader.x771364026.workers.dev').replace(/\/+$/, '');
export const INDEXABLE = process.env.INDEXABLE === 'true';
export const SITE_NAME = 'YT Thumbnail Downloader';

const parsed = new URL(SITE_URL);
if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without a path, query, or fragment.');
}
if (INDEXABLE && SITE_URL !== PRODUCTION_URL) {
  throw new Error('Indexing is only enabled for https://ytthumbnaildownloader.org.');
}

export function absoluteUrl(path = '/'): string {
  return new URL(path, `${SITE_URL}/`).href;
}
