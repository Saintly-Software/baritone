import { render, screen, within } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { List } from "./index";

describe("List", () => {
  it("renders a <ul> with role=list and one listitem per item", () => {
    render(
      <List
        items={[
          <List.Item key="ada">Ada</List.Item>,
          <List.Item key="alan">Alan</List.Item>,
          <List.Item key="grace">Grace</List.Item>,
        ]}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.tagName).toBe("LI");
    }
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("renders an <ol> when ordered", () => {
    render(<List ordered items={[<List.Item key="one">Step one</List.Item>]} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("renders each item element, mapping a data array", () => {
    const people = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Alan" },
    ];
    render(
      <List
        items={people.map((p) => (
          <List.Item key={p.id}>{p.name}</List.Item>
        ))}
      />,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Alan")).toBeInTheDocument();
  });

  it("falls back to the index for an item without its own key", () => {
    // No `key` here — the list's positional fallback keeps both rows from colliding.
    render(<List items={[<List.Item>First</List.Item>, <List.Item>Second</List.Item>]} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2);
  });

  it("skips falsy entries so rows can be included conditionally inline", () => {
    const showSecond = false;
    render(
      <List
        items={[
          <List.Item key="a">First</List.Item>,
          showSecond && <List.Item key="b">Second</List.Item>,
          null,
        ]}
      />,
    );
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
  });

  it("applies grid-template-columns for a numeric grid columns count", () => {
    render(<List layout="grid" columns={3} items={[<List.Item key="a">A</List.Item>]} />);
    // Grid sets the template inline, so it's readable in jsdom.
    expect(screen.getByRole("list").style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("applies grid-template-rows for a numeric grid rows count", () => {
    render(<List layout="grid" rows={2} items={[<List.Item key="a">A</List.Item>]} />);
    expect(screen.getByRole("list").style.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("drops inactive flex props when layout=grid (retained Storybook controls)", () => {
    // A JS caller can keep flex controls after switching to grid (the
    // discriminated union can't stop that) — they must not reach the DOM.
    const props = {
      layout: "grid",
      columns: 2,
      direction: "row",
      align: "center",
      wrap: true,
      items: [<List.Item key="a">A</List.Item>],
    } as React.ComponentProps<typeof List>;
    render(<List {...props} />);
    const list = screen.getByRole("list");
    // Grid layout is intact; the stray flex props never leak onto the <ul>.
    expect(list.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
    expect(list.hasAttribute("direction")).toBe(false);
    expect(list.hasAttribute("wrap")).toBe(false);
  });

  it("drops inactive grid props when layout=flex", () => {
    const props = {
      layout: "flex",
      columns: 3,
      rows: 2,
      areas: ["a b"],
      items: [<List.Item key="a">A</List.Item>],
    } as React.ComponentProps<typeof List>;
    render(<List {...props} />);
    const list = screen.getByRole("list");
    expect(list.hasAttribute("columns")).toBe(false);
    expect(list.hasAttribute("rows")).toBe(false);
    expect(list.hasAttribute("areas")).toBe(false);
    // No grid template leaked into the flex list.
    expect(list.style.gridTemplateColumns).toBe("");
  });

  it("places an item in a named grid area via `area`", () => {
    render(
      <List
        layout="grid"
        areas={["header header", "nav main"]}
        items={[
          <List.Item key="main" area="main">
            Body
          </List.Item>,
        ]}
      />,
    );
    const item = screen.getByRole("listitem");
    expect(item.style.gridArea).toBe("main");
  });

  it("passes through arbitrary attributes (e.g. aria-label) to name the list", () => {
    render(<List aria-label="Recent orders" items={[<List.Item key="o1">Order 1</List.Item>]} />);
    expect(screen.getByRole("list", { name: "Recent orders" })).toBeInTheDocument();
  });

  it("merges a consumer className onto the list", () => {
    render(<List className="custom" items={[<List.Item key="x">x</List.Item>]} />);
    expect(screen.getByRole("list")).toHaveClass("custom");
  });
});
