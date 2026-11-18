import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, extname, relative, sep } from 'node:path';
import site from '../src/site';

/**
 * Agent-friendly Markdown exports.
 *
 * At the end of the build this module emits, alongside every rendered HTML page:
 *   - `dist/<slug>.md`   — a clean Markdown twin of each article/note/experiment,
 *                          reachable at `/<slug>.md` (served as `text/markdown`
 *                          via `public/_headers`).
 *   - `dist/llms.txt`      — a curated index of the site in the llms.txt format.
 *   - `dist/llms-full.txt` — every page's Markdown concatenated into one file.
 *
 * The source pages are MDX that import demo files as `?raw` strings and render
 * them through Vue island components (`<UiPlayground>`, `<Preview>`, …). Those
 * are meaningless as text, so the transform strips the MDX scaffolding and
 * inlines each referenced demo file as a fenced code block — agents get the
 * actual code instead of a component reference. See `transform()`.
 */

const PAGES_DIR = join('src', 'pages');
const DIST_DIR = 'dist';

// Sections exposed to agents, in the order they appear in llms.txt. The key is
// the top-level directory under src/pages; index/listing pages are `.vue` and
// therefore never picked up by the `.md`/`.mdx` glob below.
const SECTIONS: Array<{ dir: string; label: string }> = [
  { dir: 'articles', label: 'Articles' },
  { dir: 'notes', label: 'Notes' },
  { dir: 'experiments', label: 'Experiments' },
];

// Default titles for `remark-directive` callouts, mirroring the set rendered on
// the HTML side in iles.config.ts.
const CALLOUT_DEFAULT_TITLES: Record<string, string> = {
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  danger: 'DANGER',
  details: 'Details',
};

// Fence language per demo-file extension, and the comment syntax used to label
// the inlined file inside its code block.
const LANG_BY_EXT: Record<string, string> = {
  twig: 'twig',
  html: 'html',
  vue: 'vue',
  ts: 'ts',
  tsx: 'tsx',
  js: 'js',
  jsx: 'jsx',
  mjs: 'js',
  css: 'css',
  scss: 'scss',
  json: 'json',
};

function commentFor(lang: string, name: string): string {
  if (['ts', 'tsx', 'js', 'jsx', 'mjs'].includes(lang)) return `// ${name}`;
  if (['css', 'scss'].includes(lang)) return `/* ${name} */`;
  return `<!-- ${name} -->`;
}

interface Page {
  slug: string;
  section: string;
  title: string;
  description: string;
  date: number;
  /** Transformed Markdown, frontmatter included (written to `<slug>.md`). */
  markdown: string;
  /** Transformed Markdown body only (H1 kept, frontmatter dropped). */
  body: string;
}

/** Recursively collect every `.md`/`.mdx` file under a directory. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Split a `---`-delimited frontmatter block from the body. */
function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: '', body: raw };
  return { frontmatter: match[1], body: raw.slice(match[0].length) };
}

/** Read a single top-level scalar out of a frontmatter block. */
function frontmatterValue(frontmatter: string, key: string): string {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

/**
 * Replace fenced code blocks with opaque tokens so the MDX/callout transforms
 * below never touch code (e.g. `<value>` placeholders or `:::` lines inside a
 * snippet). Restored verbatim by `unmaskFences()`.
 */
function maskFences(text: string, store: string[]): string {
  return text.replace(/(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g, (match, lead) => {
    store.push(match.slice(lead.length));
    return `${lead}\u0000FENCE${store.length - 1}\u0000`;
  });
}

function unmaskFences(text: string, store: string[]): string {
  return text.replace(/\u0000FENCE(\d+)\u0000/g, (_, index) => store[Number(index)]);
}

/**
 * Inline a `<UiPlayground html={x} script={y} css={z} …>` island as fenced code
 * blocks, reading each referenced `?raw` import from disk. `imports` maps the
 * local binding name to its import path; `dir` is the page's directory.
 */
function renderPlayground(attrs: string, imports: Map<string, string>, dir: string): string {
  const blocks: string[] = [];
  for (const prop of ['html', 'css', 'script']) {
    const binding = attrs.match(new RegExp(`\\b${prop}=\\{(\\w+)\\}`))?.[1];
    const source = binding && imports.get(binding);
    if (!source) continue;

    const file = join(dir, source.replace(/\?.*$/, ''));
    let code: string;
    try {
      code = readFileSync(file, 'utf8').trim();
    } catch {
      continue;
    }

    const lang = LANG_BY_EXT[extname(file).slice(1)] ?? 'text';
    const name = basename(file);
    blocks.push(`\`\`\`${lang}\n${commentFor(lang, name)}\n${code}\n\`\`\``);
  }
  return blocks.join('\n\n');
}

/** Remove the common leading indentation from a block of inline HTML. */
function dedent(text: string): string {
  const lines = text
    .replace(/^\n/, '')
    .replace(/\n\s*$/, '')
    .split('\n');
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)![0].length),
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

/** Convert `:::type[Title] … :::` container directives into blockquotes. */
function convertCallouts(text: string): string {
  const out: string[] = [];
  let inCallout = false;
  for (const line of text.split('\n')) {
    const open = line.match(/^:::(\w+)(?:\[([^\]]*)\])?\s*$/);
    if (!inCallout && open && open[1] in CALLOUT_DEFAULT_TITLES) {
      out.push(`> **${open[2] || CALLOUT_DEFAULT_TITLES[open[1]]}**`, '>');
      inCallout = true;
    } else if (inCallout && /^:::\s*$/.test(line)) {
      inCallout = false;
      out.push('');
    } else if (inCallout) {
      out.push(line.trim() ? `> ${line}` : '>');
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

/**
 * Turn one MDX/Markdown source file into clean Markdown: strip imports and
 * presentational islands, inline playground demos, and normalise callouts.
 */
function transform(raw: string, filePath: string): string {
  const dir = dirname(filePath);
  const { frontmatter, body } = splitFrontmatter(raw);

  const imports = new Map<string, string>();
  for (const match of body.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm)) {
    imports.set(match[1], match[2]);
  }

  const fences: string[] = [];
  let text = maskFences(body, fences);

  // Drop the (now code-free) import/export statements.
  text = text.replace(/^(?:import|export)\b.*$/gm, '');

  // Inline interactive playgrounds as code blocks, keep `<Preview>` and
  // `<MetaInfo>` text content, and drop the purely visual islands.
  text = text.replace(/<UiPlayground\b([\s\S]*?)\/?>(?:\s*<\/UiPlayground>)?/g, (_, attrs) =>
    renderPlayground(attrs, imports, dir),
  );
  text = text.replace(/<Preview(?=[\s>])[^>]*>([\s\S]*?)<\/Preview>/g, (_, inner) =>
    dedent(inner).trim(),
  );
  text = text.replace(/<MetaInfo\b[^>]*>([\s\S]*?)<\/MetaInfo>/g, (_, inner) => inner.trim());
  text = text.replace(/<Experiments\w*\b[^>]*?\/?>(?:\s*<\/Experiments\w*>)?/g, '');

  text = convertCallouts(text);
  text = unmaskFences(text, fences);
  text = text
    .replace(/(\n>\n)(?:>\n)+/g, '$1') // collapse consecutive empty blockquote lines
    .replace(/\n{3,}/g, '\n\n');
  text = `${text.trim()}\n`;

  const markdown = frontmatter ? `---\n${frontmatter}\n---\n\n${text}` : text;
  return markdown;
}

/**
 * Compute the pretty-URL slug for a page from its source path, matching îles'
 * routing: drop the extension, and collapse a trailing `/index`.
 *   src/pages/notes/foo.md            -> notes/foo
 *   src/pages/notes/bar/index.mdx     -> notes/bar
 */
function slugFor(filePath: string): string {
  return relative(PAGES_DIR, filePath)
    .split(sep)
    .join('/')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '');
}

/** Whether a transformed body carries no prose (island-only pages). */
function isEmptyBody(body: string): boolean {
  return !body
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^#.*$/gm, '')
    .trim();
}

export function markdownExports(siteUrl: string) {
  return {
    name: 'markdown-exports',
    ssg: {
      async onSiteRendered() {
        const pages: Page[] = [];

        for (const filePath of walk(PAGES_DIR)) {
          const slug = slugFor(filePath);
          const section = slug.split('/')[0];
          if (!SECTIONS.some((entry) => entry.dir === section)) continue;

          const raw = readFileSync(filePath, 'utf8');
          const { frontmatter } = splitFrontmatter(raw);
          let markdown = transform(raw, filePath);

          // Island-only pages (e.g. experiments) render to no prose; point
          // agents at the live, interactive version instead of a blank file.
          if (isEmptyBody(markdown)) {
            markdown += `\n> This page is an interactive experiment. View it live at ${siteUrl}/${slug}\n`;
          }

          const date = frontmatterValue(frontmatter, 'date');
          pages.push({
            slug,
            section,
            title: frontmatterValue(frontmatter, 'title') || slug,
            description: frontmatterValue(frontmatter, 'description'),
            date: date ? new Date(date).getTime() : 0,
            markdown,
            body: markdown.replace(/^---\n[\s\S]*?\n---\n\n/, ''),
          });

          const outFile = join(DIST_DIR, `${slug}.md`);
          mkdirSync(dirname(outFile), { recursive: true });
          writeFileSync(outFile, markdown);
        }

        pages.sort((a, b) => b.date - a.date);
        writeLlmsTxt(pages, siteUrl);
        writeLlmsFullTxt(pages, siteUrl);
        console.log(`[md] generated ${pages.length} page(s) + llms.txt + llms-full.txt`);
      },
    },
  };
}

function writeLlmsTxt(pages: Page[], siteUrl: string): void {
  const lines = [`# ${site.author}`, '', `> ${site.description}`, ''];

  for (const { dir, label } of SECTIONS) {
    const items = pages.filter((page) => page.section === dir);
    if (!items.length) continue;

    lines.push(`## ${label}`, '');
    for (const page of items) {
      const suffix = page.description ? `: ${page.description}` : '';
      lines.push(`- [${page.title}](${siteUrl}/${page.slug}.md)${suffix}`);
    }
    lines.push('');
  }

  writeFileSync(join(DIST_DIR, 'llms.txt'), `${lines.join('\n').trim()}\n`);
}

function writeLlmsFullTxt(pages: Page[], siteUrl: string): void {
  const header =
    `# ${site.author}\n\n> ${site.description}\n\n` +
    `Full Markdown content of every article, note and experiment published on ${siteUrl}.\n`;

  const body = pages
    .map((page) => `Source: ${siteUrl}/${page.slug}\n\n${page.body.trim()}`)
    .join('\n\n---\n\n');

  writeFileSync(join(DIST_DIR, 'llms-full.txt'), `${header}\n---\n\n${body}\n`);
}
