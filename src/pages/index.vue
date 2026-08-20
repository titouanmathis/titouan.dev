<script setup lang="ts">
  import { unref } from 'vue';
  import { useListing, documentNames } from '../composables/useListing.js';

  // Show the full 7-part article series; keep other listings at 5.
  const blocks = documentNames
    .map((type) => useListing(type, type === 'articles' ? 7 : 5))
    .filter((block) => block.total);
</script>

<template>
  <div class="grid gap-10">
    <template v-for="(block, index) in blocks" :key="`block-${index}`">
      <hr v-if="false && index > 0" class="border border-current opacity-10" />
      <Listing
        :title="block.title"
        :all-items-url="block.total > block.count ? block.url : undefined"
        :items="unref(block.items)"
        :no-items-label="block.noItemsLabel"
        :all-items-label="block.allItemsLabel" />
    </template>
  </div>
</template>
