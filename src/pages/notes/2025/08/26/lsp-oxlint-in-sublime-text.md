---
title: Using Oxlint LSP server in Sublime Text
description: Configuration to enable Oxlint's LSP server in Sublime Text with the Sublime LSP package.
---

# Using Oxlint LSP server in Sublime Text

<MetaInfo class="block">26/08/2025 in #sublimetext #lsp</MetaInfo>

The [Sublime LSP package](https://lsp.sublimetext.io/) brings the power of LSP servers in Sublime Text, with support for many languages and tools: ESLint, Markdown, TypeScript, Tailwind CSS, etc.

We have been using [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) in our [@studiometa/js-toolkit project](https://github.com/studiometa/js-toolkit) to speed up linting and reduce configuration complexity with TypeScript, but I was missing the instant and integrated feedback in my editor when editing files.

With some digging, I found out that it is easy to add a custom LSP server, and the `oxlint` NPM package is shipped with the language server binary. I added the following configuration in my Sublime LSP settings:

```json
{
  "clients": {
    "LSP-oxlint": {
      "enabled": true,
      "command": [
        "/opt/homebrew/bin/npx",
        "-y",
        "--package=oxlint",
        "-c",
        "'oxc_language_server'"
      ],
      "selector": "source.js | source.ts"
    }
  }
}
```

And I now have code quality reports directly in Sublime Text, with code actions and all the language server tools available.

![-](/2025/08/26/oxlint-lsp-in-sublime-text.png)
