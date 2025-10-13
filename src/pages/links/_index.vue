<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('links');
  const { site } = usePage();

  useHead({
    title: site.makeTitle('Links'),
  });
</script>

<template>
  <Listing title="Links" :items="items" no-items-label="No links." tag="h1" />
</template>
