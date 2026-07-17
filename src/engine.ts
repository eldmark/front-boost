// Core engine: workspace discovery, framework detection, plugin resolution,
// rule execution, report assembly. Framework-agnostic — everything
// React-specific lives in plugins/.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  SCHEMA_VERSION,
  computeHealth,
  makeFingerprint,
  type Category,
  type Diagnostic,
  type Range,
  type Report,
  type Severity,
} from "./report.ts";

export interface SourceFile {
  /** Path relative to the project root, posix separators. */
  path: string;
  text: string;
}

export interface DetectContext {
  root: string;
  packageJson: Record<string, unknown> | null;
  dependencies: Record<string, string>;
}

export interface RuleMeta {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  explanation: string;
  recommendation: string;
  tags?: string[];
}

export interface Finding {
  file: string;
  range: Range | null;
}

export interface Rule {
  meta: RuleMeta;
  /** Match a file this rule wants to inspect. */
  filter: (file: SourceFile) => boolean;
  check: (file: SourceFile) => Finding[];
}

export interface ProjectRule {
  meta: RuleMeta;
  check: (context: DetectContext, files: SourceFile[]) => Finding[];
}

export interface FrontBoostPlugin {
  id: string;
  frameworks: string[];
  detect: (context: DetectContext) => boolean;
  /** File extensions this plugin owns, e.g. [".jsx", ".tsx"]. */
  fileFilter: (path: string) => boolean;
  rules: Rule[];
  projectRules?: ProjectRule[];
}

const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next", "out"]);

export function walkFiles(root: string): string[] {
  const results: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
          stack.push(join(dir, entry.name));
        }
      } else if (entry.isFile()) {
        results.push(join(dir, entry.name));
      }
    }
  }
  return results.sort();
}

function buildDetectContext(root: string): DetectContext {
  let packageJson: Record<string, unknown> | null = null;
  try {
    packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  } catch {
    // no package.json — plugins fall back to file-shape detection
  }
  const dependencies: Record<string, string> = {
    ...((packageJson?.dependencies as Record<string, string>) ?? {}),
    ...((packageJson?.devDependencies as Record<string, string>) ?? {}),
  };
  return { root, packageJson, dependencies };
}

function toDiagnostic(meta: RuleMeta, finding: Finding): Diagnostic {
  return {
    fingerprint: makeFingerprint(meta.id, finding.file, finding.range),
    ruleId: meta.id,
    file: finding.file,
    range: finding.range,
    severity: meta.severity,
    category: meta.category,
    title: meta.title,
    explanation: meta.explanation,
    recommendation: meta.recommendation,
    tags: meta.tags ?? [],
  };
}

export function analyze(root: string, plugins: FrontBoostPlugin[], toolVersion = "0.0.1"): Report {
  const startedAt = new Date().toISOString();
  const t0 = performance.now();

  const context = buildDetectContext(root);
  const active = plugins.filter((p) => p.detect(context));
  const skippedChecks = plugins
    .filter((p) => !active.includes(p))
    .map((p) => `${p.id}: framework not detected`);

  const diagnostics: Diagnostic[] = [];
  let filesScanned = 0;
  const allPaths = active.length > 0 ? walkFiles(root) : [];

  for (const plugin of active) {
    const files: SourceFile[] = [];
    for (const abs of allPaths) {
      if (!plugin.fileFilter(abs)) continue;
      files.push({
        path: relative(root, abs).replaceAll("\\", "/"),
        text: readFileSync(abs, "utf8"),
      });
    }
    filesScanned += files.length;

    for (const rule of plugin.rules) {
      for (const file of files) {
        if (!rule.filter(file)) continue;
        for (const finding of rule.check(file)) {
          diagnostics.push(toDiagnostic(rule.meta, finding));
        }
      }
    }
    for (const rule of plugin.projectRules ?? []) {
      for (const finding of rule.check(context, files)) {
        diagnostics.push(toDiagnostic(rule.meta, finding));
      }
    }
  }

  diagnostics.sort((a, b) => a.fingerprint.localeCompare(b.fingerprint));

  const name =
    typeof context.packageJson?.name === "string" ? (context.packageJson.name as string) : root;

  return {
    schemaVersion: SCHEMA_VERSION,
    tool: "frontboost",
    toolVersion,
    projects: [
      {
        name,
        root,
        frameworks: active.flatMap((p) => p.frameworks),
        filesScanned,
        diagnostics,
      },
    ],
    skippedChecks,
    health: computeHealth(diagnostics),
    execution: { startedAt, durationMs: Math.round(performance.now() - t0) },
  };
}
