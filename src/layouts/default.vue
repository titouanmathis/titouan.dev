<script setup lang="ts">
  import { computed } from 'vue';
  import { usePage, useHead } from 'iles';
  import { useAllDocuments } from '../composables/useListing.js';
  import { useTableOfContent } from '../composables/useTableOfContent.js';

  const documents = useAllDocuments();
  const { meta, site } = usePage();
  const isHome = computed(() => meta.href === '/');
  const isExperiment = computed(() => meta.href.startsWith('/experiments/'));
  const headings = useTableOfContent();
  const hasToc = computed(
    () =>
      /^\/(articles|notes)\/.+/.test(meta.href) &&
      headings.value.reduce((count, heading) => count + 1 + heading.items.length, 0) >= 2,
  );

  const year = new Date().getUTCFullYear();
  const socialLinks = [
    {
      url: 'https://github.com/titouanmathis',
      label: 'GitHub',
    },
    {
      url: 'https://x.com/titouanmathis',
      label: 'X',
    },
    {
      url: 'https://bsky.app/profile/titouan.dev',
      label: 'Bluesky',
      attr: { rel: 'noopener noreferrer me' },
    },
    {
      url: 'https://www.linkedin.com/in/titouanmathis/',
      label: 'Linkedin',
    },
  ];

  if (meta.title) {
    useHead({
      title: site.makeTitle(meta.title),
    });
  }
</script>

<template>
  <ButtonToggleTheme client:load class="fixed top-0 right-0 mt-4 mr-4 sm:mt-10 sm:mr-10" />
  <div class="flex flex-col min-h-screen p-4 sm:p-10" :class="{ 'pb-20 xl:pb-10': hasToc }">
    <header class="mb-20 space-y-10">
      <div>
        <component :is="isHome ? 'h1' : 'p'" class="font-bold">
          <a href="/">Titouan Mathis</a>
        </component>
        <p>
          CTO at
          <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener">Studio Meta</a>
          and
          <a href="https://www.ikko.fr/" target="_blank" rel="noopener">ikko</a>
        </p>
      </div>
      <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
        <nav v-show="!isExperiment" class="transition">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 md:gap-10">
            <li v-for="doc in documents" :key="doc.url">
              <a :href="doc.url">{{ doc.title }}</a>
            </li>
          </ul>
        </nav>
      </transition>
    </header>
    <div v-if="isHome" class="max-w-4xl">
      <h2 class="text-2xl font-bold mb-20">
        I am CTO at
        <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener">Studio Meta</a>
        and
        <a href="https://www.ikko.fr/" target="_blank" rel="noopener">ikko</a>
        in Strasbourg, France, and build the tools our teams use every day,
        <a href="https://js-toolkit.studiometa.dev" target="_blank" rel="noopener">
          @studiometa/js-toolkit
        </a>
        for JavaScript,
        <a href="https://ui.studiometa.dev" target="_blank" rel="noopener">@studiometa/ui</a>
        for interface components, and many <a href="/projects/">others</a>.
      </h2>
    </div>
    <div class="xl:flex xl:items-start xl:gap-16">
      <main
        class="mb-32 max-w-3xl xl:flex-1 xl:min-w-0"
        :class="{ markdown: meta.filename.endsWith('.mdx') || meta.filename.endsWith('.md') }">
        <slot />
      </main>
      <aside
        v-if="hasToc"
        class="hidden xl:block sticky top-10 w-64 shrink-0 max-h-[calc(100vh-5rem)] overflow-y-auto text-sm">
        <nav aria-label="Table of content">
          <p class="mb-4 font-bold">On this page</p>
          <TableOfContent :headings="headings" />
        </nav>
      </aside>
    </div>
    <TableOfContentBar
      v-if="hasToc"
      client:load
      :headings="headings"
      class="xl:hidden fixed inset-x-4 bottom-4 z-10 rounded-lg border border-primary/10 bg-secondary shadow-lg" />
    <transition enter-from-class="opacity-0" leave-to-class="opacity-0">
      <footer v-show="!isExperiment" class="mt-auto text-sm transition">
        <span class="block sm:inline-block mr-4 md:mr-10">
          © {{ year }}
          <a href="/">T. Mathis</a>
        </span>
        <ul class="inline-flex gap-4 md:gap-10">
          <li v-for="{ label, url, attr } in socialLinks" :key="url" class="inline">
            <a :href="url" rel="noopener noreferrer" target="_blank" v-bind="attr ?? {}">
              {{ label }}
            </a>
          </li>
        </ul>
      </footer>
    </transition>
  </div>
</template>

<style>
  @import 'tailwindcss';
  @import '@fontsource/inter/latin-400.css';
  @import '@fontsource/inter/latin-700.css';
  @import '@fontsource/jetbrains-mono/latin-400.css';
  @import '@fontsource/jetbrains-mono/latin-700.css';
  @import '~/assets/base.css';
  @import '~/assets/markdown.css';
  @import '~/assets/callouts.css';
  @import '~/assets/syntax-highlight.css';
</style>
