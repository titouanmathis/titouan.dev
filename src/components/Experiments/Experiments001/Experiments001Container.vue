<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRafFn, usePointer, useWindowSize } from '@vueuse/core';
  import { damp, map, easeInOutExpo } from '@studiometa/js-toolkit/utils';
  import { useRadius } from './composables.js';

  const props = defineProps({
    index: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    active: Boolean,
  });

  const { x: pointerX } = usePointer();
  const { width } = useWindowSize();
  const { radius } = useRadius();
  const progress = ref(0);
  const numberOfDots = computed(() => props.index + 1);
  const containerSize = computed(() => 3 * props.index * radius.value);

  const duration = 10;

  const styles = computed(() => {
    const delay = props.index / 5;
    const time = Math.max(0, map(progress.value, 0, 1, (delay / duration) * -1, 1));
    const rotate = map(easeInOutExpo(time), 0, 1, 90, 270);

    return {
      zIndex: props.total - props.index,
      width: `${containerSize.value}px`,
      height: `${containerSize.value}px`,
      marginTop: `${containerSize.value / -2}px`,
      marginLeft: `${containerSize.value / -2}px`,
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
      v-bind="{ active, index: i, total: numberOfDots, containerSize, containerIndex: index, containerTotal: total }" />
  </div>
</template>
