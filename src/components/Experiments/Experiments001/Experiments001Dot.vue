<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { usePointer, useWindowSize, useEventListener, useRafFn } from '@vueuse/core';
  import { tween, easeOutExpo, map, matrix, damp } from '@studiometa/js-toolkit/utils';
  import { degToRad } from '~/utils/math.js';
  import { useRadius } from './composables.js';

  const props = defineProps({
    index: { type: Number, required: true },
    total: { type: Number, required: true },
    containerSize: { type: Number, required: true },
    containerIndex: { type: Number, required: true },
    containerTotal: { type: Number, required: true },
  });

  const size = ref(1);
  const progress = ref(0);

  const { y: pointerY } = usePointer();
  const { height } = useWindowSize();
  const { radius } = useRadius(5);

  const angle = degToRad((360 / props.total) * props.index);
  const styles = computed(() => {
    const x = props.total > 1 ? (props.containerSize / 2) * Math.cos(angle) : 0;
    const y = props.total > 1 ? (props.containerSize / 2) * Math.sin(angle) : 0;
    const scale = map(
      size.value,
      0,
      1,
      map(props.containerIndex, 0, props.containerTotal, 0.15, 0),
      map(props.containerIndex, 0, props.containerTotal, 2, 0.5)
    );

    return {
      width: `${radius.value}px`,
      height: `${radius.value}px`,
      marginTop: `${radius.value / -2}px`,
      marginLeft: `${radius.value / -2}px`,
      transform: matrix({
        translateX: x * progress.value,
        translateY: y * progress.value,
        scaleX: scale * progress.value,
        scaleY: scale * progress.value,
      }),
    };
  });

  onMounted(() => {
    useEventListener(
      document,
      'mousemove',
      () => {
        useRafFn(() => {
          size.value = damp(pointerY.value / height.value, size.value, 0.1, 0.001);
        });
      },
      { once: true }
    );
  });

  /**
   * Enter.
   */
  function enter(): Promise<void> {
    return new Promise((resolve) => {
      const t = tween(
        (p) => {
          progress.value = p;
        },
        {
          onFinish: () => resolve(),
          easing: easeOutExpo,
          duration: 1 + props.index / props.total,
        }
      );
      setTimeout(() => t.start(), props.containerIndex * 50);
    });
  }
</script>

<template>
  <transition appear @enter="enter" @leave="leave">
    <div
      :style="styles"
      class="absolute top-1/2 left-1/2 rounded-full bg-primary border border-secondary"
    />
  </transition>
</template>
