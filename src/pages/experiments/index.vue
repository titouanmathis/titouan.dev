<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('experiments');
</script>

<template>
  <Listing title="Experiments" :items="items" no-items-label="No experiments." />
</template>
