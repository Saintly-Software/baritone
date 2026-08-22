import { describe, expect, it } from "vitest";
import { controlSizeVarName } from "./controlSizes";
import { vars } from "./contract.css";
import { selectionSizeVarName, selectionSizeVars } from "./selectionSizes";

describe("selectionSizeVarName", () => {
  it("namespaces a size name + field as a --selectionSize-<name>-<field> custom property", () => {
    expect(selectionSizeVarName("cozy", "controlBox")).toBe("--selectionSize-cozy-controlBox");
  });

  it("uses a distinct namespace from the control-size vocabulary", () => {
    // The two ramps are independent, so the same name may exist in both without
    // one clobbering the other.
    expect(selectionSizeVarName("cozy", "fontSize")).not.toBe(
      controlSizeVarName("cozy", "fontSize"),
    );
  });
});

describe("selectionSizeVars", () => {
  it("always publishes the built-in ramp (box + label font) from the tokens", () => {
    const out = selectionSizeVars();
    expect(out["--selectionSize-sm-controlBox"]).toBe(vars.sizing.selection.sm.controlBox);
    expect(out["--selectionSize-md-controlBox"]).toBe(vars.sizing.selection.md.controlBox);
    expect(out["--selectionSize-lg-controlBox"]).toBe(vars.sizing.selection.lg.controlBox);
    expect(out["--selectionSize-md-fontSize"]).toBe(vars.sizing.selection.md.fontSize);
  });

  it("publishes a consumer size's required fields", () => {
    const out = selectionSizeVars({ cozy: { controlBox: "1.125rem", fontSize: "0.8125rem" } });
    expect(out["--selectionSize-cozy-controlBox"]).toBe("1.125rem");
    expect(out["--selectionSize-cozy-fontSize"]).toBe("0.8125rem");
  });

  it("omits the derived-geometry fields unless the consumer pins them", () => {
    const out = selectionSizeVars({ cozy: { controlBox: "1.125rem", fontSize: "0.8125rem" } });
    expect(out["--selectionSize-cozy-glyph"]).toBeUndefined();
    expect(out["--selectionSize-cozy-switchWidth"]).toBeUndefined();
    expect(out["--selectionSize-cozy-switchThumb"]).toBeUndefined();
  });

  it("publishes the derived-geometry overrides when set", () => {
    const out = selectionSizeVars({
      cozy: {
        controlBox: "1.125rem",
        fontSize: "0.8125rem",
        glyph: "0.85rem",
        switchWidth: "2rem",
        switchThumb: "0.75rem",
      },
    });
    expect(out["--selectionSize-cozy-glyph"]).toBe("0.85rem");
    expect(out["--selectionSize-cozy-switchWidth"]).toBe("2rem");
    expect(out["--selectionSize-cozy-switchThumb"]).toBe("0.75rem");
  });

  it("ignores built-in size names so they stay token-backed", () => {
    const out = selectionSizeVars({
      md: { controlBox: "IGNORED", fontSize: "IGNORED" },
      cozy: { controlBox: "1.125rem", fontSize: "0.8125rem" },
    });
    expect(out["--selectionSize-md-controlBox"]).toBe(vars.sizing.selection.md.controlBox);
    expect(out["--selectionSize-cozy-controlBox"]).toBe("1.125rem");
  });
});
