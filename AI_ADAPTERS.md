# AI Adapters

## Goal

FrontBoost should analyze once and explain many times.

The engine produces a universal report. Adapters translate that report into the format expected by each AI assistant or CLI.

## First targets

Initial support should prioritize:

1. Claude
2. Codex

These two should shape the first adapter contract because they already work well with file-aware coding workflows and structured instructions.

## Adapter responsibilities

An adapter should:

- consume the universal report
- filter or group diagnostics for the consumer
- render explanations in the right format
- preserve file paths and code ranges
- never change the underlying analysis result

## Shared adapter input

```json
{
  "schemaVersion": 1,
  "projects": [],
  "diagnostics": []
}
```

## Claude adapter

Claude-focused output should emphasize:

- concise Markdown
- deterministic remediation steps
- file-linked findings
- grouped diagnostics by severity and file

Suggested outputs:

- Markdown triage summary
- rule explanation blocks
- optional fix plan

## Codex adapter

Codex-focused output should emphasize:

- direct execution workflow
- structured remediation instructions
- compact summaries suitable for terminal-based collaboration
- optional machine-readable payloads alongside Markdown

Suggested outputs:

- Markdown summary
- JSON sidecar for tool-driven remediation
- changed-files-only mode

## Later adapters

Once the universal report is stable, add:

- Cursor
- GitHub Copilot
- Gemini CLI
- Windsurf
- Claude Code variants

## Adapter design rules

- No re-analysis in adapters
- No framework-specific parsing in adapters
- No CLI-specific text assumptions in the core schema
- Prefer additive output capabilities over adapter forks

## Installation model

For agent ecosystems, support two layers:

1. analyzer execution
2. agent skill or prompt installation

That mirrors the successful pattern proven by React Doctor's install flow.
