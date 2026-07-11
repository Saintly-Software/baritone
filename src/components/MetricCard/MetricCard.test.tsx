import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardList } from "../CardList";
import { MetricCard } from "./index";

// The accessible name is composed from separate value/label elements; the space
// between them is inserted by the accname algorithm (real browsers do, jsdom may
// not), so allow zero-or-more whitespace.
const namedByValueAndLabel = (value: string, label: string) => (name: string) =>
  name.includes(value) && name.includes(label);
const valueLabelName = /^2\s*Active goals$/;

describe("MetricCard", () => {
  it("renders the value, label and caption", () => {
    render(<MetricCard value={2} label="Active goals" caption="tasks completed" />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Active goals")).toBeInTheDocument();
    expect(screen.getByText("tasks completed")).toBeInTheDocument();
  });

  it("does not render the value as a heading (avoids bare-number outline noise)", () => {
    render(<MetricCard value={2} label="Active goals" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("is not a link or button when static", () => {
    render(<MetricCard value={2} label="Active goals" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("treats the icon as decorative (aria-hidden), out of the accessible name", () => {
    render(
      <MetricCard
        value={2}
        label="Active goals"
        href="/goals"
        icon={<svg data-testid="glyph" />}
      />,
    );
    const link = screen.getByRole("link");
    // The glyph is present but hidden, so it can't leak into the link's name.
    expect(within(link.parentElement as HTMLElement).queryByTestId("glyph")).not.toBeNull();
    expect(link.getAttribute("aria-label")).toBeNull();
    expect(link).toHaveAccessibleName(valueLabelName);
  });

  describe("clickable", () => {
    it("turns the value + label into a <button type=button> named by both, and fires onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<MetricCard value={2} label="Active goals" onClick={onClick} />);
      const button = screen.getByRole("button", {
        name: namedByValueAndLabel("2", "Active goals"),
      });
      expect(button).toHaveAttribute("type", "button");
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("uses aria-disabled (not native disabled), stays tabbable, and swallows the click", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<MetricCard value={2} label="Active goals" onClick={onClick} disabled />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      // Disabled but reachable: it can be tabbed to.
      await user.tab();
      expect(button).toHaveFocus();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("linkable", () => {
    it("turns the value + label into an <a> with href/target/rel, named by both", () => {
      render(
        <MetricCard
          value={2}
          label="Active goals"
          href="https://example.com"
          target="_blank"
          rel="noreferrer"
        />,
      );
      const link = screen.getByRole("link", { name: namedByValueAndLabel("2", "Active goals") });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("keeps the caption out of the control's accessible name", () => {
      render(<MetricCard value={2} label="Active goals" caption="tasks completed" href="/goals" />);
      const link = screen.getByRole("link");
      expect(link).not.toHaveTextContent("tasks completed");
      expect(link).toHaveAccessibleName(valueLabelName);
    });

    it("can render a router link via the render prop", () => {
      render(
        <MetricCard
          value={2}
          label="Active goals"
          href="/goals"
          render={<a className="router" />}
        />,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/goals");
      expect(link.className).toContain("router");
    });

    it("prevents navigation while disabled but stays focusable", async () => {
      const user = userEvent.setup();
      render(<MetricCard value={2} label="Active goals" href="/goals" disabled />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-disabled", "true");
      await user.tab();
      expect(link).toHaveFocus();
    });
  });

  describe("trend", () => {
    it("announces a text alternative, not the arrow glyph", () => {
      render(
        <MetricCard value="$1.2M" label="Revenue" trend={{ direction: "up", value: "12%" }} />,
      );
      // Exposed as one image named by the composed phrase.
      const badge = screen.getByRole("img", { name: "increased 12%" });
      expect(badge).toBeInTheDocument();
      // The decorative arrow carries no text of its own.
      expect(badge.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("composes the verb from the direction", () => {
      const { rerender } = render(
        <MetricCard value={4} label="Churn" trend={{ direction: "down", value: "3%" }} />,
      );
      expect(screen.getByRole("img", { name: "decreased 3%" })).toBeInTheDocument();
      rerender(<MetricCard value={4} label="Churn" trend={{ direction: "flat", value: "0%" }} />);
      expect(screen.getByRole("img", { name: "unchanged" })).toBeInTheDocument();
    });

    it("lets an explicit label override the composed phrase", () => {
      render(
        <MetricCard
          value={4}
          label="Churn"
          trend={{ direction: "down", value: "3%", label: "down 3% — good" }}
        />,
      );
      expect(screen.getByRole("img", { name: "down 3% — good" })).toBeInTheDocument();
    });

    it("stays out of an interactive card's control name", () => {
      render(
        <MetricCard
          value={2}
          label="Active goals"
          href="/goals"
          trend={{ direction: "up", value: "12%" }}
        />,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAccessibleName(valueLabelName);
      expect(link).not.toHaveTextContent("12%");
      // The trend is a sibling of the control, still announced separately.
      expect(screen.getByRole("img", { name: "increased 12%" })).toBeInTheDocument();
    });
  });

  it("overrides the accessible name with aria-label", () => {
    render(<MetricCard value={2} label="Active" href="/goals" aria-label="Active goals: 2" />);
    expect(screen.getByRole("link", { name: "Active goals: 2" })).toBeInTheDocument();
  });

  it("passes className and extra props through to the card root", () => {
    render(<MetricCard value={2} label="Active goals" className="extra" data-testid="tile" />);
    const tile = screen.getByTestId("tile");
    expect(tile.className).toContain("extra");
  });

  it("works as a named list of listitems inside a CardList", () => {
    render(
      <>
        <h2 id="goals-h">Goals</h2>
        <CardList aria-labelledby="goals-h">
          <MetricCard value={2} label="Active" href="/goals?status=active" />
          <MetricCard value={1} label="Paused" href="/goals?status=paused" />
        </CardList>
      </>,
    );
    const list = screen.getByRole("list", { name: "Goals" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    // Each metric is one navigable link within the named list.
    expect(within(list).getAllByRole("link")).toHaveLength(2);
  });
});
