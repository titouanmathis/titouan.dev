import { defineApp } from 'iles';
import { computed, unref } from 'vue';
import checkTheme from '~/utils/check-theme?raw';
import toggleTheme from '~/utils/toggle-theme?raw';

export default defineApp({
  head({ frontmatter, site, route, config }) {
    return {
      meta: [
        { property: 'author', content: site.author },
        {
          property: 'description',
          content: computed(() => frontmatter.description ?? site.description),
        },
        {
          name: 'twitter:creator',
          content: '@titouanmathis',
        },
      ],
      link: [
        {
          rel: 'shortcut icon',
          href: '/icon-light.svg',
        },
        {
          rel: 'canonical',
          href: computed(() => new URL(unref(route).path, config.siteUrl)),
        },
      ],
      script: [
        { children: checkTheme, once: false },
        { children: toggleTheme, defer: true, once: true },
      ],
    };
  },
});
