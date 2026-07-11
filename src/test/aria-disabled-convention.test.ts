import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Convention guard: interactive controls must model "disabled" with
 * `aria-disabled` (plus `readOnly` on form inputs), never the native HTML
 * `disabled` attribute — because `disabled` drops the element out of the tab
 * order, so it can't be focused to explain itself (a tooltip, a reason, …).
 * See the "Disabled" note in README.md and AGENTS.md.
 *
 * Rather than grep for the string `disabled` (which can't tell the native
 * attribute apart from a same-named React prop), this parses each component and
 * flags a `disabled` JSX attribute only when it lands on a *real* control: a
 * native element (`<button>`, `<input>`, …) or a base-ui form primitive
 * (`Checkbox.Root`, `Field.Root`, …). Our own presentational wrappers manage
 * disabled the focusable way, so passing `disabled` to them is fine and allowed.
 */

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Tags that may receive a `disabled` prop. Everything else is denied by default,
 * so a brand-new `<input disabled>` or `<SomeBaseControl.Root disabled>` trips
 * the guard until it's switched to `aria-disabled`.
 *
 * - `Internal*` — our presentational primitives (`InternalCheckbox`,
 *   `InternalSwitch`) take a *visual-only* `disabled` (it sets `data-disabled`,
 *   never the attribute) and the composed ones (`InternalTooltip`,
 *   `InternalButton`) forward it on correctly.
 * - `Tooltip.Root` / `BaseTooltip.Root` / `BaseTooltip.Trigger` — base-ui's
 *   tooltip `disabled` toggles whether the tooltip *shows* (on the root, or per
 *   trigger); it never applies the native `disabled` attribute to any element,
 *   so it's not an interactive-control disable. (`BaseTooltip` is how the public
 *   `Tooltip` aliases the base-ui import to avoid clashing with its own name.)
 * - `BaseSelect.Item` — base-ui's select option renders a `<div>` (a non-native
 *   button), so its `disabled` maps to `aria-disabled` and keeps the option
 *   focusable/announced in the listbox (`focusableWhenDisabled`), never the
 *   native attribute. It's the idiomatic way to disable one option.
 * - `FileList` — a system component whose `disabled` is modelled the focusable
 *   way internally (dims the chips, sets the remove buttons' `aria-disabled` and
 *   swallows their clicks, never the native attribute — see its tests). Composing
 *   components (e.g. `FileUpload`) forward their own disabled state to it.
 * - `Chip` — a system surface (per the README table) whose `disabled` sets
 *   `aria-disabled` on its span, never the native attribute, and propagates the
 *   state to its clickable adornments via context so they go inert but stay
 *   focusable. `FileList` passes its own disabled state down to each chip.
 * - `BaseCombobox.Item` — a listbox option, which is never a tab stop (the
 *   combobox input keeps focus; options are navigated by roving highlight /
 *   `aria-activedescendant`). base-ui renders it as a `<div>` and its `disabled`
 *   sets `aria-disabled`, blocking selection without removing anything from the
 *   tab order — so the "must stay focusable" rule doesn't apply.
 */
function mayReceiveDisabled(tag: string): boolean {
  return (
    tag.startsWith("Internal") ||
    tag === "Tooltip.Root" ||
    tag === "BaseTooltip.Root" ||
    tag === "BaseTooltip.Trigger" ||
    tag === "BaseSelect.Item" ||
    tag === "FileList" ||
    tag === "Chip" ||
    tag === "BaseCombobox.Item"
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
