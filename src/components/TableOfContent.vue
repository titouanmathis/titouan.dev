<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';

  const headings = ref([]);

  onMounted(() => {
    let previousLevel2;

    const elements = Array.from(document.querySelectorAll('h2, h3'));
    const processed = elements.reduce((acc, el) => {
      const level = parseInt(el.tagName[1]);
      const heading = {
        level,
        slug: el.id,
        title: el.textContent,
        items: [],
      };

      if (level === 2) {
        previousLevel2 = heading;
        acc.push(previousLevel2);
      }

      if (level === 3 && previousLevel2) {
        previousLevel2.items.push(heading);
      }

      return acc;
    }, []);

    headings.value = processed;
  });
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
