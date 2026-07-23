import { defineConfig } from 'iles';
import headings from '@islands/headings';
import icons from '@islands/icons';
import rehypeShiki from '@shikijs/rehype';
import { transformerTwoslash, rendererRich } from '@shikijs/twoslash';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { toHast } from 'mdast-util-to-hast';
import type { ElementContent, Element } from 'hast';
import type { Root } from 'mdast';
import type { ShikiTransformer } from 'shiki';
import tailwindcss from '@tailwindcss/vite';
import { withTrailingSlash } from '@studiometa/js-toolkit/utils';

/**
 * Expose the code block language as a `data-lang` attribute on the `<pre>`
 * element so the CSS can render a language badge (previously provided by
 * `@islands/prism`).
 */
const transformerLangBadge: ShikiTransformer = {
  name: 'lang-badge',
  pre(node) {
    const lang = this.options.lang;
    node.properties['data-lang'] = lang === 'text' ? '' : lang;
  },
};

/**
 * Render the markdown found in Twoslash hover docs (JSDoc descriptions, tag
 * values) to HAST so bold/code/links actually render instead of showing as raw
 * text. GFM is enabled so bare URLs (e.g. `@link https://…` tag values) become
 * clickable, and inline `{@link target}` tokens are unwrapped to their target.
 */
function renderMarkdown(this: unknown, md: string): ElementContent[] {
  const mdast = fromMarkdown(
    md.replace(/\{@(?:link|linkcode|linkplain)\s+([^}|]+)(?:\|[^}]*)?\}/g, '$1'),
    {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    },
  );
  return (toHast(mdast) as Element).children;
}

/**
 * Inline variant used for single-line tag values. Param/prop tags lead with the
 * identifier, which we wrap in code; a lone paragraph is unwrapped so the text
 * stays on one line.
 */
function renderMarkdownInline(this: unknown, md: string, context?: string): ElementContent[] {
  const value =
    context === 'tag:param' || context === 'tag:prop' ? md.replace(/^([\w$-]+)/, '`$1` ') : md;
  const children = renderMarkdown.call(this, value);
  if (children.length === 1 && children[0].type === 'element' && children[0].tagName === 'p') {
    return children[0].children;
  }
  return children;
}

/**
 * VitePress-inspired callouts, authored as `remark-directive` containers, e.g.:
 *
 *   :::warning[Developer preview]
 *   Markdown **content** with [links](https://example.com).
 *   :::
 *
 * Rendered as `<div class="callout warning"><p class="callout-title">…` (or
 * `<details><summary>` for `:::details`). Styling lives in
 * src/assets/callouts.css.
 */
const CALLOUT_DEFAULT_TITLES: Record<string, string> = {
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  danger: 'DANGER',
  details: 'Details',
};

function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node) => {
      const type = node.name;
      if (!(type in CALLOUT_DEFAULT_TITLES)) return;

      const isDetails = type === 'details';
      // A `[label]` on the opening line becomes the first child paragraph
      // flagged as a directive label; use it as the title when present.
      const [firstChild] = node.children;
      const labelNode =
        firstChild?.type === 'paragraph' && firstChild.data?.directiveLabel
          ? firstChild
          : undefined;
      if (labelNode) node.children.shift();

      const titleChildren = labelNode
        ? labelNode.children
        : [{ type: 'text' as const, value: CALLOUT_DEFAULT_TITLES[type] }];

      const titleNode = {
        type: 'paragraph' as const,
        data: {
          hName: isDetails ? 'summary' : 'p',
          hProperties: { className: ['callout-title'] },
        },
        children: titleChildren,
      };

      node.data = {
        ...node.data,
        hName: isDetails ? 'details' : 'div',
        hProperties: { className: ['callout', type] },
      };
      node.children = [titleNode, ...node.children];
    });
  };
}

/**
 * Add a trailing slash to a path.
 * @param {string} path
 * @return {string}
 */
function addTrailingSlash(path: string): string {
  const url = new URL(path, 'http://localhost');
  url.pathname = withTrailingSlash(url.pathname);
  return url.toString().replace('http://localhost', '');
}

export default defineConfig({
  modules: [headings(), icons(), '@islands/feed'],
  prettyUrls: true,
  turbo: true,
  siteUrl: process?.env?.URL ?? process?.env?.CF_PAGES_URL ?? 'http://localhost:3000',
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkDirective, remarkCallouts],
    rehypePlugins: [
      [
        rehypeShiki,
        {
          // Dual theme: colors are emitted as CSS variables and swapped via
          // the `html.dark` selector (see src/assets/syntax-highlight.css).
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: false,
          // Style fenced blocks that declare no language, or a language Shiki
          // doesn't bundle, as plaintext (they'd otherwise be skipped and render
          // unstyled). `apacheconf` isn't bundled, so alias it to `apache`.
          defaultLanguage: 'text',
          fallbackLanguage: 'text',
          langAlias: { apacheconf: 'apache' },
          transformers: [
            // Twoslash overlays are opt-in per block via the `twoslash` meta
            // flag, e.g. ```ts twoslash. Rich renderer = pure-CSS hover popups,
            // no client-side JavaScript required — the Floating Vue renderer is
            // not an option here because MDX compiles its `<v-menu>` output as
            // an inert native element, never binding to the component. `langs`
            // adds js/jsx (the transformer only handles ts/tsx by default),
            // with allowJs/checkJs so JavaScript snippets get type info too.
            transformerTwoslash({
              explicitTrigger: true,
              langs: ['js', 'jsx', 'ts', 'tsx'],
              twoslashOptions: {
                compilerOptions: { allowJs: true, checkJs: true },
              },
              renderer: rendererRich({ renderMarkdown, renderMarkdownInline }),
            }),
            transformerLangBadge,
          ],
        },
      ],
    ],
  },
  extendRoutes(routes) {
    // Remove links pages from the generated routes and add trailing slash to index pages
    return routes
      .filter((route) => !route.path.startsWith('/links/'))
      .map((route) => ({
        ...route,
        path: route.componentFilename.endsWith('/index.vue')
          ? addTrailingSlash(route.path)
          : route.path,
      }));
  },
  extendFrontmatter(frontmatter, filename) {
    if (!frontmatter.date) {
      const result = filename.match(/\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})/);

      if (result) {
        const [, year, month, day] = result;
        frontmatter.date = new Date(`${year}-${month}-${day}`);
      }
    }
  },
  ssg: {
    beforePageRender(page) {
      // Render index pages in index.html files
      if (
        page.path.endsWith('/') &&
        !page.outputFilename.endsWith('index.html') &&
        page.outputFilename.endsWith('.html')
      ) {
        page.outputFilename = page.outputFilename.replace(/\.html$/, '/index.html');
      }
      return page;
    },
  },
});
