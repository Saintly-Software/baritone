import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fontSizeVarName, sizeLineHeightVarName } from "../../../theme/fontSizes";
import { fontVarName } from "../../../theme/fonts";
import { fontWeightVarName } from "../../../theme/fontWeights";
import { letterSpacingVarName } from "../../../theme/letterSpacings";
import { lineHeightVarName } from "../../../theme/lineHeights";
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

  it("points the --textSize var at the named size", () => {
    render(
      <InternalText size="2xl" defaultElement="div">
        Big
      </InternalText>,
    );
    expect(screen.getByText("Big").getAttribute("style")).toContain(
      `var(${fontSizeVarName("2xl")})`,
    );
  });

  it("defaults --textLineHeight to the size's paired leading", () => {
    render(
      <InternalText size="2xl" defaultElement="div">
        Big
      </InternalText>,
    );
    // With no `lineHeight`, the leading is the size's own `--sizeLineHeight-<size>`.
    expect(screen.getByText("Big").getAttribute("style")).toContain(
      `var(${sizeLineHeightVarName("2xl")})`,
    );
  });

  it("overrides the leading via --textLineHeight when `lineHeight` is set", () => {
    render(
      <InternalText size="md" defaultElement="div" lineHeight="loose">
        Airy
      </InternalText>,
    );
    expect(screen.getByText("Airy").getAttribute("style")).toContain(
      `var(${lineHeightVarName("loose")})`,
    );
  });

  it("points the --textWeight var at the named weight when `weight` is set", () => {
    render(
      <InternalText size="md" defaultElement="div" weight="bold">
        Bold
      </InternalText>,
    );
    expect(screen.getByText("Bold").getAttribute("style")).toContain(
      `var(${fontWeightVarName("bold")})`,
    );
  });

  it("sets no weight var when `weight` is not passed", () => {
    render(
      <InternalText size="md" defaultElement="div">
        Plain
      </InternalText>,
    );
    expect(screen.getByText("Plain").getAttribute("style") ?? "").not.toContain("--fontWeight-");
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
