import { defineConfig } from 'iles';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  modules: ['@islands/prism', '@islands/icons', '@islands/headings'],
  prettyUrls: true,
  turbo: true,
  siteUrl: process?.env?.DEPLOY_PRIME_URL,
  markdown: {
    remarkPlugins: [remarkGfm],
  },
});
