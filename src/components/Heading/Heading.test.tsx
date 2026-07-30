import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { textSizeRecipe, typographyWeight } from "../../styles/recipes/text.css";
import { fontVarName } from "../../theme/fonts";
import { textStyleVarName } from "../../theme/textStyles";
import { Heading } from "./index";

describe("Heading", () => {
  it("renders the numeric semantic level as the matching h-tag", () => {
    render(<Heading level={2}>Title</Heading>);
    const heading = screen.getByRole("heading", { level: 2, name: "Title" });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("renders the requested semantic level", () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole("heading", { level: 1, name: "Big" })).toBeInTheDocument();
  });

  it("allows a visual size independent of the semantic level", () => {
    render(
      <Heading level={3} size="4xl">
        Small tag, big look
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 3 }).className).toContain(
      textSizeRecipe({ size: "4xl" }),
    );
  });

  it("supports any size from the shared scale (same scale as Text)", () => {
    // A Heading can render a small size like `xs` — Heading and Text share the
    // full size scale and differ only in semantics.
    render(
      <Heading level={2} size="xs">
        Tiny
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 }).className).toContain(
      textSizeRecipe({ size: "xs" }),
    );
  });

  it("applies the level's default weight, overridable via `weight`", () => {
    const { rerender } = render(
      <Heading level={2} data-testid="h">
        Default
      </Heading>,
    );
    // Weight is independent of size now; each level carries a customary default
    // (level 2 is bold), applied via the `typographyWeight` recipe.
    expect(screen.getByTestId("h").className).toContain(typographyWeight({ weight: "bold" }));
    rerender(
      <Heading level={2} data-testid="h" weight="superbold">
        Overridden
      </Heading>,
    );
    expect(screen.getByTestId("h").className).toContain(typographyWeight({ weight: "superbold" }));
  });

  it("suppresses the level's default size and weight when `textStyle` is set", () => {
    render(
      <Heading level={1} textStyle="title" data-testid="h">
        Titled
      </Heading>,
    );
    const className = screen.getByTestId("h").className;
    // Level 1 would default to `4xl` / `bold`; a `textStyle` owns both, so neither
    // level-default class is emitted (the bundle governs via the recipe fallback).
    expect(className).not.toContain(textSizeRecipe({ size: "4xl" }));
    expect(className).not.toContain(typographyWeight({ weight: "bold" }));
    // …and the instance vars point at the style.
    expect(screen.getByTestId("h").getAttribute("style") ?? "").toContain(
      `var(${textStyleVarName("title", "fontSize")})`,
    );
  });

  it("lets explicit `size`/`weight` override the textStyle on a heading", () => {
    render(
      <Heading level={1} textStyle="title" size="lg" weight="semibold" data-testid="h">
        Nudged
      </Heading>,
    );
    const className = screen.getByTestId("h").className;
    expect(className).toContain(textSizeRecipe({ size: "lg" }));
    expect(className).toContain(typographyWeight({ weight: "semibold" }));
  });

  it("selects a font family by name via the --textFont var", () => {
    render(
      <Heading level={2} font="display">
        Fancy
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 }).getAttribute("style")).toContain(
      `var(${fontVarName("display")})`,
    );
  });

  it("selects the built-in mono family via `font`", () => {
    render(
      <Heading level={2} font="mono">
        Code
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 }).getAttribute("style")).toContain(
      `var(${fontVarName("mono")})`,
    );
  });

  it("adds a class for each typographic knob passed", () => {
    const { rerender } = render(
      <Heading level={2} data-testid="h">
        Plain
      </Heading>,
    );
    // The plain heading already carries the level's default weight; `italic`,
    // `textAlign`, `whiteSpace`, and `letterSpacing` are each additive on top of it.
    const base = screen.getByTestId("h").className.split(" ").length;
    rerender(
      <Heading
        level={2}
        data-testid="h"
        italic
        textAlign="center"
        whiteSpace="nowrap"
        letterSpacing="wide"
      >
        Styled
      </Heading>,
    );
    const styled = screen.getByTestId("h").className.split(" ").length;
    expect(styled).toBe(base + 4);
  });
});
