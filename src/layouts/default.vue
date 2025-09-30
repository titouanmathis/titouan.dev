<script setup lang="ts">
  import { computed } from 'vue';
  import { useAllDocuments } from '~/composables/useListing';

  const documents = useAllDocuments();
  const { meta, site } = usePage();
  const isHome = computed(() => meta.href === '/');
  const isExperiment = computed(() => meta.href.startsWith('/experiments/'));

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
  <ButtonToggleTheme client:load class="fixed top-0 right-0 mt-10 mr-10" />
  <div class="flex flex-col min-h-screen p-10">
    <header class="mb-20 space-y-10">
      <div>
        <component :is="isHome ? 'h1' : 'p'" class="font-bold">
          <a href="/">Titouan Mathis</a>
        </component>
        <p>
          CTO at
          <a href="https://www.studiometa.fr/en/" target="_blank" rel="noopener noreferrer">
            Studio Meta
          </a>
          and
          <a href="https://www.ikko.fr/" target="_blank" rel="noopener noreferrer">Ikko</a>
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
    <div v-if="isHome" class="max-w-4xl">
      <h2 class="text-2xl font-bold mb-20">
        Hi 👋, I am the CTO at
        <a href="https://www.studiometa.fr" target="_blank" rel="noopener noreferrer">
          Studio Meta
        </a>
        and
        <a href="https://www.ikko.fr" target="_blank" rel="noopener noreferrer">Ikko</a>
        in Strasbourg, France.
        <br />
        <br />
        I created
        <a href="https://js-toolkit.studiometa.dev" target="_blank" rel="noopener noreferrer">
          @studiometa/js-toolkit
        </a>
        to standardize how we write JavaScript components as a team, and
        <a href="https://ui.studiometa.dev" target="_blank" rel="noopener">@studiometa/ui</a>
        , its accompanying UI components library powered by
        <a href="https://twig.symfony.com/" target="_blank" rel="noopener noreferrer">Twig</a>
        and
        <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">
          Tailwind CSS
        </a>
        .
      </h2>
    </div>
    <main
      class="mb-32 max-w-3xl"
      :class="{ markdown: meta.filename.endsWith('.mdx') || meta.filename.endsWith('.md') }"
    >
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
            <a :href="url" rel="noopener noreferrer" target="_blank" v-bind="attr ?? {}">
              {{ label }}
            </a>
          </li>
        </ul>
      </footer>
    </transition>
  </div>
</template>

<style lang="scss">
  @use 'tailwindcss/base' as *;
  @use '~/assets/base.scss' as *;
  @use '~/assets/markdown.scss' as *;
  @use '~/assets/syntax-highlight.scss' as *;

  @use 'tailwindcss/components' as *;
  @use 'tailwindcss/utilities' as *;
</style>
