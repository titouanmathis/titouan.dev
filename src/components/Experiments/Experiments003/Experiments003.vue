<script setup>
  import { computed, ref, unref } from 'vue';
  import { useWindowSize } from '@vueuse/core';

  defineProps({
    active: Boolean,
  });

  const total = ref(120);
  const delta = computed(() => unref(total) / 2);
  const duration = computed(() => unref(total) / 30);
  const { width, height } = useWindowSize();
  const size = computed(() =>
    (unref(width) > unref(height) ? unref(height) * 0.5 : unref(width) * 0.5)
  );

  const innerStyles = computed(() => ({
    width: `${size.value}px`,
    height: `${size.value}px`,
  }));
</script>

<template>
  <div v-if="active" class="xp3 fixed inset-0 pointer-events-none">
    <div class="xp3__inner absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :style="innerStyles">
      <Experiments003Anchor
        v-for="index in total"
        :key="index"
        v-bind="{ index, total, duration, delta, size }" />
    </div>
  </div>
</template>

<style>
  @keyframes rotation {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .xp3 {
    animation: rotation 30s linear infinite;
  }

  .xp3__inner {
    transform-style: preserve-3d;
    perspective: 20px;
  }
</style>
