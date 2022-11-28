<script setup lang="ts">
  import { ref, unref, computed, watch } from 'vue';
  import { useRafFn, usePointer, useWindowSize, useThrottledRefHistory } from '@vueuse/core';
  import { map, damp } from '@studiometa/js-toolkit/utils';
  import { degToRad } from '~/utils/math.js';

  const props = defineProps({
    index: { type: Number, required: true },
    total: { type: Number, required: true },
    delta: { type: Number, required: true },
    duration: { type: Number, required: true },
    size: { type: Number, required: true },
  });

  const { x: pointerX, y: pointerY } = usePointer();
  const delayedPointerX = ref(pointerX.value);
  const { width, height } = useWindowSize();

  watch(pointerX, (newValue) => {
    setTimeout(() => {
      delayedPointerX.value = newValue;
    }, (props.index / props.total) * 1000);
  });

  const progressX = ref(0.5);
  const progressY = ref(0.5);
  const angle = computed(() =>
    degToRad((360 / (props.total - props.delta - 1)) * (props.index - props.delta / 2))
  );
  const x = computed(() => (props.size / 2) * Math.cos(unref(angle)));
  const y = computed(() => (props.size / 2) * Math.sin(unref(angle)));
  const z = computed(() => props.index * progressY.value * -0.5)
  const scale = computed(() => map(progressX.value, 0, 1, 0.75, 1.75));

  const styles = computed(() => ({
    zIndex: props.total - props.index,
    transform: `translate3d(${x.value}px, ${y.value}px, ${z.value}px) scaleX(${scale.value}) scaleY(${scale.value})`,
  }));

  const innerStyles = computed(() => ({
    animationDelay: `${props.index * (props.duration / 100) * -1}s`,
    animationDuration: `${props.duration}s`,
  }));

  useRafFn(() => {
    progressX.value = damp(delayedPointerX.value / width.value, progressX.value, 0.1, 0.01);
    progressY.value = damp(pointerY.value / height.value, progressY.value, 0.1, 0.01);
  });
</script>

<template>
  <div :style="styles" class="absolute top-1/2 left-1/2 w-[2px] h-[2px] -mt-px -ml-px anchor">
    <div :style="innerStyles" class="absolute top-1/2 left-1/2 bg-secondary border border-primary anchor__inner" />
  </div>
</template>

<style scoped>
  .anchor__inner {
    --size: 5vmax;
    width: var(--size);
    height: calc(var(--size) * 2);
    margin-top: calc(var(--size) * -1);
    margin-left: calc(var(--size) * -0.5);
    animation: rotation 5s linear infinite;
    transition-timing-function: var(--ease-out-expo);
    transition-duration: 0.6s;
    transition-property: border-color, background-color;
  }
</style>
