<script setup lang="ts">
  const { title, allItemsUrl, items, noItemsLabel } = defineProps({
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
  });
</script>

<template>
  <div class="space-y-4">
    <p class="text-2xl font-bold">{{ title }}</p>
    <template v-if="items.length">
      <ul class="">
        <li v-for="item in items" :key="item.href">
          <a :href="item.href">{{ item.title }}</a>
        </li>
      </ul>
      <p v-if="allItemsUrl"><a :href="allItemsUrl">All items</a></p>
    </template>
    <p v-else>{{ noItemsLabel }}</p>
  </div>
</template>
