import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List } from "./index";

describe("List", () => {
  it("renders a <ul> with role=list and one listitem per child", () => {
    render(
      <List>
        <List.Item>Ada</List.Item>
        <List.Item>Alan</List.Item>
        <List.Item>Grace</List.Item>
      </List>,
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
    render(
      <List ordered>
        <List.Item>Step one</List.Item>
      </List>,
    );
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("renders from an items array, keyed by id", () => {
    render(
      <List
        items={[
          { id: "a", children: "Ada" },
          { id: "b", children: "Alan" },
        ]}
      />,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Alan")).toBeInTheDocument();
  });

  it("lets the items array win over children", () => {
    render(
      <List items={[{ id: "a", children: "From items" }]}>
        <List.Item>From children</List.Item>
      </List>,
    );
    expect(screen.getByText("From items")).toBeInTheDocument();
    expect(screen.queryByText("From children")).not.toBeInTheDocument();
  });

  it("applies grid-template-columns for a numeric grid columns count", () => {
    render(
      <List layout="grid" columns={3}>
        <List.Item>A</List.Item>
      </List>,
    );
    // Grid sets the template inline, so it's readable in jsdom.
    expect(screen.getByRole("list").style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("applies grid-template-rows for a numeric grid rows count", () => {
    render(
      <List layout="grid" rows={2}>
        <List.Item>A</List.Item>
      </List>,
    );
    expect(screen.getByRole("list").style.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("places an item in a named grid area via `area`", () => {
    render(
      <List layout="grid" areas={["header header", "nav main"]}>
        <List.Item area="main">Body</List.Item>
      </List>,
    );
    const item = screen.getByRole("listitem");
    expect(item.style.gridArea).toBe("main");
  });

  it("passes through arbitrary attributes (e.g. aria-label) to name the list", () => {
    render(
      <List aria-label="Recent orders">
        <List.Item>Order 1</List.Item>
      </List>,
    );
    expect(screen.getByRole("list", { name: "Recent orders" })).toBeInTheDocument();
  });

  it("merges a consumer className onto the list", () => {
    render(
      <List className="custom">
        <List.Item>x</List.Item>
      </List>,
    );
    expect(screen.getByRole("list")).toHaveClass("custom");
  });
});
