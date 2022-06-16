(() => {
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const setting = localStorage.getItem('vueuse-color-scheme') || 'auto';
  if (setting === 'dark' || (prefersDark && setting !== 'light')) {
    document.documentElement.classList.add('dark');
    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = '/icon-dark.svg';
    }
  }
})();
