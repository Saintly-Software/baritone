import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { fontVarName } from "./fonts";
import { textStyleVarName, textStyleVars } from "./textStyles";

describe("textStyleVarName", () => {
  it("namespaces a style name + prop as a --textStyle-<name>-<prop> property", () => {
    expect(textStyleVarName("title", "fontSize")).toBe("--textStyle-title-fontSize");
    expect(textStyleVarName("lyric", "lineHeight")).toBe("--textStyle-lyric-lineHeight");
    expect(textStyleVarName("badge", "fontWeight")).toBe("--textStyle-badge-fontWeight");
    expect(textStyleVarName("title", "fontFamily")).toBe("--textStyle-title-fontFamily");
  });
});

describe("textStyleVars", () => {
  it("resolves the `size` convenience to the size token's fontSize + lineHeight", () => {
    const out = textStyleVars({ title: { size: "xl" } });
    // Routed through the contract vars (not literals) so a runtime theme swap flows
    // through — mirrors how `fontFamilyVars` emits `vars.font.sans`.
    expect(out["--textStyle-title-fontSize"]).toBe(vars.text.size.xl.fontSize);
    expect(out["--textStyle-title-lineHeight"]).toBe(vars.text.size.xl.lineHeight);
  });

  it("lets an explicit fontSize/lineHeight override the `size` convenience", () => {
    const out = textStyleVars({ title: { size: "xl", fontSize: "99px", lineHeight: 1.04 } });
    expect(out["--textStyle-title-fontSize"]).toBe("99px");
    // A numeric lineHeight is stringified (CSS accepts a unitless number).
    expect(out["--textStyle-title-lineHeight"]).toBe("1.04");
  });

  it("resolves `weight` to the text.weight token", () => {
    const out = textStyleVars({ title: { weight: "bold" } });
    expect(out["--textStyle-title-fontWeight"]).toBe(vars.text.weight.bold);
  });

  it("resolves `font` to var(--font-<name>)", () => {
    const out = textStyleVars({ title: { font: "serif" } });
    expect(out["--textStyle-title-fontFamily"]).toBe(`var(${fontVarName("serif")})`);
  });

  it("emits only the properties a style defines (omitted props fall through the recipe)", () => {
    const out = textStyleVars({ badge: { weight: "bold" } });
    expect(out["--textStyle-badge-fontWeight"]).toBe(vars.text.weight.bold);
    // No fontSize/lineHeight/fontFamily emitted — the component's instance var
    // resolves to guaranteed-invalid and the recipe falls back to the base token.
    expect(out["--textStyle-badge-fontSize"]).toBeUndefined();
    expect(out["--textStyle-badge-lineHeight"]).toBeUndefined();
    expect(out["--textStyle-badge-fontFamily"]).toBeUndefined();
  });

  it("namespaces each style independently", () => {
    const out = textStyleVars({
      title: { size: "4xl", weight: "bold" },
      lyric: { size: "xl", font: "serif" },
    });
    expect(out["--textStyle-title-fontSize"]).toBe(vars.text.size["4xl"].fontSize);
    expect(out["--textStyle-title-fontWeight"]).toBe(vars.text.weight.bold);
    expect(out["--textStyle-lyric-fontSize"]).toBe(vars.text.size.xl.fontSize);
    expect(out["--textStyle-lyric-fontFamily"]).toBe(`var(${fontVarName("serif")})`);
  });

  it("returns an empty object for no styles", () => {
    expect(textStyleVars()).toEqual({});
    expect(textStyleVars({})).toEqual({});
  });
});
