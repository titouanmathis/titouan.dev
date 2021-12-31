import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

export function useRadius(factor:number = 1) {
  const { width, height } = useWindowSize();
  const radius = computed(() =>
    width.value > height.value ? height.value / 50 * factor : width.value / 50 * factor
  );

  return { radius };
}
