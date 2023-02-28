import { defineConfig } from 'iles';
import headings from '@islands/headings';
import icons from '@islands/icons';
import prism from '@islands/prism';
import { withTrailingSlash } from '@studiometa/js-toolkit/utils';

/**
 * Add a trailing slash to a path.
 * @param {string} path
 * @return {string}
 */
function addTrailingSlash(path:string):string {
  const url = new URL(path, 'http://localhost');
  url.pathname = withTrailingSlash(url.pathname);
  return url.toString().replace('http://localhost', '');
}

export default defineConfig({
  modules: [headings(), icons(), prism(), '@islands/feed'],
  prettyUrls: true,
  turbo: true,
  siteUrl: process?.env?.URL ?? 'http://localhost:3000',
  extendRoutes(routes) {
    // Remove links pages from the generated routes and add trailing slash to index pages
    return routes
      .filter((route) => !route.path.startsWith('/links/'))
      .map((route) => ({
        ...route,
        path: route.componentFilename.endsWith('/index.vue') ? addTrailingSlash(route.path) : route.path,
      }));
  },
  ssg: {
    beforePageRender(page) {
      // Render index pages in index.html files
      if (page.path.endsWith('/') && !page.outputFilename.endsWith('index.html') && page.outputFilename.endsWith('.html')) {
        page.outputFilename = page.outputFilename.replace(/\.html$/, '/index.html');
      }
      return page;
    },
  },
});
