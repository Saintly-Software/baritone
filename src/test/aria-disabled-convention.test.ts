import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

function mayReceiveDisabled(tag: string): boolean {
  return (
    tag.startsWith("Internal") ||
    tag === "Tooltip.Root" ||
    tag === "BaseTooltip.Root" ||
    tag === "BaseTooltip.Trigger" ||
    tag === "BaseSelect.Item" ||
    tag === "FileList" ||
    tag === "Chip" ||
    tag === "BaseCombobox.Item" ||
    tag === "Modal" ||
    tag === "Modal.Close" ||
    tag === "Field" ||
    tag === "HelpText"
  );
}

function tsxSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...tsxSourceFiles(full));
    } else if (
      entry.name.endsWith(".tsx") &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.endsWith(".stories.tsx")
    ) {
      out.push(full);
    }
  }
  return out;
}

function findNativeDisabled(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (!mayReceiveDisabled(tag)) {
        const disabledAttr = node.attributes.properties.find(
          (prop): prop is ts.JsxAttribute =>
            ts.isJsxAttribute(prop) && prop.name.getText(source) === "disabled",
        );
        if (disabledAttr) {
          const line = source.getLineAndCharacterOfPosition(disabledAttr.getStart(source)).line + 1;
          hits.push(`${relative(SRC_DIR, file)}:${line}: <${tag} disabled={…}>`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return hits;
}

describe("aria-disabled convention", () => {
  it("no interactive control uses the native `disabled` attribute (it must stay tabbable)", () => {
    const violations = tsxSourceFiles(SRC_DIR).flatMap(findNativeDisabled);

    expect(
      violations,
      "Native `disabled` removes a control from the tab order, so it can't be focused to " +
        "explain itself. Model disabled with `aria-disabled` (and base-ui's `readOnly` on form " +
        "inputs, which vetoes the toggle while keeping focus). See AGENTS.md.\n\n" +
        violations.join("\n"),
    ).toEqual([]);
  });
});
