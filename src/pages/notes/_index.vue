<script setup lang="ts">
  import { usePage, useHead } from 'iles';
  import { useListing } from '~/composables/useListing.js';

  const { items } = useListing('notes');
  const { site } = usePage();

  useHead({
    title: site.makeTitle('Notes'),
  });
</script>

<template>
  <Listing title="Notes" :items="items" no-items-label="No notes." tag="h1" />
</template>
