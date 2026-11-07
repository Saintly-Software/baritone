import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { lineHeightVarName, lineHeightVars } from "./lineHeights";

describe("lineHeightVarName", () => {
  it("namespaces a leading name as a --lineHeight-<name> custom property", () => {
    expect(lineHeightVarName("airy")).toBe("--lineHeight-airy");
  });
});

describe("lineHeightVars", () => {
  it("always publishes the built-in leadings from the theme tokens", () => {
    const out = lineHeightVars();
    expect(out["--lineHeight-none"]).toBe(vars.text.lineHeight.none);
    expect(out["--lineHeight-normal"]).toBe(vars.text.lineHeight.normal);
    expect(out["--lineHeight-loose"]).toBe(vars.text.lineHeight.loose);
  });

  it("does not touch the size-paired leading namespace", () => {
    const out = lineHeightVars();
    expect(out["--sizeLineHeight-md"]).toBeUndefined();
    expect(out["--lineHeight-md"]).toBeUndefined();
  });

  it("publishes each consumer value as a --lineHeight-<name> property", () => {
    const out = lineHeightVars({ airy: "2.2" });
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });

  it("ignores built-in leading names but allows a size name (distinct namespace)", () => {
    const out = lineHeightVars({ normal: "IGNORED", md: "1.4", airy: "2.2" });
    expect(out["--lineHeight-normal"]).toBe(vars.text.lineHeight.normal);
    expect(out["--lineHeight-md"]).toBe("1.4");
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });
});
