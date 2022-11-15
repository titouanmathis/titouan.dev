<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('experiments');
  const { site } = usePage();

  useHead({
    title: site.makeTitle('Experiments'),
  });
</script>

<template>
  <Listing title="Experiments" :items="items" no-items-label="No experiments." tag="h1" />
</template>
