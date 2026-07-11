import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import { Checkbox } from "./index";

// Checkbox is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ControlledCheckbox(
  props: Omit<React.ComponentProps<typeof Checkbox>, "value" | "onChange">,
) {
  const [value, setValue] = React.useState(false);
  return <Checkbox value={value} onChange={setValue} {...props} />;
}

const meta: Meta<typeof ControlledCheckbox> = {
  title: "Form Controls/Checkbox",
  component: ControlledCheckbox,
  args: {
    label: "Email me about product updates",
    size: "md",
    state: "neutral",
    disabled: false,
    required: false,
    indeterminate: false,
  },
  argTypes: {
    size: { control: "select", options: SIZES },
    state: { control: "select", options: FORM_STATES },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ControlledCheckbox>;

export const Playground: Story = {};

/** Unchecked, checked, and disabled side by side. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Checkbox label="Unchecked" value={false} onChange={() => {}} />
      <Checkbox label="Checked" value onChange={() => {}} />
      <Checkbox label="Disabled" value={false} disabled onChange={() => {}} />
      <Checkbox label="Disabled + checked" value disabled onChange={() => {}} />
    </div>
  ),
};

/** `sm` / `md` / `lg`, each shown checked. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <Checkbox key={size} label={`Size ${size}`} size={size} value onChange={() => {}} />
      ))}
    </div>
  ),
};

/** Invalid pulls the negative accent onto the box, wires `aria-invalid`, and
 * surfaces the `errorMessage` beneath. */
export const Invalid: Story = {
  args: {
    label: "I accept the terms",
    required: true,
    state: "invalid",
    errorMessage: "You must accept the terms to continue.",
  },
};

/**
 * `indeterminate` shows the "mixed" dash and reports `aria-checked="mixed"` —
 * the usual "select all" parent for a partly-selected set. Toggling it resolves
 * to a plain boolean.
 */
export const Indeterminate: Story = {
  render: () => {
    const options = ["Product updates", "Billing", "Security alerts"] as const;
    const [selected, setSelected] = React.useState<string[]>(["Billing"]);
    const allChecked = selected.length === options.length;
    const someChecked = selected.length > 0 && !allChecked;

    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Checkbox
          label="Select all"
          value={allChecked}
          indeterminate={someChecked}
          onChange={(next) => setSelected(next ? [...options] : [])}
        />
        <div style={{ display: "grid", gap: 8, paddingLeft: 24 }}>
          {options.map((option) => (
            <Checkbox
              key={option}
              label={option}
              value={selected.includes(option)}
              onChange={(next) =>
                setSelected((prev) => (next ? [...prev, option] : prev.filter((o) => o !== option)))
              }
            />
          ))}
        </div>
      </div>
    );
  },
};

/** Inline `helpText` beneath the box, wired as the control's `aria-describedby`. */
export const HelpText: Story = {
  args: {
    label: "Email me about product updates",
    helpText: "We send at most one email a week. Unsubscribe anytime.",
  },
};

/**
 * A label-less checkbox (e.g. a table row selector) still needs an accessible
 * name — supply one with `aria-label`.
 */
export const AriaLabel: Story = {
  render: () => {
    const [value, setValue] = React.useState(false);
    return <Checkbox aria-label="Select row" value={value} onChange={setValue} />;
  },
};
