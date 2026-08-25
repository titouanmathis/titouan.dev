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
  projects: {
    get items() {
      const items = useDocuments('~/pages/projects');
      return computed(() =>
        unref(items).map((item) => ({
          title: item.title,
          description: item?.description,
          href: item.link,
          repository: item.repository,
        })),
      );
    },
    get total() {
      return unref(this.items).length;
    },
    // Projects have no date: they keep the order of their filenames (`01-`, `02-`, …).
    sorted: false,
    url: '/projects/',
    title: 'Projects',
    allItemsLabel: 'Discover all projects →',
    noItemsLabel: 'No projects.',
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

export const documentNames: Array<DocumentNames> = Object.keys(documents) as DocumentNames[];

function byDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function useListing(type: DocumentNames, count?: number) {
  const document = documents[type];
  const { items } = document;
  // Documents are listed from the most recent to the oldest, except the ones
  // opting out of the date sorting.
  const sorted = 'sorted' in document ? document.sorted : true;
  count = count ?? items.value.length;
  return {
    ...document,
    items: computed(() =>
      (sorted ? [...items.value].sort(byDateDesc) : items.value).slice(0, count),
    ),
    count,
  };
}
