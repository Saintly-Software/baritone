import { describe, expect, it } from "vitest";
import { contrastRatio, oklchToLinearRgb, parseOklch, relativeLuminance } from "./color-math";

describe("parseOklch", () => {
  it("parses L C H", () => {
    expect(parseOklch("oklch(0.5 0.1 200)")).toEqual({
      l: 0.5,
      c: 0.1,
      h: 200,
      alpha: 1,
    });
  });

  it("parses an alpha channel", () => {
    expect(parseOklch("oklch(0.2 0.02 260 / 0.5)")?.alpha).toBe(0.5);
  });

  it("treats transparent as zero-alpha", () => {
    expect(parseOklch("transparent")).toEqual({ l: 0, c: 0, h: 0, alpha: 0 });
  });

  it("returns null for non-static values (var/calc/relative)", () => {
    expect(parseOklch("oklch(from var(--x) l c h)")).toBeNull();
    expect(parseOklch("var(--whatever)")).toBeNull();
  });
});

describe("oklch conversion + luminance", () => {
  it("maps white to ~(1,1,1)", () => {
    const rgb = oklchToLinearRgb({ l: 1, c: 0, h: 0, alpha: 1 });
    expect(rgb.r).toBeCloseTo(1, 2);
    expect(rgb.g).toBeCloseTo(1, 2);
    expect(rgb.b).toBeCloseTo(1, 2);
  });

  it("white luminance is ~1, black ~0", () => {
    expect(relativeLuminance(oklchToLinearRgb({ l: 1, c: 0, h: 0, alpha: 1 }))).toBeCloseTo(1, 2);
    expect(relativeLuminance(oklchToLinearRgb({ l: 0, c: 0, h: 0, alpha: 1 }))).toBeCloseTo(0, 2);
  });
});

describe("contrastRatio", () => {
  it("black on white is ~21:1", () => {
    const ratio = contrastRatio("oklch(0 0 0)", "oklch(1 0 0)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("identical colours are 1:1", () => {
    expect(contrastRatio("oklch(0.5 0 0)", "oklch(0.5 0 0)")).toBeCloseTo(1, 5);
  });

  it("returns null when a colour cannot be parsed", () => {
    expect(contrastRatio("oklch(from var(--x) l c h)", "oklch(1 0 0)")).toBeNull();
  });
});
