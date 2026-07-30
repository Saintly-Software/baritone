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

  it("publishes the per-size line-heights so `size` has a paired default", () => {
    const out = lineHeightVars();
    expect(out["--lineHeight-md"]).toBe(vars.text.size.md.lineHeight);
    expect(out["--lineHeight-4xl"]).toBe(vars.text.size["4xl"].lineHeight);
  });

  it("publishes each consumer value as a --lineHeight-<name> property", () => {
    const out = lineHeightVars({ airy: "2.2" });
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });

  it("ignores built-in leading names and size names so both stay token-backed", () => {
    // A consumer entry can shadow neither the leadings nor the per-size defaults —
    // `size`'s paired line-height reads the same `--lineHeight-<size>` namespace.
    const out = lineHeightVars({ normal: "IGNORED", md: "IGNORED", airy: "2.2" });
    expect(out["--lineHeight-normal"]).toBe(vars.text.lineHeight.normal);
    expect(out["--lineHeight-md"]).toBe(vars.text.size.md.lineHeight);
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });
});
