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

  it("does not publish per-size leadings — those belong to the size vocabulary", () => {
    // The `--lineHeight-<size>` namespace is owned by `fontSizeVars` (a size is a
    // font-size + leading pair), so the leading vocabulary leaves it alone.
    const out = lineHeightVars();
    expect(out["--lineHeight-md"]).toBeUndefined();
    expect(out["--lineHeight-4xl"]).toBeUndefined();
  });

  it("publishes each consumer value as a --lineHeight-<name> property", () => {
    const out = lineHeightVars({ airy: "2.2" });
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });

  it("ignores built-in leading names and size names", () => {
    // A consumer entry can shadow neither the leadings (token-backed) nor a size
    // name (owned by the size vocabulary's paired `--lineHeight-<size>`).
    const out = lineHeightVars({ normal: "IGNORED", md: "IGNORED", airy: "2.2" });
    expect(out["--lineHeight-normal"]).toBe(vars.text.lineHeight.normal);
    expect(out["--lineHeight-md"]).toBeUndefined();
    expect(out["--lineHeight-airy"]).toBe("2.2");
  });
});
