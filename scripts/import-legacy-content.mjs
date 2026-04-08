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

const FILES = execGit(['ls-tree', '-r', '--name-only', 'main', 'src/pages/notes', 'src/pages/articles'])
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /\.(md|mdx)$/.test(line));

const existingByCollection = new Map();
const tagsBySlug = new Map();

function execGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function gitShow(path) {
  return execFileSync('git', ['show', `main:${path}`], { encoding: 'utf8' });
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = {};

  if (!match) {
    return { frontmatter, body: raw };
  }

  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) continue;
    frontmatter[m[1]] = m[2].trim();
  }

  return { frontmatter, body: raw.slice(match[0].length) };
}

function extractDateFromPath(path) {
  const match = path.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]} 00:00:00`;
}

function extractSlugFromPath(path) {
  const parts = path.split('/');
  const file = parts[parts.length - 1];
  if (file === 'index.mdx' || file === 'index.md') {
    return parts[parts.length - 2];
  }
  return file.replace(/\.(md|mdx)$/,'');
}

function extractTags(frontmatter, body) {
  const set = new Map();
  const pushTag = (tag) => {
    if (!tag) return;
    const trimmed = String(tag).trim();
    if (!trimmed) return;
    const slug = slugify(trimmed);
    if (!slug) return;
    if (!set.has(slug)) set.set(slug, trimmed);
  };

  if (frontmatter.tags) {
    for (const tag of frontmatter.tags.split(',')) pushTag(tag);
  }

  const metaMatch = body.match(/in\s+((?:#[-\w]+\s*)+)/i);
  if (metaMatch) {
    for (const item of metaMatch[1].split(/\s+/)) {
      if (item.startsWith('#')) pushTag(item.slice(1));
    }
  }

  return Array.from(set.entries()).map(([slug, label]) => ({ slug, label }));
}

function cleanBody(body) {
  let cleaned = body;

  cleaned = cleaned.replace(/^import .*$/gm, '').trim();
  cleaned = cleaned.replace(/^#\s+.+\n+/, '');
  cleaned = cleaned.replace(/<MetaInfo[^>]*>[\s\S]*?<\/MetaInfo>/g, '');
  cleaned = cleaned.replace(/<div class="tracking-wide uppercase opacity-70">[\s\S]*?<\/div>/g, '');
  cleaned = cleaned.replace(/<small>.*?<\/small>/g, '');
  cleaned = cleaned.replace(/<TableOfContent[^>]*\/>/g, '');

  cleaned = cleaned.replace(/<PreviewPlayground[\s\S]*?<\/PreviewPlayground>/g, '> Interactive demo omitted during migration.');
  cleaned = cleaned.replace(/<Preview[\s\S]*?<\/Preview>/g, '> Visual demo omitted during migration.');

  cleaned = cleaned.replace(/<video[\s\S]*?<\/video>/g, '');
  cleaned = cleaned.replace(/<source[^>]*\/>/g, '');
  cleaned = cleaned.replace(/<div[^>]*>/g, '');
  cleaned = cleaned.replace(/<\/div>/g, '');

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim() + '\n';
}

async function listAllEntries(collection) {
  if (existingByCollection.has(collection)) return existingByCollection.get(collection);

  const items = [];
  let cursor;
  do {
    const page = await client.list(collection, { limit: 100, cursor, status: 'published' });
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);

  existingByCollection.set(collection, items);
  return items;
}

async function getTagMap() {
  if (tagsBySlug.size > 0) return tagsBySlug;

  let cursor;
  do {
    const page = await client.terms('tag', { limit: 100, cursor });
    const terms = page.items || page.terms || [];
    for (const item of terms) tagsBySlug.set(item.slug, item);
    cursor = page.nextCursor;
  } while (cursor);

  return tagsBySlug;
}

async function ensureTag(tag) {
  const map = await getTagMap();
  if (map.has(tag.slug)) return map.get(tag.slug);

  if (dryRun) {
    console.log(`[dry-run] create tag ${tag.slug}`);
    const fake = { id: `dry-${tag.slug}`, slug: tag.slug, label: tag.label };
    map.set(tag.slug, fake);
    return fake;
  }

  try {
    const created = await client.createTerm('tag', {
      slug: tag.slug,
      label: tag.label,
    });
    map.set(created.slug, created);
    return created;
  } catch (error) {
    if (error?.status === 409) {
      tagsBySlug.clear();
      const refreshed = await getTagMap();
      if (refreshed.has(tag.slug)) return refreshed.get(tag.slug);
    }
    throw error;
  }
}

async function setEntryTerms(collection, id, termIds) {
  const response = await fetch(`${baseUrl}/_emdash/api/content/${encodeURIComponent(collection)}/${encodeURIComponent(id)}/terms/tag`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ termIds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to assign tags: ${response.status} ${text}`);
  }
}

function toEntry(path) {
  const collection = path.includes('/articles/') ? 'articles' : 'notes';
  const raw = gitShow(path);
  const { frontmatter, body } = parseFrontmatter(raw);
  const slug = extractSlugFromPath(path);
  const publishedAt = extractDateFromPath(path);
  const title = frontmatter.title || slug;
  const description = frontmatter.description || undefined;
  const tags = extractTags(frontmatter, body);
  const content = cleanBody(body);

  return {
    path,
    collection,
    slug,
    title,
    description,
    publishedAt,
    tags,
    content,
  };
}

async function createEntry(entry) {
  const existing = await listAllEntries(entry.collection);
  const found = existing.find((item) => item.slug === entry.slug);

  if (found) {
    console.log(`skip ${entry.collection}/${entry.slug} (already exists)`);
    return { id: found.id, skipped: true };
  }

  if (dryRun) {
    console.log(`[dry-run] create ${entry.collection}/${entry.slug}`);
    if (verbose) console.log(entry);
    return { id: `dry-${entry.slug}`, skipped: false };
  }

  const payload = {
    title: entry.title,
    description: entry.description,
    tags: entry.tags.map((tag) => tag.slug).join(', '),
    content: entry.content,
  };

  const item = await client.create(entry.collection, {
    slug: entry.slug,
    status: 'published',
    data: payload,
  });

  if (entry.publishedAt) {
    await fetch(`${baseUrl}/_emdash/api/content/${encodeURIComponent(entry.collection)}/${encodeURIComponent(item.id)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        status: 'published',
        publishedAt: entry.publishedAt,
        data: payload,
      }),
    });
  }

  existing.push(item);
  return { id: item.id, skipped: false };
}

async function main() {
  const entries = FILES.map(toEntry);
  console.log(`Found ${entries.length} legacy markdown entries from main`);

  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const result = await createEntry(entry);
    if (result.skipped) {
      skipped += 1;
      continue;
    }

    created += 1;

    if (entry.tags.length > 0) {
      const termIds = [];
      for (const tag of entry.tags) {
        const term = await ensureTag(tag);
        if (term?.id) termIds.push(term.id);
      }

      if (termIds.length > 0 && !dryRun) {
        await setEntryTerms(entry.collection, result.id, termIds);
      }
    }

    console.log(`imported ${entry.collection}/${entry.slug}`);
  }

  console.log(`Done. Created: ${created}, skipped: ${skipped}, dry-run: ${dryRun}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
