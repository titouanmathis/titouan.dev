<script setup lang="ts">
  import { computed, ref, unref, onMounted } from 'vue';
  import { usePointer, useMousePressed, useWindowSize, useRafFn, useEventListener } from '@vueuse/core';
  import { tween, matrix, damp, map, easeOutExpo, easeInOutExpo } from '@studiometa/js-toolkit/utils';

  const props = defineProps({
    index: { type: Number, required: true },
    total: { type: Number, required: true },
  });

  const { width, height } = useWindowSize();
  const {
    x: pointerX,
    y: pointerY,
  } = usePointer({
    initialValue: {
      x: unref(width) / 2,
      y: unref(height) / 2,
      width: unref(width),
      height: unref(height),
    },
  });
  const { pressed } = useMousePressed();

  const radius = computed(() => {
    const radius = width.value > height.value ? height.value / 60 : width.value / 60;
    return Math.round(radius / 2) * 2;
  });
  const borderWidth = computed(() => Math.ceil(radius.value / 7));

  const x = ref(width.value / 2);
  const y = ref(height.value / 2);
  const scale = ref(1);
  const progress = ref(0);

  const styles = computed(() => {
    const size = props.index * 2 * radius.value;

    return {
      transform: matrix({
        translateX: x.value,
        translateY: y.value,
        scaleX: scale.value * progress.value,
        scaleY: scale.value * progress.value,
      }) as string,
      width: size + 'px',
      height: size + 'px',
      marginTop: size / -2 - borderWidth.value + 'px',
      marginLeft: size / -2 - borderWidth.value + 'px',
      zIndex: props.total - props.index,
    };
  });

  onMounted(() => {
    useEventListener(document, 'mousemove', () => {
      useRafFn(() => {
        const targetDiffX = (pointerX.value - x.value) * ((props.index + 5) / 5 - 0.05);
        x.value = damp(x.value + targetDiffX, x.value, 0.1, 0.01);
        const targetDiffY = (pointerY.value - y.value) * ((props.index + 5) / 5 - 0.05);
        y.value = damp(y.value + targetDiffY, y.value, 0.1, 0.01);
        scale.value = damp(pressed.value ? props.index / props.total : 1, scale.value, 0.1, 0.01);
      });
    }, { once: true });
  });

  function enter() {
    return new Promise((resolve) => {
      const t = tween((p) => {
        progress.value = p;
      }, {
        easing: easeOutExpo,
        duration: 1,
      });
      setTimeout(() => t.start(), props.index * 20);
    })
  }
</script>

<template>
  <transition appear @enter="enter">
    <div class="absolute top-0 left-0" :style="styles">
      <div
        :style="{ borderWidth: borderWidth + 'px' }"
        class="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-primary transform -translate-x-1/2 -translate-y-1/2 transition ease-out-expo"
      ></div>
    </div>
  </transition>
</template>
