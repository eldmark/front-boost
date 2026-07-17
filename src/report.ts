// Universal analysis report — the contract between the engine and every
// downstream consumer (CLI, adapters, CI). Versioned; changes are
// compatibility events (see CONTRIBUTING.md).

export const SCHEMA_VERSION = 1;

export type Severity = "error" | "warning" | "info";

export type Category =
  | "correctness"
  | "performance"
  | "architecture"
  | "accessibility"
  | "security"
  | "maintainability";

export interface Range {
  /** 1-based line/column, inclusive start, exclusive end. */
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface Diagnostic {
  /** Stable identity: `${ruleId}:${file}:${start.line}:${start.column}` */
  fingerprint: string;
  ruleId: string;
  file: string;
  range: Range | null;
  severity: Severity;
  category: Category;
  title: string;
  explanation: string;
  recommendation: string;
  tags: string[];
}

export interface ProjectReport {
  name: string;
  root: string;
  frameworks: string[];
  filesScanned: number;
  diagnostics: Diagnostic[];
}

export interface Report {
  schemaVersion: typeof SCHEMA_VERSION;
  tool: "frontboost";
  toolVersion: string;
  projects: ProjectReport[];
  skippedChecks: string[];
  health: { score: number; errors: number; warnings: number; infos: number };
  execution: { startedAt: string; durationMs: number };
}

export function makeFingerprint(ruleId: string, file: string, range: Range | null): string {
  const pos = range ? `${range.start.line}:${range.start.column}` : "0:0";
  return `${ruleId}:${file}:${pos}`;
}

export function computeHealth(diagnostics: Diagnostic[]): Report["health"] {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const d of diagnostics) {
    if (d.severity === "error") errors++;
    else if (d.severity === "warning") warnings++;
    else infos++;
  }
  // ponytail: naive linear score, replace with per-category weighting if it matters
  const score = Math.max(0, 100 - errors * 10 - warnings * 3 - infos);
  return { score, errors, warnings, infos };
}
