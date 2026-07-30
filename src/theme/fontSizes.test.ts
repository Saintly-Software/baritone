import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { fontSizeVarName, fontSizeVars } from "./fontSizes";

describe("fontSizeVarName", () => {
  it("namespaces a size name as a --fontSize-<name> custom property", () => {
    expect(fontSizeVarName("hero")).toBe("--fontSize-hero");
  });
});

describe("fontSizeVars", () => {
  it("always publishes the built-in ramp from the theme tokens", () => {
    const out = fontSizeVars();
    expect(out["--fontSize-xs"]).toBe(vars.text.size.xs.fontSize);
    expect(out["--fontSize-md"]).toBe(vars.text.size.md.fontSize);
    expect(out["--fontSize-9xl"]).toBe(vars.text.size["9xl"].fontSize);
  });

  it("publishes each consumer value as a --fontSize-<name> property", () => {
    const out = fontSizeVars({ hero: "4rem" });
    expect(out["--fontSize-hero"]).toBe("4rem");
  });

  it("ignores built-in size names so they stay token-backed", () => {
    const out = fontSizeVars({ md: "IGNORED", hero: "4rem" });
    // Reserved built-in sizes never shadow the token-backed values (otherwise bare
    // text and e.g. `size="md"` would diverge); the custom entry is still published.
    expect(out["--fontSize-md"]).toBe(vars.text.size.md.fontSize);
    expect(out["--fontSize-hero"]).toBe("4rem");
  });
});
