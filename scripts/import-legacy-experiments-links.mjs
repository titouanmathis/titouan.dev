#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { EmDashClient } from 'emdash/client';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const verbose = args.has('--verbose');
const baseUrl = process.env.EMDASH_URL || process.env.SITE_URL || 'http://localhost:4321';
const token = process.env.EMDASH_TOKEN;

if (!token) {
  console.error('Missing EMDASH_TOKEN');
  process.exit(1);
}

const client = new EmDashClient({ baseUrl, token });

function execGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function gitShow(path) {
  return execFileSync('git', ['show', `main:${path}`], { encoding: 'utf8' });
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = {};

  if (!match) return { frontmatter, body: raw };

  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) continue;
    frontmatter[m[1]] = m[2].trim().replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
  }

  return { frontmatter, body: raw.slice(match[0].length) };
}

async function listAllEntries(collection) {
  const items = [];
  let cursor;
  do {
    const page = await client.list(collection, { limit: 100, cursor });
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return items;
}

function parseExperiment(path) {
  const raw = gitShow(path);
  const { frontmatter } = parseFrontmatter(raw);
  const basename = path.split('/').pop().replace(/\.(md|mdx)$/,'');
  const number = Number.parseInt(basename, 10);

  return {
    collection: 'experiments',
    slug: basename,
    data: {
      title: frontmatter.title || `#${basename}`,
      number,
      component: `Experiments${basename}`,
    },
  };
}

function parseLink(path) {
  const raw = gitShow(path);
  const { frontmatter } = parseFrontmatter(raw);
  const parts = path.split('/');
  const file = parts[parts.length - 1].replace(/\.(md|mdx)$/,'');
  const slug = file;

  return {
    collection: 'links',
    slug,
    data: {
      title: frontmatter.title,
      link: frontmatter.link,
      description: frontmatter.description || '',
      tags: frontmatter.tags || '',
    },
  };
}

async function createEntry(entry, existing) {
  const found = existing.find((item) => item.slug === entry.slug);
  if (found) {
    console.log(`skip ${entry.collection}/${entry.slug} (already exists)`);
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] create ${entry.collection}/${entry.slug}`);
    if (verbose) console.log(entry);
    return;
  }

  await client.create(entry.collection, {
    slug: entry.slug,
    status: 'published',
    data: entry.data,
  });

  console.log(`imported ${entry.collection}/${entry.slug}`);
}

async function main() {
  const experimentFiles = execGit(['ls-tree', '-r', '--name-only', 'main', 'src/pages/experiments'])
    .split('\n')
    .filter((line) => /\/\d+\.mdx?$/.test(line));

  const linkFiles = execGit(['ls-tree', '-r', '--name-only', 'main', 'src/pages/links'])
    .split('\n')
    .filter((line) => /\.(md|mdx)$/.test(line));

  const experiments = experimentFiles.map(parseExperiment);
  const links = linkFiles.map(parseLink);

  const existingExperiments = await listAllEntries('experiments');
  const existingLinks = await listAllEntries('links');

  for (const experiment of experiments) {
    await createEntry(experiment, existingExperiments);
  }

  for (const link of links) {
    await createEntry(link, existingLinks);
  }

  console.log(`Done. Experiments: ${experiments.length}, links: ${links.length}, dry-run: ${dryRun}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
