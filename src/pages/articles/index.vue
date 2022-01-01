<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('articles');
</script>

<template>
  <Listing title="Articles" :items="items" no-items-label="No articles." />
</template>
