import { defineConfig } from 'iles';
import headings from '@islands/headings';
import icons from '@islands/icons';
import prism from '@islands/prism';

export default defineConfig({
  modules: [headings(), icons(), prism()],
  prettyUrls: true,
  turbo: false,
  siteUrl: process?.env?.URL,
});
