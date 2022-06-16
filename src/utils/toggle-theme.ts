window.addEventListener('load', () => {
  const name = 'color-scheme';
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const link = document.querySelector('link[rel="shortcut icon"]');
  const setting = localStorage.getItem('vueuse-color-scheme') || 'auto';
  let theme = localStorage.getItem(name);

  function setTheme(newTheme) {
    theme = newTheme;
    localStorage.setItem(name, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    if (link) {
      link.href = `/icon-${newTheme}.svg`;
    }
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  const btn = document.querySelector('#toggle-theme');
  if (btn) {
    btn.onclick = toggleTheme;
  }

  if (setting === 'dark' || (prefersDark && setting !== 'light')) {
    setTheme('dark');
  }
});
