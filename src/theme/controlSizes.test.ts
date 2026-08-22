import { describe, expect, it } from "vitest";
import { controlSizeVarName, controlSizeVars } from "./controlSizes";
import { vars } from "./contract.css";

describe("controlSizeVarName", () => {
  it("namespaces a size name + field as a --controlSize-<name>-<field> custom property", () => {
    expect(controlSizeVarName("cozy", "height")).toBe("--controlSize-cozy-height");
    expect(controlSizeVarName("cozy", "paddingInline")).toBe("--controlSize-cozy-paddingInline");
  });
});

describe("controlSizeVars", () => {
  it("always publishes the built-in ramp (every bundle field) from the tokens", () => {
    const out = controlSizeVars();
    expect(out["--controlSize-sm-height"]).toBe(vars.sizing.control.sm.height);
    expect(out["--controlSize-md-height"]).toBe(vars.sizing.control.md.height);
    expect(out["--controlSize-lg-height"]).toBe(vars.sizing.control.lg.height);
    expect(out["--controlSize-md-paddingInline"]).toBe(vars.sizing.control.md.paddingInline);
    expect(out["--controlSize-md-fontSize"]).toBe(vars.sizing.control.md.fontSize);
    expect(out["--controlSize-md-gap"]).toBe(vars.sizing.control.md.gap);
  });

  it("publishes a consumer size's required fields", () => {
    const out = controlSizeVars({
      cozy: { height: "2.25rem", paddingInline: "0.625rem", fontSize: "0.8125rem" },
    });
    expect(out["--controlSize-cozy-height"]).toBe("2.25rem");
    expect(out["--controlSize-cozy-paddingInline"]).toBe("0.625rem");
    expect(out["--controlSize-cozy-fontSize"]).toBe("0.8125rem");
  });

  it("omits gap when the consumer entry doesn't set it (recipe falls back to the md gap)", () => {
    const out = controlSizeVars({
      cozy: { height: "2.25rem", paddingInline: "0.625rem", fontSize: "0.8125rem" },
    });
    expect(out["--controlSize-cozy-gap"]).toBeUndefined();
  });

  it("publishes gap when the consumer entry sets it", () => {
    const out = controlSizeVars({
      cozy: { height: "2.25rem", paddingInline: "0.625rem", fontSize: "0.8125rem", gap: "0.5rem" },
    });
    expect(out["--controlSize-cozy-gap"]).toBe("0.5rem");
  });

  it("ignores built-in size names so they stay token-backed", () => {
    const out = controlSizeVars({
      md: { height: "IGNORED", paddingInline: "IGNORED", fontSize: "IGNORED" },
      cozy: { height: "2.25rem", paddingInline: "0.625rem", fontSize: "0.8125rem" },
    });
    // Reserved built-in sizes never shadow the token-backed values (otherwise bare
    // controls and e.g. `size="md"` would diverge); the custom entry is still published.
    expect(out["--controlSize-md-height"]).toBe(vars.sizing.control.md.height);
    expect(out["--controlSize-cozy-height"]).toBe("2.25rem");
  });
});
