# Claude and Codex First

FrontBoost should support Claude and Codex before broader CLI expansion.

## Why these two first

- Both work well with file-aware coding workflows.
- Both benefit from compact structured findings plus short explanations.
- Both can use the same normalized report with different presentation layers.

## Output expectations

### Claude

Prefer:

- Markdown summaries
- grouped findings by severity
- direct file references
- short fix guidance

### Codex

Prefer:

- concise terminal-friendly summaries
- findings tied to concrete file edits
- optional JSON sidecar data
- changed-files-first workflows where available

## Shared minimum payload

Both should receive:

- project metadata
- framework metadata
- normalized diagnostics
- score or health summary
- skipped checks
- fix or recommendation metadata when available

The adapter should change the presentation, not the facts.
