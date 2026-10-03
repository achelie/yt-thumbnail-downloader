# Localization SEO research and implementation

Evidence date: **2026-10-04, Asia/Hong_Kong**. This record consolidates the public search-suggestion checks and actual search-result pages reviewed during planning. The title and H1 values below were read from the implemented dictionaries in `src/i18n/locales/` on the same date.

The Semrush API allowance was insufficient for this research, so no usable monthly search-volume or keyword-difficulty figures were obtained. **Autocomplete suggestions are not monthly search volumes.** Competitor wording confirms language and intent, not demand size or ranking strength. Primary and secondary keywords below are editorial recommendations based on the observed wording; they are not a volume ranking. Search suggestions may change with time and location.

## Shared intent and implementation

The product retrieves the available thumbnail images for one YouTube video and saves the original JPG. The target intent is thumbnail download, extraction, or saving—not video download, thumbnail design, image generation, bulk downloading, or guaranteed 4K output. Keep the brand **YT Thumbnail Downloader** in English. Translate the task, navigation, status messages, and supporting pages naturally.

English remains at `/`, with nine localized homepages and their matching About, Privacy, and Terms pages. Portuguese is Brazilian (`pt-BR`, `/pt-br/`), Traditional Chinese is Taiwanese (`zh-TW`, `/zh-tw/`), and Spanish uses neutral cross-regional wording (`es`, `/es/`). The route registry contains 40 public pages; localized error documents do not enter the sitemap. Each public page has a self-referencing canonical and alternates for the equivalent page in every language, with the English equivalent as `x-default`.

Every locale has eight FAQs covering operation, available image quality, missing resolutions, Shorts, mobile saving, accepted links, data handling, and reuse rights. The selected local FAQ questions below reflect the implemented copy rather than copied competitor text. HD availability is conditional on the source image. Do not infer that a video’s upload resolution alone determines its available thumbnails. Suggestions containing “4K” do not justify promising that output.

## Japanese — Japan

- Route / language: `/ja/`, `ja`; suggestion market: `hl=ja`, `gl=JP`.
- Primary keyword: **YouTube サムネ 保存**.
- Secondary intent: `YouTube サムネイル ダウンロード`, `YouTube サムネ 保存 高画質`, `YouTube サムネ 保存 iPhone`, `YouTube サムネ 保存 スマホ`.
- Implemented title: **YouTubeサムネ保存｜高画質のサムネイルを無料ダウンロード**.
- Implemented H1: **YouTubeのサムネイルを保存**.
- FAQ examples: `YouTubeのサムネイルを保存するには？` / `iPhoneやAndroidでもサムネを保存できますか？` / `YouTubeショートのサムネイルも取得できますか？`.

The recorded Google suggestions for the saving query included method, site, high-quality, iPhone, and smartphone modifiers. Use the compact everyday term `サムネ` for discovery, with `サムネイル` in explanatory text. Evidence: [Google suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=JP&q=youtube%20%E3%82%B5%E3%83%A0%E3%83%8D%20%E4%BF%9D%E5%AD%98), [GCGX result page](https://gcgx.games/web/tool/youtube_thumbnail.html), [Anys result page](https://anysweb.co.jp/youtube-thumbnail/).

## Spanish — neutral cross-regional wording

- Route / language: `/es/`, `es`; suggestion checks: `hl=es`, principally `gl=MX`, with an additional Spain check.
- Primary keyword: **descargar miniaturas de YouTube**.
- Secondary intent: `descargador de miniaturas de YouTube`, `descargar miniatura de un video de YouTube`, `descargar miniaturas de YouTube HD`.
- Implemented title: **Descargar miniaturas de YouTube gratis en JPG**.
- Implemented H1: **Descargar miniaturas de YouTube**.
- FAQ examples: `¿Cómo descargo la miniatura de un video de YouTube?` / `¿Por qué no aparece la miniatura de mayor resolución?` / `¿Cómo guardo una miniatura en mi teléfono?`.

The Mexico query `descargar miniaturas` returned variants including `descargar miniaturas de videos` and `descargar miniaturas hd`. Exact inputs containing YouTube returned no suggestions in the successful requests; one Spain request failed with an SSL error. The YouTube-specific main phrase is supported by actual Spanish result pages, not an autocomplete volume claim. Prefer `pega`, `descarga`, `enlace`, and `teléfono`, avoiding regional voseo forms. Evidence: [Google suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=MX&q=descargar%20miniaturas), [YouTube’s Spanish terminology](https://support.google.com/youtube/answer/72431?hl=es), [UpTube result page](https://www.uptube.io/es/tools/youtube-thumbnail-downloader), [Thumbnail Download YT result page](https://thumbnaildownloadyt.com/es).

## French — France

- Route / language: `/fr/`, `fr`; suggestion market: `hl=fr`, `gl=FR`.
- Primary keyword: **télécharger miniature YouTube**.
- Secondary intent: `télécharger miniature YouTube HD`, `télécharger miniature YouTube Shorts`, `télécharger vignette YouTube`.
- Implemented title: **Télécharger une miniature YouTube gratuitement**.
- Implemented H1: **Télécharger une miniature YouTube**.
- FAQ examples: `Comment télécharger la miniature d’un YouTube Short ?` / `Pourquoi la miniature en résolution maximale est-elle absente ?` / `Comment enregistrer une miniature sur mon téléphone ?`.

Google returned the main query and HD, Shorts, and `vignette` variants. The article `une` makes the H1 a natural instruction; it is intentionally not an exact reproduction of the compressed search query. Use `miniature` as the principal noun. Evidence: [Google suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=FR&q=t%C3%A9l%C3%A9charger%20miniature%20youtube), [YouTube’s French terminology](https://support.google.com/youtube/answer/72431?hl=fr), [Pluri.tools result page](https://pluri.tools/fr/telecharger-miniature-youtube/), [ImageTools result page](https://www.imagetools.org/fr/youtube-thumbnail-downloader).

## German — Germany

- Route / language: `/de/`, `de`; suggestion market: `hl=de`, `gl=DE`.
- Primary keyword: **YouTube-Thumbnail herunterladen**.
- Secondary intent: `YouTube Vorschaubild speichern`, `YouTube Vorschaubild herunterladen`, `YouTube Thumbnail Download`.
- Implemented title: **YouTube-Thumbnail herunterladen – kostenlos & online**.
- Implemented H1: **YouTube-Thumbnail herunterladen**.
- FAQ examples: `Wie lade ich ein YouTube-Vorschaubild herunter?` / `Warum fehlt die höchste Auflösung?` / `Wie speichere ich ein Thumbnail auf dem Handy?`.

The broader `youtube vorschaubild` query produced a saving variant. The exact downloading phrase returned no autocomplete suggestion in the recorded check. The chosen primary keyword combines the download intent visible in the result pages with the common product noun; `Vorschaubild` remains a useful native-language synonym. Evidence: [Google suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=DE&q=youtube%20vorschaubild), [GetYTThumbnail result page](https://getytthumbnail.com/de/), [ThumbnailsGrabber result page](https://thumbnailsgrabber.com/de/youtube-thumbnail-herunterladen).

## Italian — Italy

- Route / language: `/it/`, `it`; suggestion market: `hl=it`, `gl=IT`.
- Primary keyword: **scaricare miniatura YouTube**.
- Secondary intent: `scaricare copertina YouTube`, `scaricare copertina video YouTube`, `scaricare miniature YouTube`.
- Implemented title: **Scarica miniature YouTube gratis e senza registrazione**.
- Implemented H1: **Scarica miniature YouTube**.
- FAQ examples: `Come scaricare la miniatura di un video YouTube?` / `Perché manca la miniatura alla massima risoluzione?` / `Come salvo una miniatura su iPhone o Android?`.

The recorded Google check returned `scaricare miniatura youtube`; the `copertina` query also produced a video modifier. The page uses the natural imperative `Scarica`, while explanatory text covers the infinitive search form. Evidence: [Google miniature suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=IT&q=scaricare%20miniatura%20youtube), [Google cover suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=IT&q=scaricare%20copertina%20youtube), [Thumbnail Download YT result page](https://thumbnaildownloadyt.com/it), [Toolopoli result page](https://toolopoli.com/tools/miniatura-youtube).

## Korean — South Korea

- Route / language: `/ko/`, `ko`; recorded suggestion source: Bing, `market=ko-KR`.
- Primary keyword: **유튜브 썸네일 추출**.
- Secondary intent: `유튜브 썸네일 다운로드`, `유튜브 썸네일 저장`, `유튜브 썸네일 추출기`.
- Implemented title: **유튜브 썸네일 추출 · 고화질 이미지 무료 다운로드**.
- Implemented H1: **유튜브 썸네일 추출**.
- FAQ examples: `유튜브 썸네일은 어떻게 추출하나요?` / `쇼츠 썸네일도 추출할 수 있나요?` / `모바일에서는 썸네일을 어떻게 저장하나요?`.

Bing’s Korean suggestions included extraction, download, saving, and extractor variants. These were first-party Bing suggestions; no Google-specific conclusion is claimed for this locale. The extraction term leads naturally into the tool’s preview-and-save behavior. Evidence: [Bing suggestions](https://api.bing.com/osjson.aspx?query=%EC%9C%A0%ED%8A%9C%EB%B8%8C%20%EC%8D%B8%EB%84%A4%EC%9D%BC&market=ko-KR), [Dalkak result page](https://dalkak.ai/tools/youtube-thumbnail), [OneToolHub result page](https://onetoolhub.com/tools/youtube-thumbnail).

## Portuguese — Brazil

- Route / language: `/pt-br/`, `pt-BR`; suggestion market: `hl=pt-BR`, `gl=BR`.
- Primary keyword: **baixar thumbnail do YouTube**.
- Secondary intent: `baixar miniatura do YouTube`, `baixar thumbnail YouTube online`, `baixar thumbnail do YouTube em HD`, `baixar thumbnail por link`.
- Implemented title: **Baixar thumbnail do YouTube grátis em JPG**.
- Implemented H1: **Baixar thumbnail do YouTube**.
- FAQ examples: `Como baixar a thumbnail de um vídeo do YouTube?` / `Por que a miniatura em resolução máxima não aparece?` / `Como salvar uma thumbnail no celular?`.

Google returned `baixar thumbnail youtube online`; the shorter query also produced HD and link-based variants. A separate check returned `baixar miniatura youtube`. Use `thumbnail` and the explanatory synonym `miniatura`, with Brazilian wording such as `baixar`, `celular`, `grátis`, and `sem cadastro`. Evidence: [Google thumbnail suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&gl=BR&q=baixar%20thumbnail), [Google miniatura suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&gl=BR&q=baixar%20miniatura%20youtube), [YouTube’s Brazilian Portuguese terminology](https://support.google.com/youtube/answer/72431?hl=pt-BR), [Utilpedia result page](https://utilpedia.com.br/baixar-thumbnail-do-youtube), [Revista QMIX result page](https://qmixdigital.com.br/ferramentas/baixar-thumbnail-youtube/).

## Russian — Russian-language users

- Route / language: `/ru/`, `ru`; suggestion market used for research: `hl=ru`, `gl=RU`.
- Primary keyword: **скачать превью ютуб**.
- Secondary intent: `скачать превью YouTube по ссылке`, `скачать превью YouTube онлайн`, `скачать превью YouTube в хорошем качестве`, `скачать обложку видео YouTube`.
- Implemented title: **Скачать превью YouTube бесплатно — по ссылке**.
- Implemented H1: **Скачать превью с YouTube**.
- FAQ examples: `Как скачать превью с YouTube по ссылке?` / `Почему нет превью в максимальном разрешении?` / `Как сохранить превью на телефоне?`.

The recorded suggestions included link-based, online, and good-quality modifiers. The interface preserves the YouTube brand spelling and uses natural grammar rather than repeating the abbreviated query verbatim. `Обложка` provides an additional cover-image synonym. Evidence: [Google suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=ru&gl=RU&q=%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20%D0%BF%D1%80%D0%B5%D0%B2%D1%8C%D1%8E%20%D1%8E%D1%82%D1%83%D0%B1), [Linklister result page](https://linklister.ru/youtube-downloader), [Resize-web cover-image result page](https://resize-web.ru/skachat-oblozhku-video-s-youtube/). The Linklister URL is broad; it is recorded as a reviewed result, not evidence that this product should target video-file downloads.

## Traditional Chinese — Taiwan

- Route / language: `/zh-tw/`, `zh-TW`; suggestion market: `hl=zh-TW`, `gl=TW`.
- Primary keyword: **YouTube 縮圖下載**.
- Secondary intent: `YouTube 縮圖下載器`, `YouTube 封面下載`, `YouTube 封面圖下載`.
- Implemented title: **YouTube 縮圖下載｜免費下載高畫質影片封面**.
- Implemented H1: **YouTube 縮圖下載**.
- FAQ examples: `如何下載 YouTube 縮圖？` / `手機也能下載 YouTube 封面嗎？` / `為什麼沒有最高解析度的縮圖？`.

The thumbnail query returned download and downloader variants; the cover query returned cover-download and cover-image-download variants. Use Taiwan terminology such as `縮圖`, `影片`, `畫質`, `連結`, and `儲存` throughout the UI and supporting pages. Evidence: [Google thumbnail suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=zh-TW&gl=TW&q=youtube%20%E7%B8%AE%E5%9C%96), [Google cover suggestions](https://suggestqueries.google.com/complete/search?client=firefox&hl=zh-TW&gl=TW&q=youtube%20%E5%B0%81%E9%9D%A2), [Techmarks result page](https://www.techmarks.com/youtube_thumbnail/), [Wiz result page](https://wiz.ooo/zh-TW/apps/yt-thumbnail-dl).

## Maintenance notes

- Treat dictionaries as the source of truth for rendered titles, H1s, FAQs, and disclosures. Update this record when those values or the research evidence change.
- Keep secondary phrases within useful explanations. Do not create separate doorway pages for singular/plural spellings, English loanwords, or synonymous cover-image terms.
- Keep About, Privacy, Terms, form errors, loading states, copy feedback, and 404 pages localized—not just the homepage headline.
- Privacy copy must continue to disclose YouTube CDN requests, ordinary connection data, Cloudflare hosting, Microsoft Clarity heatmaps/session replay and possible cookies, and clipboard writes only after clicking Copy. Do not claim anonymity, no analytics, or a consent flow that the product does not implement.
- Run the existing checks and SEO audit before publication. Verify 40 sitemap URLs, self-canonicals, reciprocal alternate groups, 10 language-specific noindex error documents, and the language selector’s equivalent-page links.
