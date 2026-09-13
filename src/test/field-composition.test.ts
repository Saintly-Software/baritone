import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

const ALLOWED = ["components/Field/index.tsx"];

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
