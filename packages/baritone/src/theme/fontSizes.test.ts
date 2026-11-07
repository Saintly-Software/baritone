import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { fontSizeVarName, fontSizeVars, sizeLineHeightVarName } from "./fontSizes";

describe("fontSizeVarName", () => {
  it("namespaces a size name as a --fontSize-<name> custom property", () => {
    expect(fontSizeVarName("hero")).toBe("--fontSize-hero");
  });
});

describe("sizeLineHeightVarName", () => {
  it("namespaces a size's paired leading distinctly from the lineHeight vocabulary", () => {
    expect(sizeLineHeightVarName("hero")).toBe("--sizeLineHeight-hero");
  });
});

describe("fontSizeVars", () => {
  it("always publishes the built-in ramp (font-size + paired leading) from the tokens", () => {
    const out = fontSizeVars();
    expect(out["--fontSize-xs"]).toBe(vars.text.size.xs.fontSize);
    expect(out["--fontSize-md"]).toBe(vars.text.size.md.fontSize);
    expect(out["--fontSize-9xl"]).toBe(vars.text.size["9xl"].fontSize);
    expect(out["--sizeLineHeight-md"]).toBe(vars.text.size.md.lineHeight);
    expect(out["--sizeLineHeight-4xl"]).toBe(vars.text.size["4xl"].lineHeight);
  });

  it("publishes a string consumer size as a font-size only (no paired leading)", () => {
    const out = fontSizeVars({ hero: "4rem" });
    expect(out["--fontSize-hero"]).toBe("4rem");
    expect(out["--sizeLineHeight-hero"]).toBeUndefined();
  });

  it("publishes a { fontSize, lineHeight } pair as paired --fontSize/--sizeLineHeight", () => {
    const out = fontSizeVars({ hero: { fontSize: "4rem", lineHeight: "1.05" } });
    expect(out["--fontSize-hero"]).toBe("4rem");
    expect(out["--sizeLineHeight-hero"]).toBe("1.05");
  });

  it("omits the paired leading when a pair sets only fontSize", () => {
    const out = fontSizeVars({ hero: { fontSize: "4rem" } });
    expect(out["--fontSize-hero"]).toBe("4rem");
    expect(out["--sizeLineHeight-hero"]).toBeUndefined();
  });

  it("ignores built-in size names so they stay token-backed", () => {
    const out = fontSizeVars({ md: "IGNORED", hero: "4rem" });
    expect(out["--fontSize-md"]).toBe(vars.text.size.md.fontSize);
    expect(out["--fontSize-hero"]).toBe("4rem");
  });
});
