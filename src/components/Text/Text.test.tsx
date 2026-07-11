import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { textTypographyRecipe } from "../../styles/recipes/text.css";
import { TEXT_WEIGHTS } from "../../theme/constants";
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

  it.each(TEXT_WEIGHTS)("applies the %s weight variant", (weight) => {
    render(<Text weight={weight}>Weighted</Text>);
    expect(screen.getByText("Weighted").className).toContain(textTypographyRecipe({ weight }));
  });

  it("applies the italic variant", () => {
    render(<Text italic>Slanted</Text>);
    expect(screen.getByText("Slanted").className).toContain(textTypographyRecipe({ italic: true }));
  });

  it("applies the align variant", () => {
    render(<Text align="center">Centred</Text>);
    expect(screen.getByText("Centred").className).toContain(
      textTypographyRecipe({ align: "center" }),
    );
  });

  it("applies the wrap variant", () => {
    render(<Text wrap="nowrap">Single line</Text>);
    expect(screen.getByText("Single line").className).toContain(
      textTypographyRecipe({ wrap: "nowrap" }),
    );
  });

  it("applies the wordBreak variant", () => {
    render(<Text wordBreak="break-word">Breakable</Text>);
    expect(screen.getByText("Breakable").className).toContain(
      textTypographyRecipe({ wordBreak: "break-word" }),
    );
  });

  it("omits a weight variant class when `weight` is not passed", () => {
    render(<Text>Plain</Text>);
    expect(screen.getByText("Plain").className).not.toContain(
      textTypographyRecipe({ weight: "bold" }),
    );
  });
});
