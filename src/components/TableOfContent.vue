<script setup lang="ts">
  import type { TableOfContentItem } from '~/composables/useTableOfContent.js';

  defineProps<{ headings: TableOfContentItem[] }>();
</script>

<template>
  <ol class="space-y-1">
    <li v-for="heading in headings" :key="heading.slug">
      <a
        :href="`#${heading.slug}`"
        :style="{ '--i': heading.index }"
        class="inline-block opacity-75 transition-opacity hover:opacity-100 hover:text-accent">
        {{ heading.title }}
      </a>
      <ol v-if="heading.items.length" class="mt-1 pl-4 space-y-1">
        <li v-for="subheading in heading.items" :key="subheading.slug">
          <a
            :href="`#${subheading.slug}`"
            :style="{ '--i': subheading.index }"
            class="inline-block opacity-75 transition-opacity hover:opacity-100 hover:text-accent">
            {{ subheading.title }}
          </a>
        </li>
      </ol>
    </li>
  </ol>
</template>
