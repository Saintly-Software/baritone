import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PACKAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "packages");

const RELATIVE_SPECIFIER = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']*)["']/g;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("package boundaries", () => {
  it("no package reaches into another package's files by relative path", () => {
    const offenders = readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const packageDir = join(PACKAGES_DIR, entry.name);
        return sourceFiles(join(packageDir, "src")).flatMap((file) =>
          [...readFileSync(file, "utf8").matchAll(RELATIVE_SPECIFIER)]
            .map((match) => match[1] ?? "")
            .filter((specifier) =>
              relative(packageDir, resolve(dirname(file), specifier)).startsWith(".."),
            )
            .map((specifier) => `${relative(PACKAGES_DIR, file)}: "${specifier}"`),
        );
      });

    expect(
      offenders,
      "Import sibling packages by name (e.g. `@saintly-software/baritone`), or from " +
        "`@saintly-software/baritone/internal` for non-public pieces. A relative path " +
        "bundles a second copy of the sibling. See AGENTS.md.\n\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });
});
