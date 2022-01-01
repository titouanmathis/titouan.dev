<script setup lang="ts">
  import { computed } from 'vue';

  const { meta } = usePage();
  const isExperiment = computed(() => meta.href.startsWith('/experiments/'))

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
  <div class="flex flex-col min-h-screen p-10">
    <header class="mb-20 space-y-10">
      <div>
        <h1 class="font-bold"><a href="/">Titouan Mathis</a></h1>
        <p>
          Lead front-end developer at
          <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener">Studio Meta</a>
        </p>
      </div>
      <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
        <nav class="transition" v-show="!isExperiment">
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
      </transition>
    </header>
    <main class="mb-32 max-w-3xl markdown">
      <slot />
    </main>
    <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
      <footer class="mt-auto text-sm transition" v-show="!isExperiment">
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
    </transition>
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
