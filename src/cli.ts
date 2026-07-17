#!/usr/bin/env node
// frontboost CLI — thin wrapper over the engine, no logic of its own.
//   frontboost analyze [path] [--format json|claude|codex]

import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { analyze } from "./engine.ts";
import { reactPlugin } from "./plugins/react.ts";
import { renderClaude, renderCodex, renderJson } from "./adapters.ts";

const PLUGINS = [reactPlugin];
const FORMATS = { json: renderJson, claude: renderClaude, codex: renderCodex } as const;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    format: { type: "string", short: "f", default: "json" },
    help: { type: "boolean", short: "h", default: false },
  },
});

const [command = "analyze", target = "."] = positionals;

if (values.help || command !== "analyze") {
  console.log("usage: frontboost analyze [path] [--format json|claude|codex]");
  process.exit(command === "analyze" || values.help ? 0 : 1);
}

const render = FORMATS[values.format as keyof typeof FORMATS];
if (!render) {
  console.error(`unknown format: ${values.format} (expected json|claude|codex)`);
  process.exit(1);
}

const report = analyze(resolve(target), PLUGINS);
process.stdout.write(render(report));
process.exit(report.health.errors > 0 ? 1 : 0);
