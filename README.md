# FrontBoost

AI-powered frontend diagnostics for modern frameworks.

FrontBoost is a framework-agnostic diagnostic engine for frontend codebases. It is inspired by React Doctor's architecture and workflow, but its goal is broader: a shared analysis core, framework plugins, and AI-friendly outputs that work across Claude, Codex, and other coding assistants.

## Current focus

The first milestone is deliberate:

- study React Doctor's architecture
- reproduce its core behavior for React
- document the reusable abstractions
- extract a framework-independent engine

React is the reference implementation, not the end state.

## Planned layout

```text
packages/
  core/
  diagnostics/
  rules/
  parser/
  filesystem/
  configuration/
  reporting/
  react/
  vue/
  angular/
  adapters/
  cli/
  shared/

apps/
docs/
examples/
skills/
```

## Design goals

- Framework-agnostic core
- Plugin-based framework support
- AI-first structured output
- Deterministic diagnostics
- Extensible rule system
- Multi-surface delivery: CLI, CI, editor, and agent workflows

## Quick start

This repository currently serves as the project foundation and specification set.

Recommended reading order:

1. [ROADMAP.md](/home/dmark123/Documents/front-boost/ROADMAP.md)
2. [ARCHITECTURE.md](/home/dmark123/Documents/front-boost/ARCHITECTURE.md)
3. [PLUGIN_API.md](/home/dmark123/Documents/front-boost/PLUGIN_API.md)
4. [RULES.md](/home/dmark123/Documents/front-boost/RULES.md)
5. [AI_ADAPTERS.md](/home/dmark123/Documents/front-boost/AI_ADAPTERS.md)

## Initial agent support

The first skill shipped in this repo targets:

- Claude
- Codex

Other AI CLIs can be added once the universal analysis contract is stable.

See [skills/frontboost/SKILL.md](/home/dmark123/Documents/front-boost/skills/frontboost/SKILL.md).

## Acknowledgement

FrontBoost is informed by the public React Doctor repository, especially its separation between a diagnostic core, CLI surfaces, machine-readable reports, and agent installation workflows.
