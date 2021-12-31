<script setup lang="ts">
  import { computed, ref, unref } from 'vue';
  import { usePointer, useWindowSize, useRafFn } from '@vueuse/core';
  import { matrix } from '~/utils/math';

  const { index, total } = defineProps({
    index: Number,
    total: Number,
  });

  const { width, height } = useWindowSize();
  const { x: pointerX, y: pointerY } = usePointer({
    initialValue: {
      x: unref(width) / 2,
      y: unref(height) / 2,
      width: unref(width),
      height: unref(height),
    },
  });

  const radius = computed(() => {
    const radius = width.value > height.value ? height.value / 60 : width.value / 60;
    return Math.round(radius / 2) * 2;
  });
  const borderWidth = computed(() => Math.ceil(radius.value / 7));

  const x = ref(width.value / 2);
  const y = ref(height.value / 2);

  const styles = computed(() => {
    const size = index * 2 * radius.value;
    return {
      transform: matrix({ translateX: x.value, translateY: y.value }) as string,
      width: size + 'px',
      height: size + 'px',
      marginTop: size / -2 - borderWidth.value + 'px',
      marginLeft: size / -2 - borderWidth.value + 'px',
      zIndex: total - index,
    };
  });

  useRafFn(() => {
    x.value += (pointerX.value - x.value) * ((index + 5) / 40 - 0.05);
    y.value += (pointerY.value - y.value) * ((index + 5) / 40 - 0.05);
  });
</script>

<template>
  <div class="absolute top-0 left-0" :style="styles">
    <div
      :style="{ borderWidth: borderWidth + 'px' }"
      class="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-primary transform -translate-x-1/2 -translate-y-1/2 transition ease-out-expo"
    ></div>
  </div>
</template>
