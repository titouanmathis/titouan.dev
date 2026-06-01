# titouan.dev

Personal website — articles, notes, experiments, and links — built with
[Astro](https://astro.build) and the [EmDash](https://emdashcms.com) CMS.

## Stack

- **Astro 6** in `server` output mode, behind the `@astrojs/node` standalone adapter
- **EmDash** CMS for content, backed by **SQLite** (`better-sqlite3`)
- **Tailwind CSS 4** for styling
- **React** for EmDash's admin UI
- Media stored on the local filesystem (`./uploads`)

Content lives in the EmDash database (`data.db`), not in the repository. The
schema (collections, fields, taxonomies, menu) is defined in
[`seed/seed.json`](seed/seed.json).

## Collections

| Collection    | Notes                                                        |
| ------------- | ------------------------------------------------------------ |
| `articles`    | Long-form posts (rich portable-text content, tags, SEO)      |
| `notes`       | Short notes / TILs (rich content, tags)                      |
| `experiments` | Interactive canvas experiments, rendered by `number`         |
| `links`       | Outbound links                                               |
| `pages`       | Standalone pages                                             |

## Project setup

```sh
npm install
```

### Initialize the database

Creates `data.db`, runs migrations, and applies the seed (collections, fields,
taxonomies, menu):

```sh
npm run bootstrap   # emdash init && emdash seed
```

### Develop

```sh
npm run dev         # http://localhost:4321  (admin at /_emdash/admin)
```

### Build & run for production

```sh
npm run build
npm start           # node ./dist/server/entry.mjs
```

### Type-check

```sh
npm run typecheck   # astro check
```

## Authoring content

Use the EmDash admin at `/_emdash/admin`. The first admin signs in with a
passkey (WebAuthn) through the setup wizard.

For headless/scripted access (e.g. the import below), mint an API token
directly against the local database:

```sh
npm run token:create   # prints an ec_pat_… token; copy it into EMDASH_TOKEN
```

## Importing the legacy site

The previous îles-based version of the site (Markdown/MDX) lives on the `main`
branch. The scripts under `scripts/` read it via `git show` and recreate it in
EmDash. They talk to a running instance, so start `npm run dev` first and export
your token:

```sh
export EMDASH_URL=http://localhost:4321
export EMDASH_TOKEN=ec_pat_…        # from `npm run token:create`
```

Run the pipeline in order:

```sh
npm run import:legacy           # articles + notes (preview with -- --dry-run)
npm run import:legacy:extras    # experiments + links
npm run fix:imported-mdx        # restore rich interactive blocks for 2 posts
npm run backfill:published-at   # restore original publish dates
```

Notes:

- Content is created as a draft, then published; original publish dates are
  restored from the legacy `/YYYY/MM/DD/` paths.
- Missing tag taxonomy terms are created and assigned to imported entries.
- Legacy MDX-only UI (interactive playgrounds, video pairs, number grids) is
  preserved as custom portable-text blocks via the local
  [`legacy-mdx`](plugins/legacy-mdx) EmDash plugin.
- `--dry-run` previews without writing; `--verbose` logs parsed payloads.
- Old `/notes/YYYY/MM/DD/<slug>` URLs are 301-redirected to the new flat slugs
  by [`src/middleware.ts`](src/middleware.ts).

## Deployment

`data.db` and `uploads/` are git-ignored — they are the live content store and
must be persisted across deploys (e.g. a mounted volume). Set `SITE_URL` to the
public origin so canonical URLs and the RSS feed are correct.
