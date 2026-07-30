import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  textSizeRecipe,
  typographyDecoration,
  typographyWeight,
} from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import { TEXT_WEIGHTS } from "../../theme/constants";
import { fontVarName } from "../../theme/fonts";
import { letterSpacingVarName } from "../../theme/letterSpacings";
import { Text } from "./index";

describe("Text", () => {
  it("renders body text in a div by default", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("DIV");
  });

  it("renders the tag named by the `as` shorthand", () => {
    render(<Text as="p">Para</Text>);
    expect(screen.getByText("Para").tagName).toBe("P");
  });

  it("can render as a label via `as`", () => {
    render(<Text as="label">Field</Text>);
    expect(screen.getByText("Field").tagName).toBe("LABEL");
  });

  it("can render as an arbitrary element via the render prop", () => {
    render(<Text render={<em />}>Emphasis</Text>);
    expect(screen.getByText("Emphasis").tagName).toBe("EM");
  });

  it("applies a generated recipe class", () => {
    render(<Text>Styled</Text>);
    expect(screen.getByText("Styled").className.length).toBeGreaterThan(0);
  });

  it.each(TEXT_WEIGHTS)("applies the %s weight recipe", (weight) => {
    render(<Text weight={weight}>Weighted</Text>);
    expect(screen.getByText("Weighted").className).toContain(typographyWeight({ weight }));
  });

  it("applies the italic decoration", () => {
    render(<Text italic>Slanted</Text>);
    expect(screen.getByText("Slanted").className).toContain(typographyDecoration({ italic: true }));
  });

  it("selects a consumer font family by name via the --textFont var", () => {
    render(<Text font="display">Fancy</Text>);
    expect(screen.getByText("Fancy").getAttribute("style")).toContain(
      `var(${fontVarName("display")})`,
    );
  });

  it("selects the built-in mono family via `font`", () => {
    render(<Text font="mono">Code</Text>);
    expect(screen.getByText("Code").getAttribute("style")).toContain(`var(${fontVarName("mono")})`);
  });

  it("sets no font var when `font` is not passed", () => {
    render(<Text>Plain</Text>);
    expect(screen.getByText("Plain").getAttribute("style") ?? "").not.toContain("--font-");
  });

  it("preserves a consumer `style` while injecting the font var", () => {
    render(
      <Text font="display" style={{ letterSpacing: "0.1em" }}>
        Both
      </Text>,
    );
    const style = screen.getByText("Both").getAttribute("style") ?? "";
    expect(style).toContain(`var(${fontVarName("display")})`);
    expect(style).toContain("letter-spacing");
  });

  it("applies the textAlign atom", () => {
    render(<Text textAlign="center">Centred</Text>);
    expect(screen.getByText("Centred").className).toContain(atoms({ textAlign: "center" }));
  });

  it("applies the whiteSpace atom", () => {
    render(<Text whiteSpace="nowrap">Single line</Text>);
    expect(screen.getByText("Single line").className).toContain(atoms({ whiteSpace: "nowrap" }));
  });

  it("applies the overflowWrap atom", () => {
    render(<Text overflowWrap="break-word">Breakable</Text>);
    expect(screen.getByText("Breakable").className).toContain(
      atoms({ overflowWrap: "break-word" }),
    );
  });

  it("applies the textTransform atom", () => {
    render(<Text textTransform="uppercase">Shout</Text>);
    expect(screen.getByText("Shout").className).toContain(atoms({ textTransform: "uppercase" }));
  });

  it("selects a built-in tracking step by name via the --textLetterSpacing var", () => {
    render(<Text letterSpacing="widest">Eyebrow</Text>);
    expect(screen.getByText("Eyebrow").getAttribute("style")).toContain(
      `var(${letterSpacingVarName("widest")})`,
    );
  });

  it("selects a consumer tracking value by name via the --textLetterSpacing var", () => {
    render(<Text letterSpacing="eyebrow">Label</Text>);
    expect(screen.getByText("Label").getAttribute("style")).toContain(
      `var(${letterSpacingVarName("eyebrow")})`,
    );
  });

  it("sets no tracking var when `letterSpacing` is not passed", () => {
    render(<Text>Plain</Text>);
    expect(screen.getByText("Plain").getAttribute("style") ?? "").not.toContain("--letterSpacing-");
  });

  it("applies the size recipe class", () => {
    render(<Text size="lg">Body</Text>);
    expect(screen.getByText("Body").className).toContain(textSizeRecipe({ size: "lg" }));
  });

  it("renders any size from the shared scale (same scale as Heading)", () => {
    // Text and Heading share the full scale; a large display size is valid on Text.
    render(<Text size="4xl">Display</Text>);
    expect(screen.getByText("Display").className).toContain(textSizeRecipe({ size: "4xl" }));
  });

  it("omits a weight class when `weight` is not passed", () => {
    render(<Text>Plain</Text>);
    expect(screen.getByText("Plain").className).not.toContain(typographyWeight({ weight: "bold" }));
  });
});
