import { defineMiddleware } from 'astro:middleware';

const legacyContentRedirects = new Map([
  ['/articles/2023/12/20/dos-and-donts-of-redirects-with-htaccess', '/articles/dos-and-donts-of-redirects-with-htaccess'],
  ['/notes/2022/01/01/new-year-new-site', '/notes/new-year-new-site'],
  ['/notes/2022/05/30/proxy-request-backend-nuxt3', '/notes/proxy-request-backend-nuxt3'],
  ['/notes/2022/06/15/php-version-manager', '/notes/php-version-manager'],
  ['/notes/2022/06/20/batch-rename-files-with-zmv', '/notes/batch-rename-files-with-zmv'],
  ['/notes/2022/07/22/redirecting-correctly-with-the-location-header', '/notes/redirecting-correctly-with-the-location-header'],
  ['/notes/2022/11/03/applying-patch-from-github', '/notes/applying-patch-from-github'],
  ['/notes/2023/03/10/basic-auth-middleware-nuxt-3', '/notes/basic-auth-middleware-nuxt-3'],
  ['/notes/2023/05/29/deepl-alfred-workflow', '/notes/deepl-alfred-workflow'],
  ['/notes/2025/08/26/alfred-workflow-for-your-ssh-aliases', '/notes/alfred-workflow-for-your-ssh-aliases'],
  ['/notes/2025/08/26/lsp-oxlint-in-sublime-text', '/notes/lsp-oxlint-in-sublime-text'],
  ['/notes/2025/09/30/fixing-numbers-alignment-with-css', '/notes/fixing-numbers-alignment-with-css'],
]);

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

  const pathname = context.url.pathname.replace(/\/$/, '') || '/';
  const redirectTo = legacyContentRedirects.get(pathname);

  if (redirectTo) {
    return context.redirect(redirectTo, 301);
  }

  return next();
});
