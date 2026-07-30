import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { textSizeRecipe, typographyWeight } from "../../../styles/recipes/text.css";
import { fontVarName } from "../../../theme/fonts";
import { letterSpacingVarName } from "../../../theme/letterSpacings";
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

  it("points the --textLetterSpacing var at the named value when `letterSpacing` is set", () => {
    render(
      <InternalText size="md" defaultElement="div" letterSpacing="eyebrow">
        Tracked
      </InternalText>,
    );
    expect(screen.getByText("Tracked").getAttribute("style")).toContain(
      `var(${letterSpacingVarName("eyebrow")})`,
    );
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
