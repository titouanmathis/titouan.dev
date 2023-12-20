<script setup lang="ts">
  import { computed, unref } from 'vue';
  import { usePage } from 'iles';

  const { page } = usePage();

  let previousLevel2;

  const headings = computed(() =>
    unref(page).headings?.reduce((acc, heading) => {
      if (heading.level === 1 || heading.level > 3) {
        return acc;
      }

      if (heading.level === 2) {
        previousLevel2 = {
          ...heading,
          items: [],
        };
        acc.push(previousLevel2);
      }

      if (heading.level === 3) {
        previousLevel2.items.push(heading);
      }

      return acc;
    }, [])
  );
</script>

<template>
  <details class="text-sm">
    <summary class="font-bold">Table of content</summary>
    <div class="py-4">
      <ol>
        <li v-for="heading in headings" :key="heading.slug">
          <a :href="`#${heading.slug}`">{{ heading.title }}</a>
          <ol v-if="heading.items.length">
            <li v-for="subheading in heading.items" :key="subheading.slug">
              <a :href="`#${subheading.slug}`">{{ subheading.title }}</a>
            </li>
          </ol>
        </li>
      </ol>
    </div>
  </details>
</template>
