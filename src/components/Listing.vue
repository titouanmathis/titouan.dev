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

  function getOrigin() {
    return typeof window !== 'undefined' ? window.location.origin : import.meta.env.SITE;
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
  <div class="space-y-4">
    <component :is="tag" class="text-2xl font-bold">{{ title }}</component>
    <template v-if="items.length">
      <ul class="">
        <li v-for="item in items" :key="item.href">
          <a
            :href="item.href"
            :target="isExternal(item.href) ? '_blank' : undefined"
            :rel="isExternal(item.href) ? 'noopener' : undefined">
            {{ item.title }}
          </a>
          <MetaInfo v-if="item.date" class="ml-3">
            {{ formatDate(item.date) }}
          </MetaInfo>
        </li>
      </ul>
      <p v-if="allItemsUrl">
        <a :href="allItemsUrl">{{ allItemsLabel }}</a>
      </p>
    </template>
    <p v-else>{{ noItemsLabel }}</p>
  </div>
</template>
