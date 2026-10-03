import { writeFile, mkdir, rm } from 'node:fs/promises';
import sharp from 'sharp';
import { INDEXABLE, SITE_URL } from '../src/lib/site.ts';

await mkdir('dist', { recursive: true });
const robots = `User-agent: *\nAllow: /\n${INDEXABLE ? `\nSitemap: ${SITE_URL}/sitemap.xml\n` : ''}`;
await writeFile('dist/robots.txt', robots);
const headerLines = [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: no-referrer',
  '  X-Frame-Options: DENY',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  ...(!INDEXABLE ? ['  X-Robots-Tag: noindex, nofollow'] : []),
  '',
  '/_astro/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
];
await writeFile('dist/_headers', headerLines.join('\n'));
if (INDEXABLE) {
  const urls = ['/', '/about/', '/privacy/', '/terms/'];
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path => `<url><loc>${SITE_URL}${path}</loc></url>`).join('')}</urlset>\n`);
} else {
  await rm('dist/sitemap.xml', { force: true });
}
await sharp('public/favicon.svg').resize(32, 32).png().toFile('dist/favicon.png');
await sharp('public/favicon.svg').resize(180, 180).png().toFile('dist/apple-touch-icon.png');
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#fafaf9"/><rect x="40" y="40" width="1120" height="550" rx="20" fill="#fff" stroke="#e5e5df"/>
<rect x="82" y="83" width="48" height="38" rx="9" fill="#be4519"/><path d="m101 93 15 9-15 9Z" fill="#fff"/>
<text x="146" y="111" font-family="Segoe UI,Arial,sans-serif" font-size="25" font-weight="600" fill="#252522">YTThumbnail<tspan fill="#be4519">.</tspan></text>
<text x="82" y="228" font-family="Segoe UI,Arial,sans-serif" font-size="58" font-weight="700" letter-spacing="-2" fill="#252522">YT Thumbnail</text>
<text x="82" y="294" font-family="Segoe UI,Arial,sans-serif" font-size="58" font-weight="700" letter-spacing="-2" fill="#252522">Downloader<tspan fill="#be4519">.</tspan></text>
<text x="84" y="357" font-family="Segoe UI,Arial,sans-serif" font-size="25" fill="#6c6c66">Paste a YouTube link.</text><text x="84" y="393" font-family="Segoe UI,Arial,sans-serif" font-size="25" fill="#6c6c66">Get the original thumbnail.</text>
<rect x="84" y="454" width="217" height="56" rx="8" fill="#be4519"/><text x="110" y="489" font-family="Segoe UI,Arial,sans-serif" font-size="20" fill="#fff" font-weight="600">Free. No sign-up.</text>
<rect x="730" y="208" width="341" height="202" rx="14" fill="#f3f3f0" stroke="#e5e5df"/><rect x="707" y="184" width="341" height="202" rx="14" fill="#fff4ed" stroke="#e5cabc"/><circle cx="877" cy="279" r="36" fill="#be4519"/><path d="m868 261 28 18-28 18Z" fill="#fff"/>
<text x="805" y="442" font-family="Segoe UI,Arial,sans-serif" font-size="18" fill="#6c6c66">Original JPG images</text></svg>`;
await sharp(Buffer.from(social)).png().toFile('dist/social-card.png');
console.log(`Static metadata ready: ${SITE_URL} | indexable=${INDEXABLE}`);
