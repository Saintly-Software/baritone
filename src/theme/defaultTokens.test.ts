import { describe, expect, it } from "vitest";
import { vars } from "./contract.css";
import { buildDefaultTokens } from "./defaultTokens";

// The authored control/selection size ramps are load-bearing: Phase 1 grows
// buttons to meet inputs at exactly the unified `control` heights, so an accidental
// edit to `controlHeight` / `selectionBox` / the `CONTROL_PADDING` mapping must not
// slip through typecheck + the reference-only publisher tests. These pin the values
// `buildDefaultTokens` actually assembles into the `sizing` contract slice.
describe("buildDefaultTokens — sizing.control ramp", () => {
  const { control } = buildDefaultTokens("light").sizing;

  it("pins the unified control heights (Button lines up with inputs at these)", () => {
    expect(control.sm.height).toBe("2rem");
    expect(control.md.height).toBe("2.5rem");
    expect(control.lg.height).toBe("3rem");
  });

  it("maps inline padding onto the space scale (sm→2, md→3, lg→4)", () => {
    expect(control.sm.paddingInline).toBe("8px"); // space[2]
    expect(control.md.paddingInline).toBe("12px"); // space[3]
    expect(control.lg.paddingInline).toBe("16px"); // space[4]
  });

  it("keeps a constant gap across the ramp (space[2])", () => {
    expect(control.sm.gap).toBe("8px");
    expect(control.md.gap).toBe("8px");
    expect(control.lg.gap).toBe("8px");
  });

  it("ties the control font-size to the text-size ramp (sm/md/lg)", () => {
    expect(control.sm.fontSize).toBe(vars.text.size.sm.fontSize);
    expect(control.md.fontSize).toBe(vars.text.size.md.fontSize);
    expect(control.lg.fontSize).toBe(vars.text.size.lg.fontSize);
  });
});

describe("buildDefaultTokens — sizing.selection ramp", () => {
  const { selection } = buildDefaultTokens("light").sizing;

  it("pins the selection box heights", () => {
    expect(selection.sm.controlBox).toBe("1rem");
    expect(selection.md.controlBox).toBe("1.25rem");
    expect(selection.lg.controlBox).toBe("1.5rem");
  });

  it("ties the selection label font-size to the text-size ramp", () => {
    expect(selection.sm.fontSize).toBe(vars.text.size.sm.fontSize);
    expect(selection.md.fontSize).toBe(vars.text.size.md.fontSize);
    expect(selection.lg.fontSize).toBe(vars.text.size.lg.fontSize);
  });
});

describe("buildDefaultTokens — sizing scheme independence", () => {
  it("produces identical size ramps for light and dark (sizing is scheme-agnostic)", () => {
    expect(buildDefaultTokens("light").sizing).toStrictEqual(buildDefaultTokens("dark").sizing);
  });
});

describe("buildDefaultTokens — BrandSeed size overrides", () => {
  it("merges controlSizeScale per field, leaving the rest at their defaults", () => {
    const { control } = buildDefaultTokens("light", {
      controlSizeScale: { md: { height: "9rem" } },
    }).sizing;
    expect(control.md.height).toBe("9rem");
    // Untouched fields keep the built-in ramp.
    expect(control.md.paddingInline).toBe("12px");
    expect(control.md.gap).toBe("8px");
    // Other sizes are untouched.
    expect(control.sm.height).toBe("2rem");
  });

  it("merges selectionSizeScale per field", () => {
    const { selection } = buildDefaultTokens("light", {
      selectionSizeScale: { md: { controlBox: "2rem" } },
    }).sizing;
    expect(selection.md.controlBox).toBe("2rem");
    expect(selection.md.fontSize).toBe(vars.text.size.md.fontSize);
    expect(selection.sm.controlBox).toBe("1rem");
  });

  it("flows a brand `space` override through control padding (pins the space-key mapping)", () => {
    const { control } = buildDefaultTokens("light", { space: { "3": "99px" } }).sizing;
    // md maps to space[3], so a brand space override reaches control padding.
    expect(control.md.paddingInline).toBe("99px");
  });
});
