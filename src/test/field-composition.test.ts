import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Convention guard: label / help / error layout and its ARIA wiring live in
 * exactly one place — `src/components/Field`. A control that reaches for
 * base-ui's `Field` directly re-derives that wiring, which is how this
 * primitive's two motivating bugs happened: `CheckboxGroup` rendered help text
 * `aria-describedby` never pointed at, and controls disagreed about whether
 * `label` or `aria-label` won. See "Form controls compose `Field`" in AGENTS.md.
 *
 * `Field` itself is the one legal consumer.
 */

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The only module allowed to import base-ui's `Field` — it *is* the wrapper. */
const ALLOWED = ["components/Field/index.tsx"];

// `@base-ui/react/fieldset` is a different module (legitimately used by
// `Fieldset`), so match the field import exactly, not by substring.
const BASE_UI_FIELD_IMPORT = /from\s+["']@base-ui\/react\/field["']/;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.endsWith(".stories.tsx")
    ) {
      out.push(full);
    }
  }
  return out;
}

describe("Field composition convention", () => {
  it("only `Field` imports base-ui's Field — controls compose ours", () => {
    const offenders = sourceFiles(SRC_DIR)
      .filter((file) => BASE_UI_FIELD_IMPORT.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC_DIR, file))
      .filter((rel) => !ALLOWED.includes(rel));

    expect(
      offenders,
      "Import the `Field` primitive from `src/components/Field` instead of base-ui's " +
        "`Field` directly, so label/help/error layout and ARIA wiring stay in one place. " +
        "See AGENTS.md.\n\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });
});
