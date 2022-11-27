<script setup lang="ts">
  import { ref, unref, computed } from 'vue';
  import { useRafFn, usePointer, useWindowSize } from '@vueuse/core';
  import { map, damp } from '@studiometa/js-toolkit/utils';
  import { degToRad } from '~/utils/math.js';

  const props = defineProps({
    index: { type: Number, required: true },
    total: { type: Number, required: true },
    delta: { type: Number, required: true },
    duration: { type: Number, required: true },
    size: { type: Number, required: true },
  });

  const { x: pointerX } = usePointer();
  const { width } = useWindowSize();

  const progress = ref(0.5);
  const angle = computed(() =>
    degToRad((360 / (props.total - props.delta - 1)) * (props.index - props.delta / 2))
  );
  const x = computed(() => (props.size / 2) * Math.cos(unref(angle)));
  const y = computed(() => (props.size / 2) * Math.sin(unref(angle)));
  const scale = computed(() => map(progress.value, 0, 1, 0.5, 1.5));

  const styles = computed(() => ({
    zIndex: props.total - props.index,
    transform: `translate3d(${x.value}px, ${y.value}px, ${props.index * -0.1}px) scaleX(${scale.value}) scaleY(${scale.value})`,
  }));

  const innerStyles = computed(() => ({
    animationDelay: `${props.index * (props.duration / 100) * -1}s`,
    animationDuration: `${props.duration}s`,
  }));

  useRafFn(() => {
    // @todo delay given index
    progress.value = damp(pointerX.value / width.value, progress.value, 0.1, 0.01);
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
  }
</style>
