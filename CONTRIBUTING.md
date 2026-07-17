# Contributing

## Contribution standard

FrontBoost is not a generic lint-rule collection. Changes should strengthen one of the following:

- the framework-independent core
- a framework plugin boundary
- the universal report contract
- an adapter surface
- developer ergonomics without weakening determinism

## Working principles

- Prefer deterministic analysis over heuristic prose.
- Keep framework-specific logic out of `packages/core`.
- Treat false positives as bugs.
- Treat schema changes as compatibility events.
- Add tests for rule behavior and report shape changes.

## Development workflow

1. Define the user or developer problem clearly.
2. Check whether the change belongs in core, a plugin, or an adapter.
3. Prefer extending an existing contract over inventing a parallel one.
4. Add or update tests.
5. Update architectural docs when the boundary changes.
6. Record notable design choices in [DECISIONS.md](/home/dmark123/Documents/front-boost/DECISIONS.md).

## Code organization rules

- `packages/core` must remain framework-agnostic.
- `packages/<framework>` may depend on `core`, but not the reverse.
- `packages/adapters` consume normalized reports only.
- CLI commands should call shared APIs, not duplicate orchestration logic.

## Pull request expectations

Include:

- problem statement
- design choice
- package boundary impact
- test coverage
- report compatibility impact

## Documentation

If a contribution changes:

- the plugin contract, update [PLUGIN_API.md](/home/dmark123/Documents/front-boost/PLUGIN_API.md)
- rule authoring, update [RULES.md](/home/dmark123/Documents/front-boost/RULES.md)
- architecture boundaries, update [ARCHITECTURE.md](/home/dmark123/Documents/front-boost/ARCHITECTURE.md)
- adapter behavior, update [AI_ADAPTERS.md](/home/dmark123/Documents/front-boost/AI_ADAPTERS.md)
