import { registerComponents } from '@studiometa/js-toolkit';
import { LazyInclude, TrackShopify } from '@studiometa/ui';

// --- Simulated Shopify environment ------------------------------------------
// TrackShopify publishes through window.Shopify.analytics.publish. The playground
// has no Shopify object, so we provide a tiny stub that logs to the page. On a
// real storefront this API already exists; delete the stub to use it.
const w = window as unknown as {
  Shopify?: { analytics?: { publish?: (event: string, payload: unknown) => void } };
};
w.Shopify = w.Shopify || {};
w.Shopify.analytics = w.Shopify.analytics || {
  publish: (event, payload) => {
    const log = document.getElementById('analytics-log');
    if (log) log.textContent = `${event} ${JSON.stringify(payload)}`;
  },
};

// Simulated Product Recommendations API: GET /recommendations/products returns
// the rendered section HTML. LazyInclude injects it. Delete to hit the real one.
const recommended = [
  { title: 'Wool Beanie', handle: 'wool-beanie', price: 22 },
  { title: 'Leather Tote', handle: 'leather-tote', price: 60 },
  { title: 'Ceramic Mug', handle: 'ceramic-mug', price: 12 },
  { title: 'Cotton Tee', handle: 'cotton-tee', price: 30 },
];

function recommendationsMarkup() {
  const items = recommended
    .map(
      (p) =>
        `<li><a href="/products/${p.handle}" class="block p-3 border rounded hover:bg-current/5">${p.title} · €${p.price}</a></li>`,
    )
    .join('');
  return `<ul class="grid grid-cols-2 gap-3">${items}</ul>`;
}

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  if (url.pathname.endsWith('/recommendations/products')) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake latency
    return new Response(recommendationsMarkup(), { headers: { 'content-type': 'text/html' } });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponents(LazyInclude, TrackShopify);
