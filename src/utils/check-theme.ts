(() => {
  const theme = localStorage.getItem('color-scheme') || 'auto';
  if (
    theme === 'dark' ||
    (matchMedia('(prefers-color-scheme: dark)').matches && theme !== 'light')
  ) {
    document.documentElement.classList.add('dark');
    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = '/icon-dark.svg';
    }
  }
})();
