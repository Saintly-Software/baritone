import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Convention guard: the label / help / error layout and the ARIA wiring that
 * goes with it live in exactly one place — `src/components/Field`. A control that
 * reaches for base-ui's `Field` directly is re-deriving that wiring, which is how
 * the two bugs this primitive was built to fix happened in the first place:
 * `CheckboxGroup` rendered help text that `aria-describedby` never pointed at,
 * and several controls quietly disagreed about whether `label` or `aria-label`
 * won. See the "Form controls compose `Field`" note in AGENTS.md.
 *
 * `Field` itself is the one legal consumer — it's the thing doing the wrapping.
 */

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The only module allowed to import base-ui's `Field` — it *is* the wrapper. */
const ALLOWED = ["components/Field/index.tsx"];

// `@base-ui/react/fieldset` is a different module (and legitimately used by
// `Fieldset`), so match the field import exactly rather than by substring.
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
