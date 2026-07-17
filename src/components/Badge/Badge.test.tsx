import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import { Badge } from "./index";

const classesOf = (element: Element) => element.className.split(/\s+/);

/**
 * The classes that mark each `interactive` variant, diffed out of the recipe
 * itself rather than hardcoded — the hashes move whenever the recipe does. The
 * `control` variant hovers/actives unconditionally; `auto` defers to the
 * rendered element.
 */
const variantMarkers = (variant: "control" | "auto") => {
  const other = variant === "control" ? "auto" : "control";
  const mine = componentIntentRecipe({ interactive: variant }).split(/\s+/);
  const theirs = componentIntentRecipe({ interactive: other }).split(/\s+/);
  return mine.filter((cls) => !theirs.includes(cls));
};

describe("Badge", () => {
  it("renders as a span by default", () => {
    render(<Badge data-testid="badge" count={3} />);
    expect(screen.getByTestId("badge").tagName).toBe("SPAN");
  });

  it("passes through className", () => {
    render(<Badge data-testid="badge" className="extra" count={1} />);
    expect(screen.getByTestId("badge").className).toContain("extra");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(<Badge render={<a href="/x" className="mine" />} count={2} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/x");
    expect(link.className).toContain("mine");
    expect(link).toHaveTextContent("2");
  });

  // A badge is an indicator, not a hit target, so it must not take the shared
  // recipe's control affordances — a hover/active background on a static span
  // advertises a click it can't perform. jsdom applies no stylesheet, so these
  // assert the variant carried on the element; the hover colours themselves are
  // verified against real computed styles in the browser.
  describe("affordances", () => {
    it("does not take a control's hover background", () => {
      render(<Badge data-testid="badge" text="NEW" />);
      const classes = classesOf(screen.getByTestId("badge"));
      for (const marker of variantMarkers("control")) {
        expect(classes).not.toContain(marker);
      }
    });

    it("resolves its affordances from the rendered element", () => {
      // `auto` is what keeps a badge that `render`s as a link lighting up while
      // the default span stays inert, so both kinds carry it.
      render(
        <>
          <Badge data-testid="span" text="NEW" />
          <Badge data-testid="link" text="NEW" render={<a href="/releases" />} />
        </>,
      );
      const markers = variantMarkers("auto");
      expect(markers.length).toBeGreaterThan(0);
      for (const marker of markers) {
        expect(classesOf(screen.getByTestId("span"))).toContain(marker);
        expect(classesOf(screen.getByTestId("link"))).toContain(marker);
      }
    });
  });

  describe("count", () => {
    it("renders the numeric count", () => {
      render(<Badge data-testid="badge" count={7} />);
      expect(screen.getByTestId("badge")).toHaveTextContent("7");
    });

    it("renders a zero count (not treated as empty)", () => {
      render(<Badge data-testid="badge" count={0} />);
      expect(screen.getByTestId("badge")).toHaveTextContent("0");
    });

    describe("max", () => {
      it("renders `{max}+` when the count exceeds max", () => {
        render(<Badge data-testid="badge" count={100} max={99} />);
        expect(screen.getByTestId("badge")).toHaveTextContent("99+");
      });

      it("renders the raw count when it is at or below max", () => {
        render(
          <>
            <Badge data-testid="at" count={99} max={99} />
            <Badge data-testid="below" count={12} max={99} />
          </>,
        );
        expect(screen.getByTestId("at")).toHaveTextContent("99");
        expect(screen.getByTestId("at")).not.toHaveTextContent("+");
        expect(screen.getByTestId("below")).toHaveTextContent("12");
      });

      it("renders the raw count when no max is given, however large", () => {
        render(<Badge data-testid="badge" count={100000} />);
        expect(screen.getByTestId("badge")).toHaveTextContent("100000");
      });
    });
  });

  describe("text", () => {
    it("renders the text content", () => {
      render(<Badge data-testid="badge" text="NEW" />);
      expect(screen.getByTestId("badge")).toHaveTextContent("NEW");
    });
  });

  describe("icon", () => {
    it("renders the given icon", () => {
      render(<Badge data-testid="badge" icon={<svg data-testid="glyph" />} />);
      const badge = screen.getByTestId("badge");
      expect(badge).toContainElement(screen.getByTestId("glyph"));
    });
  });

  describe("blank", () => {
    it("renders no content when no icon/count/text is supplied", () => {
      render(<Badge data-testid="badge" />);
      expect(screen.getByTestId("badge")).toBeEmptyDOMElement();
    });

    it("applies a distinct class from a content-bearing badge of the same size", () => {
      render(
        <>
          <Badge data-testid="blank" size="md" />
          <Badge data-testid="count" size="md" count={1} />
        </>,
      );
      const blank = screen.getByTestId("blank");
      const count = screen.getByTestId("count");
      // The blank variant adds a class the content-bearing badge does not carry.
      const extra = blank.className
        .split(/\s+/)
        .filter((cls) => !count.className.split(/\s+/).includes(cls));
      expect(extra.length).toBeGreaterThan(0);
    });
  });

  describe("shape", () => {
    it("applies a distinct class for square vs round of the same kind", () => {
      render(
        <>
          <Badge data-testid="round" count={1} shape="round" />
          <Badge data-testid="square" count={1} shape="square" />
        </>,
      );
      const round = screen.getByTestId("round").className.split(/\s+/);
      const square = screen.getByTestId("square").className.split(/\s+/);
      const extra = square.filter((cls) => !round.includes(cls));
      expect(extra.length).toBeGreaterThan(0);
    });

    it("squares the content-less blank kind too", () => {
      // The shape axis is orthogonal to content, so a blank badge squares just
      // like the content-bearing kinds.
      render(
        <>
          <Badge data-testid="round-blank" shape="round" />
          <Badge data-testid="square-blank" shape="square" />
        </>,
      );
      const round = screen.getByTestId("round-blank").className.split(/\s+/);
      const square = screen.getByTestId("square-blank").className.split(/\s+/);
      expect(square.some((cls) => !round.includes(cls))).toBe(true);
    });
  });
});
