# Other CLI Agents

After Claude and Codex are stable, FrontBoost can target other agent CLIs by reusing the same normalized report.

Candidate surfaces:

- Cursor
- GitHub Copilot
- Gemini CLI
- Windsurf
- future terminal agents

Expansion rule:

Do not add a new adapter until the universal report already expresses the needed information without assistant-specific hacks.

If a new adapter requires new data:

1. decide whether it belongs in the universal report
2. add it generically if it does
3. avoid adding assistant-only semantics into the core schema
