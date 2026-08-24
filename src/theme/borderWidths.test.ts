import { describe, expect, it } from "vitest";
import { borderWidthVarName, borderWidthVars } from "./borderWidths";
import { vars } from "./contract.css";

describe("borderWidthVarName", () => {
  it("namespaces a width name as a --borderWidth-<name> custom property", () => {
    expect(borderWidthVarName("hair")).toBe("--borderWidth-hair");
  });
});

describe("borderWidthVars", () => {
  it("always publishes the built-in steps from the theme tokens", () => {
    const out = borderWidthVars();
    expect(out["--borderWidth-thin"]).toBe(vars.borderWidth.thin);
    expect(out["--borderWidth-thick"]).toBe(vars.borderWidth.thick);
  });

  it("publishes each consumer value as a --borderWidth-<name> property", () => {
    const out = borderWidthVars({ hair: "0.5px" });
    expect(out["--borderWidth-hair"]).toBe("0.5px");
  });

  it("ignores built-in step names so they stay token-backed", () => {
    const out = borderWidthVars({ thick: "IGNORED", hair: "0.5px" });
    expect(out["--borderWidth-thick"]).toBe(vars.borderWidth.thick);
    expect(out["--borderWidth-hair"]).toBe("0.5px");
  });
});
