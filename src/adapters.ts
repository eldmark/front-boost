// Adapters: presentation only. Consume the universal report, never re-analyze.

import type { Diagnostic, Report, Severity } from "./report.ts";

const SEVERITY_ORDER: Severity[] = ["error", "warning", "info"];

function groupBySeverity(diagnostics: Diagnostic[]): Map<Severity, Diagnostic[]> {
  const groups = new Map<Severity, Diagnostic[]>();
  for (const severity of SEVERITY_ORDER) {
    const items = diagnostics.filter((d) => d.severity === severity);
    if (items.length > 0) groups.set(severity, items);
  }
  return groups;
}

function location(d: Diagnostic): string {
  return d.range ? `${d.file}:${d.range.start.line}:${d.range.start.column}` : d.file;
}

/** Markdown triage summary grouped by severity, file-linked, with fix guidance. */
export function renderClaude(report: Report): string {
  const lines: string[] = [];
  for (const project of report.projects) {
    lines.push(`# FrontBoost report: ${project.name}`);
    lines.push("");
    lines.push(
      `Health **${report.health.score}/100** — ${report.health.errors} errors, ` +
        `${report.health.warnings} warnings, ${report.health.infos} info. ` +
        `Frameworks: ${project.frameworks.join(", ") || "none detected"}. ` +
        `Files scanned: ${project.filesScanned}.`,
    );
    for (const [severity, items] of groupBySeverity(project.diagnostics)) {
      lines.push("");
      lines.push(`## ${severity} (${items.length})`);
      for (const d of items) {
        lines.push("");
        lines.push(`### \`${location(d)}\` — ${d.title}`);
        lines.push(`- Rule: \`${d.ruleId}\` (${d.category})`);
        lines.push(`- Why: ${d.explanation}`);
        lines.push(`- Fix: ${d.recommendation}`);
      }
    }
    if (project.diagnostics.length === 0) {
      lines.push("");
      lines.push("No findings.");
    }
  }
  if (report.skippedChecks.length > 0) {
    lines.push("");
    lines.push(`Skipped: ${report.skippedChecks.join("; ")}`);
  }
  return lines.join("\n") + "\n";
}

/** Compact terminal summary, one finding per line, edits-first ordering. */
export function renderCodex(report: Report): string {
  const lines: string[] = [];
  for (const project of report.projects) {
    lines.push(
      `frontboost ${project.name} score=${report.health.score} ` +
        `errors=${report.health.errors} warnings=${report.health.warnings}`,
    );
    for (const severity of SEVERITY_ORDER) {
      for (const d of project.diagnostics.filter((x) => x.severity === severity)) {
        lines.push(`${severity.toUpperCase().padEnd(7)} ${location(d)} ${d.ruleId} — ${d.recommendation}`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

export function renderJson(report: Report): string {
  return JSON.stringify(report, null, 2) + "\n";
}
