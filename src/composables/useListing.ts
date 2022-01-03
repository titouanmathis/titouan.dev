import { computed } from 'vue';

const documents = {
  articles: {
    items: useDocuments('~/pages/articles'),
    url: '/articles/',
    title: 'Articles',
    noItemsLabel: 'No articles.',
  },
  experiments: {
    items: useDocuments('~/pages/experiments'),
    url: '/experiments/',
    title: 'Experiments',
    noItemsLabel: 'No experiments.',
  },
  links: {
    items: useDocuments('~/pages/links'),
    url: '/links/',
    title: 'Links',
    noItemsLabel: 'No links.',
  },
  notes: {
    items: useDocuments('~/pages/notes'),
    url: '/notes/',
    title: 'Notes',
    noItemsLabel: 'No notes.',
  }
};

export type Documents = keyof typeof documents;

export const documentTypes:Array<Documents> = Object.keys(documents) as Documents[];

export function useListing(type: Documents, count?: number) {
  const { items } = documents[type];
  count = count ?? items.value.length;
  return {
    ...documents[type],
    items: computed(() => items.value.reverse().slice(0, count)),
    total: items.value.length,
    count,
  };
}
