import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { analyze } from "../src/engine.ts";
import { reactPlugin } from "../src/plugins/react.ts";
import { renderClaude, renderCodex } from "../src/adapters.ts";
import { SCHEMA_VERSION } from "../src/report.ts";

const FIXTURE = join(import.meta.dirname, "fixtures", "react-app");

test("react fixture: detects framework, flags bad patterns, skips lookalikes", () => {
  const report = analyze(FIXTURE, [reactPlugin]);

  assert.equal(report.schemaVersion, SCHEMA_VERSION);
  assert.equal(report.projects.length, 1);
  const project = report.projects[0]!;
  assert.deepEqual(project.frameworks, ["react"]);
  assert.equal(project.filesScanned, 2);

  const ruleIds = project.diagnostics.map((d) => d.ruleId);
  assert.deepEqual(ruleIds.sort(), ["react/no-array-index-key", "react/no-unsafe-inner-html"]);

  const indexKey = project.diagnostics.find((d) => d.ruleId === "react/no-array-index-key")!;
  assert.equal(indexKey.file, "src/List.tsx");
  assert.equal(indexKey.range?.start.line, 5);

  const unsafe = project.diagnostics.find((d) => d.ruleId === "react/no-unsafe-inner-html")!;
  assert.equal(unsafe.file, "src/Html.tsx");
  assert.equal(unsafe.severity, "error");

  assert.equal(report.health.errors, 1);
  assert.equal(report.health.warnings, 1);
});

test("non-react project: plugin skipped, no diagnostics", () => {
  const report = analyze(join(import.meta.dirname, "fixtures"), [reactPlugin]);
  assert.equal(report.projects[0]!.diagnostics.length, 0);
  assert.deepEqual(report.skippedChecks, ["@frontboost/plugin-react: framework not detected"]);
});

test("determinism: two runs produce identical diagnostics", () => {
  const a = analyze(FIXTURE, [reactPlugin]);
  const b = analyze(FIXTURE, [reactPlugin]);
  assert.deepEqual(a.projects[0]!.diagnostics, b.projects[0]!.diagnostics);
});

test("adapters render both findings without re-analysis", () => {
  const report = analyze(FIXTURE, [reactPlugin]);
  const claude = renderClaude(report);
  assert.match(claude, /## error \(1\)/);
  assert.match(claude, /src\/Html\.tsx:2:15/);
  const codex = renderCodex(report);
  assert.match(codex, /ERROR {3}src\/Html\.tsx/);
  assert.match(codex, /WARNING src\/List\.tsx/);
});
