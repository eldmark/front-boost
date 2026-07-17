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

const SARIF_LEVEL: Record<Severity, string> = { error: "error", warning: "warning", info: "note" };

/** SARIF 2.1.0 — consumed by GitHub code scanning and most CI security dashboards. */
export function renderSarif(report: Report): string {
  const diagnostics = report.projects.flatMap((p) => p.diagnostics);
  const ruleIds = [...new Set(diagnostics.map((d) => d.ruleId))].sort();
  const rulesById = new Map(diagnostics.map((d) => [d.ruleId, d]));
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: report.tool,
            version: report.toolVersion,
            informationUri: "https://github.com/eldmark/front-boost",
            rules: ruleIds.map((id) => {
              const d = rulesById.get(id)!;
              return {
                id,
                shortDescription: { text: d.title },
                fullDescription: { text: d.explanation },
                help: { text: d.recommendation },
                properties: { category: d.category, tags: d.tags },
              };
            }),
          },
        },
        results: diagnostics.map((d) => ({
          ruleId: d.ruleId,
          level: SARIF_LEVEL[d.severity],
          message: { text: `${d.title}. ${d.recommendation}` },
          partialFingerprints: { frontboost: d.fingerprint },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: d.file },
                ...(d.range && {
                  region: {
                    startLine: d.range.start.line,
                    startColumn: d.range.start.column,
                    endLine: d.range.end.line,
                    endColumn: d.range.end.column,
                  },
                }),
              },
            },
          ],
        })),
      },
    ],
  };
  return JSON.stringify(sarif, null, 2) + "\n";
}

const ACTIONS_LEVEL: Record<Severity, string> = { error: "error", warning: "warning", info: "notice" };

/** GitHub Actions workflow commands — annotations appear inline on the PR diff. */
export function renderGithubActions(report: Report): string {
  const lines: string[] = [];
  for (const project of report.projects) {
    for (const d of project.diagnostics) {
      const loc = d.range
        ? `file=${d.file},line=${d.range.start.line},col=${d.range.start.column}`
        : `file=${d.file}`;
      // workflow command values must be single-line
      const message = `${d.title}. ${d.recommendation}`.replaceAll("\n", " ");
      lines.push(`::${ACTIONS_LEVEL[d.severity]} ${loc},title=${d.ruleId}::${message}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") + "\n" : "";
}
