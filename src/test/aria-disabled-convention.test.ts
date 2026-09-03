import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Convention guard: interactive controls must model "disabled" with
 * `aria-disabled` (plus `readOnly` on form inputs), never the native `disabled`
 * attribute — it drops the element from the tab order, so it can't be focused to
 * explain itself. See the "Disabled" note in README.md and AGENTS.md.
 *
 * Grepping for `disabled` can't tell the attribute from a same-named prop, so
 * this parses each component and flags `disabled` only on a real control: a
 * native element or a base-ui form primitive. Our presentational wrappers manage
 * disabled the focusable way already, so `disabled` on them is fine.
 */

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Tags that may receive a `disabled` prop. Everything else is denied by default,
 * so a brand-new `<input disabled>` or `<SomeBaseControl.Root disabled>` trips
 * the guard until it's switched to `aria-disabled`.
 *
 * - `Internal*` — presentational primitives whose `disabled` is visual-only
 *   (`data-disabled`, never the attribute); composed ones forward it correctly.
 * - `Tooltip.Root` / `BaseTooltip.Root` / `BaseTooltip.Trigger` — base-ui's
 *   tooltip `disabled` toggles whether the tooltip shows; it never applies the
 *   native attribute to any element. (`BaseTooltip` is the aliased base-ui import.)
 * - `BaseSelect.Item` — renders a `<div>`, so `disabled` maps to `aria-disabled`
 *   and keeps the option focusable/announced (`focusableWhenDisabled`).
 * - `FileList` — models `disabled` the focusable way internally (dims chips,
 *   sets remove buttons' `aria-disabled`, swallows their clicks).
 * - `Chip` — sets `aria-disabled` on its span, never the native attribute, and
 *   propagates the state to clickable adornments via context so they stay focusable.
 * - `BaseCombobox.Item` — a listbox option and never a tab stop (the combobox
 *   input keeps focus; options use roving highlight / `aria-activedescendant`),
 *   so the "must stay focusable" rule doesn't apply.
 * - `Modal` / `Modal.Close` — `Modal`'s `disabled` is a non-DOM veto flag (cancels
 *   close attempts, never reaches an element); `Modal.Close` forwards its own
 *   `disabled` through `InternalButton` as `aria-disabled`.
 * - `Field` — *our* primitive (base-ui's is always aliased `BaseField`). Its
 *   `disabled` only dims the label/help text and is deliberately not forwarded
 *   to `BaseField.Root`, which would propagate the native attribute down.
 * - `HelpText` — a line of text, not a control; `disabled` only picks the dimmed
 *   colour, so there's no element that could leave the tab order.
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
