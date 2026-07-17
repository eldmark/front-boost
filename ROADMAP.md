# FrontBoost Roadmap

## Vision

FrontBoost aims to become a framework-agnostic diagnostic engine for modern frontend applications.

It should provide intelligent analysis, best-practice recommendations, performance insights, and architecture validation across multiple frontend ecosystems.

The long-term goal is a single analysis engine that can be consumed by AI coding assistants such as ChatGPT, Codex, Claude, Copilot, Cursor, Gemini CLI, Windsurf, and future agents.

## Phase 0: Research

Goal:
Understand React Doctor before implementing a new architecture.

Deliverables:

- architecture documentation
- data flow diagrams
- reusable abstraction notes

## Phase 1: Bootstrap

Goal:
Create the FrontBoost repository and monorepo structure.

Deliverables:

- repository layout
- TypeScript
- ESLint
- Prettier
- Vitest
- Changesets
- GitHub Actions
- documentation baseline

## Phase 2: React Foundation

Goal:
Build the first working analyzer using React Doctor-inspired ideas.

Initial coverage:

- project detection
- AST parsing
- rule execution
- diagnostics
- report generation

## Phase 3: Core Extraction

Goal:
Split React-specific behavior away from the shared engine.

Deliverables:

- reusable core
- stable plugin contract
- normalized reporting pipeline

## Phase 4: Vue Support

Goal:
Prove the abstraction with the first non-React plugin.

## Phase 5: Angular Support

Goal:
Extend the same core to another major ecosystem with different templates and reactivity primitives.

## Phase 6: AI Adapters

Goal:
Expose a universal intermediate report and translate it for assistants.

Priority:

1. Claude
2. Codex
3. Other CLI agents

## Phase 7: CLI

Planned commands:

```bash
frontboost analyze
frontboost doctor
frontboost report
frontboost explain
frontboost fix
```

Future:

```bash
frontboost ai
```

## Phase 8: Reports

Formats:

- Markdown
- HTML
- JSON
- SARIF
- GitHub Actions annotations

## Phase 9: CI/CD

Targets:

- GitHub Actions
- Azure Pipelines
- GitLab CI
- Jenkins

## Phase 10: Future Frameworks

Planned support:

- Next.js
- Nuxt
- Astro
- Svelte
- Solid
- Qwik
- Remix
- Ionic
- React Native
