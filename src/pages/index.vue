<script setup lang="ts">
  import { unref } from 'vue';
  import { useListing } from '~/composables/useListing';

  const articles = useListing('articles', 5);
  const notes = useListing('notes', 5);
  const experiments = useListing('experiments', 5);
</script>

<template>
  <div class="space-y-10">
    <Listing
      title="Articles"
      :all-items-url="articles.total > articles.count ? '/articles/' : undefined"
      :items="unref(articles.items)"
      no-items-label="No articles."
    />
    <hr class="my-10 border border-current opacity-10" />
    <Listing
      title="Notes"
      :all-items-url="notes.total > notes.count ? '/notes/' : undefined"
      :items="unref(notes.items)"
      no-items-label="No notes."
    />
    <hr class="my-10 border border-current opacity-10" />
    <Listing
      title="Experiments"
      :all-items-url="experiments.total > experiments.count ? '/experiments/' : undefined"
      :items="unref(experiments.items)"
      all-items-label="All experiments"
      no-items-label="No experiments."
    />
  </div>
</template>
