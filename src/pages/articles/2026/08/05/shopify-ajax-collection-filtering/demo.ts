import { registerComponent } from '@studiometa/js-toolkit';
import { Action, Fetch, Transition } from '@studiometa/ui';

// --- Simulated collection endpoint ------------------------------------------
// Filtering and sorting normally happen server-side: Shopify reads the query
// string, renders the collection, and returns the requested sections. Here we
// do the same in memory. Delete this block to hit the real endpoint.
type Product = { title: string; price: number; tags: string[] };
const products: Product[] = [
  { title: 'Cap', price: 25, tags: ['apparel'] },
  { title: 'Tee', price: 30, tags: ['apparel'] },
  { title: 'Tote', price: 18, tags: ['accessories'] },
  { title: 'Mug', price: 12, tags: ['accessories'] },
];

const grid = (items: Product[]) =>
  `<ul id="shopify-section-product-grid" class="grid grid-cols-2 gap-4 sm:grid-cols-4">${
    items.length
      ? items.map((p) => `<li class="p-4 border rounded">${p.title} · €${p.price}</li>`).join('')
      : '<li class="p-4 text-current/60">No products match these filters.</li>'
  }</ul>`;

const count = (items: Product[]) =>
  `<div id="shopify-section-results-count" class="text-sm text-current/70">${items.length} products</div>`;

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  if (url.searchParams.has('sections')) {
    const tags = url.searchParams.getAll('tag');
    const sort = url.searchParams.get('sort_by');
    let items = tags.length ? products.filter((p) => tags.some((t) => p.tags.includes(t))) : [...products];
    if (sort === 'price-ascending') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-descending') items.sort((a, b) => b.price - a.price);
    await new Promise((resolve) => setTimeout(resolve, 400)); // fake latency
    const body = JSON.stringify({ 'product-grid': grid(items), 'results-count': count(items) });
    return new Response(body, { headers: { 'content-type': 'application/json' } });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponent(Action);
registerComponent(Fetch);
registerComponent(Transition);
