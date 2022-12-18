<script setup lang="ts">
  import { computed } from 'vue';
  import { useAllDocuments } from '~/composables/useListing';

  const documents = useAllDocuments();
  const { meta } = usePage();
  const isHome = computed(() => meta.href === '/');
  const isExperiment = computed(() => meta.href.startsWith('/experiments/'));

  const year = new Date().getUTCFullYear();
  const socialLinks = [
    {
      url: 'https://github.com/titouanmathis',
      label: 'GitHub',
    },
    {
      url: 'https://twitter.com/titouanmathis',
      label: 'Twitter',
    },
    {
      url: 'https://mast.eu.org/@titouanmathis',
      label: 'Mastodon',
      attr: { rel: 'me' },
    },
    {
      url: 'https://www.linkedin.com/in/titouanmathis/',
      label: 'Linkedin',
    },
  ];
</script>

<template>
  <ButtonToggleTheme class="absolute top-0 right-0 mt-10 mr-10" />
  <div class="flex flex-col min-h-screen p-10">
    <header class="mb-20 space-y-10">
      <div>
        <component :is="isHome ? 'h1' : 'p'" class="font-bold">
          <a href="/">Titouan Mathis</a>
        </component>
        <p>
          Developer & CTO at
          <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener noreferrer">
            Studio Meta
          </a>
        </p>
      </div>
      <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
        <nav v-show="!isExperiment" class="transition">
          <ul class="flex space-x-10">
            <li v-for="doc in documents" :key="doc.url">
              <a :href="doc.url">{{ doc.title }}</a>
            </li>
          </ul>
        </nav>
      </transition>
    </header>
    <main
      class="mb-32 max-w-3xl"
      :class="{ markdown: meta.filename.endsWith('.mdx') || meta.filename.endsWith('.md') }">
      <slot />
    </main>
    <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
      <footer v-show="!isExperiment" class="mt-auto text-sm transition">
        <span class="block sm:inline-block mr-4 md:mr-10">
          © {{ year }}
          <a href="/">T. Mathis</a>
        </span>
        <ul class="inline-flex gap-4 md:gap-10">
          <li v-for="{ label, url, attr } in socialLinks" :key="url" class="inline">
            <a
              :href="url"
              rel="noopener noreferrer"
              target="_blank"
              v-bind="attr ?? {}">
              {{ label }}
            </a>
          </li>
        </ul>
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
