import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { textSizeRecipe, typographyWeight } from "../../../styles/recipes/text.css";
import { fontVarName } from "../../../theme/fonts";
import { textStyleVarName } from "../../../theme/textStyles";
import { InternalText } from "./index";

describe("InternalText", () => {
  it("renders the defaultElement tag", () => {
    render(
      <InternalText size="md" defaultElement="p">
        Body
      </InternalText>,
    );
    expect(screen.getByText("Body").tagName).toBe("P");
  });

  it("applies the size recipe class", () => {
    render(
      <InternalText size="2xl" defaultElement="div">
        Big
      </InternalText>,
    );
    expect(screen.getByText("Big").className).toContain(textSizeRecipe({ size: "2xl" }));
  });

  it("composes typographic knobs on top of the size", () => {
    render(
      <InternalText size="md" defaultElement="div" weight="bold">
        Bold
      </InternalText>,
    );
    expect(screen.getByText("Bold").className).toContain(typographyWeight({ weight: "bold" }));
  });

  it("points the --textFont var at the named family when `font` is set", () => {
    render(
      <InternalText size="md" defaultElement="div" font="display">
        Fancy
      </InternalText>,
    );
    expect(screen.getByText("Fancy").getAttribute("style")).toContain(
      `var(${fontVarName("display")})`,
    );
  });

  it("points the four instance vars at the named style when `textStyle` is set", () => {
    render(
      <InternalText defaultElement="div" textStyle="title">
        Titled
      </InternalText>,
    );
    // Each instance var reads its `--textStyle-<name>-<prop>`; the theme publishes
    // (or omits) those, and the recipe falls back per prop.
    const style = screen.getByText("Titled").getAttribute("style") ?? "";
    expect(style).toContain(`var(${textStyleVarName("title", "fontSize")})`);
    expect(style).toContain(`var(${textStyleVarName("title", "lineHeight")})`);
    expect(style).toContain(`var(${textStyleVarName("title", "fontFamily")})`);
    expect(style).toContain(`var(${textStyleVarName("title", "fontWeight")})`);
  });

  it("sets no textStyle vars when `textStyle` is not passed", () => {
    render(
      <InternalText size="md" defaultElement="div">
        Plain
      </InternalText>,
    );
    expect(screen.getByText("Plain").getAttribute("style") ?? "").not.toContain("--textStyle-");
  });

  it("lets an explicit `font` win over the textStyle family (spread last)", () => {
    render(
      <InternalText defaultElement="div" textStyle="title" font="mono">
        Override
      </InternalText>,
    );
    const style = screen.getByText("Override").getAttribute("style") ?? "";
    // `font` sets the same `--textFont` var after the bundle, so the family points
    // at the built-in, not the style's `fontFamily`.
    expect(style).toContain(`var(${fontVarName("mono")})`);
    expect(style).not.toContain(textStyleVarName("title", "fontFamily"));
  });

  it("emits the size variant class when `size` is passed alongside `textStyle`", () => {
    render(
      <InternalText defaultElement="div" textStyle="title" size="lg">
        Nudged
      </InternalText>,
    );
    // The explicit `size` still emits its class, which wins over the bundle's
    // font-size (later in the cascade, as a real property).
    expect(screen.getByText("Nudged").className).toContain(textSizeRecipe({ size: "lg" }));
  });

  it("forwards arbitrary html attributes", () => {
    render(
      <InternalText size="md" defaultElement="div" data-testid="node" aria-label="hi">
        X
      </InternalText>,
    );
    expect(screen.getByTestId("node")).toHaveAttribute("aria-label", "hi");
  });

  it("renders as an arbitrary element via the render prop", () => {
    render(
      <InternalText size="md" defaultElement="div" render={<em />}>
        Emphasis
      </InternalText>,
    );
    expect(screen.getByText("Emphasis").tagName).toBe("EM");
  });
});
