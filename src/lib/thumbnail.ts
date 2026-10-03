export type ThumbnailQuality = 'maxres' | 'standard' | 'high' | 'medium';

export interface ThumbnailCandidate {
  quality: ThumbnailQuality;
  label: string;
  url: string;
}

export interface LoadedThumbnail extends ThumbnailCandidate {
  videoId: string;
  width: number;
  height: number;
  /** Present only when the original JPG can be downloaded directly. */
  objectUrl: string | null;
}

export type ParsedVideoInput =
  | { ok: true; videoId: string; canonicalUrl: string }
  | { ok: false; error: string };

export interface ThumbnailBatch {
  videoId: string;
  thumbnails: LoadedThumbnail[];
  unavailable: number;
  timedOut: boolean;
}

interface ImageSize {
  width: number;
  height: number;
}

export interface ThumbnailDependencies {
  fetch: typeof globalThis.fetch;
  loadImage: (url: string, signal: AbortSignal) => Promise<ImageSize>;
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
}

export interface ThumbnailLoadOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Injectable browser boundaries keep network and cancellation tests deterministic. */
  dependencies?: Partial<ThumbnailDependencies>;
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
]);
const EMBED_HOSTS = new Set(['youtube-nocookie.com', 'www.youtube-nocookie.com']);
const INPUT_ERROR = 'Enter a valid YouTube video URL or an 11-character video ID.';

export const THUMBNAIL_QUALITIES = [
  { quality: 'maxres', label: 'Max resolution', filename: 'maxresdefault.jpg' },
  { quality: 'standard', label: 'Standard', filename: 'sddefault.jpg' },
  { quality: 'high', label: 'High quality', filename: 'hqdefault.jpg' },
  { quality: 'medium', label: 'Medium', filename: 'mqdefault.jpg' },
] as const;

/** Parse only known YouTube hosts; never use user input as a request URL. */
export function parseVideoInput(input: string): ParsedVideoInput {
  const value = input.trim();
  let videoId: string | null = null;

  if (VIDEO_ID.test(value)) {
    videoId = value;
  } else {
    if (!value || /\s/.test(value)) return { ok: false, error: INPUT_ERROR };
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) {
        return { ok: false, error: INPUT_ERROR };
      }
      const parts = url.pathname.split('/').filter(Boolean);
      if (['youtu.be', 'www.youtu.be'].includes(url.hostname) && parts.length === 1) {
        videoId = decodeURIComponent(parts[0]);
      } else if (YOUTUBE_HOSTS.has(url.hostname)) {
        if (parts.length === 1 && parts[0] === 'watch') {
          videoId = url.searchParams.get('v');
        } else if (parts.length === 2 && ['shorts', 'live', 'embed', 'v'].includes(parts[0])) {
          videoId = decodeURIComponent(parts[1]);
        }
      } else if (EMBED_HOSTS.has(url.hostname) && parts.length === 2 && parts[0] === 'embed') {
        videoId = decodeURIComponent(parts[1]);
      }
    } catch {
      return { ok: false, error: INPUT_ERROR };
    }
  }

  return videoId && VIDEO_ID.test(videoId)
    ? { ok: true, videoId, canonicalUrl: `https://www.youtube.com/watch?v=${videoId}` }
    : { ok: false, error: INPUT_ERROR };
}

export function getThumbnailCandidates(videoId: string): ThumbnailCandidate[] {
  if (!VIDEO_ID.test(videoId)) throw new TypeError('Invalid YouTube video ID.');
  return THUMBNAIL_QUALITIES.map(({ quality, label, filename }) => ({
    quality,
    label,
    url: `https://i.ytimg.com/vi/${videoId}/${filename}`,
  }));
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw signal.reason ?? new DOMException('Request cancelled.', 'AbortError');
}

/** Works for Blob URLs and, as a CORS fallback, ordinary cross-origin images. */
export function loadImageSize(url: string, signal: AbortSignal): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException('Request cancelled.', 'AbortError'));
      return;
    }
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanup();
      image.src = '';
      reject(signal.reason ?? new DOMException('Request cancelled.', 'AbortError'));
    };
    image.onload = () => {
      const size = { width: image.naturalWidth, height: image.naturalHeight };
      cleanup();
      resolve(size);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error('The thumbnail image could not be loaded.'));
    };
    image.referrerPolicy = 'no-referrer';
    signal.addEventListener('abort', onAbort, { once: true });
    image.src = url;
  });
}

function validImageSize(size: ImageSize): boolean {
  // Missing YouTube images can be decodable 120 × 90 JPEG placeholders.
  return Number.isFinite(size.width) && Number.isFinite(size.height)
    && size.width >= 320 && size.height >= 180;
}

async function loadCandidate(
  videoId: string,
  candidate: ThumbnailCandidate,
  signal: AbortSignal,
  dependencies: ThumbnailDependencies,
): Promise<LoadedThumbnail> {
  throwIfAborted(signal);
  let response: Response;
  try {
    response = await dependencies.fetch(candidate.url, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal,
    });
  } catch (error) {
    throwIfAborted(signal);
    // A blocked CORS fetch may still be viewable as an ordinary image.
    // This path must not be used for an explicit HTTP error response.
    const size = await dependencies.loadImage(candidate.url, signal);
    throwIfAborted(signal);
    if (!validImageSize(size)) throw new Error('This thumbnail size is unavailable.', { cause: error });
    return { ...candidate, ...size, videoId, objectUrl: null };
  }

  throwIfAborted(signal);
  if (response.status !== 200 || !response.ok) throw new Error('This thumbnail size is unavailable.');
  const blob = await response.blob();
  throwIfAborted(signal);
  if (!blob.size || !/^image\/(jpeg|jpg)(?:;|$)/i.test(blob.type)) {
    throw new Error('The response is not a JPG image.');
  }
  const objectUrl = dependencies.createObjectURL(blob);
  try {
    const size = await dependencies.loadImage(objectUrl, signal);
    throwIfAborted(signal);
    if (!validImageSize(size)) throw new Error('This thumbnail size is unavailable.');
    return { ...candidate, ...size, videoId, objectUrl };
  } catch (error) {
    dependencies.revokeObjectURL(objectUrl);
    throw error;
  }
}

export function selectBestThumbnail(thumbnails: readonly LoadedThumbnail[]): LoadedThumbnail | undefined {
  return thumbnails.reduce<LoadedThumbnail | undefined>((best, thumbnail) => (
    !best || thumbnail.width * thumbnail.height > best.width * best.height ? thumbnail : best
  ), undefined);
}

export function revokeThumbnails(
  thumbnails: readonly LoadedThumbnail[],
  revoke: (url: string) => void = (url) => URL.revokeObjectURL(url),
): void {
  const urls = new Set(thumbnails.flatMap((thumbnail) => thumbnail.objectUrl ? [thumbnail.objectUrl] : []));
  urls.forEach(revoke);
}

/** Fetch all four candidates concurrently, returning only usable images. */
export async function fetchThumbnails(
  videoId: string,
  options: ThumbnailLoadOptions = {},
): Promise<ThumbnailBatch> {
  const candidates = getThumbnailCandidates(videoId);
  const dependencies: ThumbnailDependencies = {
    fetch: (input, init) => globalThis.fetch(input, init),
    loadImage: loadImageSize,
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    ...options.dependencies,
  };
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort(options.signal?.reason ?? new DOMException('Request cancelled.', 'AbortError'));
  if (options.signal?.aborted) onAbort();
  else options.signal?.addEventListener('abort', onAbort, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException('The thumbnail request timed out.', 'TimeoutError'));
  }, options.timeoutMs ?? 12_000);

  try {
    const outcomes = await Promise.allSettled(candidates.map((candidate) => (
      loadCandidate(videoId, candidate, controller.signal, dependencies)
    )));
    const thumbnails = outcomes.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    if (options.signal?.aborted) {
      revokeThumbnails(thumbnails, dependencies.revokeObjectURL);
      throwIfAborted(options.signal);
    }
    thumbnails.sort((left, right) => right.width * right.height - left.width * left.height);
    return { videoId, thumbnails, unavailable: candidates.length - thumbnails.length, timedOut };
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
