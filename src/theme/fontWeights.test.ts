import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { fontWeightVarName, fontWeightVars } from "./fontWeights";

describe("fontWeightVarName", () => {
  it("namespaces a weight name as a --fontWeight-<name> custom property", () => {
    expect(fontWeightVarName("black")).toBe("--fontWeight-black");
  });
});

describe("fontWeightVars", () => {
  it("always publishes the built-in steps from the theme tokens", () => {
    const out = fontWeightVars();
    expect(out["--fontWeight-default"]).toBe(vars.text.weight.default);
    expect(out["--fontWeight-bold"]).toBe(vars.text.weight.bold);
    expect(out["--fontWeight-superbold"]).toBe(vars.text.weight.superbold);
  });

  it("publishes each consumer value as a --fontWeight-<name> property", () => {
    const out = fontWeightVars({ black: "900" });
    expect(out["--fontWeight-black"]).toBe("900");
  });

  it("ignores built-in step names so they stay token-backed", () => {
    const out = fontWeightVars({ bold: "IGNORED", black: "900" });
    expect(out["--fontWeight-bold"]).toBe(vars.text.weight.bold);
    expect(out["--fontWeight-black"]).toBe("900");
  });
});
