# titouan.dev

[îles]: https://github.com/ElMassimo/iles
[configuration reference]: https://iles-docs.netlify.app/config

This template should help get you started developing with [îles].

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic `PageComponent` type by default. In most cases this is fine if you don't really care about component prop types outside of templates.

However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can run `Volar: Switch TS Plugin on/off` from VSCode command palette.

## Customize configuration

See îles [Configuration Reference].

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Import legacy notes/articles from `main` into EmDash

Use the migration script to import markdown content from the previous version of the site stored on the `main` branch.

```sh
EMDASH_URL=http://localhost:4321 \
EMDASH_TOKEN=your_api_token \
npm run import:legacy -- --dry-run
```

Then run the real import:

```sh
EMDASH_URL=http://localhost:4321 \
EMDASH_TOKEN=your_api_token \
npm run import:legacy
```

Options:

- `--dry-run` — preview what would be imported
- `--verbose` — log parsed entry payloads

Notes:

- Reads legacy `.md`/`.mdx` files from the `main` branch via `git show`
- Imports `src/pages/notes/**` into `notes`
- Imports `src/pages/articles/**` into `articles`
- Skips entries whose slug already exists
- Creates missing tag taxonomy terms, then assigns them to imported entries
- Strips legacy MDX-only UI components/imports during migration

### Run Unit Tests with [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction)

```sh
npm run test:unit # or `npm run test:unit:ci` for headless testing
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e # or `npm run test:e2e:ci` for headless testing
```
