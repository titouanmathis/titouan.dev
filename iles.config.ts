import { promises as fs } from 'fs';
import { join } from 'path';
import { defineConfig, resolveConfig } from 'iles';
import remarkGfm from 'remark-gfm';

function fixSsrRequireEsmError() {
  return process.env.NODE_ENV === 'production' && {
    name: 'fix-ssr-require-esm-error',
    async writeBundle() {
      const config = await resolveConfig();
      fs.writeFile(join(config.tempDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));
    },
  };
}

export default defineConfig({
  modules: ['@islands/prism', '@islands/icons', '@islands/headings'],
  prettyUrls: true,
  turbo: true,
  siteUrl: process?.env?.DEPLOY_PRIME_URL,
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  vite: {
    plugins: [fixSsrRequireEsmError()],
  },
});
