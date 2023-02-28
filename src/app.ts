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
          name: 'twitter:site',
          content: '@titouanmathis',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:image',
          content: computed(() =>
            new URL('/android-chrome-512x512.png', config.siteUrl).toString()
          ),
        },
        {
          name: 'og:image',
          content: computed(() =>
            new URL('/android-chrome-512x512.png', config.siteUrl).toString()
          ),
        },
      ],
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico', // 32×32
          sizes: 'any',
          'data-light': '/light-favicon.ico',
          'data-dark': '/favicon.ico',
          'data-theme-switch': '',
        },
        {
          rel: 'icon',
          href: '/icon.svg',
          type: 'image/svg+xml',
          'data-light': '/light-icon.svg',
          'data-dark': '/icon.svg',
          'data-theme-switch': '',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png', // 180×180
          'data-light': '/light-apple-touch-icon.png',
          'data-dark': '/apple-touch-icon.png',
          'data-theme-switch': '',
        },
        {
          rel: 'manifest',
          href: '/site.webmanifest',
          'data-light': '/light-site.webmanifest',
          'data-dark': '/site.webmanifest',
          'data-theme-switch': '',
        },
        {
          rel: 'alternate',
          type: 'application/atom+xml',
          title: 'Atom feed',
          href: computed(() => new URL('/feed.atom', config.siteUrl).toString()),
        },
        {
          rel: 'canonical',
          href: computed(() => new URL(unref(route).path, config.siteUrl).toString()),
        },
      ],
      script: [
        { children: checkTheme, once: false },
        { children: toggleTheme, defer: true, once: true },
        {
          defer: true,
          dataDomain: 'titouan.dev',
          src: 'https://p.analytic.sh/js/script.js',
        },
      ],
    };
  },
});
