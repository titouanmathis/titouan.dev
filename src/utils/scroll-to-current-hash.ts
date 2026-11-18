// The îles turbo navigation cancels a click on a link to the hash already in
// the URL, so following the same table of content link twice does nothing.
// Scroll to the target in that case, as the browser does without turbo.
// Inlined as is in the page head: keep it plain JavaScript.
document.addEventListener(
  'click',
  (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest?.('a[href*="#"]');
    if (
      !link ||
      link.target === '_blank' ||
      link.origin !== location.origin ||
      link.pathname !== location.pathname ||
      !link.hash ||
      link.hash !== location.hash
    ) {
      return;
    }

    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (target) {
      event.preventDefault();
      target.scrollIntoView();
    }
  },
  // Capture phase, to run before the turbo listener on each link.
  true,
);
