import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { fontFamilyVars, fontVarName } from "./fonts";

describe("fontVarName", () => {
  it("namespaces a font name as a --font-<name> custom property", () => {
    expect(fontVarName("display")).toBe("--font-display");
  });
});

describe("fontFamilyVars", () => {
  it("always publishes the built-in sans/mono from the theme tokens", () => {
    const out = fontFamilyVars();
    expect(out["--font-sans"]).toBe(vars.font.sans);
    expect(out["--font-mono"]).toBe(vars.font.mono);
  });

  it("publishes each consumer family as a --font-<name> property", () => {
    const out = fontFamilyVars({ display: '"Playfair", serif' });
    expect(out["--font-display"]).toBe('"Playfair", serif');
  });

  it("ignores `sans`/`mono` entries so the built-ins stay token-backed", () => {
    const out = fontFamilyVars({ sans: "IGNORED", mono: "IGNORED", display: "kept" });
    // Reserved names never shadow the token-backed values (otherwise bare text and
    // `font="sans"` would diverge); the custom entry is still published.
    expect(out["--font-sans"]).toBe(vars.font.sans);
    expect(out["--font-mono"]).toBe(vars.font.mono);
    expect(out["--font-display"]).toBe("kept");
  });
});
