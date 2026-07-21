---
title: Use AI to build deterministic tools, not to run repetitive workflows
description: A code-review experiment comparing deterministic context staging with agent-led context discovery.
tags: ai, agents, determinism
---

# Use AI to build deterministic tools, not to run repetitive workflows

<MetaInfo class="block">21/07/2026 in #ai #agents #determinism</MetaInfo>

Sunil Pai's [one document, two hands](https://sunilpai.dev/posts/one-document-two-hands/#let-boring-code-do-the-precise-bits) describes a rule I use and share with the team at [ikko](https://ikko.fr): models handle ambiguous intent; deterministic code handles defined steps.

When a repetitive workflow requires consistent output, use a model to write a program instead of running an agent each time. The resulting code is predictable, testable, and cheap to run.

## Why not an agent

An agent reconstructs context and plans on every run, consuming tokens and potentially producing different results. Most of the workflow may not require judgment: staging files, filtering noise, collecting repository context, and shaping a prompt are deterministic steps. Put those steps in code and reserve the model for the parts that require interpretation.

## A measured example

Our code reviewer [`@weareikko/code-review`](https://github.com/weareikko/code-review) filters and stages files, collects repository and pull request context, and configures the relevant skills before the model reviews the diff. We arrived at this design after comparing deterministic prompt construction with an agent that discovered its own context through read-only Git tools.

A [controlled test](https://github.com/weareikko/code-review/pull/131) used synthetic diffs with bugs at known locations, making recall measurable. One fixture was about 269,000 characters—2.7 times the 100,000-character inline budget—with bugs in small files that inline mode dropped first.

<table class="w-full">
  <thead>
    <tr>
      <th class="border-b border-current py-2 pr-4 text-left">mode</th>
      <th class="whitespace-nowrap border-b border-current px-4 py-2 text-left">recall</th>
      <th class="whitespace-nowrap border-b border-current py-2 pl-4 text-left">cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="py-2 pr-4"><code>inline</code> (diff in the prompt)</td>
      <td class="whitespace-nowrap px-4 py-2">80–83%</td>
      <td class="whitespace-nowrap py-2 pl-4">~$0.09</td>
    </tr>
    <tr>
      <td class="py-2 pr-4"><code>commits</code> (agent explores with Git tools)</td>
      <td class="whitespace-nowrap px-4 py-2">100%</td>
      <td class="whitespace-nowrap py-2 pl-4">~$0.19–0.24</td>
    </tr>
  </tbody>
</table>

`commits` recovered every planted bug but cost two to three times as much as `inline`, largely because of `git_show` output. Deterministic disk staging also reached 100% recall without asking the agent to find its own context. Its cost varied substantially, so this does not show that staging is always cheaper. The bugs were also synthetic; treat the result as directional evidence that autonomy did not improve recall over deterministic staging, not as a benchmark.

## When an agent is worth it

Agents remain useful for open-ended tasks such as interpreting vague requests or comparing designs. For repetitive mechanical tasks, write code instead.
