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
import { textStyleVarName } from "../../theme/textStyles";
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

  it("applies the letterSpacing atom", () => {
    render(<Text letterSpacing="widest">Eyebrow</Text>);
    expect(screen.getByText("Eyebrow").className).toContain(atoms({ letterSpacing: "widest" }));
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

  it("still applies the md size class by default (no textStyle)", () => {
    // The recipe's `defaultVariants` was removed; the `md` default is reintroduced
    // at the component layer, so a bare `Text` keeps its md size class.
    render(<Text>Plain</Text>);
    expect(screen.getByText("Plain").className).toContain(textSizeRecipe({ size: "md" }));
  });

  it("suppresses the md default size class when `textStyle` is set", () => {
    // With a `textStyle`, `size` is left unset so the bundle owns the size (via the
    // recipe base fallback) — no size class is emitted.
    render(<Text textStyle="title">Titled</Text>);
    expect(screen.getByText("Titled").className).not.toContain(textSizeRecipe({ size: "md" }));
  });

  it("points the instance vars at the style when `textStyle` is set", () => {
    render(<Text textStyle="title">Titled</Text>);
    expect(screen.getByText("Titled").getAttribute("style") ?? "").toContain(
      `var(${textStyleVarName("title", "fontSize")})`,
    );
  });

  it("lets an explicit `size` override the textStyle (its class still emits)", () => {
    render(
      <Text textStyle="title" size="4xl">
        Nudged
      </Text>,
    );
    expect(screen.getByText("Nudged").className).toContain(textSizeRecipe({ size: "4xl" }));
  });
});
