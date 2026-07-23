---
date: 2026-07-20
title: Managing my dotfiles with mise
description: Replacing custom Homebrew shell scripts with a portable mise configuration.
---

# Managing my dotfiles with mise

<MetaInfo class="block">20/07/2026 in #dotfiles #mise</MetaInfo>

I recently replaced the custom Homebrew shell scripts I used to bootstrap my dotfiles with [mise’s new dotfiles support](https://github.com/jdx/mise/releases/tag/v2026.6.6). It lets me manage tools, versions, and dotfiles from one declarative configuration. The biggest benefit is portability: the same setup works on macOS and Linux servers, with fewer scripts and special cases to maintain.

If you already use mise—or maintain your own dotfiles bootstrap scripts, I recommend giving it a try.
