import { computed } from 'vue';

export function useExperiments(count?:number) {
  const experiments = useDocuments('~/pages/experiments');
  count = count ?? experiments.value.length;
  return computed(() => experiments.value.slice(0, count));
}
