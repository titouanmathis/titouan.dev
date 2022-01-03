<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('links');
</script>

<template>
  <Listing title="Links" :items="items" no-items-label="No links." />
</template>
