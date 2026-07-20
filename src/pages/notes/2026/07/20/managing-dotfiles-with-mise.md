---
title: Managing my dotfiles with mise
description: Replacing custom Homebrew shell scripts with a portable mise configuration.
---

# Managing my dotfiles with mise

<MetaInfo class="block">20/07/2026 in #dotfiles #mise</MetaInfo>

Until recently, bootstrapping my dotfiles meant maintaining custom shell scripts built around [Homebrew](https://brew.sh/). They worked well on my Mac, but using the same setup on Linux servers required extra paths and special cases.

I have now moved tool installation and version management to [mise](https://mise.jdx.dev/). The biggest win is portability: the same declarative configuration works on both macOS and Linux. My dotfiles contain less installation logic, and setting up a laptop or server now follows the same workflow.
