#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { EmDashClient } from 'emdash/client';

const baseUrl = process.env.EMDASH_URL || 'http://localhost:4321';
const token = process.env.EMDASH_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!token) {
  console.error('Missing EMDASH_TOKEN');
  process.exit(1);
}

const client = new EmDashClient({ baseUrl, token });

function execGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function extractDateFromPath(path) {
  const match = path.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!match) return null;
  // EmDash 0.15 requires ISO 8601 for publishedAt
  return `${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`;
}

function extractSlugFromPath(path) {
  const parts = path.split('/');
  const file = parts[parts.length - 1];
  if (file === 'index.mdx' || file === 'index.md') return parts[parts.length - 2];
  return file.replace(/\.(md|mdx)$/,'');
}

async function main() {
  const files = execGit(['ls-tree', '-r', '--name-only', 'main', 'src/pages/notes', 'src/pages/articles'])
    .split('\n')
    .filter(Boolean)
    .filter((line) => /\.(md|mdx)$/.test(line));

  const wanted = new Map(files.map((path) => [
    `${path.includes('/articles/') ? 'articles' : 'notes'}:${extractSlugFromPath(path)}`,
    extractDateFromPath(path),
  ]));

  for (const collection of ['notes', 'articles']) {
    let cursor;
    do {
      const page = await client.list(collection, { limit: 100, cursor, status: 'published' });
      for (const item of page.items) {
        const targetDate = wanted.get(`${collection}:${item.slug}`);
        // Always re-apply the original date: publishing stamps publishedAt to
        // "now", so we can't skip entries that already have a publishedAt.
        if (!targetDate || item.publishedAt === targetDate) continue;

        if (dryRun) {
          console.log(`[dry-run] ${collection}/${item.slug} -> ${targetDate}`);
          continue;
        }

        const response = await fetch(`${baseUrl}/_emdash/api/content/${collection}/${item.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ publishedAt: targetDate }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${collection}/${item.slug}: ${response.status} ${await response.text()}`);
        }

        console.log(`updated ${collection}/${item.slug} -> ${targetDate}`);
      }
      cursor = page.nextCursor;
    } while (cursor);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
