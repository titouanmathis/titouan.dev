import { computed } from 'vue';

export function useNotes(count?:number) {
  const notes = useDocuments('~/pages/notes');
  count = count ?? notes.value.length;
  return computed(() => notes.value.slice(0, count));
}
