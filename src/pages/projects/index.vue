<script setup lang="ts">
  import { useListing } from '~/composables/useListing';

  const { items } = useListing('projects');
  const { site } = usePage();

  useHead({
    title: site.makeTitle('Projects'),
  });
</script>

<template>
  <Listing
    title="Projects"
    :items="items"
    no-items-label="No projects."
    tag="h1"
    with-description />
</template>
