/** Runs only on the HTTP www route; HTTPS continues to use static assets. */
export function redirectToHttps(request: Request): Response {
  const url = new URL(request.url);
  if (url.protocol !== 'http:' || url.hostname !== 'www.ytthumbnaildownloader.org') {
    return new Response('Not found', { status: 404 });
  }
  url.protocol = 'https:';
  url.port = '';
  return Response.redirect(url.href, 301);
}

export default { fetch: redirectToHttps };
