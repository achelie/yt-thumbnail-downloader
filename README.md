# YT Thumbnail Downloader

Browser-only YouTube thumbnail downloader built with Astro, TypeScript, and CSS, available in 10 languages. The tool, About, Privacy, and Terms pages are statically rendered in every language: 40 public pages, plus 10 localized noindex error documents. No API keys, database, server functions, or accounts. Microsoft Clarity provides visitor-interaction analytics.

## Development

Use Node 22.12 or newer (verified with Node 22.19).

```powershell
npm ci
npm run dev
```

`npm run dev` serves the Astro development site. `npm run build` produces the production site for **https://www.ytthumbnaildownloader.org**, including sitemap.xml, hosting headers, robots.txt, a social card, and icons. `npm run preview` uses Wrangler to serve the built files locally with Cloudflare routing and headers at http://127.0.0.1:4322.

Source repository: https://github.com/achelie/yt-thumbnail-downloader

## Languages and routes

The English pages keep their existing root URLs. The other languages use directory prefixes:

| Language | HTML / hreflang code | Homepage |
| --- | --- | --- |
| English | `en` | `/` |
| 日本語 | `ja` | `/ja/` |
| Español | `es` | `/es/` |
| Français | `fr` | `/fr/` |
| Deutsch | `de` | `/de/` |
| Italiano | `it` | `/it/` |
| 한국어 | `ko` | `/ko/` |
| Português (Brasil) | `pt-BR` | `/pt-br/` |
| Русский | `ru` | `/ru/` |
| 繁體中文（台灣） | `zh-TW` | `/zh-tw/` |

Each homepage has matching `about/`, `privacy/`, and `terms/` pages within its directory. For example, `/fr/privacy/` is the French privacy page. Spanish uses neutral wording for readers across regions; Portuguese targets Brazil and Traditional Chinese targets Taiwan. The English brand **YT Thumbnail Downloader** stays the same in every language.

`src/i18n/routes.ts` is the route registry. `src/i18n/types.ts` defines the content contract, and `src/i18n/locales/*.ts` holds the complete dictionaries for navigation, tool UI, dynamic states, FAQs, information pages, and errors. Shared templates render these dictionaries; the localized dynamic route is `src/pages/[locale]/[...page].astro`. Keep client message placeholders unchanged when editing translations.

The language selector links to the same page in another language. Pages use their own canonical URL and a complete set of language alternates; `x-default` points to the corresponding English page. Search intent, keyword evidence, and the implemented homepage titles are documented in [docs/localization-seo.md](docs/localization-seo.md).

Every language also has a `404.html` document in its own output directory. The postbuild step moves localized error pages into this position so Cloudflare can serve the nearest language-specific error document with HTTP 404. Error pages always remain noindex and are excluded from language alternate groups and the sitemap.

## Validation

```powershell
npm run check
npm test
npm run build
npm run audit
```

The tests cover accepted and rejected URLs, missing high-resolution thumbnails, placeholder images, real dimensions, CORS fallback, cancellation, timeouts, and Blob cleanup. Localization checks cover dictionary structure, message placeholders, routes, and sitemap generation. The audit checks all 40 public pages and 10 error documents, including static content, canonical URLs, language alternates, metadata, assets, and indexing configuration. Browser verification must also include a real download, language switching, localized status messages, and responsive layouts.

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

`scripts/postbuild.ts` generates the production `/sitemap.xml` using `src/i18n/sitemap.ts` and the shared route registry. There is no manually maintained `public/sitemap.xml`. The sitemap contains the homepage, About, Privacy, and Terms pages in all 10 languages: exactly 40 absolute www URLs, with language alternates and `x-default` for each page group. The production robots.txt announces `https://www.ytthumbnaildownloader.org/sitemap.xml`. Update the registry and dictionaries when adding pages or languages, then run validation. Do not include error documents or thumbnail query results.

With indexing disabled, every HTML page has `noindex, nofollow`, `_headers` applies the same directive, robots.txt allows crawling, and no sitemap is generated. Allowing crawling lets search engines read `noindex`. Canonical and social URLs use the configured temporary origin.

Production domain: **https://www.ytthumbnaildownloader.org**. Its existing Cloudflare custom-domain binding is preserved by the deployment configuration. Search Console submission has not been performed.

After a production deployment, verify:

1. `/sitemap.xml` returns HTTP 200 with XML containing the 40 www URLs and the correct language alternates.
2. `/robots.txt` allows crawling and announces the production sitemap.
3. All 40 public pages use their own www canonical URLs and have no noindex directive in their HTML or response headers.
4. A nonexistent URL under each language prefix returns a real 404 in that language, with the error page still marked noindex.
5. Only then submit the production sitemap to Search Console if requested.

The bare domain `ytthumbnaildownloader.org` is not the canonical production hostname; any future bare-domain redirect should point to www. For local noindex builds, set `INDEXABLE=false` and use `npm run build` followed by `npm run preview`; the deployment guard prevents publishing those assets over production.

## Thumbnail behavior

URLs are validated against explicit YouTube hostnames and converted to an 11-character video ID. The browser requests four known JPG candidates from `https://i.ytimg.com`, using no credentials or referrer. Non-200 responses, non-JPG responses, and small placeholder images are rejected. Each successful Blob is decoded for its actual dimensions; the largest pixel area is selected.

Downloads reuse the original Blob URL and use the filename `youtube-{id}-{width}x{height}.jpg`. If CORS prevents reading the response but the image is viewable, the UI offers opening the image for manual saving. There is a 12-second request deadline; newer lookups cancel older ones. Blob URLs are released when results are cleared or the page closes. No image upscaling, cropping, or video downloads are performed.

The YouTube CDN filenames are an external convention and can change. The site does not guarantee HD availability or ownership/reuse rights. The default page makes no requests to YouTube until a lookup or example is submitted.

## Publisher disclosures and contact

`public/ads.txt` authorizes Google for publisher `pub-7443237558968985`. Astro copies it to `/ads.txt` during the build. This file does not enable ad serving: the site currently has no AdSense ad script or ad units.

All ten Privacy pages explain the data handling that would apply if Google ads are enabled, link to Google's partner-site data explanation and My Ad Center, and disclose Cloudflare Web Analytics alongside Clarity and the image CDN. Before enabling ads, implement and verify any required consent and withdrawal controls and review which pages can show ads. Keep the current-ad-status statements accurate when changing that behavior.

The public contact address is `contact@ytthumbnaildownloader.org`, defined once in `src/i18n/contact.ts`. Every footer links to it. About pages identify the operator as an independent developer and explain how to report a problem or copyright concern; Privacy pages explain how email requests are handled. Domain email forwarding is configured separately in Cloudflare Email Routing. The private destination mailbox must not be included in site content or this repository.

## Microsoft Clarity

The standard asynchronous Microsoft Clarity snippet is included in the shared `src/layouts/Layout.astro` for project **ys07qa7u86**, so it loads across the site without an additional npm dependency. Clarity loads independently of thumbnail lookups.

Clarity helps understand visitor interactions through heatmaps and session replay. It may use cookies and collect usage, device, browser, and interaction information, including page content and interactions. Every localized Privacy page, including `/privacy/`, `/pt-br/privacy/`, and `/zh-tw/privacy/`, discloses this integration and links to the [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement). Keep these disclosures consistent when changing tracking behavior; do not restore outdated claims that the site has no analytics or cookies.
