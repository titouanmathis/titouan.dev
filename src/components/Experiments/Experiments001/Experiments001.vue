<script setup lang="ts">
  import { ref } from 'vue';

  const total = ref(10);
</script>

<template>
  <div class="fixed inset-0 pointer-events-none">
    <Experiments001Container v-for="index in total" v-bind="{ index, total }" />
  </div>
</template>
