# YT Thumbnail Downloader

English, browser-only YouTube thumbnail downloader built with Astro, TypeScript, and CSS. The page content is statically rendered. No API keys, database, server functions, accounts, analytics, or application cookies.

## Development

Use Node 22.12 or newer (verified with Node 22.19).

```powershell
npm ci
npm run dev
```

`npm run dev` serves the Astro development site. `npm run build` produces the production site for **https://www.ytthumbnaildownloader.org**, including sitemap.xml, hosting headers, robots.txt, a social card, and icons. `npm run preview` uses Wrangler to serve the built files locally with Cloudflare routing and headers at http://127.0.0.1:4322.

Source repository: https://github.com/achelie/yt-thumbnail-downloader

## Validation

```powershell
npm run check
npm test
npm run build
npm run audit
```

The tests cover accepted and rejected URLs, missing high-resolution thumbnails, placeholder images, real dimensions, CORS fallback, cancellation, timeouts, and Blob cleanup. The audit checks the generated HTML and indexing configuration. Browser verification must also include a real download and responsive layouts.

Known dependency advisory (checked October 3, 2026): Astro's build dependency `http-cache-semantics@4.2.0` has an [unpatched upstream advisory](https://github.com/advisories/GHSA-ch52-4w7c-c8xp). This site does not use Astro remote image processing, server rendering, or shared application caches; the dependency is not present in the deployed static assets. The advisory remains in `npm audit`; do not use its suggested major Astro downgrade as an automatic fix. Reassess before introducing server rendering or when an upstream patch is available.

## Production Cloudflare deployment

The configured Worker is `yt-thumbnail-downloader`; only static assets in `dist` are uploaded. The production custom domain is attached in `wrangler.jsonc`:

https://www.ytthumbnaildownloader.org

```powershell
$env:SITE_URL = 'https://www.ytthumbnaildownloader.org'
$env:INDEXABLE = 'true'
npm run deploy
```

The `workers.dev` route and version preview URLs are disabled to avoid duplicate indexable hostnames. `npm run deploy` builds, audits the output, and checks the hosting configuration before uploading. It refuses preview-mode builds for the attached production domain, because those builds intentionally omit sitemap.xml and set noindex.

If the local network cannot reach the Cloudflare API directly, use the existing local proxy for this shell session:

```powershell
$env:HTTPS_PROXY = 'http://127.0.0.1:7897'
$env:HTTP_PROXY = 'http://127.0.0.1:7897'
```

Wrangler uses its locally stored OAuth credentials. Do not commit credentials or token files. No Git remote is required for direct asset deployments.

## Indexing configuration

`SITE_URL` and `INDEXABLE` are build-time environment variables read in `src/lib/site.ts`. The default origin is **https://www.ytthumbnaildownloader.org**, and indexing defaults to enabled only for that exact origin. `.env.example` documents the production values; export variables in the shell when changing builds. Non-production origins cannot be explicitly made indexable.

The production sitemap is maintained in `public/sitemap.xml` and copied to `/sitemap.xml` during the build. It includes only the homepage, About, Privacy, and Terms pages, with absolute www URLs. The production robots.txt announces `https://www.ytthumbnaildownloader.org/sitemap.xml`. The SEO audit verifies every sitemap URL against the page canonicals. Add new indexable pages to the sitemap and audit together; do not include the 404 page or thumbnail query results.

With indexing disabled, every HTML page has `noindex, nofollow`, `_headers` applies the same directive, robots.txt allows crawling, and no sitemap is generated. Allowing crawling lets search engines read `noindex`. Canonical and social URLs use the configured temporary origin.

Production domain: **https://www.ytthumbnaildownloader.org**. Its existing Cloudflare custom-domain binding is preserved by the deployment configuration. Search Console submission has not been performed.

After a production deployment, verify:

1. `/sitemap.xml` returns HTTP 200 with XML containing the four www URLs.
2. `/robots.txt` allows crawling and announces the production sitemap.
3. The four public pages use www canonical URLs and have no noindex directive in their HTML or response headers.
4. A nonexistent URL returns a real 404, with the 404 page still marked noindex.
5. Only then submit the production sitemap to Search Console if requested.

The bare domain `ytthumbnaildownloader.org` is not the canonical production hostname; any future bare-domain redirect should point to www. For local noindex builds, set `INDEXABLE=false` and use `npm run build` followed by `npm run preview`; the deployment guard prevents publishing those assets over production.

## Thumbnail behavior

URLs are validated against explicit YouTube hostnames and converted to an 11-character video ID. The browser requests four known JPG candidates from `https://i.ytimg.com`, using no credentials or referrer. Non-200 responses, non-JPG responses, and small placeholder images are rejected. Each successful Blob is decoded for its actual dimensions; the largest pixel area is selected.

Downloads reuse the original Blob URL and use the filename `youtube-{id}-{width}x{height}.jpg`. If CORS prevents reading the response but the image is viewable, the UI offers opening the image for manual saving. There is a 12-second request deadline; newer lookups cancel older ones. Blob URLs are released when results are cleared or the page closes. No image upscaling, cropping, or video downloads are performed.

The YouTube CDN filenames are an external convention and can change. The site does not guarantee HD availability or ownership/reuse rights. The default page makes no requests to YouTube until a lookup or example is submitted.
