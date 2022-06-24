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
            :rel="isExternal(item.href) ? 'noopener noreferer' : undefined"
          >
            {{ item.title }}
          </a>
        </li>
      </ul>
      <p v-if="allItemsUrl">
        <a :href="allItemsUrl">{{ allItemsLabel }}</a>
      </p>
    </template>
    <p v-else>{{ noItemsLabel }}</p>
  </div>
</template>
