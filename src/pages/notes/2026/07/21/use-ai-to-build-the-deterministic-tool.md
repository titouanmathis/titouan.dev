---
title: Use AI to build deterministic tools, not to run repetitive workflows
description: A code-review experiment comparing deterministic context staging with agent-led context discovery.
tags: ai, agents, determinism
---

# Use AI to build deterministic tools, not to run repetitive workflows

<MetaInfo class="block">21/07/2026 in #ai #agents #determinism</MetaInfo>

Sunil Pai's [_one document, two hands_](https://sunilpai.dev/posts/one-document-two-hands/) describes a rule I use: models handle ambiguous intent; deterministic code handles defined steps.

When a repetitive workflow requires consistent output, use a model to write a program instead of running an agent each time. The resulting code is predictable, testable, and cheap to run.

## Why not an agent

An agent reconstructs context and plans on every run, consuming tokens and potentially producing different results. Most of the workflow may not require judgment: staging files, filtering noise, collecting repository context, and shaping a prompt are deterministic steps. Put those steps in code and reserve the model for the parts that require interpretation.

## A measured example

Our code reviewer [`@weareikko/code-review`](https://github.com/weareikko/code-review) filters and stages files, collects repository and pull request context, and configures the relevant skills before the model reviews the diff. We compared this pipeline with an agent that discovered its own context through read-only Git tools.

A [controlled test](https://github.com/weareikko/code-review/pull/131) used synthetic diffs with bugs at known locations, making recall measurable. One fixture was about 269,000 characters—2.7 times the 100,000-character inline budget—with bugs in small files that inline mode dropped first.

| mode                                   | recall | cost        |
| -------------------------------------- | ------ | ----------- |
| inline (diff in the prompt)            | 80–83% | ~$0.09      |
| disk (files staged, read on demand)    | 100%   | variable    |
| commits (agent explores via git tools) | 100%   | ~$0.19–0.24 |

`commits`, in which the agent explores history through read-only Git tools, matched `disk` mode's 100% recall. It cost $0.19–$0.24, compared with about $0.09 for `inline`, largely because of `git_show` output, without improving recall over `disk`. Because the bugs were synthetic and `disk` costs varied substantially, treat this as directional evidence rather than a benchmark.

## When an agent is worth it

Agents remain useful for open-ended tasks such as interpreting vague requests or comparing designs. For repetitive mechanical tasks, write code instead.
