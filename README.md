# YT Thumbnail Downloader

Preview and download the available original JPG thumbnails for a YouTube video directly in your browser. Built with Astro, TypeScript, and CSS, with support for 10 languages and deployment on Cloudflare Workers Static Assets.

**Production website: [https://www.ytthumbnaildownloader.org](https://www.ytthumbnaildownloader.org/)**

[GitHub repository](https://github.com/achelie/yt-thumbnail-downloader) · [繁體中文工具](https://www.ytthumbnaildownloader.org/zh-tw/) · [Privacy policy](https://www.ytthumbnaildownloader.org/privacy/)

## Features

- Accepts YouTube watch, Shorts, live, embed, and short links, or an 11-character video ID.
- Checks four thumbnail qualities, reads their actual dimensions, and selects the largest available image.
- Downloads the original JPG without upscaling or cropping; offers manual saving when browser CORS restrictions prevent a direct download.
- Rejects missing images and placeholder thumbnails, cancels superseded lookups, and applies a 12-second request deadline.
- Runs thumbnail lookups in the browser without API keys, a database, an application server, or user accounts.
- Includes 40 static public pages across 10 languages, localized error pages, canonical URLs, language alternates, and a generated sitemap.

Paste a supported video link, load its thumbnails, then choose a size to download. Availability depends on the source video; a maximum-resolution thumbnail is not guaranteed.

## Technology

| Area | Technology |
| --- | --- |
| Static site | Astro |
| Browser logic and build scripts | TypeScript |
| Styling | CSS |
| Hosting and deployment | Cloudflare Workers Static Assets and Wrangler |
| Tests | Node.js test runner |
| Analytics | Microsoft Clarity and Cloudflare Web Analytics |

## Development

Use Node 22.12 or newer (verified with Node 22.19).

```powershell
git clone https://github.com/achelie/yt-thumbnail-downloader.git
cd yt-thumbnail-downloader
npm ci
npm run dev
```

`npm run dev` serves the Astro development site. `npm run build` produces the production site for **https://www.ytthumbnaildownloader.org**, including sitemap.xml, hosting headers, robots.txt, a social card, and icons. `npm run preview` uses Wrangler to serve the built files locally with Cloudflare routing and headers at http://127.0.0.1:4322.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Astro development server. |
| `npm run check` | Check Astro and TypeScript diagnostics. |
| `npm test` | Run thumbnail, localization, and HTTP redirect tests. |
| `npm run build` | Build the static site and generate hosting and SEO files in `dist/`. |
| `npm run preview` | Serve the built site locally with Wrangler at `http://127.0.0.1:4322`. |
| `npm run audit` | Validate built pages, metadata, assets, and indexing configuration. |
| `npm run deploy` | Build, audit, check deployment configuration, and publish production assets. |
| `npm run deploy:redirect` | Publish the separate HTTP-to-HTTPS redirect Worker. |

### Project structure

```text
src/
  components/       Shared tool and information-page templates
  i18n/             Locale dictionaries, routes, and sitemap helpers
  layouts/          Shared HTML layout and analytics integration
  lib/              YouTube input parsing, thumbnails, and site settings
  pages/            English and localized Astro routes
  scripts/          Browser-side downloader UI
  styles/           Shared CSS
  http-redirect.ts  HTTP-to-HTTPS redirect Worker
public/             Static assets, icons, and ads.txt
scripts/            Postbuild, production audit, and deployment checks
tests/              Automated tests
docs/               Localization and SEO documentation
astro.config.ts     Static site configuration
wrangler.jsonc      Production static asset Worker configuration
wrangler.redirect.jsonc  HTTP redirect Worker configuration
```

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

The October 5, 2026 homepage copy update keeps the tool first and adds a supported-link guide and download troubleshooting guide to all 10 languages. Each homepage contains three usage steps, a four-row size table, six link examples, three troubleshooting items, and eight expandable FAQs. The English content goal is 1,200–1,400 words, including FAQ answers; other languages preserve the information naturally without an equivalent word-count threshold. The shared `home.linkGuide` and `home.downloadHelp` content blocks are required in every dictionary.

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

The main Worker is `yt-thumbnail-downloader`; only static assets in `dist` are uploaded to it. The production HTTPS custom domain is attached in `wrangler.jsonc`:

https://www.ytthumbnaildownloader.org

```powershell
$env:SITE_URL = 'https://www.ytthumbnaildownloader.org'
$env:INDEXABLE = 'true'
npm run deploy
```

The `workers.dev` route and version preview URLs are disabled to avoid duplicate indexable hostnames. `npm run deploy` builds, audits the output, and checks the hosting configuration before uploading. It refuses preview-mode builds for the attached production domain, because those builds intentionally omit sitemap.xml and set noindex.

Deploy the separate redirect Worker when creating or updating HTTP normalization:

```powershell
npm run deploy:redirect
```

This command uses `wrangler.redirect.jsonc` to deploy `yt-thumbnail-https-redirect` from `src/http-redirect.ts`, with the scheme-specific route `http://www.ytthumbnaildownloader.org/*`. It sends a permanent 301 directly to the HTTPS www URL while preserving the path and query string. The route matches HTTP only, so normal HTTPS traffic continues to use the main static asset Worker. Its `workers.dev` and version preview URLs are also disabled. The existing bare-domain zone redirect remains responsible for `ytthumbnaildownloader.org` and points directly to HTTPS www.

The local OAuth session available on October 5, 2026 did not have the Single Redirect Edit permission needed to change zone redirect rules, but did support Worker deployment and routes. The HTTP-only Worker route implements normalization with those existing permissions. For future maintenance, a zone Redirect Rule can replace this Worker when suitable zone-edit access is available; that replacement is optional and must preserve the same one-hop path and query behavior.

HTTP requests handled by the redirect script count toward the Workers Free account allowance of 100,000 requests per day, shared across Worker scripts. HTTPS static asset requests remain free and unlimited. See [Cloudflare’s daily request limits](https://developers.cloudflare.com/workers/platform/limits/#daily-requests) and [static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Keep the redirect route limited to HTTP so HTTPS page traffic does not invoke that script.

If the local network cannot reach the Cloudflare API directly, use the existing local proxy for this shell session:

```powershell
$env:HTTPS_PROXY = 'http://127.0.0.1:7897'
$env:HTTP_PROXY = 'http://127.0.0.1:7897'
```

Wrangler uses its locally stored OAuth credentials. Do not commit credentials or token files. No Git remote is required for direct asset deployments.

## Indexing configuration

The shared layout declares a 96×96 PNG favicon at the stable `/favicon.png` URL for Google Search, a scalable SVG for browsers, and a 180×180 Apple touch icon. The build generates both PNG icons from `public/favicon.svg`; the audit verifies their file format, dimensions, and declarations across all pages. See [Google's favicon guidelines](https://developers.google.com/search/docs/appearance/favicon-in-search).

`SITE_URL` and `INDEXABLE` are build-time environment variables read in `src/lib/site.ts`. The default origin is **https://www.ytthumbnaildownloader.org**, and indexing defaults to enabled only for that exact origin. `.env.example` documents the production values; export variables in the shell when changing builds. Non-production origins cannot be explicitly made indexable.

`scripts/postbuild.ts` generates the production `/sitemap.xml` using `src/i18n/sitemap.ts` and the shared route registry. There is no manually maintained `public/sitemap.xml`. The sitemap contains the homepage, About, Privacy, and Terms pages in all 10 languages: exactly 40 absolute www URLs, with language alternates and `x-default` for each page group. The production robots.txt announces `https://www.ytthumbnaildownloader.org/sitemap.xml`. Update the registry and dictionaries when adding pages or languages, then run validation. Do not include error documents or thumbnail query results.

With indexing disabled, every HTML page has `noindex, nofollow`, `_headers` applies the same directive, robots.txt allows crawling, and no sitemap is generated. Allowing crawling lets search engines read `noindex`. Canonical and social URLs use the configured temporary origin.

Production domain: **https://www.ytthumbnaildownloader.org**. Its existing Cloudflare custom-domain binding is preserved by the deployment configuration. Search Console submission has not been performed.

After a production deployment, verify:

1. `/sitemap.xml` returns HTTP 200 with XML containing the 40 www URLs and the correct language alternates.
2. `/robots.txt` allows crawling and announces the production sitemap.
3. All 40 public pages use their own www canonical URLs and have no noindex directive in their HTML or response headers.
4. A nonexistent URL under each language prefix returns a real 404 in that language, with the error page still marked noindex.
5. The HTTPS www homepage returns 200 without a redirect. HTTP www and HTTP/HTTPS bare-domain requests redirect once to the matching HTTPS www URL, preserving localized paths and query strings.
6. Only then submit the production sitemap to Search Console if requested.

The bare domain `ytthumbnaildownloader.org` is not the canonical production hostname; preserve its existing redirect to HTTPS www. For local noindex builds, set `INDEXABLE=false` and use `npm run build` followed by `npm run preview`; the deployment guard prevents publishing those assets over production.

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
