---
name: frontboost
description: Use when auditing a frontend repository, extracting framework diagnostics into structured output, planning a FrontBoost plugin, or the user asks for FrontBoost/doctor-style analysis. Prioritize Claude and Codex workflows first, then adapt the same normalized report for other agent CLIs.
---

# FrontBoost

FrontBoost is a framework-agnostic frontend diagnostics workflow inspired by React Doctor.

Use this skill when the user wants to:

- scan or audit a frontend codebase
- design or extend a framework diagnostics plugin
- produce AI-friendly frontend diagnostics
- convert findings into Claude or Codex remediation workflows

## Workflow

1. Identify the repository shape and frontend frameworks in use.
2. Prefer deterministic analysis over prompt-only opinions.
3. Normalize findings into a report shape that is independent of the current assistant.
4. Render the findings first for Claude and Codex.
5. Only after that, adapt the same report for other CLI agents.

## Operating rules

- Keep framework-specific logic out of the core design.
- Treat every framework integration as a plugin.
- Prefer JSON or another structured format over prose-only output.
- Keep explanations concise and tied to files, rules, and impact.
- Do not make the assistant-specific formatter responsible for analysis.

## First implementation target

For the first FrontBoost version:

- React is the reference plugin
- Claude and Codex are the primary adapter targets
- other CLIs are follow-on surfaces

## Read these references when needed

- For repository architecture and boundaries: [references/architecture.md](references/architecture.md)
- For Claude and Codex output strategy: [references/claude-codex.md](references/claude-codex.md)
- For later CLI expansion: [references/other-clis.md](references/other-clis.md)
- For plugin authoring guidance: [references/plugin-checklist.md](references/plugin-checklist.md)
