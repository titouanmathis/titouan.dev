import { defineMiddleware } from 'astro:middleware';

/**
 * Rewrite request URLs to use the correct origin when behind a reverse proxy
 * (e.g. Tailscale serve). This fixes WebAuthn origin verification.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const forwardedProto = context.request.headers.get('x-forwarded-proto');
  const forwardedHost = context.request.headers.get('x-forwarded-host') || context.request.headers.get('host');

  if (forwardedProto && forwardedHost) {
    const originalUrl = new URL(context.request.url);
    const newOrigin = `${forwardedProto}://${forwardedHost}`;

    if (originalUrl.origin !== newOrigin) {
      const newUrl = new URL(originalUrl.pathname + originalUrl.search, newOrigin);
      // Replace the request with the corrected URL
      Object.defineProperty(context, 'url', { value: newUrl, writable: true });
      const newRequest = new Request(newUrl.toString(), {
        method: context.request.method,
        headers: context.request.headers,
        body: context.request.method !== 'GET' && context.request.method !== 'HEAD'
          ? context.request.body
          : undefined,
        // @ts-ignore
        duplex: 'half',
      });
      Object.defineProperty(context, 'request', { value: newRequest, writable: true });
    }
  }

  return next();
});
