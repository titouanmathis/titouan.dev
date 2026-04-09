#!/usr/bin/env node

import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { EmDashClient, markdownToPortableText } from 'emdash/client';

const baseUrl = process.env.EMDASH_URL || 'http://localhost:4321';
const token = process.env.EMDASH_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!token) {
  console.error('Missing EMDASH_TOKEN');
  process.exit(1);
}

const client = new EmDashClient({
  baseUrl,
  token,
});

function gitShow(path) {
  return execFileSync('git', ['show', `main:${path}`], { encoding: 'utf8' });
}

function opaqueBlock(block) {
  return `<!--ec:block ${JSON.stringify(block)} -->`;
}

function buildLegacyNoteMarkdown() {
  const bug = gitShow('src/pages/notes/2025/09/30/fixing-numbers-alignment-with-css/demo-bug.twig').trim();
  const fixed = gitShow('src/pages/notes/2025/09/30/fixing-numbers-alignment-with-css/demo-fixed.twig').trim();
  const css = gitShow('src/pages/notes/2025/09/30/fixing-numbers-alignment-with-css/demo.css').trim();
  const js = gitShow('src/pages/notes/2025/09/30/fixing-numbers-alignment-with-css/demo.ts').trim();
  const columns = JSON.stringify([
    ['17906', '50087', '47395', '63327', '43013', '20560', '47430', '27118', '59888', '28934'],
    ['21899', '65701', '52334', '90941', '86553', '72253', '48722', '77162', '50158', '10179'],
    ['17906', '50087', '47395', '63327', '43013', '20560', '47430', '27118', '59888', '28934'],
  ]);

  return `While working on a demo for the [Action](https://ui.studiometa.dev/-/components/Action/) and [DataModel](https://ui.studiometa.dev/-/components/DataBind/) components from [@studiometa/ui](https://ui.studiometa.dev) involving an \`<input type="date">\` element, I stumbled upon a small issue I often encounter when working with numbers: small layout shifts when the number changes.

## The issue

In the example below, adding or removing a day from the date will slightly change the width of the \`<input type="date">\` element.

${opaqueBlock({
    _type: 'legacyPlayground',
    title: 'Date input layout shift demo',
    note: 'Original interactive demo restored from the legacy MDX post.',
    html: bug,
    css,
    js,
  })}

If you do not see the small layout shifts in the demo above, the following video might be more explicit:

${opaqueBlock({
    _type: 'legacyVideo',
    title: 'Input width glitch preview',
    lightSrc: '/2025/09/30/input-glitch-light.mp4',
    darkSrc: '/2025/09/30/input-glitch.mp4',
  })}

This issue can also be seen when displaying a list of numbers, where the line endings are not aligned, even though they contain the same number of characters.

${opaqueBlock({
    _type: 'legacyNumberGrid',
    title: 'Misaligned proportional figures',
    columns,
    note: 'Without tabular figures, equally long numbers do not align visually.',
  })}

## The solution

The solution is a feature of the OpenType format called \`tnum\` ([wiki](https://en.wikipedia.org/wiki/List_of_typographic_features#Features_intended_for_digits_and_math)), which enables tabular figures. This means that all numbers will have the same width, preventing any misalignment or small layout shifts.

This can be enabled with [Tailwind CSS](https://tailwindcss.com/) by using the [\`tabular-nums\` class](https://tailwindcss.com/docs/font-variant-numeric#using-tabular-figures):

\`\`\`diff
-  <div class="flex gap-10 justify-center">
+  <div class="flex gap-10 justify-center tabular-nums">
\`\`\`

Or directly in CSS by using the [\`font-variant-numeric\` property](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric):

\`\`\`css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
\`\`\`

Adding the \`tabular-nums\` class to both our demos fixes them: numbers are aligned, and changing them does not trigger a layout shift.

Our columns of number are nicely aligned:

${opaqueBlock({
    _type: 'legacyNumberGrid',
    title: 'Aligned tabular figures',
    columns,
    note: 'Adding tabular-nums keeps every digit the same width, so the columns line up cleanly.',
  })}

The \`<input type="date">\` element will not have its width changed when its value is updated:

${opaqueBlock({
    _type: 'legacyPlayground',
    title: 'Fixed date input demo',
    note: 'Same demo with the tabular-nums fix applied.',
    html: fixed,
    css,
    js,
  })}

## Links

To go further, make sure to visit the following links:

- [Documentation on OpenType font features](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/OpenType_fonts_guide)
- [Documentation for the \`font-variant-numeric\` property](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)
- [Documentation for the \`tabular-nums\` class of Tailwind CSS](https://tailwindcss.com/docs/font-variant-numeric#using-tabular-figures)

And to learn more on the components used for the date demo:

- [Documentation for the \`Action\` component](https://ui.studiometa.dev/-/components/Action/)
- [Documentation for the \`DataBind\` family of components](https://ui.studiometa.dev/-/components/DataBind/)
`;
}

function buildLegacyArticleMarkdown() {
  const mdx = gitShow('src/pages/articles/2023/12/20/dos-and-donts-of-redirects-with-htaccess.mdx');
  const lines = mdx.split('\n');
  let i = 0;

  while (i < lines.length && lines[i] !== '---') i++;
  i++;
  while (i < lines.length && lines[i] !== '---') i++;
  i++;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i]?.startsWith('# ')) i++;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i]?.startsWith('<MetaInfo')) i++;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i]?.startsWith('<TableOfContent')) i++;
  while (i < lines.length && lines[i].trim() === '') i++;

  return lines
    .slice(i)
    .join('\n')
    .replace(/<TableOfContent open \/>\n\n/g, '')
    .replace(/<div class="group-leading-none">\n\n/g, '')
    .replace(/\n\n<\/div>/g, '')
    .trim() + '\n';
}

const fixes = [
  {
    collection: 'articles',
    slug: 'dos-and-donts-of-redirects-with-htaccess',
    content: markdownToPortableText(buildLegacyArticleMarkdown()),
  },
  {
    collection: 'notes',
    slug: 'fixing-numbers-alignment-with-css',
    content: markdownToPortableText(buildLegacyNoteMarkdown()),
  },
];

async function main() {
  for (const fix of fixes) {
    const list = await client.list(fix.collection, { status: 'published', limit: 100, raw: true });
    const item = list.items.find((entry) => entry.slug === fix.slug);

    if (!item) {
      console.log(`skip ${fix.collection}/${fix.slug} (not found)`);
      continue;
    }

    const current = await client.get(fix.collection, item.id, { raw: true });
    const { publishedAt: _publishedAt, ...baseData } = current.data;
    const updatedData = { ...baseData, content: fix.content };

    if (dryRun) {
      console.log(`[dry-run] would update ${fix.collection}/${fix.slug}`);
      continue;
    }

    await client.update(fix.collection, item.id, {
      data: updatedData,
      status: current.status,
      _rev: current._rev,
    });

    console.log(`updated ${fix.collection}/${fix.slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
