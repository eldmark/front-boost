# Rule Specification

## Goal

A FrontBoost rule should detect one specific frontend problem with low noise and predictable output.

The rule quality bar is directly informed by what works well in React Doctor:

- specific
- behaviorally grounded
- precise
- adversarially tested
- easy to explain

## Rule contract

Every rule should declare:

- `id`
- `plugin`
- `framework`
- `category`
- `severity`
- `summary`
- `why`
- `recommended`
- `requires`
- `create`

Example:

```ts
export const noVIfInsideVFor = defineRule({
  id: "vue/no-v-if-inside-v-for",
  category: "performance",
  severity: "warning",
  summary: "Avoid mixing v-if and v-for on the same element",
  why: "It increases template work and often hides data-shaping problems",
  recommended: true,
  requires: ["template-ast"],
  create: (context) => {
    return {
      Element(node) {},
    };
  },
});
```

## Rule categories

Core categories:

- correctness
- performance
- architecture
- accessibility
- security
- maintainability

## Rule types

### AST rule

Runs on a framework AST or normalized intermediate AST.

### Project rule

Runs on project structure, filesystem layout, dependency graph, or configuration.

### Hybrid rule

Combines AST findings with project context.

## Rule authoring checklist

Before implementation:

- define the exact bug or smell
- define the runtime or maintenance impact
- list valid lookalikes that must not be flagged
- keep v1 narrower than the full idea

After implementation:

- add positive cases
- add false-positive tests
- add edge cases
- verify emitted diagnostics are stable

## Diagnostic output

A rule must emit normalized diagnostics, not terminal text.

Each diagnostic should include:

- stable identity
- file path
- range
- severity
- category
- title
- explanation
- recommended action
- tags
- optional fix metadata

## Fixes

Autofix is optional.

When offered, it must be:

- deterministic
- isolated
- safe by default
- clearly marked as automatic or assisted

## Rule boundaries

Do not place these in rules when they belong elsewhere:

- workspace discovery
- framework detection
- CLI formatting
- AI prompt rendering
- report serialization
