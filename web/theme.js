(() => {
  let theme;
  try { theme = localStorage.getItem('cs5486:theme'); } catch {}
  document.documentElement.dataset.theme = theme === 'dark' || theme === 'light' ? theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
