import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SIZES } from "../../theme/constants";
import { Switch } from "./index";

// Switch is controlled, so the stories drive it from local state — the same
// shape a consumer would use.
function ControlledSwitch(props: Omit<React.ComponentProps<typeof Switch>, "value" | "onChange">) {
  const [value, setValue] = React.useState(false);
  return <Switch value={value} onChange={setValue} {...props} />;
}

const meta: Meta<typeof ControlledSwitch> = {
  title: "Form Controls/Switch",
  component: ControlledSwitch,
  args: {
    label: "Enable notifications",
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

type Story = StoryObj<typeof ControlledSwitch>;

export const Playground: Story = {};

/** Off, on, and disabled side by side. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Switch label="Off" value={false} onChange={() => {}} />
      <Switch label="On" value onChange={() => {}} />
      <Switch label="Disabled" value={false} disabled onChange={() => {}} />
      <Switch label="Disabled + on" value disabled onChange={() => {}} />
    </div>
  ),
};

/** `sm` / `md` / `lg`, each shown on. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <Switch key={size} label={`Size ${size}`} size={size} value onChange={() => {}} />
      ))}
    </div>
  ),
};

/** Invalid pulls the negative accent onto the track and wires `aria-invalid`. */
export const Invalid: Story = {
  args: {
    label: "Accept tracking",
    required: true,
    invalid: true,
  },
};
