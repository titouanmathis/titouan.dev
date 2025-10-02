<script setup lang="ts">
  import { unref } from 'vue';
  import { useListing, documentNames } from '../composables/useListing.js';

  const blocks = documentNames.map((type) => useListing(type, 5)).filter((block) => block.total);
</script>

<template>
  <div class="space-y-10">
    <template v-for="(block, index) in blocks" :key="`block-${index}`">
      <hr v-if="index > 0" class="my-10 border border-current opacity-10">
      <Listing
        :title="block.title"
        :all-items-url="block.total > block.count ? block.url : undefined"
        :items="unref(block.items)"
        :no-items-label="block.noItemsLabel"
        :all-items-label="block.allItemsLabel" />
    </template>
  </div>
</template>
