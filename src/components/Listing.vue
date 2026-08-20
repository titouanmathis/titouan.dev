<script setup lang="ts">
  const { title, allItemsUrl, items, noItemsLabel, allItemsLabel } = defineProps({
    title: String,
    allItemsUrl: String,
    items: {
      type: Array,
      required: true,
    },
    noItemsLabel: {
      type: String,
      default: 'No items.',
    },
    allItemsLabel: {
      type: String,
      default: 'All items',
    },
    tag: {
      type: String,
      default: 'p',
    },
  });

  const { site } = usePage();

  function getOrigin() {
    return typeof window !== 'undefined' ? window.location.origin : site.url;
  }

  function isExternal(url: string): boolean {
    const parsed = new URL(url, getOrigin());
    return parsed.origin !== getOrigin();
  }

  function formatDate(date: Date) {
    return [
      date.getDate().toString().padStart(2, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getFullYear(),
    ].join('/');
  }
</script>

<template>
  <div class="grid grid-cols-1">
    <component :is="tag" class="text-2xl font-bold border-b-3 pb-4">{{ title }}</component>
    <template v-if="items.length">
      <ul class="">
        <li v-for="item in items" :key="item.href">
          <a
            class="flex justify-between items-baseline py-4 !text-primary"
            :href="item.href"
            :target="isExternal(item.href) ? '_blank' : undefined"
            :rel="isExternal(item.href) ? 'noopener' : undefined">
            {{ item.title }}
            <MetaInfo v-if="item.date" class="ml-3">
              {{ formatDate(item.date) }}
            </MetaInfo>
            <span class="text-[0.75em] ml-auto">→</span>
          </a>
        </li>
      </ul>
      <p v-if="allItemsUrl">
        <a
        class="flex justify-between items-baseline py-4 !text-primary"

        :href="allItemsUrl">
          {{ allItemsLabel }}
          <span class="text-[0.75em] ml-auto">→</span>

        </a>
      </p>
    </template>
    <p v-else>{{ noItemsLabel }}</p>
  </div>
</template>
