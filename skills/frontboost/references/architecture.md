# FrontBoost Architecture Reference

This skill assumes the same high-level split that React Doctor demonstrates successfully:

- a reusable core engine
- thin delivery layers
- versioned structured output
- installation and workflow helpers for agents

When applying the skill:

1. Keep the scan engine independent of React, Vue, Angular, or any assistant.
2. Model framework behavior as plugins.
3. Emit a universal report before formatting for any assistant.
4. Reuse the same findings across CLI, CI, editor, and agent surfaces.

Recommended package responsibilities:

- `core`: orchestration and lifecycle
- `diagnostics`: schema and identities
- `reporting`: JSON, Markdown, SARIF, HTML
- `parser`: parser contracts
- `rules`: rule contracts and helpers
- `configuration`: config loading and merging
- `react`, `vue`, `angular`: framework plugins
- `adapters`: assistant-specific transforms
- `cli`: command surface

The adapter layer must never own framework detection or AST traversal.
