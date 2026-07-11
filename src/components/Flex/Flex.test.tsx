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
      { grow: true },
      { gap: "4" as const },
      { justify: "between" as const },
      { width: "fill" as const },
      { height: "8" as const },
      { maxWidth: "12" as const },
      { minHeight: "full" as const },
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

  it("maps the width shorthand to distinct classes (fill vs fit vs inherit)", () => {
    const { rerender } = render(
      <Flex width="fill" data-testid="flex">
        x
      </Flex>,
    );
    const fill = screen.getByTestId("flex").className;
    rerender(
      <Flex width="fit" data-testid="flex">
        x
      </Flex>,
    );
    const fit = screen.getByTestId("flex").className;
    rerender(
      <Flex width="inherit" data-testid="flex">
        x
      </Flex>,
    );
    const inherit = screen.getByTestId("flex").className;
    expect(new Set([fill, fit, inherit]).size).toBe(3);
  });

  it("distinguishes grow true and false", () => {
    const { rerender } = render(
      <Flex grow data-testid="flex">
        x
      </Flex>,
    );
    const growTrue = screen.getByTestId("flex").className;
    rerender(
      <Flex grow={false} data-testid="flex">
        x
      </Flex>,
    );
    expect(screen.getByTestId("flex").className).not.toBe(growTrue);
  });

  it("applies responsive visibility classes for hideOn / showOn", () => {
    const { rerender } = render(<Flex data-testid="flex">x</Flex>);
    const base = screen.getByTestId("flex").className;
    rerender(
      <Flex hideOn="md" data-testid="flex">
        x
      </Flex>,
    );
    const hidden = screen.getByTestId("flex").className;
    expect(hidden).not.toBe(base);
    rerender(
      <Flex showOn={["mobile", "sm"]} data-testid="flex">
        x
      </Flex>,
    );
    expect(screen.getByTestId("flex").className).not.toBe(hidden);
  });
});

describe("Flex.Item", () => {
  it("renders a div by default with its children", () => {
    render(<Flex.Item data-testid="item">child</Flex.Item>);
    const el = screen.getByTestId("item");
    expect(el.tagName).toBe("DIV");
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("can render as a different element via the render prop", () => {
    render(
      <Flex.Item render={<li />} data-testid="item">
        item
      </Flex.Item>,
    );
    expect(screen.getByTestId("item").tagName).toBe("LI");
  });

  it("merges a consumer className with the atoms classes", () => {
    render(
      <Flex.Item grow className="extra" data-testid="item">
        x
      </Flex.Item>,
    );
    expect(screen.getByTestId("item").className).toContain("extra");
  });

  it("maps alignSelf (and the align alias) to the same class", () => {
    const { rerender } = render(
      <Flex.Item alignSelf="center" data-testid="item">
        x
      </Flex.Item>,
    );
    const viaSelf = screen.getByTestId("item").className;
    rerender(
      <Flex.Item align="center" data-testid="item">
        x
      </Flex.Item>,
    );
    expect(screen.getByTestId("item").className).toBe(viaSelf);
  });

  it("lets alignSelf win over the align alias", () => {
    const { rerender } = render(
      <Flex.Item align="start" data-testid="item">
        x
      </Flex.Item>,
    );
    const startOnly = screen.getByTestId("item").className;
    rerender(
      <Flex.Item align="start" alignSelf="end" data-testid="item">
        x
      </Flex.Item>,
    );
    expect(screen.getByTestId("item").className).not.toBe(startOnly);
  });

  it("distinguishes grow/shrink true and false", () => {
    const { rerender } = render(
      <Flex.Item grow data-testid="item">
        x
      </Flex.Item>,
    );
    const growTrue = screen.getByTestId("item").className;
    rerender(
      <Flex.Item grow={false} data-testid="item">
        x
      </Flex.Item>,
    );
    expect(screen.getByTestId("item").className).not.toBe(growTrue);
  });

  it("applies a class for each layout knob", () => {
    const { rerender } = render(<Flex.Item data-testid="item">x</Flex.Item>);
    const base = screen.getByTestId("item").className;
    for (const props of [
      { grow: true },
      { shrink: false },
      { width: "full" as const },
      { height: "8" as const },
      { minWidth: "0" as const },
      { minHeight: "fit-content" as const },
      { p: "2" as const },
    ]) {
      rerender(
        <Flex.Item data-testid="item" {...props}>
          x
        </Flex.Item>,
      );
      expect(screen.getByTestId("item").className).not.toBe(base);
    }
  });
});
