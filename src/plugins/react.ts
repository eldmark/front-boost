// React reference plugin: detection, JSX-aware parsing via the TypeScript
// compiler API, and the first rule set. Proves the core/plugin boundary.

import ts from "typescript";
import type { Finding, FrontBoostPlugin, Rule, SourceFile } from "../engine.ts";
import type { Range } from "../report.ts";

const REACT_EXTENSIONS = [".jsx", ".tsx", ".js", ".ts"];

function parse(file: SourceFile): ts.SourceFile {
  return ts.createSourceFile(file.path, file.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function nodeRange(sourceFile: ts.SourceFile, node: ts.Node): Range {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  return {
    start: { line: start.line + 1, column: start.character + 1 },
    end: { line: end.line + 1, column: end.character + 1 },
  };
}

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  node.forEachChild((child) => walk(child, visit));
}

function isComponentFile(file: SourceFile): boolean {
  return /\.(jsx|tsx)$/.test(file.path) || /<[A-Za-z]/.test(file.text);
}

/** key={index} inside a .map((item, index) => <jsx>) callback. */
const noArrayIndexKey: Rule = {
  meta: {
    id: "react/no-array-index-key",
    category: "correctness",
    severity: "warning",
    title: "Array index used as React key",
    explanation:
      "Index keys break reconciliation when the list is reordered, inserted into, or filtered: React reuses component state for the wrong item.",
    recommendation: "Key by a stable identity from the data (id, slug) instead of the map index.",
    tags: ["react", "rendering"],
  },
  filter: isComponentFile,
  check(file) {
    const source = parse(file);
    const findings: Finding[] = [];
    walk(source, (node) => {
      if (!ts.isCallExpression(node)) return;
      if (!ts.isPropertyAccessExpression(node.expression)) return;
      if (node.expression.name.text !== "map") return;
      const callback = node.arguments[0];
      if (!callback || (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))) return;
      const indexParam = callback.parameters[1];
      if (!indexParam || !ts.isIdentifier(indexParam.name)) return;
      const indexName = indexParam.name.text;
      walk(callback.body, (inner) => {
        if (!ts.isJsxAttribute(inner)) return;
        if (inner.name.getText(source) !== "key") return;
        const init = inner.initializer;
        if (
          init &&
          ts.isJsxExpression(init) &&
          init.expression &&
          ts.isIdentifier(init.expression) &&
          init.expression.text === indexName
        ) {
          findings.push({ file: file.path, range: nodeRange(source, inner) });
        }
      });
    });
    return findings;
  },
};

/** dangerouslySetInnerHTML with a value that is not a plain string literal. */
const noUnsafeInnerHtml: Rule = {
  meta: {
    id: "react/no-unsafe-inner-html",
    category: "security",
    severity: "error",
    title: "dangerouslySetInnerHTML with dynamic content",
    explanation:
      "Injecting non-literal HTML is an XSS vector unless the value is sanitized. Literal strings are exempt because they cannot carry user input.",
    recommendation:
      "Render content as JSX children, or sanitize with a vetted library (e.g. DOMPurify) before injecting.",
    tags: ["react", "xss"],
  },
  filter: isComponentFile,
  check(file) {
    if (!file.text.includes("dangerouslySetInnerHTML")) return [];
    const source = parse(file);
    const findings: Finding[] = [];
    walk(source, (node) => {
      if (!ts.isJsxAttribute(node)) return;
      if (node.name.getText(source) !== "dangerouslySetInnerHTML") return;
      // shape: dangerouslySetInnerHTML={{ __html: value }}
      const init = node.initializer;
      if (!init || !ts.isJsxExpression(init) || !init.expression) return;
      let html: ts.Expression | undefined;
      if (ts.isObjectLiteralExpression(init.expression)) {
        for (const prop of init.expression.properties) {
          if (ts.isPropertyAssignment(prop) && prop.name.getText(source) === "__html") {
            html = prop.initializer;
          }
        }
      }
      const isLiteral =
        html !== undefined &&
        (ts.isStringLiteral(html) || ts.isNoSubstitutionTemplateLiteral(html));
      if (!isLiteral) {
        findings.push({ file: file.path, range: nodeRange(source, node) });
      }
    });
    return findings;
  },
};

export const reactPlugin: FrontBoostPlugin = {
  id: "@frontboost/plugin-react",
  frameworks: ["react"],
  detect: (context) => "react" in context.dependencies,
  fileFilter: (path) => REACT_EXTENSIONS.some((ext) => path.endsWith(ext)),
  rules: [noArrayIndexKey, noUnsafeInnerHtml],
};
