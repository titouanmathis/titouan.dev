<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRafFn, usePointer, useWindowSize } from '@vueuse/core';
  import { useRadius } from './composables';
  import { damp, map, easeInOutExpo, easeInExpo } from '~/utils/math';

  const { index, total } = defineProps({
    index: Number,
    total: Number,
  });

  const { x: pointerX } = usePointer();
  const { width } = useWindowSize();
  const { radius } = useRadius();
  const progress = ref(0);
  const numberOfDots = computed(() => index + 1);
  const containerSize = computed(() => 4 * index * radius.value);

  const duration = 10;

  const styles = computed(() => {
    const delay = index / 5;
    const time = Math.max(0, map(progress.value, 0, 1, delay / duration * - 1, 1));
    const rotate = map(easeInOutExpo(time), 0, 1, 90, 270);

    return {
      zIndex: total - index,
      width: containerSize.value + 'px',
      height: containerSize.value + 'px',
      marginTop: containerSize.value / -2 + 'px',
      marginLeft: containerSize.value / -2 + 'px',
      transform: `rotate(${rotate}deg)`,
    };
  });

  useRafFn(() => {
    progress.value = damp(pointerX.value / width.value, progress.value, 0.05, 0.0001);
  });
</script>

<template>
  <div :style="styles" class="absolute top-1/2 left-1/2">
    <Experiments001Dot
      v-for="i in numberOfDots"
      :key="`dot-${index}-${i}`"
      v-bind="{ index: i, total: numberOfDots, containerSize, containerIndex: index, containerTotal: total }"
    />
  </div>
</template>
