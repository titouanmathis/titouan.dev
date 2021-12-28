<script setup lang="ts">
  import { useArticles } from '~/composables/useArticles';

  const articles = useArticles();
</script>

<template>
  <Listing
    title="Articles"
    :items="articles"
    no-items-label="No articles."
  />
</template>
