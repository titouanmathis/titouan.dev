<script setup lang="ts">
  import { ref } from 'vue';
  import type { TableOfContentItem } from '~/composables/useTableOfContent.js';

  defineProps<{ headings: TableOfContentItem[] }>();

  const details = ref<HTMLDetailsElement>();

  /**
   * Close the panel when a link is followed, so it does not cover the section.
   */
  function onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('a') && details.value) {
      details.value.open = false;
    }
  }
</script>

<template>
  <details
    ref="details"
    class="toc-bar group text-sm rounded-lg border border-primary/10 bg-secondary shadow-lg transition-[border-radius] duration-400 open:rounded-t-none">
    <summary class="flex items-center justify-between px-4 py-3 font-bold cursor-pointer list-none">
      On this page
      <span aria-hidden="true" class="transition-transform group-open:rotate-180">↑</span>
    </summary>
    <!-- Clip the bottom edge only, so the panel appears from behind the bar. -->
    <div class="absolute -inset-x-px bottom-full [clip-path:inset(-100vh_-100vw_0_-100vw)]">
      <nav
        aria-label="Table of content"
        class="toc-bar-panel max-h-[60vh] overflow-y-auto p-4 rounded-t-lg border border-b-0 border-primary/10 bg-secondary shadow-[0_-8px_16px_-4px_rgb(0_0_0/0.1)]"
        @click="onClick">
        <TableOfContent :headings="headings" />
      </nav>
    </div>
  </details>
</template>

<style>
  @media (prefers-reduced-motion: no-preference) {
    /* Keep the content slot visible while the panel transitions out. */
    .toc-bar::details-content {
      transition: content-visibility 0.4s allow-discrete;
    }

    .toc-bar-panel {
      translate: 0 100%;
      transition: translate 0.4s var(--ease-out-expo);
    }

    .toc-bar[open] .toc-bar-panel {
      translate: 0;

      @starting-style {
        translate: 0 100%;
      }
    }

    /* Each link slides a bit more slowly than the one before it. */
    .toc-bar-panel a {
      translate: 0 2.5rem;
      transition:
        translate calc(0.4s + var(--i) * 0.08s) var(--ease-out-quart),
        opacity 0.15s;
    }

    .toc-bar[open] .toc-bar-panel a {
      translate: 0;

      @starting-style {
        translate: 0 2.5rem;
      }
    }
  }
</style>
