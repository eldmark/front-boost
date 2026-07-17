# Plugin API

## Objective

A FrontBoost framework plugin should add support for a framework without requiring changes to the core engine.

## Plugin responsibilities

A plugin may provide:

- framework detection metadata
- parser registration
- file inclusion logic
- rule registry
- framework-specific project facts
- recommendation builders
- optional fix providers

## Plugin shape

Example conceptual interface:

```ts
export interface FrontBoostPlugin {
  id: string;
  version: string;
  frameworks: string[];
  detect(context: DetectContext): DetectResult | null;
  createParserRegistry(): ParserRegistry;
  createRuleRegistry(): RuleRegistry;
  collectProjectFacts?(context: ProjectFactsContext): Promise<ProjectFacts>;
  createRecommendations?(context: RecommendationContext): RecommendationSet;
}
```

## Parser contract

Plugins should register parsers by capability, not by file extension alone.

Examples:

- `tsx-component`
- `vue-sfc`
- `angular-template`
- `typescript-module`

This allows the core to request the right parser for a rule without hard-coding a framework map.

## Rule context

The core should provide a stable rule context:

- file metadata
- project metadata
- framework metadata
- parser services
- shared helpers
- diagnostic emitter

Framework plugins may extend the context with framework-specific helpers, but the core shape should stay stable.

## Plugin lifecycle

```text
load plugin
  ->
 detect applicability
  ->
 register parsers and rules
  ->
 analyze matching files
  ->
 emit normalized diagnostics
  ->
 produce recommendations and fixes
```

## Compatibility rules

- Plugins may depend on `core`, `diagnostics`, `parser`, `rules`, and `shared`.
- `core` must never depend on a framework plugin.
- Adapters must not import plugin internals directly.

## Versioning

Plugin compatibility should be explicit.

Recommended fields:

- plugin version
- supported FrontBoost core range
- schema compatibility range

## Local and third-party plugins

The loader should support:

- built-in official plugins
- npm packages such as `@frontboost/plugin-react`
- local paths for experimental plugins

## First official plugins

1. React
2. Vue
3. Angular

React should be the proving ground for the contract before additional frameworks are added.
