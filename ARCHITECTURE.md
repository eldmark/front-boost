# FrontBoost Architecture

## Purpose

FrontBoost should separate diagnostic execution from framework knowledge and from delivery surfaces.

React Doctor is a useful reference because it already demonstrates four important patterns:

- a core inspection pipeline
- a thin public API around that pipeline
- multiple delivery surfaces such as CLI, CI, and editor integrations
- structured machine-readable output

FrontBoost should keep those strengths while removing the React-specific assumptions from the center of the system.

## Architectural model

```text
Project Files
  ->
 Workspace Discovery
  ->
 Framework Detection
  ->
 Framework Plugin Resolution
  ->
 Parse + Index
  ->
 Rule Execution
  ->
 Diagnostic Normalization
  ->
 Universal Analysis Report
  ->
 Adapters / CLI / CI / Agent Output
```

## Lessons extracted from React Doctor

### 1. Keep the core orchestration separate

React Doctor's `@react-doctor/core` is the real engine. The public library and CLI are wrappers around that engine. FrontBoost should preserve that split:

- `packages/core`: orchestration, scheduling, scan lifecycle
- `packages/cli`: user-facing command surface
- `packages/adapters`: AI and CI output transforms

### 2. Treat reports as a product surface

React Doctor defines a versioned JSON report contract. FrontBoost should do the same from day one.

Rules should not write directly to terminal output. They should emit normalized diagnostics into a universal intermediate representation.

### 3. Make framework detection explicit

React Doctor resolves the scan target and project facts before running checks. FrontBoost needs the same concept, but generalized:

- discover workspaces
- detect frameworks per package/app
- choose one or more plugins
- merge plugin capabilities with shared services

### 4. Keep the public API thin

React Doctor's API layer mainly resolves configuration and runs the core program. FrontBoost should avoid duplicating logic across surfaces.

Every surface should consume the same engine:

- CLI
- Node API
- GitHub Action
- language server
- AI adapter

### 5. Separate rules from orchestration

React Doctor's rule implementations live outside the orchestration core. FrontBoost should go further and make framework rules behave like installable plugins.

## Proposed package map

```text
packages/
  core/             scan orchestration, plugin runtime, scheduler
  diagnostics/      diagnostic schema, categories, severity, fingerprints
  reporting/        JSON, Markdown, HTML, SARIF renderers
  rules/            shared rule interfaces and helpers
  filesystem/       file walking, ignore resolution, caching
  parser/           parser interfaces and AST adapter contracts
  configuration/    config loading, merging, validation
  react/            React plugin: detectors, parsers, rules, recommendations
  vue/              Vue plugin
  angular/          Angular plugin
  adapters/         Claude, Codex, Cursor, Copilot, Gemini transforms
  cli/              `frontboost` command implementation
  shared/           low-level reusable utilities
```

## Core runtime boundaries

### Core engine

Owns:

- scan lifecycle
- concurrency and batching
- workspace/project discovery
- plugin loading
- pipeline hooks
- result aggregation
- caching and deadlines

Does not own:

- framework-specific AST logic
- framework-specific rules
- assistant-specific prompt formatting

### Framework plugin

A framework plugin should provide:

- detection hints
- file targeting rules
- parser selection
- framework metadata extraction
- rule registry
- fix and recommendation metadata

### Adapter

An adapter converts the universal report into a consumer-specific format. It must not re-run analysis.

## Universal analysis report

The universal report is the contract between the engine and all downstream consumers.

Minimum requirements:

- stable schema version
- project metadata
- framework metadata
- file coverage
- diagnostics
- score or health summary
- skipped checks
- execution metadata
- optional fix suggestions

Example shape:

```json
{
  "schemaVersion": 1,
  "tool": "frontboost",
  "projects": [
    {
      "name": "web",
      "root": "apps/web",
      "frameworks": ["react", "nextjs"],
      "diagnostics": []
    }
  ]
}
```

## Plugin system

Plugin loading should support three levels:

1. Built-in official plugins
2. Third-party npm plugins
3. Local workspace plugins

Each plugin registers:

- identity
- supported frameworks
- parser providers
- rule metadata
- recommendation builders
- optional autofix providers

## AI-first execution model

The first AI-oriented use case should mirror what React Doctor already proves:

- deterministic scan
- machine-readable output
- assistant-specific explanation layer

FrontBoost should not force AI agents to parse terminal text. They should consume:

- JSON by default
- Markdown explanation as a secondary view

## Initial sequence

Phase 1 should implement:

- a monorepo
- a versioned universal report
- a React reference plugin
- a minimal CLI
- Claude/Codex adapters

Vue and Angular should only start after the React extraction proves the plugin boundary.
