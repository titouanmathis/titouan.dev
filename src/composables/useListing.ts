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
    allItemsLabel: 'Discover all articles →',
  },
  notes: {
    items: useDocuments('~/pages/notes'),
    get total() {
      return unref(this.items).length;
    },
    url: '/notes/',
    title: 'Notes',
    noItemsLabel: 'No notes.',
    allItemsLabel: 'Discover all notes →',
  },
  experiments: {
    items: useDocuments('~/pages/experiments'),
    get total() {
      return unref(this.items).length;
    },
    url: '/experiments/',
    title: 'Experiments',
    allItemsLabel: 'Discover all experiments →',
    noItemsLabel: 'No experiments.',
  },
  links: {
    get items() {
      const items = useDocuments('~/pages/links')
      return computed(() => unref(items).map((item) => ({
        title: item.title,
        description: item?.description,
        href: item.link,
      })).reverse());
    },
    get total() {
      return unref(this.items).length;
    },
    url: '/links/',
    title: 'Links',
    allItemsLabel: 'Discover all links →',
    noItemsLabel: 'No links.',
  },
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
  if (a.filename < b.filename) {
    return -1;
  }

  if (a.filename > b.filename) {
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
