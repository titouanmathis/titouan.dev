(() => {
  const name = 'vueuse-color-scheme';
  const theme = localStorage.getItem(name) || 'auto';
  if (
    theme === 'dark' ||
    (matchMedia('(prefers-color-scheme: dark)').matches && theme !== 'light')
  ) {
    document.documentElement.classList.add('dark');
  }
  document.querySelectorAll('link[data-theme-switch]').forEach((link) => {
    if (link.dataset[theme] && link.href !== link.dataset[theme]) {
      link.href = link.dataset[theme];
    }
  });
})();
