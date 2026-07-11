import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./index";

const VIEWS = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
] as const;
type View = (typeof VIEWS)[number]["value"];

// A tiny controlled host mirroring the documented usage, so the type-safe
// value/onChange pair is exercised exactly as a consumer would write it.
function Sections({
  value: initial = "overview",
  onChange,
  disabled,
}: {
  value?: View;
  onChange?: (value: View) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<View>(initial);
  return (
    <Tabs
      aria-label="Sections"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      disabled={disabled}
      tabs={VIEWS}
    />
  );
}

describe("Tabs", () => {
  it("renders a named tablist with one tab per item", () => {
    render(<Sections />);
    expect(screen.getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
  });

  it("reflects the controlled value as the selected tab", () => {
    render(<Sections value="activity" />);
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with the selected value when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sections onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(onChange).toHaveBeenCalledWith("activity");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus with the arrows but only activates on Enter (activateOnFocus off)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sections value="overview" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("activity");
  });

  it("manages its own state when uncontrolled, seeded by initialValue", async () => {
    const user = userEvent.setup();
    render(<Tabs aria-label="Sections" initialValue="activity" tabs={VIEWS} />);

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: "Settings" }));
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
  });

  it("defaults the uncontrolled selection to the first enabled tab", () => {
    render(
      <Tabs
        aria-label="Sections"
        tabs={[
          { value: "overview", label: "Overview", disabled: true },
          { value: "activity", label: "Activity" },
        ]}
      />,
    );
    // The first tab is disabled, so the next enabled one starts selected.
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("does not change the value when the whole group is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sections value="overview" disabled onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("marks a disabled group with aria-disabled and keeps its tabs tabbable", async () => {
    const user = userEvent.setup();
    render(<Sections value="overview" disabled />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    // The tabs carry the disabled semantics...
    expect(overview).toHaveAttribute("aria-disabled", "true");
    // ...but never the native attribute that would drop them from the tab order.
    expect(overview).not.toBeDisabled();

    // Tab reaches the tablist, landing on the selected (roving) tab.
    await user.tab();
    expect(overview).toHaveFocus();
  });

  it("disables a single tab without disabling the rest", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs
        aria-label="Sections"
        value="overview"
        onChange={onChange}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "settings", label: "Settings", disabled: true },
        ]}
      />,
    );

    const settings = screen.getByRole("tab", { name: "Settings" });
    // aria-disabled, so it stays focusable/reachable rather than being skipped.
    expect(settings).toHaveAttribute("aria-disabled", "true");
    expect(settings).not.toBeDisabled();
    settings.focus();
    expect(settings).toHaveFocus();

    await user.click(settings);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("works with a numeric enum, not just strings", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    enum Step {
      One = 0,
      Two = 1,
    }
    render(
      <Tabs
        aria-label="Steps"
        value={Step.One}
        onChange={onChange}
        tabs={[
          { value: Step.One, label: "One" },
          { value: Step.Two, label: "Two" },
        ]}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(onChange).toHaveBeenCalledWith(Step.Two);
  });

  it("shows the active tab's panel and wires aria-controls/aria-labelledby", () => {
    render(
      <Tabs aria-label="Sections" initialValue="overview" tabs={VIEWS}>
        <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
        <Tabs.Panel value="settings">Settings panel</Tabs.Panel>
      </Tabs>,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel");

    // Only the active tab's panel is exposed; the wiring points both ways.
    expect(panel).toHaveTextContent("Overview panel");
    expect(overviewTab).toHaveAttribute("aria-controls", panel.getAttribute("id"));
    expect(panel).toHaveAttribute("aria-labelledby", overviewTab.getAttribute("id"));
  });

  it("swaps the visible panel when the selection changes", async () => {
    const user = userEvent.setup();
    render(
      <Tabs aria-label="Sections" initialValue="overview" tabs={VIEWS}>
        <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
      </Tabs>,
    );

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");

    await user.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });

  it("lazily mounts panels by default but keeps them mounted with keepMounted", async () => {
    const user = userEvent.setup();
    render(
      <Tabs aria-label="Sections" initialValue="overview" tabs={VIEWS}>
        <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="activity">
          <span data-testid="lazy">Activity panel</span>
        </Tabs.Panel>
        <Tabs.Panel value="settings" keepMounted>
          <span data-testid="kept">Settings panel</span>
        </Tabs.Panel>
      </Tabs>,
    );

    // Lazy panel isn't in the DOM until its tab is first activated...
    expect(screen.queryByTestId("lazy")).not.toBeInTheDocument();
    // ...but a keepMounted panel is present (just hidden) from the start.
    expect(screen.getByTestId("kept")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByTestId("lazy")).toBeInTheDocument();
  });

  it("renders lead and trail icons alongside the label", () => {
    render(
      <Tabs
        aria-label="Sections"
        initialValue="overview"
        tabs={[
          {
            value: "overview",
            label: "Overview",
            leadIcon: <span data-testid="lead">L</span>,
            trailIcon: <span data-testid="trail">T</span>,
          },
        ]}
      />,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Overview/ })).toBeInTheDocument();
  });
});
