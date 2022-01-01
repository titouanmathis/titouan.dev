import { computed } from 'vue';

const documents = {
  notes: useDocuments('~/pages/notes'),
  articles: useDocuments('~/pages/articles'),
  experiments: useDocuments('~/pages/experiments'),
};

export function useListing(type: keyof typeof documents, count?: number) {
  const items = documents[type];
  count = count ?? items.value.length;
  return {
    items: computed(() => items.value.reverse().slice(0, count)),
    total: items.value.length,
    count,
  };
}
