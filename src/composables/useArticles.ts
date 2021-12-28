import { computed } from 'vue';

export function useArticles(count?:number) {
  const articles = useDocuments('~/pages/articles');
  count = count ?? articles.value.length;
  return computed(() => articles.value.slice(0, count));
}
