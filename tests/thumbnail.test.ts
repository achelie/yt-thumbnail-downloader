import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fetchThumbnails,
  getThumbnailCandidates,
  parseVideoInput,
  revokeThumbnails,
  selectBestThumbnail,
  type ThumbnailDependencies,
} from '../src/lib/thumbnail.ts';

const VIDEO_ID = 'dQw4w9WgXcQ';

test('accepts common YouTube URLs, timestamps, Shorts, live, embeds, and bare IDs', () => {
  const inputs = [
    VIDEO_ID,
    `  ${VIDEO_ID}  `,
    `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtube.com/watch?t=42&v=${VIDEO_ID}&list=PL123`,
    `https://youtu.be/${VIDEO_ID}?si=123&t=42`,
    `youtu.be/${VIDEO_ID}`,
    `www.youtube.com/watch?v=${VIDEO_ID}`,
    `https://m.youtube.com/watch?v=${VIDEO_ID}`,
    `https://music.youtube.com/watch?v=${VIDEO_ID}`,
    `https://www.youtube.com/shorts/${VIDEO_ID}`,
    `https://youtube.com/live/${VIDEO_ID}?feature=share`,
    `https://youtube.com/embed/${VIDEO_ID}`,
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
    `http://youtube.com/v/${VIDEO_ID}`,
  ];
  for (const input of inputs) {
    assert.deepEqual(parseVideoInput(input), {
      ok: true,
      videoId: VIDEO_ID,
      canonicalUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    }, input);
  }
});

test('rejects unsupported links, deceptive hosts, credentials, schemes, and malformed IDs', () => {
  const inputs = [
    '', 'not a youtube link', '1234567890', '123456789012', 'bad?videoID',
    `https://youtube.com.evil.example/watch?v=${VIDEO_ID}`,
    `https://evilyoutube.com/watch?v=${VIDEO_ID}`,
    `https://youtube.com@evil.example/watch?v=${VIDEO_ID}`,
    `https://someone@youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtube.com:444/watch?v=${VIDEO_ID}`,
    `ftp://youtube.com/watch?v=${VIDEO_ID}`,
    `javascript:alert('${VIDEO_ID}')`,
    `https://youtube.com/playlist?list=${VIDEO_ID}`,
    `https://youtube.com/channel/${VIDEO_ID}`,
    `https://youtube.com/watch?list=${VIDEO_ID}`,
    `https://youtube-nocookie.com/watch?v=${VIDEO_ID}`,
    `https://youtu.be/${VIDEO_ID}/extra`,
    `https://youtube.com/shorts/${VIDEO_ID}/extra`,
    `https://youtube.com/watch?v=${VIDEO_ID}%20`,
    `https://youtube.com/watch?\nv=${VIDEO_ID}`,
  ];
  for (const input of inputs) assert.equal(parseVideoInput(input).ok, false, input);
});

test('thumbnail requests always use fixed YouTube CDN URLs', () => {
  const candidates = getThumbnailCandidates(VIDEO_ID);
  assert.equal(candidates.length, 4);
  assert.deepEqual(candidates.map((candidate) => candidate.url), [
    `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${VIDEO_ID}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${VIDEO_ID}/mqdefault.jpg`,
  ]);
  assert.throws(() => getThumbnailCandidates('../untrusted'), TypeError);
});

function fixture(overrides: Partial<ThumbnailDependencies> = {}) {
  const revoked: string[] = [];
  let objectCounter = 0;
  const sizes = [
    { width: 1280, height: 720 },
    { width: 640, height: 480 },
    { width: 480, height: 360 },
    { width: 320, height: 180 },
  ];
  const dependencies: ThumbnailDependencies = {
    fetch: async () => new Response(new Blob(['jpg'], { type: 'image/jpeg' }), { status: 200 }),
    createObjectURL: () => `blob:test-${objectCounter++}`,
    revokeObjectURL: (url) => { revoked.push(url); },
    loadImage: async (url) => sizes[Number(url.split('-').at(-1))] || sizes[0],
    ...overrides,
  };
  return { dependencies, revoked };
}

test('loads all four candidates concurrently with CORS and selects actual largest pixels', async () => {
  let count = 0;
  let release: () => void = () => {};
  const barrier = new Promise<void>((resolve) => { release = resolve; });
  const state = fixture({
    fetch: async (_url, init) => {
      assert.equal(init?.mode, 'cors');
      assert.equal(init?.credentials, 'omit');
      assert.equal(init?.referrerPolicy, 'no-referrer');
      assert.ok(init?.signal instanceof AbortSignal);
      count += 1;
      if (count === 4) release();
      await barrier;
      return new Response(new Blob(['jpg'], { type: 'image/jpeg' }), { status: 200 });
    },
  });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
  assert.equal(count, 4);
  assert.equal(batch.thumbnails.length, 4);
  assert.equal(batch.unavailable, 0);
  assert.equal(batch.timedOut, false);
  assert.equal(selectBestThumbnail(batch.thumbnails)?.width, 1280);
  assert.ok(batch.thumbnails.every((thumbnail) => thumbnail.objectUrl?.startsWith('blob:')));
  assert.deepEqual(state.revoked, []);
  const [first, second] = batch.thumbnails;
  assert.equal(selectBestThumbnail([{ ...first, width: 320, height: 180 }, second])?.quality, 'standard');
});

test('excludes missing high-resolution JPGs even if a 404 body is a decodable image', async () => {
  const probed: string[] = [];
  const state = fixture({
    fetch: async (url) => new Response(new Blob(['jpg'], { type: 'image/jpeg' }), {
      status: String(url).includes('maxresdefault') || String(url).includes('sddefault') ? 404 : 200,
    }),
    loadImage: async (url) => { probed.push(url); return { width: 480, height: 360 }; },
  });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
  assert.deepEqual(batch.thumbnails.map((thumbnail) => thumbnail.quality), ['high', 'medium']);
  assert.equal(probed.length, 2);
  assert.ok(probed.every((url) => url.startsWith('blob:')));
});

test('rejects successful HTTP placeholder images and releases their Blob URLs', async () => {
  const state = fixture({ loadImage: async () => ({ width: 120, height: 90 }) });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
  assert.equal(batch.thumbnails.length, 0);
  assert.equal(state.revoked.length, 4);
});

test('rejects non-JPG or empty responses without allocating Blob URLs', async () => {
  for (const body of [new Blob(['not an image'], { type: 'text/html' }), new Blob([], { type: 'image/jpeg' })]) {
    const state = fixture({
      fetch: async () => new Response(body),
      createObjectURL: () => { throw new Error('Invalid responses must not allocate Blob URLs.'); },
    });
    const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
    assert.equal(batch.thumbnails.length, 0);
    assert.equal(state.revoked.length, 0);
  }
});

test('falls back to real image dimensions after CORS rejection without promising direct downloads', async () => {
  const state = fixture({
    fetch: async () => { throw new TypeError('Failed to fetch'); },
    loadImage: async (url) => ({ width: url.includes('maxres') ? 120 : 480, height: url.includes('maxres') ? 90 : 360 }),
  });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
  assert.equal(batch.thumbnails.length, 3);
  assert.ok(batch.thumbnails.every((thumbnail) => thumbnail.objectUrl === null));
  assert.equal(state.revoked.length, 0);
});

test('timeout aborts all pending requests and returns a retryable empty result', async () => {
  let aborted = 0;
  const state = fixture({
    fetch: async (_url, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        aborted += 1;
        reject(init.signal?.reason);
      }, { once: true });
    }),
  });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies, timeoutMs: 15 });
  assert.equal(aborted, 4);
  assert.equal(batch.timedOut, true);
  assert.equal(batch.thumbnails.length, 0);
});

test('cancellation rejects the old request and releases any completed thumbnails', async () => {
  const controller = new AbortController();
  let decoded = 0;
  const state = fixture({
    fetch: async (url, init) => {
      if (String(url).includes('maxresdefault')) {
        return new Response(new Blob(['jpg'], { type: 'image/jpeg' }));
      }
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
      });
    },
    loadImage: async () => {
      decoded += 1;
      setTimeout(() => controller.abort(), 0);
      return { width: 1280, height: 720 };
    },
  });
  await assert.rejects(fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies, signal: controller.signal }), {
    name: 'AbortError',
  });
  assert.equal(decoded, 1);
  assert.equal(state.revoked.length, 1);
});

test('an already-aborted request makes no network calls', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  const state = fixture({ fetch: async () => { calls += 1; throw new Error('Unexpected request'); } });
  await assert.rejects(fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies, signal: controller.signal }), {
    name: 'AbortError',
  });
  assert.equal(calls, 0);
});

test('cancellation during image decoding releases all allocated Blob URLs', async () => {
  const controller = new AbortController();
  let started = 0;
  const state = fixture({
    loadImage: async (_url, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      started += 1;
      if (started === 4) controller.abort();
    }),
  });
  await assert.rejects(fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies, signal: controller.signal }), {
    name: 'AbortError',
  });
  assert.equal(state.revoked.length, 4);
});

test('a timeout keeps already-loaded sizes available for download', async () => {
  const state = fixture({
    fetch: async (url, init) => {
      if (String(url).includes('maxresdefault')) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
        });
      }
      return new Response(new Blob(['jpg'], { type: 'image/jpeg' }));
    },
  });
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies, timeoutMs: 15 });
  assert.equal(batch.timedOut, true);
  assert.equal(batch.thumbnails.length, 3);
  assert.equal(batch.unavailable, 1);
  assert.ok(batch.thumbnails.every((thumbnail) => thumbnail.objectUrl));
  assert.equal(state.revoked.length, 0);
});

test('cleanup revokes each owned Blob URL once and ignores remote-only fallback images', async () => {
  const state = fixture();
  const batch = await fetchThumbnails(VIDEO_ID, { dependencies: state.dependencies });
  revokeThumbnails([
    ...batch.thumbnails,
    batch.thumbnails[0],
    { ...batch.thumbnails[0], objectUrl: null },
  ], state.dependencies.revokeObjectURL);
  assert.equal(state.revoked.length, 4);
  assert.equal(new Set(state.revoked).size, 4);
});
