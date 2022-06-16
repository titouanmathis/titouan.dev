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

export function useAllDocuments() {
  return Object.entries(documents).reduce((acc, [key, value]) => {
    if (value && value.total) {
      acc.push(value);
    }

    return acc;
  }, [] as DocumentValues[]);
}

type ValueOf<T> = T[keyof T];
export type DocumentValues = ValueOf<Documents>;
export type Documents = typeof documents;
export type DocumentNames = keyof Documents;

export const documentNames:Array<DocumentNames> = Object.keys(documents) as DocumentNames[];

function byPath(a, b) {
  if (a.href < b.href) {
    return -1;
  }

  if (a.href > b.href) {
    return 1;
  }

  return 0;
}

export function useListing(type: DocumentNames, count?: number) {
  const { items } = documents[type];
  count = count ?? items.value.length;
  return {
    ...documents[type],
    items: computed(() => items.value.sort(byPath).reverse().slice(0, count)),
    count,
  };
}
