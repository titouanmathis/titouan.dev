<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { usePointer, useWindowSize, useRafFn } from '@vueuse/core';
  import { degToRad, map, damp, matrix, easeInOutExpo } from '~/utils/math';

  const { width, height } = useWindowSize();
  const radius = computed(() =>
    width.value > height.value ? height.value / 50 : width.value / 50
  );
  const dotSize = computed(() => radius.value * 5);
  const { x, y } = usePointer();

  const progress = ref(0);
  const size = ref(1);
  const total = 10;

  const containers = reactive(
    Array(total)
      .fill(0)
      .map((val, index) => {
        const numberOfDots = 1 * index + 1;
        const containerSize = computed(() => 4 * index * radius.value);

        const dots = Array(numberOfDots)
          .fill(0)
          .map((val, dotIndex) => {
            const angle = degToRad((360 / numberOfDots) * dotIndex);
            return {
              styles: computed(() => {
                const x = numberOfDots > 1 ? (containerSize.value / 2) * Math.cos(angle) : 0;
                const y = numberOfDots > 1 ? (containerSize.value / 2) * Math.sin(angle) : 0;

                return {
                  width: dotSize.value + 'px',
                  height: dotSize.value + 'px',
                  marginTop: dotSize.value / -2 + 'px',
                  marginLeft: dotSize.value / -2 + 'px',
                  transform: matrix({
                    translateX: x,
                    translateY: y,
                    scaleX: map(size.value, 0, 1, map(index, 0, total, 0.15, 0), map(index, 0, total, 3, 0.5)),
                    scaleY: map(size.value, 0, 1, map(index, 0, total, 0.15, 0), map(index, 0, total, 3, 0.5)),
                  }),
                };
              }),
            };
          });

        return {
          dots,
          styles: {
            zIndex: total - index,
            width: computed(() => containerSize.value + 'px'),
            height: computed(() => containerSize.value + 'px'),
            marginTop: computed(() => containerSize.value / -2 + 'px'),
            marginLeft: computed(() => containerSize.value / -2 + 'px'),
            transform: computed(
              () => `rotate(${map(easeInOutExpo(progress.value) * index, 0, 1, 90, 270)}deg)`
            ),
          },
        };
      })
  );

  useRafFn(() => {
    progress.value = damp(x.value / width.value, progress.value, 0.05, 0.0001);
    size.value = damp(y.value / height.value, size.value, 0.1, 0.001);
  });
</script>

<template>
  <div class="fixed inset-0 pointer-events-none">
    <div
      v-for="(container, i) in containers"
      :key="`container-${i}`"
      :style="container.styles"
      class="absolute top-1/2 left-1/2"
    >
      <div
        v-for="(dot, j) in container.dots"
        :key="`dot-${i}-${j}`"
        :style="dot.styles"
        class="absolute top-1/2 left-1/2 rounded-full bg-primary border border-secondary"
      ></div>
    </div>
  </div>
</template>
