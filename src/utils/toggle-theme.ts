(() => {
  function setup() {
    const name = "vueuse-color-scheme";
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    let theme = localStorage.getItem(name) || "auto";

    function setTheme(newTheme) {
      theme = newTheme;
      localStorage.setItem(name, newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");

      document.querySelectorAll("link[data-theme-switch]").forEach((link) => {
        link.href = link.dataset[newTheme];
      });
    }

    if (theme === "dark" || (prefersDark && theme !== "light")) {
      setTheme("dark");
    }
  }

  if (document.readyState === "complete") {
    setup();
  } else {
    window.addEventListener("load", setup);
  }
})();
