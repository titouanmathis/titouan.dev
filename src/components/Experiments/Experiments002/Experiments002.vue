<script setup lang="ts">
  import { ref } from 'vue';

  defineProps({
    active: Boolean,
  });

  const total = ref(10);
</script>

<template>
  <div v-if="active" class="fixed inset-0 overflow-hidden pointer-events-none">
    <Experiments002Circle
      v-for="index in total"
      :key="`circle-${index}`"
      :active="active"
      :index="index - 1"
      :total="total" />
  </div>
</template>
