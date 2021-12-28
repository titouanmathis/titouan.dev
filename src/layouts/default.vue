<script setup lang="ts">
  const year = new Date().getUTCFullYear();
  const socialLinks = [
    {
      url: 'https://github.com/titouanmathis',
      label: 'Github',
    },
    {
      url: 'https://twitter.com/titouanmathis',
      label: 'Twitter',
    },
    {
      url: 'https://www.linkedin.com/in/titouan-mathis-8663a1a6/',
      label: 'Linkedin',
    },
  ];
</script>

<template>
  <ButtonToggleTheme class="absolute top-0 right-0 mt-10 mr-10" client:idle />
  <div class="p-10 space-y-20">
    <header class="space-y-10">
      <div>
        <h1 class="font-bold"><a href="/">Titouan Mathis</a></h1>
        <p>
          Lead front-end developer at
          <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener">Studio Meta</a>
        </p>
      </div>
      <nav>
        <ul class="flex space-x-10">
          <li>
            <a href="/articles/">Articles</a>
          </li>
          <li>
            <a href="/notes/">Notes</a>
          </li>
          <li>
            <a href="/experiments/">Experiments</a>
          </li>
        </ul>
      </nav>
    </header>
    <main class="max-w-3xl space-y-4 markdown">
      <slot />
    </main>
    <footer class="text-sm">
      <p class="space-x-4 md:space-x-10">
        <span class="inline-block">
          © {{ year }}
          <a href="/">T. Mathis</a>
        </span>
        <a
          v-for="{ label, url } in socialLinks"
          :key="url"
          :href="url"
          rel="noopener"
          target="_blank"
        >
          {{ label }}
        </a>
      </p>
    </footer>
  </div>
</template>

<style lang="scss">
  @import 'tailwindcss/base';
  @import '~/assets/base.scss';
  @import '~/assets/markdown.scss';
  @import '~/assets/syntax-highlight.scss';

  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';
</style>
