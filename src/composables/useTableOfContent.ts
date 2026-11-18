import { computed, unref } from 'vue';
import { usePage } from 'iles';

export interface TableOfContentItem {
  slug: string;
  title: string;
  /** Position in the flattened list, used to stagger transitions. */
  index: number;
  items: TableOfContentItem[];
}

/**
 * Build a two-level tree from the current page headings: `h2` at the top
 * level, with the `h3` that follow each one nested under it.
 */
export function useTableOfContent() {
  const { page } = usePage();

  return computed(() => {
    const tree: TableOfContentItem[] = [];
    let index = 0;

    for (const { level, slug, title } of unref(page).headings ?? []) {
      if (level === 2 || (level === 3 && !tree.length)) {
        tree.push({ slug, title, index: index++, items: [] });
      } else if (level === 3) {
        tree.at(-1).items.push({ slug, title, index: index++, items: [] });
      }
    }

    return tree;
  });
}
