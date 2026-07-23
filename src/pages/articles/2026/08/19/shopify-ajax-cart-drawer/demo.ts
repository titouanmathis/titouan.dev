import { registerComponent } from '@studiometa/js-toolkit';
import { Action, Fetch, Panel, Transition } from '@studiometa/ui';

// --- Simulated Cart AJAX API ------------------------------------------------
// Shopify's POST /cart/add.js accepts a `sections` parameter and returns JSON
// with a `sections` key holding the rendered HTML for each requested section
// (bundled section rendering). We reproduce that here with an in-memory cart.
// Delete this block to hit the real endpoint.
type Line = { id: string; title: string; price: number; qty: number };
const catalog: Record<string, { title: string; price: number }> = {
  '101': { title: 'Cap', price: 25 },
  '102': { title: 'Tote', price: 18 },
  '103': { title: 'Mug', price: 12 },
};
const cart: Line[] = [];

function drawerSection() {
  if (!cart.length) {
    return '<div id="cart-drawer"><p class="text-current/60">Your cart is empty.</p></div>';
  }
  const items = cart
    .map(
      (l) =>
        `<li class="flex justify-between gap-4"><span>${l.title} × ${l.qty}</span><span>€${l.price * l.qty}</span></li>`,
    )
    .join('');
  return `<div id="cart-drawer"><ul class="space-y-2">${items}</ul></div>`;
}

function countSection() {
  const n = cart.reduce((sum, l) => sum + l.qty, 0);
  return `<span id="cart-count">${n}</span>`;
}

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost');
  if (url.pathname.endsWith('/cart/add.js')) {
    const body = init?.body;
    const id = body instanceof FormData ? String(body.get('id')) : '101';
    const product = catalog[id];
    const line = cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else if (product) cart.push({ id, title: product.title, price: product.price, qty: 1 });
    await new Promise((resolve) => setTimeout(resolve, 400)); // fake latency
    const payload = {
      items: cart,
      sections: { 'cart-drawer': drawerSection(), 'cart-count': countSection() },
    };
    return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });
  }
  return realFetch(input, init);
};
// ---------------------------------------------------------------------------

registerComponent(Action);
registerComponent(Fetch);
registerComponent(Panel);
registerComponent(Transition);
