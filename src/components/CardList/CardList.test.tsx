import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../Card";
import { CardList } from "./index";

describe("CardList", () => {
  it("renders a list with one listitem per card", () => {
    render(
      <CardList aria-label="People">
        <Card header="Ada" />
        <Card header="Alan" />
        <Card header="Grace" />
      </CardList>,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    // Each card is wrapped in an <li>.
    for (const item of items) {
      expect(item.tagName).toBe("LI");
    }
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("names the list from aria-label", () => {
    render(
      <CardList aria-label="Team members">
        <Card header="Ada" />
      </CardList>,
    );
    expect(screen.getByRole("list", { name: "Team members" })).toBeInTheDocument();
  });

  it("supports aria-labelledby instead", () => {
    render(
      <>
        <h2 id="lbl">Recent orders</h2>
        <CardList aria-labelledby="lbl">
          <Card header="Order #1" />
        </CardList>
      </>,
    );
    expect(screen.getByRole("list", { name: "Recent orders" })).toBeInTheDocument();
  });

  it("keeps explicit list / listitem roles even with the marker removed", () => {
    render(
      <CardList aria-label="Cards">
        <Card header="One" />
        <Card header="Two" />
      </CardList>,
    );
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveAttribute("role", "listitem");
    }
  });

  it("passes className and extra props through to the root", () => {
    render(
      <CardList aria-label="Cards" className="extra" data-testid="list">
        <Card header="One" />
      </CardList>,
    );
    const list = screen.getByTestId("list");
    expect(list.className).toContain("extra");
  });

  it("applies a distinct gap class per gap value", () => {
    const { rerender } = render(
      <CardList aria-label="Cards" data-testid="list">
        <Card header="One" />
      </CardList>,
    );
    const def = screen.getByTestId("list").className;
    rerender(
      <CardList aria-label="Cards" data-testid="list" gap="8">
        <Card header="One" />
      </CardList>,
    );
    expect(screen.getByTestId("list").className).not.toBe(def);
  });
});
