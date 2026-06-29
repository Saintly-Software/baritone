import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./index";

type Section = "shipping" | "returns" | "warranty";

const ITEMS = [
  {
    value: "shipping",
    header: <Accordion.ItemHeader title="Shipping" subtitle="2–4 business days" />,
    children: <p>We ship worldwide.</p>,
  },
  {
    value: "returns",
    header: <Accordion.ItemHeader title="Returns" />,
    children: <p>30-day returns.</p>,
  },
  {
    value: "warranty",
    header: <Accordion.ItemHeader title="Warranty" />,
    children: <p>One-year warranty.</p>,
  },
] as const;

// Controlled single-open host mirroring the documented usage.
function SingleFAQ({
  onChange,
  disabled,
  initialOpen = null,
}: {
  onChange?: (value: Section | null) => void;
  disabled?: boolean;
  initialOpen?: Section | null;
}) {
  const [value, setValue] = React.useState<Section | null>(initialOpen);
  return (
    <Accordion
      aria-label="FAQ"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      disabled={disabled}
      items={ITEMS}
    />
  );
}

// Controlled multi-open host.
function MultiFAQ({
  onChange,
  initialOpen = [],
}: {
  onChange?: (value: Section[]) => void;
  initialOpen?: Section[];
}) {
  const [value, setValue] = React.useState<Section[]>(initialOpen);
  return (
    <Accordion
      aria-label="FAQ"
      multiple
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      items={ITEMS}
    />
  );
}

describe("Accordion", () => {
  it("renders a labelled trigger per item, the title as its accessible name", () => {
    render(<SingleFAQ />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /Shipping/ })).toBeInTheDocument();
    // The subtitle renders alongside the title in the trigger.
    expect(screen.getByText("2–4 business days")).toBeInTheDocument();
  });

  it("renders a header's leading icon and trailing chip inside the trigger", () => {
    render(
      <Accordion
        aria-label="Environments"
        initialValue="production"
        items={[
          {
            value: "production",
            header: (
              <Accordion.ItemHeader
                title="Production"
                icon={<span data-testid="icon">★</span>}
                chip={<span data-testid="chip">Healthy</span>}
              />
            ),
            children: <p>All systems operational.</p>,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Production/ });
    // Both adornments live inside the trigger button alongside the title.
    expect(trigger).toContainElement(screen.getByTestId("icon"));
    expect(trigger).toContainElement(screen.getByTestId("chip"));
    // The chip text folds into the trigger's accessible name.
    expect(trigger).toHaveAccessibleName(/Production.*Healthy/s);
  });

  it("starts collapsed and opens the clicked item, calling onChange with its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleFAQ onChange={onChange} />);

    const shipping = screen.getByRole("button", { name: /Shipping/ });
    expect(shipping).toHaveAttribute("aria-expanded", "false");

    await user.click(shipping);

    expect(onChange).toHaveBeenCalledWith("shipping");
    expect(shipping).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("We ship worldwide.")).toBeInTheDocument();
  });

  it("single mode: opening an item closes the previously open one", async () => {
    const user = userEvent.setup();
    render(<SingleFAQ initialOpen="shipping" />);

    const shipping = screen.getByRole("button", { name: /Shipping/ });
    const returns = screen.getByRole("button", { name: /Returns/ });
    expect(shipping).toHaveAttribute("aria-expanded", "true");

    await user.click(returns);

    expect(returns).toHaveAttribute("aria-expanded", "true");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
  });

  it("single mode: clicking the open item closes it, emitting null", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleFAQ initialOpen="shipping" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Shipping/ }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("multiple mode: keeps several items open at once and emits an array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiFAQ onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Shipping/ }));
    expect(onChange).toHaveBeenLastCalledWith(["shipping"]);

    await user.click(screen.getByRole("button", { name: /Returns/ }));
    expect(onChange).toHaveBeenLastCalledWith(["shipping", "returns"]);

    // Both stay open.
    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: /Returns/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("manages its own state when uncontrolled, seeded by initialValue", async () => {
    const user = userEvent.setup();
    render(<Accordion aria-label="FAQ" initialValue="shipping" items={ITEMS} />);

    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /Returns/ }));
    // Single-open: opening Returns closes Shipping, with no external state.
    expect(screen.getByRole("button", { name: /Returns/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("does not toggle anything when the whole group is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleFAQ disabled onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Shipping/ }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("marks a disabled group with aria-disabled and keeps its triggers tabbable", async () => {
    const user = userEvent.setup();
    render(<SingleFAQ disabled />);

    const shipping = screen.getByRole("button", { name: /Shipping/ });
    // The triggers carry the disabled semantics...
    expect(shipping).toHaveAttribute("aria-disabled", "true");
    // ...but never the native attribute that would drop them from the tab order.
    expect(shipping).not.toBeDisabled();

    await user.tab();
    expect(shipping).toHaveFocus();
  });

  it("disables a single item without disabling the rest", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Accordion
        aria-label="FAQ"
        value={null}
        onChange={onChange}
        items={[
          {
            value: "shipping",
            header: <Accordion.ItemHeader title="Shipping" />,
            children: <p>We ship worldwide.</p>,
          },
          {
            value: "warranty",
            header: <Accordion.ItemHeader title="Warranty" />,
            children: <p>One-year warranty.</p>,
            disabled: true,
          },
        ]}
      />,
    );

    const warranty = screen.getByRole("button", { name: /Warranty/ });
    // aria-disabled, so it stays focusable/reachable rather than being skipped.
    expect(warranty).toHaveAttribute("aria-disabled", "true");
    expect(warranty).not.toBeDisabled();
    warranty.focus();
    expect(warranty).toHaveFocus();

    await user.click(warranty);
    expect(onChange).not.toHaveBeenCalled();
    expect(warranty).toHaveAttribute("aria-expanded", "false");

    // A sibling still toggles normally.
    await user.click(screen.getByRole("button", { name: /Shipping/ }));
    expect(onChange).toHaveBeenCalledWith("shipping");
  });

  it("works with a numeric enum, not just strings", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    enum Step {
      One = 0,
      Two = 1,
    }
    render(
      <Accordion
        aria-label="Steps"
        value={null}
        onChange={onChange}
        items={[
          {
            value: Step.One,
            header: <Accordion.ItemHeader title="One" />,
            children: <p>First step.</p>,
          },
          {
            value: Step.Two,
            header: <Accordion.ItemHeader title="Two" />,
            children: <p>Second step.</p>,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Two/ }));
    expect(onChange).toHaveBeenCalledWith(Step.Two);
  });
});
