<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { usePointer, useWindowSize, useRafFn } from '@vueuse/core';
  import { map, matrix, degToRad, damp } from '~/utils/math';
  import { useRadius } from './composables';

  const { index, total, containerSize, containerIndex, containerTotal } = defineProps({
    index: Number,
    total: Number,
    containerSize: Number,
    containerIndex: Number,
    containerTotal: Number,
  });

  const size = ref(1);

  const { y } = usePointer();
  const { height } = useWindowSize();
  const { radius } = useRadius(5);

  const angle = degToRad((360 / total) * index);
  const styles = computed(() => {
    const x = total > 1 ? (containerSize / 2) * Math.cos(angle) : 0;
    const y = total > 1 ? (containerSize / 2) * Math.sin(angle) : 0;
    const scale = map(
      size.value,
      0,
      1,
      map(containerIndex, 0, containerTotal, 0.15, 0),
      map(containerIndex, 0, containerTotal, 3, 0.5)
    );

    return {
      width: radius.value + 'px',
      height: radius.value + 'px',
      marginTop: radius.value / -2 + 'px',
      marginLeft: radius.value / -2 + 'px',
      transform: matrix({
        translateX: x,
        translateY: y,
        scaleX: scale,
        scaleY: scale,
      }),
    };
  });

  useRafFn(() => {
    size.value = damp(y.value / height.value, size.value, 0.1, 0.001);
  });
</script>

<template>
  <div
    :style="styles"
    class="absolute top-1/2 left-1/2 rounded-full bg-primary border border-secondary"
  ></div>
</template>
