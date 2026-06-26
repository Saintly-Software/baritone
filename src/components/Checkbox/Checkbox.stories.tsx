import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SIZES } from "../../theme/constants";
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
    disabled: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    size: { control: "select", options: SIZES },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    invalid: { control: "boolean" },
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

/** Invalid pulls the negative accent onto the box and wires `aria-invalid`. */
export const Invalid: Story = {
  args: {
    label: "I accept the terms",
    required: true,
    invalid: true,
  },
};
