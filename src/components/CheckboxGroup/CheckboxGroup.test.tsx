import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { DistributiveOmit } from "../../utils/types";
import { CheckboxGroup } from "./index";

type Topic = "product" | "billing" | "security";

// A tiny controlled host mirroring the documented usage, so the type-safe
// render-prop pattern is exercised exactly as a consumer would write it.
function Subscriptions({
  value: initial = [],
  onChange,
  ...rest
}: {
  value?: Topic[];
  onChange?: (value: Topic[]) => void;
} & Partial<
  DistributiveOmit<
    React.ComponentProps<typeof CheckboxGroup<Topic>>,
    "label" | "aria-label" | "aria-labelledby" | "value" | "onChange" | "children"
  >
>) {
  const [value, setValue] = React.useState<Topic[]>(initial);
  return (
    <CheckboxGroup
      label="Email me about"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    >
      {({ CheckboxGroupItem }) => (
        <>
          <CheckboxGroupItem value="product" />
          <CheckboxGroupItem value="billing" />
          <CheckboxGroupItem value="security" />
        </>
      )}
    </CheckboxGroup>
  );
}

describe("CheckboxGroup", () => {
  it("renders one checkbox per item inside a group named by the label", () => {
    render(<Subscriptions />);
    expect(screen.getByRole("group", { name: "Email me about" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "product" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "billing" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "security" })).toBeInTheDocument();
  });

  it("reflects the controlled selection as checked", () => {
    render(<Subscriptions value={["billing"]} />);
    expect(screen.getByRole("checkbox", { name: "billing" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "product" })).not.toBeChecked();
  });

  it("adds a value to the selection when an unchecked option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscriptions value={["product"]} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "billing" }));

    expect(onChange).toHaveBeenCalledWith(["product", "billing"]);
    expect(screen.getByRole("checkbox", { name: "billing" })).toBeChecked();
  });

  it("removes a value from the selection when a checked option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscriptions value={["product", "billing"]} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "product" }));

    expect(onChange).toHaveBeenCalledWith(["billing"]);
    expect(screen.getByRole("checkbox", { name: "product" })).not.toBeChecked();
  });

  it("toggles multiple options independently", async () => {
    const user = userEvent.setup();
    render(<Subscriptions />);

    await user.click(screen.getByRole("checkbox", { name: "product" }));
    await user.click(screen.getByRole("checkbox", { name: "security" }));

    expect(screen.getByRole("checkbox", { name: "product" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "billing" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "security" })).toBeChecked();
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscriptions onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("checkbox", { name: "product" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(["product"]);
  });

  it("renders children as the label, overriding the default", () => {
    render(
      <CheckboxGroup<Topic> label="Email me about" value={[]} onChange={() => {}}>
        {({ CheckboxGroupItem }) => (
          <CheckboxGroupItem value="product">Product updates</CheckboxGroupItem>
        )}
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Product updates" })).toBeInTheDocument();
  });

  it("does not change selection when the group is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Subscriptions value={["product"]} disabled onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "billing" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "billing" })).not.toBeChecked();
  });

  it("keeps every box tabbable when the group is disabled (aria-disabled, not the attribute)", async () => {
    const user = userEvent.setup();
    render(<Subscriptions value={["product"]} disabled />);
    const product = screen.getByRole("checkbox", { name: "product" });

    expect(product).toHaveAttribute("aria-disabled", "true");
    expect(product).not.toBeDisabled();

    // No roving focus here — each box is its own tab stop, even disabled.
    await user.tab();
    expect(product).toHaveFocus();
  });

  it("disables a single item without disabling the group", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroup<Topic> label="Email me about" value={[]} onChange={onChange}>
        {({ CheckboxGroupItem }) => (
          <>
            <CheckboxGroupItem value="product" disabled />
            <CheckboxGroupItem value="billing" />
          </>
        )}
      </CheckboxGroup>,
    );

    const product = screen.getByRole("checkbox", { name: "product" });
    // The disabled item stays focusable so it can be tabbed to and inspected.
    expect(product).toHaveAttribute("aria-disabled", "true");
    expect(product).not.toBeDisabled();
    await user.tab();
    expect(product).toHaveFocus();

    await user.click(product);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("checkbox", { name: "billing" }));
    expect(onChange).toHaveBeenCalledWith(["billing"]);
  });

  it("renders the helpText as an error when invalid", () => {
    render(<Subscriptions state="invalid" helpText="Pick at least one topic" />);
    const line = screen.getByText("Pick at least one topic");
    expect(line).toBeInTheDocument();
    expect(line.querySelector("svg")).not.toBeNull();
  });

  // The group is a bare `<div role="group">`, so base-ui's field context can't
  // reach it — its help / error text used to render but point at nothing.
  describe("aria-describedby", () => {
    /** Resolve the group's `aria-describedby` to the text it announces. */
    const describedByText = (el: HTMLElement) =>
      (el.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? `<missing:${id}>`);

    it("wires helpText to the group", () => {
      render(<Subscriptions helpText="Pick any that apply" />);
      expect(describedByText(screen.getByRole("group"))).toEqual(["Pick any that apply"]);
    });

    it("keeps helpText wired when the state turns invalid", () => {
      render(<Subscriptions helpText="Pick any that apply" state="invalid" />);
      // The one line stays in `aria-describedby` across states — it changes
      // colour, it doesn't leave and re-enter the description.
      expect(describedByText(screen.getByRole("group"))).toEqual(["Pick any that apply"]);
    });

    it("combines helpText with a caller's aria-describedby rather than replacing it", () => {
      render(
        <>
          <span id="ext">From elsewhere</span>
          <Subscriptions helpText="Pick any that apply" aria-describedby="ext" />
        </>,
      );
      expect(describedByText(screen.getByRole("group"))).toEqual([
        "From elsewhere",
        "Pick any that apply",
      ]);
    });
  });

  it("works with a numeric enum, not just strings", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    enum Day {
      Mon = 0,
      Tue = 1,
    }
    render(
      <CheckboxGroup<Day> label="Days" value={[Day.Mon]} onChange={onChange}>
        {({ CheckboxGroupItem }) => (
          <>
            <CheckboxGroupItem value={Day.Mon}>Monday</CheckboxGroupItem>
            <CheckboxGroupItem value={Day.Tue}>Tuesday</CheckboxGroupItem>
          </>
        )}
      </CheckboxGroup>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Tuesday" }));
    expect(onChange).toHaveBeenCalledWith([Day.Mon, Day.Tue]);
  });
});
