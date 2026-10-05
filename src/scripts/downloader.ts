import {
  fetchThumbnails,
  parseVideoInput,
  revokeThumbnails,
  selectBestThumbnail,
  type LoadedThumbnail,
} from '../lib/thumbnail.ts';
import type { LocaleContent } from '../i18n/types.ts';
import { formatMessage } from '../i18n/format.ts';

export function initializeDownloader(): void {
  const form = document.querySelector<HTMLFormElement>('#downloader-form');
  if (!form || form.dataset.downloaderReady === 'true') return;
  const messages = document.querySelector('#downloader-messages');
  if (!messages?.textContent) return;
  const t = JSON.parse(messages.textContent) as LocaleContent['client'];
  const input = document.querySelector<HTMLInputElement>('#video-url');
  const submit = document.querySelector<HTMLButtonElement>('#get-thumbnails');
  const inputError = document.querySelector<HTMLElement>('#url-error');
  const status = document.querySelector<HTMLElement>('#downloader-status');
  const results = document.querySelector<HTMLElement>('#thumbnail-results');
  const preview = document.querySelector<HTMLImageElement>('#thumbnail-preview');
  const dimensions = document.querySelector<HTMLElement>('#thumbnail-dimensions');
  const quality = document.querySelector<HTMLElement>('#thumbnail-quality');
  const options = document.querySelector<HTMLElement>('#quality-options');
  const download = document.querySelector<HTMLAnchorElement>('#download-thumbnail');
  const open = document.querySelector<HTMLAnchorElement>('#open-thumbnail');
  const copy = document.querySelector<HTMLButtonElement>('#copy-thumbnail-link');
  const copyFallback = document.querySelector<HTMLElement>('#copy-link-fallback');
  const linkInput = document.querySelector<HTMLInputElement>('#thumbnail-link');
  if (!input || !submit || !inputError || !status || !results || !preview || !dimensions
    || !quality || !options || !download || !open || !copy || !copyFallback || !linkInput) return;

  form.dataset.downloaderReady = 'true';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  options.setAttribute('role', 'group');
  linkInput.readOnly = true;
  const defaultSubmitContent = Array.from(submit.childNodes, (node) => node.cloneNode(true));
  const defaultCopyContent = Array.from(copy.childNodes, (node) => node.cloneNode(true));
  const inputDescription = input.getAttribute('aria-describedby') || '';
  let requestId = 0;
  let copyAttemptId = 0;
  let copyFeedbackTimer: number | undefined;
  let activeController: AbortController | null = null;
  let thumbnails: LoadedThumbnail[] = [];
  let selected: LoadedThumbnail | undefined;

  const announce = (message: string) => { status.textContent = message; };
  const resetCopyFeedback = () => {
    copyAttemptId += 1;
    window.clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = undefined;
    copy.replaceChildren(...defaultCopyContent.map((node) => node.cloneNode(true)));
    copy.removeAttribute('data-copied');
  };
  const setLoading = (loading: boolean) => {
    form.setAttribute('aria-busy', String(loading));
    submit.dataset.loading = String(loading);
    if (loading) submit.textContent = t.loading;
    else submit.replaceChildren(...defaultSubmitContent.map((node) => node.cloneNode(true)));
  };
  const clearError = () => {
    inputError.hidden = true;
    inputError.textContent = '';
    input.removeAttribute('aria-invalid');
    if (inputDescription) input.setAttribute('aria-describedby', inputDescription);
    else input.removeAttribute('aria-describedby');
  };
  const clearResults = () => {
    resetCopyFeedback();
    results.hidden = true;
    preview.removeAttribute('src');
    download.removeAttribute('href');
    download.removeAttribute('download');
    open.removeAttribute('href');
    copyFallback.hidden = true;
    linkInput.value = '';
    options.replaceChildren();
    revokeThumbnails(thumbnails);
    thumbnails = [];
    selected = undefined;
  };
  const cancelRequest = () => {
    requestId += 1;
    activeController?.abort();
    activeController = null;
    setLoading(false);
  };
  const selectThumbnail = (thumbnail: LoadedThumbnail, announceSelection = true) => {
    resetCopyFeedback();
    selected = thumbnail;
    preview.referrerPolicy = 'no-referrer';
    preview.width = thumbnail.width;
    preview.height = thumbnail.height;
    preview.src = thumbnail.objectUrl || thumbnail.url;
    preview.alt = formatMessage(t.previewAlt, { id: thumbnail.videoId, width: thumbnail.width, height: thumbnail.height });
    dimensions.textContent = `${thumbnail.width} × ${thumbnail.height}`;
    quality.textContent = t.qualities[thumbnail.quality];
    open.href = thumbnail.url;
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    linkInput.value = thumbnail.url;
    copyFallback.hidden = true;
    download.href = thumbnail.objectUrl || thumbnail.url;
    if (thumbnail.objectUrl) {
      download.download = `youtube-${thumbnail.videoId}-${thumbnail.width}x${thumbnail.height}.jpg`;
      download.textContent = t.download;
      download.removeAttribute('target');
      download.removeAttribute('rel');
    } else {
      download.removeAttribute('download');
      download.textContent = t.openToSave;
      download.target = '_blank';
      download.rel = 'noopener noreferrer';
    }
    options.querySelectorAll<HTMLButtonElement>('button[data-quality]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.quality === thumbnail.quality));
    });
    if (announceSelection) {
      announce(formatMessage(thumbnail.objectUrl ? t.selected : t.selectedFallback, {
        quality: t.qualities[thumbnail.quality], width: thumbnail.width, height: thumbnail.height,
      }));
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    cancelRequest();
    clearError();
    clearResults();
    const parsed = parseVideoInput(input.value);
    if (!parsed.ok) {
      inputError.textContent = t.invalidInput;
      inputError.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', [...new Set(`${inputDescription} url-error`.trim().split(/\s+/))].join(' '));
      announce(t.invalidInput);
      input.focus();
      return;
    }

    const currentRequest = requestId;
    activeController = new AbortController();
    const controller = activeController;
    setLoading(true);
    announce(t.checking);
    try {
      const batch = await fetchThumbnails(parsed.videoId, { signal: controller.signal });
      if (requestId !== currentRequest || controller.signal.aborted) {
        revokeThumbnails(batch.thumbnails);
        return;
      }
      thumbnails = batch.thumbnails;
      const best = selectBestThumbnail(thumbnails);
      if (!best) {
        announce(batch.timedOut ? t.timeout : t.noResults);
        return;
      }
      thumbnails.forEach((thumbnail) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quality-option';
        button.dataset.quality = thumbnail.quality;
        button.setAttribute('aria-pressed', 'false');
        const name = document.createElement('span');
        name.className = 'quality-option-name';
        name.textContent = t.qualities[thumbnail.quality];
        const size = document.createElement('span');
        size.className = 'quality-option-size';
        size.textContent = `${thumbnail.width} × ${thumbnail.height}`;
        button.append(name, size);
        button.addEventListener('click', () => selectThumbnail(thumbnail));
        options.append(button);
      });
      selectThumbnail(best, false);
      results.hidden = false;
      announce(formatMessage(best.objectUrl ? t.found : t.foundFallback, {
        count: thumbnails.length, width: best.width, height: best.height,
      }));
      if (results.getBoundingClientRect().top > window.innerHeight * (2 / 3)) {
        results.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }
    } catch (error) {
      if (currentRequest !== requestId || controller.signal.aborted) return;
      announce(t.networkError);
    } finally {
      if (currentRequest === requestId) {
        activeController = null;
        setLoading(false);
      }
    }
  });

  input.addEventListener('input', clearError);
  copy.addEventListener('click', async () => {
    if (!selected) return;
    resetCopyFeedback();
    const currentCopyAttempt = copyAttemptId;
    const imageUrl = selected.url;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable.');
      await navigator.clipboard.writeText(imageUrl);
      if (copyAttemptId !== currentCopyAttempt || selected?.url !== imageUrl) return;
      copyFallback.hidden = true;
      copy.textContent = t.copied;
      copy.dataset.copied = 'true';
      copyFeedbackTimer = window.setTimeout(() => {
        if (copyAttemptId === currentCopyAttempt) resetCopyFeedback();
      }, 1800);
      announce(t.copySuccess);
    } catch {
      if (copyAttemptId !== currentCopyAttempt || selected?.url !== imageUrl) return;
      copyFallback.hidden = false;
      linkInput.value = imageUrl;
      linkInput.focus();
      linkInput.select();
      linkInput.setSelectionRange(0, imageUrl.length);
      announce(t.copyFailed);
    }
  });
  document.querySelector<HTMLButtonElement>('#clear-thumbnail')?.addEventListener('click', () => {
    cancelRequest();
    clearResults();
    clearError();
    input.value = '';
    announce(t.reset);
    input.focus();
  });
  document.querySelector<HTMLButtonElement>('#try-example')?.addEventListener('click', () => {
    input.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    form.requestSubmit();
  });
  window.addEventListener('pagehide', () => {
    cancelRequest();
    clearResults();
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloader, { once: true });
  } else {
    initializeDownloader();
  }
}
