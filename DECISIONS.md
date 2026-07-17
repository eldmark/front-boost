# Architecture Decisions

## ADR-0001: Use React Doctor as the reference architecture, not the final architecture

Status: Accepted

Reason:
React Doctor already proves a strong pattern for scan orchestration, machine-readable reports, and agent workflows. FrontBoost should study and borrow those ideas without inheriting React-specific assumptions into its core.

## ADR-0002: Keep the core framework-agnostic

Status: Accepted

Reason:
Framework-specific detection, parsing, and rules must live in plugins so Vue, Angular, and future ecosystems can reuse the same engine.

## ADR-0003: Define a universal report before adding many adapters

Status: Accepted

Reason:
Adapters are presentation layers. If each assistant integration invents its own output format first, the platform fragments early.

## ADR-0004: Prioritize Claude and Codex before other AI CLIs

Status: Accepted

Reason:
They are strong initial targets for file-aware coding workflows and provide a practical boundary for the first adapter contract.

## ADR-0005: React is the reference implementation

Status: Accepted

Reason:
The first plugin must prove the core/plugin split with a known architecture before broader framework support is added.
