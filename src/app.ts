import { defineApp } from 'iles';
import { computed } from 'vue';
import checkTheme from '~/utils/check-theme?raw';
import toggleTheme from '~/utils/toggle-theme?raw';

export default defineApp({
  head({ frontmatter, site }) {
    return {
      meta: [
        { property: 'author', content: site.author },
        {
          property: 'description',
          content: computed(() => frontmatter.description ?? site.description),
        },
      ],
      link: [
        {
          rel: 'shortcut icon',
          href: '/icon-light.svg',
        },
      ],
      script: [
        { children: checkTheme, once: true },
        { children: toggleTheme, defer: true, once: true },
      ],
    };
  },
});
