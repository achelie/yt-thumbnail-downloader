# YT Thumbnail Downloader

English, browser-only YouTube thumbnail downloader built with Astro, TypeScript, and CSS. The page content is statically rendered. No API keys, database, server functions, accounts, analytics, or application cookies.

## Development

Use Node 22.12 or newer (verified with Node 22.19).

```powershell
npm ci
npm run dev
```

`npm run dev` serves the Astro development site. `npm run build` also generates the hosting headers, robots file, social card, and icons. `npm run preview` uses Wrangler to serve the built files with Cloudflare routing and headers at http://127.0.0.1:4322.

## Validation

```powershell
npm run check
npm test
npm run build
npm run audit
```

The tests cover accepted and rejected URLs, missing high-resolution thumbnails, placeholder images, real dimensions, CORS fallback, cancellation, timeouts, and Blob cleanup. The audit checks the generated HTML and indexing configuration. Browser verification must also include a real download and responsive layouts.

Known dependency advisory (checked October 3, 2026): Astro's build dependency `http-cache-semantics@4.2.0` has an [unpatched upstream advisory](https://github.com/advisories/GHSA-ch52-4w7c-c8xp). This site does not use Astro remote image processing, server rendering, or shared application caches; the dependency is not present in the deployed static assets. The advisory remains in `npm audit`; do not use its suggested major Astro downgrade as an automatic fix. Reassess before introducing server rendering or when an upstream patch is available.

## Deploy to Cloudflare

The configured Worker is `yt-thumbnail-downloader`; only static assets in `dist` are uploaded. The temporary public URL is:

https://yt-thumbnail-downloader.x771364026.workers.dev

```powershell
$env:SITE_URL = 'https://yt-thumbnail-downloader.x771364026.workers.dev'
$env:INDEXABLE = 'false'
npm run deploy
```

If the local network cannot reach the Cloudflare API directly, use the existing local proxy for this shell session:

```powershell
$env:HTTPS_PROXY = 'http://127.0.0.1:7897'
$env:HTTP_PROXY = 'http://127.0.0.1:7897'
```

Wrangler uses its locally stored OAuth credentials. Do not commit credentials or token files. No Git remote is required for direct asset deployments.

## Indexing configuration

`SITE_URL` and `INDEXABLE` are build-time environment variables read in `src/lib/site.ts`. Their defaults match the temporary hostname and disabled indexing. `.env.example` documents these values; export them in the shell when changing builds.

With indexing disabled, every HTML page has `noindex, nofollow`, `_headers` applies the same directive, robots.txt allows crawling, and no sitemap is generated. Allowing crawling lets search engines read `noindex`. Canonical and social URLs use the configured temporary origin.

Future production domain: **https://ytthumbnaildownloader.org**. Domain binding, DNS changes, and Search Console submission have not been performed.

When the production domain is ready:

1. Bind the domain to this Worker in Cloudflare and verify HTTPS.
2. Set `workers_dev: false` and `preview_urls: false` in `wrangler.jsonc` before publishing an indexable build, and verify the corresponding temporary routes are disabled in Cloudflare. This keeps later deployments from restoring duplicate indexable hostnames.
3. Set `SITE_URL=https://ytthumbnaildownloader.org` and `INDEXABLE=true`, then run the validation commands and deploy. The build deliberately refuses an indexable build for any other origin.
4. Verify the production canonical URLs, absent global noindex header, expected page statuses, and sitemap.xml. The 404 page remains noindex.
5. Only then submit the production sitemap to Search Console.

These steps are documentation, not part of the temporary-domain release.

## Thumbnail behavior

URLs are validated against explicit YouTube hostnames and converted to an 11-character video ID. The browser requests four known JPG candidates from `https://i.ytimg.com`, using no credentials or referrer. Non-200 responses, non-JPG responses, and small placeholder images are rejected. Each successful Blob is decoded for its actual dimensions; the largest pixel area is selected.

Downloads reuse the original Blob URL and use the filename `youtube-{id}-{width}x{height}.jpg`. If CORS prevents reading the response but the image is viewable, the UI offers opening the image for manual saving. There is a 12-second request deadline; newer lookups cancel older ones. Blob URLs are released when results are cleared or the page closes. No image upscaling, cropping, or video downloads are performed.

The YouTube CDN filenames are an external convention and can change. The site does not guarantee HD availability or ownership/reuse rights. The default page makes no requests to YouTube until a lookup or example is submitted.
