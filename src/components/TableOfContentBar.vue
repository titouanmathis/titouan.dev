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
  <details ref="details" class="group text-sm">
    <summary class="flex items-center justify-between px-4 py-3 font-bold cursor-pointer list-none">
      On this page
      <span aria-hidden="true" class="transition-transform group-open:rotate-180">↑</span>
    </summary>
    <nav
      aria-label="Table of content"
      class="absolute inset-x-0 bottom-full max-h-[60vh] overflow-y-auto p-4 border-t border-primary/10 bg-secondary"
      @click="onClick">
      <TableOfContent :headings="headings" />
    </nav>
  </details>
</template>
