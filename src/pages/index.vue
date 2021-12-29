<script setup lang="ts">
  import { useArticles } from '~/composables/useArticles';
  import { useNotes } from '~/composables/useNotes';
  import { useExperiments } from '~/composables/useExperiments';

  const articles = useArticles(5);
  const notes = useNotes(5);
  const experiments = useExperiments(5);
</script>

<template>
  <div class="space-y-10">
    <Listing
      title="Articles"
      all-items-url="/articles/"
      :items="articles"
      no-items-label="No articles."
    />
    <hr class="my-10 border border-current opacity-10" />
    <Listing
      title="Notes"
      all-items-url="/notes/"
      :items="notes"
      no-items-label="No notes."
    />
    <hr class="my-10 border border-current opacity-10" />
    <Listing
      title="Experiments"
      all-items-url="/experiments/"
      :items="experiments"
      all-items-label="All experiments"
      no-items-label="No experiments."
    />
  </div>
</template>
