import { readFile } from 'node:fs/promises';
import { INDEXABLE, PRODUCTION_URL, SITE_URL } from '../src/lib/site.ts';

const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8')) as {
  workers_dev?: boolean;
  preview_urls?: boolean;
  routes?: { pattern: string; custom_domain?: boolean }[];
};
const productionHost = new URL(PRODUCTION_URL).hostname;
const hasProductionDomain = config.routes?.some((route) => route.pattern === productionHost && route.custom_domain === true);

// A preview build omits sitemap.xml; never publish it to the live production domain.
if (hasProductionDomain && (!INDEXABLE || SITE_URL !== PRODUCTION_URL)) {
  throw new Error(`The production domain is attached. Deploy with SITE_URL=${PRODUCTION_URL} and INDEXABLE=true so sitemap.xml and production SEO metadata are included.`);
}

// Indexable assets must not also be exposed at temporary Cloudflare hostnames.
if (INDEXABLE) {
  if (config.workers_dev !== false || config.preview_urls !== false || !hasProductionDomain) {
    throw new Error(`Production deployment requires the ${productionHost} custom domain in wrangler.jsonc, workers_dev: false, and preview_urls: false. For a temporary deployment, explicitly set SITE_URL to the workers.dev URL and INDEXABLE=false.`);
  }
}
