import { registerComponent } from '@studiometa/js-toolkit';
import { Action, Fetch, Transition } from '@studiometa/ui';

// --- Simulated Section Rendering API ----------------------------------------
// Shopify answers `?sections=a,b` with JSON: { "a": "<html>", "b": "<html>" }.
// Each value is the section wrapped in <div id="shopify-section-{id}">, which is
// what Fetch swaps by id. Here we build that JSON ourselves; delete this block
// to hit the real endpoint (see "Swap the mock for your store").
const products = [
  { title: 'Cap', price: 25 },
  { title: 'Tote', price: 18 },
  { title: 'Mug', price: 12 },
];

const grid = (items: typeof products) =>
  `<ul id="shopify-section-product-grid" class="grid grid-cols-3 gap-4">${items
    .map((p) => `<li class="p-4 border rounded">${p.title} · €${p.price}</li>`)
    .join('')}</ul>`;

const count = (items: typeof products) =>
  `<div id="shopify-section-results-count" class="text-sm text-current/70">${items.length} products</div>`;

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  if (url.searchParams.has('sections')) {
    const sorted = [...products];
    if (url.searchParams.get('sort_by') === 'price-ascending') {
      sorted.sort((a, b) => a.price - b.price);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake latency
    const body = JSON.stringify({
      'product-grid': grid(sorted),
      'results-count': count(sorted),
    });
    return new Response(body, { headers: { 'content-type': 'application/json' } });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponent(Action);
registerComponent(Fetch);
registerComponent(Transition);
