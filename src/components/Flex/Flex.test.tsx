import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flex } from "./index";

describe("Flex", () => {
  it("renders a div by default and lays out its children", () => {
    render(
      <Flex data-testid="flex">
        <span>one</span>
        <span>two</span>
      </Flex>,
    );
    const el = screen.getByTestId("flex");
    expect(el.tagName).toBe("DIV");
    expect(el.className.length).toBeGreaterThan(0);
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("can render as a different element via the render prop", () => {
    render(
      <Flex render={<ul />} data-testid="flex">
        <li>item</li>
      </Flex>,
    );
    expect(screen.getByTestId("flex").tagName).toBe("UL");
  });

  it("merges a consumer className with the atoms classes", () => {
    render(
      <Flex className="extra" data-testid="flex">
        child
      </Flex>,
    );
    expect(screen.getByTestId("flex").className).toContain("extra");
  });

  it("maps friendly align values to distinct classes", () => {
    const { rerender } = render(
      <Flex align="center" data-testid="flex">
        x
      </Flex>,
    );
    const center = screen.getByTestId("flex").className;
    rerender(
      <Flex align="end" data-testid="flex">
        x
      </Flex>,
    );
    expect(screen.getByTestId("flex").className).not.toBe(center);
  });

  it("applies a class for each layout knob", () => {
    const { rerender } = render(<Flex data-testid="flex">x</Flex>);
    const base = screen.getByTestId("flex").className;
    for (const props of [
      { inline: true },
      { direction: "row" as const },
      { direction: "column" as const },
      { wrap: true },
      { gap: "4" as const },
      { justify: "between" as const },
      { p: "2" as const },
      { mx: "auto" as const },
    ]) {
      rerender(
        <Flex data-testid="flex" {...props}>
          x
        </Flex>,
      );
      expect(screen.getByTestId("flex").className).not.toBe(base);
    }
  });
});
