<script setup lang="ts">
  import { ref } from 'vue';

  const total = ref(10);
</script>

<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <Circle
      v-for="index in total"
      :key="`circle-${index}`"
      :index="index - 1"
      :total="total"
    />
  </div>
</template>
