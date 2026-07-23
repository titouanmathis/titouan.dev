import { registerComponents } from '@studiometa/js-toolkit';
import { Action, Fetch, Transition } from '@studiometa/ui';

// --- Simulated storefront ---------------------------------------------------
// The playground has no backend, so we mock the two routes and return the HTML
// a Liquid page would render. On a real store these are normal pages already;
// delete this block to go live (see "Swap the mock for your store" below).
// `data-option-history` calls history.pushState, which the sandboxed playground
// iframe blocks (SecurityError). Stub it so the URL sync is a no-op in the demo.
history.pushState = () => {};
history.replaceState = () => {};

const realFetch = window.fetch.bind(window);
const pages: Record<string, string> = {
  '/': `<main id="main-content" class="space-y-3">
    <h1 class="text-xl font-bold">Home</h1>
    <p>Welcome to the shop. Browse our latest products.</p>
  </main>`,
  '/pages/shipping': `<main id="main-content" class="space-y-3">
    <h1 class="text-xl font-bold">Shipping</h1>
    <p>We ship worldwide in 2 to 5 business days.</p>
  </main>`,
};
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  const page = pages[url.pathname];
  if (page) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake latency
    return new Response(page, { headers: { 'content-type': 'text/html' } });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponents(Action, Fetch, Transition);
