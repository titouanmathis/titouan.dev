<script setup lang="ts">
  import { ref, unref, computed, watch, onMounted } from 'vue';
  import { useRafFn, usePointer, useWindowSize, useEventListener } from '@vueuse/core';
  import { map, damp, tween, easeOutExpo } from '@studiometa/js-toolkit/utils';
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

  const progress = ref(0);
  const progressX = ref(0.75);
  const progressY = ref(0.75);
  const angle = computed(() =>
    degToRad((360 / (props.total - props.delta - 1)) * (props.index - props.delta / 2))
  );
  const x = computed(() => (props.size / 2) * Math.cos(unref(angle)));
  const y = computed(() => (props.size / 2) * Math.sin(unref(angle)));
  const z = computed(() => props.index * progressY.value * -0.5)
  const scale = computed(() => map(progressX.value, 0, 1, 0.5, 1));

  const styles = computed(() => ({
    zIndex: props.total - props.index,
    transform: `
      translate3d(
        ${x.value * progress.value}px,
        ${y.value * progress.value}px,
        ${z.value}px
      )
      scaleX(${scale.value * progress.value})
      scaleY(${scale.value * progress.value})
    `,
  }));

  const innerStyles = computed(() => ({
    animationDelay: `${props.index * (props.duration / 100) * -1}s`,
    animationDuration: `${props.duration}s`,
  }));

  onMounted(() => {
    useEventListener(document, 'mousemove', () => {
      useRafFn(() => {
        progressX.value = damp(delayedPointerX.value / width.value, progressX.value, 0.1, 0.01);
        progressY.value = damp(pointerY.value / height.value, progressY.value, 0.1, 0.01);
      });
    }, { once: true });
  });

  /**
   * Enter.
   */
  function enter() {
    return new Promise((resolve) => {
      const t = tween((p) => {
        progress.value = p;
      }, {
        easing: easeOutExpo,
        duration: 1,
        onFinish: resolve,
      });
      setTimeout(() => t.start(), props.index * 20);
    })
  }
</script>

<template>
  <transition appear @enter="enter">
    <div :style="styles" class="absolute top-1/2 left-1/2 w-[2px] h-[2px] -mt-px -ml-px anchor">
      <div :style="innerStyles" class="absolute top-1/2 left-1/2 bg-secondary border border-primary anchor__inner" />
    </div>
  </transition>
</template>

<style scoped>
  .anchor__inner {
    --size: 10vmax;
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
