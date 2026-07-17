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

function containsJsx(node: ts.Node): boolean {
  let found = false;
  walk(node, (inner) => {
    if (ts.isJsxElement(inner) || ts.isJsxSelfClosingElement(inner) || ts.isJsxFragment(inner)) {
      found = true;
    }
  });
  return found;
}

/** Function declarations / arrow consts with a capitalized name that render JSX. */
function componentDefinitions(source: ts.SourceFile): { name: string; node: ts.Node; body: ts.Node }[] {
  const defs: { name: string; node: ts.Node; body: ts.Node }[] = [];
  walk(source, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name && node.body && /^[A-Z]/.test(node.name.text)) {
      if (containsJsx(node.body)) defs.push({ name: node.name.text, node, body: node.body });
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /^[A-Z]/.test(node.name.text) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      if (containsJsx(node.initializer.body)) {
        defs.push({ name: node.name.text, node, body: node.initializer.body });
      }
    }
  });
  return defs;
}

/** Component defined inside another component's body: remounts on every render. */
const noNestedComponentDefinition: Rule = {
  meta: {
    id: "react/no-nested-component-definition",
    category: "correctness",
    severity: "error",
    title: "Component defined inside another component",
    explanation:
      "A component created during render gets a new identity every render, so React unmounts and remounts its whole subtree: state resets, effects re-run, focus is lost.",
    recommendation:
      "Move the inner component to module scope and pass data via props; if it closes over parent state, lift that state into props.",
    tags: ["react", "rendering", "state-loss"],
  },
  filter: isComponentFile,
  check(file) {
    const source = parse(file);
    const defs = componentDefinitions(source);
    const findings: Finding[] = [];
    for (const inner of defs) {
      for (const outer of defs) {
        if (inner === outer) continue;
        const start = inner.node.getStart(source);
        if (start > outer.body.getStart(source) && inner.node.getEnd() < outer.body.getEnd()) {
          findings.push({ file: file.path, range: nodeRange(source, inner.node) });
          break;
        }
      }
    }
    return findings;
  },
};

/** Inline object/array literal passed as a Context Provider value. */
const noUnstableContextValue: Rule = {
  meta: {
    id: "react/no-unstable-context-value",
    category: "performance",
    severity: "warning",
    title: "Inline object as Context Provider value",
    explanation:
      "A fresh object literal on every render makes the context value referentially unequal each time, so every consumer re-renders even when nothing changed.",
    recommendation: "Memoize the value with useMemo, or pass primitive values through separate contexts.",
    tags: ["react", "context", "re-render"],
  },
  filter: isComponentFile,
  check(file) {
    if (!file.text.includes("Provider")) return [];
    const source = parse(file);
    const findings: Finding[] = [];
    walk(source, (node) => {
      if (!ts.isJsxAttribute(node)) return;
      if (node.name.getText(source) !== "value") return;
      const element = node.parent.parent;
      if (!ts.isJsxOpeningElement(element) && !ts.isJsxSelfClosingElement(element)) return;
      if (!element.tagName.getText(source).endsWith(".Provider")) return;
      const init = node.initializer;
      if (!init || !ts.isJsxExpression(init) || !init.expression) return;
      if (ts.isObjectLiteralExpression(init.expression) || ts.isArrayLiteralExpression(init.expression)) {
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
  rules: [noArrayIndexKey, noUnsafeInnerHtml, noNestedComponentDefinition, noUnstableContextValue],
};
