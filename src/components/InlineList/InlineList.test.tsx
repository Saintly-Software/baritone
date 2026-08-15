import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineList } from "./index";

describe("InlineList", () => {
  it("renders a div by default with its children in order", () => {
    render(
      <InlineList data-testid="il">
        <span>one</span>
        <span>two</span>
        <span>three</span>
      </InlineList>,
    );
    const el = screen.getByTestId("il");
    expect(el.tagName).toBe("DIV");
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("three")).toBeInTheDocument();
  });

  it("puts a separator between each pair of items (n-1 total)", () => {
    render(
      <InlineList>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </InlineList>,
    );
    expect(screen.getAllByText("·")).toHaveLength(2);
  });

  it("renders no separator for a single item", () => {
    render(
      <InlineList>
        <span>only</span>
      </InlineList>,
    );
    expect(screen.queryByText("·")).toBeNull();
  });

  it("marks separators aria-hidden so they aren't announced", () => {
    render(
      <InlineList>
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
  });

  it("drops falsy children, so a conditional item leaves no stray separator", () => {
    const show = false;
    render(
      <InlineList>
        <span>a</span>
        {show && <span>hidden</span>}
        <span>b</span>
      </InlineList>,
    );
    expect(screen.queryByText("hidden")).toBeNull();
    // Two visible items → exactly one separator.
    expect(screen.getAllByText("·")).toHaveLength(1);
  });

  it("drops falsy leaves toArray keeps (0 and empty string), leaving no stray separator", () => {
    const count = 0;
    render(
      <InlineList>
        <span>a</span>
        {count && <span>never</span>}
        {""}
        <span>b</span>
      </InlineList>,
    );
    expect(screen.queryByText("never")).toBeNull();
    // Only the two real items survive → exactly one separator, and no bare "0".
    expect(screen.getAllByText("·")).toHaveLength(1);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("marks separators inert so an interactive delimiter can't take focus", () => {
    render(
      <InlineList separator={<button type="button">x</button>}>
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    const sep = screen.getByRole("button", { hidden: true }).parentElement;
    expect(sep).toHaveAttribute("inert");
    expect(sep).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts a custom separator node", () => {
    render(
      <InlineList separator="/">
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.queryByText("·")).toBeNull();
  });

  it("omits separators entirely when separator is null", () => {
    render(
      <InlineList separator={null}>
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    expect(screen.queryByText("·")).toBeNull();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("treats any falsy separator (empty string) like null — no separator span", () => {
    const { container } = render(
      <InlineList separator="">
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    // No stray empty spacer spans: the two items are the only element children.
    expect(container.querySelectorAll("span")).toHaveLength(2);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("renders nothing when every child is falsy (no empty box to carry margins)", () => {
    const show = false;
    const { container } = render(
      <InlineList mx="2" data-testid="il">
        {show && <span>never</span>}
        {null}
        {""}
      </InlineList>,
    );
    expect(screen.queryByTestId("il")).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("forwards the layout knobs (wrap / gap / align / margins) to the root", () => {
    const { rerender } = render(
      <InlineList data-testid="il">
        <span>x</span>
      </InlineList>,
    );
    const base = screen.getByTestId("il").className;
    for (const props of [
      { wrap: false },
      { gap: "4" as const },
      { align: "baseline" as const },
      { mx: "2" as const },
    ]) {
      rerender(
        <InlineList data-testid="il" {...props}>
          <span>x</span>
        </InlineList>,
      );
      expect(screen.getByTestId("il").className).not.toBe(base);
    }
  });

  it("can render as a different element via the render prop", () => {
    render(
      <InlineList render={<nav />} data-testid="il">
        <span>a</span>
        <span>b</span>
      </InlineList>,
    );
    expect(screen.getByTestId("il").tagName).toBe("NAV");
  });

  it("merges a consumer className with the layout classes", () => {
    render(
      <InlineList className="extra" data-testid="il">
        <span>a</span>
      </InlineList>,
    );
    expect(screen.getByTestId("il").className).toContain("extra");
  });
});
