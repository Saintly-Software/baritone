import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { componentIntentRecipe } from "../../styles/recipes/component.css";
import { badgeCustomColor } from "./badge.css";
import { Badge } from "./index";

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

  describe("color escape hatch", () => {
    it("sets the custom fill as an inline custom property", () => {
      render(<Badge data-testid="badge" text="NEW" color="#7c3aed" />);
      const badge = screen.getByTestId("badge");
      // The value is arbitrary, so it can't be a recipe variant — it rides in on
      // a custom property that the escape-hatch class reads.
      expect(badge.getAttribute("style")).toContain("#7c3aed");
      // …and never as the native `color` attribute.
      expect(badge).not.toHaveAttribute("color");
    });

    it("swaps the palette scheme out rather than layering over it", () => {
      render(<Badge data-testid="custom" text="NEW" color="#7c3aed" />);
      const custom = screen.getByTestId("custom").className.split(/\s+/);

      // Both schemes are single classes, so if both were applied the winner
      // would come down to stylesheet emission order rather than to intent.
      // The custom badge must carry the escape-hatch class and *none* of the
      // token recipe's.
      expect(custom).toContain(badgeCustomColor);
      const intentClasses = componentIntentRecipe({ intent: "primary", saliency: "high" }).split(
        /\s+/,
      );
      expect(custom.some((cls) => intentClasses.includes(cls))).toBe(false);
    });

    it("keeps the box identical to an intent badge of the same size and shape", () => {
      render(
        <>
          <Badge data-testid="intent" text="NEW" size="lg" shape="square" />
          <Badge data-testid="custom" text="NEW" size="lg" shape="square" color="#7c3aed" />
        </>,
      );
      // Only the colour scheme differs — the size/shape classes are shared.
      const intent = new Set(screen.getByTestId("intent").className.split(/\s+/));
      const custom = new Set(screen.getByTestId("custom").className.split(/\s+/));
      const shared = [...custom].filter((cls) => intent.has(cls));
      expect(shared.length).toBeGreaterThan(0);
    });

    it("leaves an intent badge free of the inline custom property", () => {
      render(<Badge data-testid="badge" text="NEW" intent="primary" />);
      expect(screen.getByTestId("badge").getAttribute("style")).toBeNull();
    });

    it("keeps the consumer's own style prop", () => {
      render(<Badge data-testid="badge" text="NEW" color="#7c3aed" style={{ marginLeft: 4 }} />);
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveStyle({ marginLeft: "4px" });
      expect(badge.getAttribute("style")).toContain("#7c3aed");
    });

    it("rejects color alongside intent/saliency", () => {
      // The hatch replaces the token scheme outright, so accepting both would
      // leave one silently doing nothing.
      // @ts-expect-error `color` and `intent` are mutually exclusive.
      render(<Badge text="A" color="#7c3aed" intent="primary" />);
      // @ts-expect-error `color` and `saliency` are mutually exclusive.
      render(<Badge text="B" color="#7c3aed" saliency="high" />);
      expect(screen.getAllByText("A").length).toBeGreaterThan(0);
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
