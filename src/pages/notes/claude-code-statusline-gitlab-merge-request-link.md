---
date: 2026-09-15
title: Add GitLab merge request links to a Claude Code statusline
description: Show a clickable link to the merge request for the current Git branch.
tags: claude-code, gitlab, dotfiles
---

# Adding GitLab merge request links to Claude Code status line

<MetaInfo class="block">15/09/2026 in #claude-code #gitlab #dotfiles</MetaInfo>

We use GitLab at [ikko.fr](https://www.ikko.fr) to host most of our client projects and I was missing the useful link to a PR that Claude Code displays for GitHub repositories. So I wanted to update its [status line](https://code.claude.com/docs/en/statusline) to display a similar link for GitLab. 

The Bash script for this is simple, we get the merge request URL with [`glab` CLI](https://gitlab.com/gitlab-org/cli) and `jq` and then wrap the merge request IID in an [OSC 8 hyperlink](https://en.wikipedia.org/wiki/ANSI_escape_code#OSC_8:_Hyperlinks).

```bash
mr=$(glab mr view --output json | jq -r 'select(.web_url) | "\(.iid)\t\(.web_url)"')
IFS=$'\t' read -r mr_iid mr_url <<< "$mr"
printf '\033]8;;%s\007!%s\033]8;;\007' "$mr_url" "$mr_iid"
```

Display was working fine, but the link was not detected and not clickable. I found the solution in a [Github issue thread](https://github.com/anthropics/claude-code/issues/70161#issuecomment-5304442486): for links in the status line to be detected and clickable, you have to set `FORCE_HYPERLINK=1` in the Claude Code environment. This can added directly in `~/.claude/settings.json`. 

```json
{
  "env": {
    "FORCE_HYPERLINK": "1"
  }
}
```

My status line now display something like the following for GitLab projects and I can quickly open the merge request in GitLab by clicking on its number.

```bash
~/gitlab.example.com/acme/widget (feat/login ✓) !42
↑0 ↓0 R0 W0 0%/1.0M claude-fable-5-1 (medium)
```
