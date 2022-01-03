import { computed, unref } from 'vue';

export const documents = {
  articles: {
    items: useDocuments('~/pages/articles'),
    get total() {
      return unref(this.items).length;
    },
    url: '/articles/',
    title: 'Articles',
    noItemsLabel: 'No articles.',
  },
  experiments: {
    items: useDocuments('~/pages/experiments'),
    get total() {
      return unref(this.items).length;
    },
    url: '/experiments/',
    title: 'Experiments',
    noItemsLabel: 'No experiments.',
  },
  links: {
    items: useDocuments('~/pages/links'),
    get total() {
      return unref(this.items).length;
    },
    url: '/links/',
    title: 'Links',
    noItemsLabel: 'No links.',
  },
  notes: {
    items: useDocuments('~/pages/notes'),
    get total() {
      return unref(this.items).length;
    },
    url: '/notes/',
    title: 'Notes',
    noItemsLabel: 'No notes.',
  }
};

export function useAllDocuments():Partial<typeof documents> {
  return Object.entries(documents).reduce((acc, [key, value]) => {
    if (value.total) {
      acc[key as Documents] = value;
    }
    return acc;
  }, {} as Partial<typeof documents>);
}

export type Documents = keyof typeof documents;

export const documentTypes:Array<Documents> = Object.keys(documents) as Documents[];

export function useListing(type: Documents, count?: number) {
  const { items } = documents[type];
  count = count ?? items.value.length;
  return {
    ...documents[type],
    items: computed(() => items.value.reverse().slice(0, count)),
    count,
  };
}
