import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { letterSpacingVarName, letterSpacingVars } from "./letterSpacings";

describe("letterSpacingVarName", () => {
  it("namespaces a tracking name as a --letterSpacing-<name> custom property", () => {
    expect(letterSpacingVarName("eyebrow")).toBe("--letterSpacing-eyebrow");
  });
});

describe("letterSpacingVars", () => {
  it("always publishes the built-in steps from the theme tokens", () => {
    const out = letterSpacingVars();
    expect(out["--letterSpacing-tighter"]).toBe(vars.text.letterSpacing.tighter);
    expect(out["--letterSpacing-normal"]).toBe(vars.text.letterSpacing.normal);
    expect(out["--letterSpacing-widest"]).toBe(vars.text.letterSpacing.widest);
  });

  it("publishes each consumer value as a --letterSpacing-<name> property", () => {
    const out = letterSpacingVars({ eyebrow: "0.2em" });
    expect(out["--letterSpacing-eyebrow"]).toBe("0.2em");
  });

  it("ignores built-in step names so they stay token-backed", () => {
    const out = letterSpacingVars({ widest: "IGNORED", eyebrow: "0.2em" });
    expect(out["--letterSpacing-widest"]).toBe(vars.text.letterSpacing.widest);
    expect(out["--letterSpacing-eyebrow"]).toBe("0.2em");
  });
});
