---
title: Use AI to build the deterministic tool, not to be the tool
description: Why a deterministic program often beats handing a workflow to an agent, with numbers from a code reviewer.
tags: ai, agents, determinism
---

# Use AI to build the deterministic tool, not to be the tool

<MetaInfo class="block">21/07/2026 in #ai #agents #determinism</MetaInfo>

Sunil Pai's [*one document, two hands*](https://sunilpai.dev/posts/one-document-two-hands/) puts clean words on a rule I keep coming back to: the model handles the fuzzy intent, and deterministic code handles the precise work.

The practical version is simple. When a workflow gets repetitive, an agent is rarely the right tool. Use the model to write a deterministic program, then keep the agent out of the runtime as much as possible. You pay for the model once, when the tool is built, and after that it is ordinary code: predictable, testable, and cheap to run.

## Why not an agent

A non-deterministic agent has two recurring costs. It spends tokens, because it re-derives the context and re-plans on every run. And it is hard to reason about, because what it does today is not necessarily what it does tomorrow. Most of a workflow is not fuzzy anyway. Staging files, filtering noise, pulling repository context and shaping a prompt are deterministic steps that a script handles for free. The useful question is not which agent should run a task, but which parts of it are deterministic and whether the model can write that code.

## A measured example

Our code reviewer, `@weareikko/code-review`, gathers context deterministically. It stages the files that are not noise, pulls repository context, and configures the relevant skills, and then the model reviews. That was not the first design. Letting the agent discover its own context is the more natural one, and it is where the project started. The measurements changed that.

A [controlled test](https://github.com/weareikko/code-review/pull/131) used synthetic diffs with bugs planted at known locations, so recall was measurable. The clearest case was a 269k diff, 2.7 times the budget, with the bugs in the small files that get dropped first.

| mode | recall | cost |
|---|---|---|
| inline (diff in the prompt) | 80–83% | ~$0.09 |
| disk (files staged, read on demand) | 100% | variable |
| commits (agent explores via git tools) | 100% | ~$0.19–0.24 |

The mode where the agent finds context on its own is commits, which explores history through read-only git tools. It reached the same recall as deterministic staging, and it was the most expensive way to do so, roughly two to three times the inline cost, mostly from `git_show` token bloat. The extra autonomy did not surface better bugs. One caveat: the staging cost varies a lot between runs, and the bugs were synthetic, so the result reads as a direction rather than a benchmark.

## When an agent is worth it

None of this argues against agents. The freedom is worth its cost when the task is genuinely open, such as interpreting a vague request or weighing two designs. It is a poor trade when the task is mechanical but framed as reasoning. The pattern to watch for is reaching for an agent because a step is repetitive, when repetitive is usually a sign that the step should be code.
