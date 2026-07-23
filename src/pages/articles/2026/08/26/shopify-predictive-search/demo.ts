import { registerComponent } from '@studiometa/js-toolkit';
import { Action, Fetch, Transition } from '@studiometa/ui';

// --- Simulated Predictive Search API ----------------------------------------
// Shopify's GET /search/suggest?q=…&section_id=predictive-search returns the
// rendered section HTML. We return the same shape (a #shopify-section-predictive-search
// wrapper Fetch can swap by id). Delete this block to hit the real endpoint.
const products = [
  { title: 'Canvas Cap', handle: 'canvas-cap' },
  { title: 'Wool Beanie', handle: 'wool-beanie' },
  { title: 'Leather Tote', handle: 'leather-tote' },
  { title: 'Ceramic Mug', handle: 'ceramic-mug' },
  { title: 'Cotton Tee', handle: 'cotton-tee' },
];

function section(inner: string) {
  return `<div id="shopify-section-predictive-search">${inner}</div>`;
}

function results(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return section('<p class="text-sm text-current/60">Start typing to see suggestions.</p>');
  }
  const matches = products.filter((p) => p.title.toLowerCase().includes(q));
  if (!matches.length) {
    return section(`<p class="text-sm text-current/60">No results for “${query}”.</p>`);
  }
  const items = matches
    .map(
      (p) =>
        `<li role="option"><a href="/products/${p.handle}" class="block px-3 py-2 hover:bg-current/10">${p.title}</a></li>`,
    )
    .join('');
  return section(`<ul role="listbox" class="border rounded divide-y divide-current/10">${items}</ul>`);
}

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  if (url.pathname.endsWith('/search/suggest')) {
    await new Promise((resolve) => setTimeout(resolve, 250)); // fake latency
    return new Response(results(url.searchParams.get('q') ?? ''), {
      headers: { 'content-type': 'text/html' },
    });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponent(Action);
registerComponent(Fetch);
registerComponent(Transition);
