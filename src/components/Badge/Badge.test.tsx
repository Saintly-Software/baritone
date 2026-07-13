import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  describe("square", () => {
    it("renders no content — a content-less swatch", () => {
      render(<Badge data-testid="badge" square />);
      expect(screen.getByTestId("badge")).toBeEmptyDOMElement();
    });

    it("applies a distinct class from both a dot and a content-bearing badge", () => {
      render(
        <>
          <Badge data-testid="square" size="md" square />
          <Badge data-testid="dot" size="md" />
          <Badge data-testid="count" size="md" count={1} />
        </>,
      );
      const classesOf = (id: string) => screen.getByTestId(id).className.split(/\s+/);
      const square = classesOf("square");
      const dot = classesOf("dot");
      const count = classesOf("count");
      // The square variant carries a class neither the dot nor the count badge has.
      const extra = square.filter((cls) => !dot.includes(cls) && !count.includes(cls));
      expect(extra.length).toBeGreaterThan(0);
    });
  });

  describe("dot", () => {
    it("renders no content when no icon/count/text is supplied", () => {
      render(<Badge data-testid="badge" />);
      expect(screen.getByTestId("badge")).toBeEmptyDOMElement();
    });

    it("applies a distinct class from a content-bearing badge of the same size", () => {
      render(
        <>
          <Badge data-testid="dot" size="md" />
          <Badge data-testid="count" size="md" count={1} />
        </>,
      );
      const dot = screen.getByTestId("dot");
      const count = screen.getByTestId("count");
      // The dot variant adds a class the content-bearing badge does not carry.
      const extra = dot.className
        .split(/\s+/)
        .filter((cls) => !count.className.split(/\s+/).includes(cls));
      expect(extra.length).toBeGreaterThan(0);
    });
  });
});
