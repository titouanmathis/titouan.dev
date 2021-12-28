<script setup lang="ts">
  import { useExperiments } from '~/composables/useExperiments';

  const experiments = useExperiments();
</script>

<template>
  <Listing
    title="Experiments"
    :items="experiments"
    no-items-label="No experiments."
  />
</template>
