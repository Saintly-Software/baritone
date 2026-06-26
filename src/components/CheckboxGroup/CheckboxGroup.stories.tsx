import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import { CheckboxGroup } from "./index";

type Topic = "product" | "billing" | "security";

// CheckboxGroup is controlled, so the stories drive it from local state — the
// same shape a consumer would use.
function Subscriptions(
  props: Omit<React.ComponentProps<typeof CheckboxGroup<Topic>>, "value" | "onChange" | "children">,
) {
  const [value, setValue] = React.useState<Topic[]>(["product"]);
  return (
    <CheckboxGroup value={value} onChange={setValue} {...props}>
      {({ CheckboxGroupItem }) => (
        <>
          <CheckboxGroupItem value="product">Product updates</CheckboxGroupItem>
          <CheckboxGroupItem value="billing">Billing &amp; receipts</CheckboxGroupItem>
          <CheckboxGroupItem value="security">Security alerts</CheckboxGroupItem>
        </>
      )}
    </CheckboxGroup>
  );
}

const meta: Meta<typeof Subscriptions> = {
  title: "Form Controls/CheckboxGroup",
  component: Subscriptions,
  args: {
    label: "Email me about",
    state: "neutral",
    size: "md",
    orientation: "vertical",
  },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
    size: { control: "select", options: SIZES },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Subscriptions>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {SIZES.map((size) => (
        <Subscriptions key={size} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {FORM_STATES.map((state) => (
        <Subscriptions
          key={state}
          label={`State: ${state}`}
          state={state}
          description={state === "warning" ? "Double-check these choices." : undefined}
          errorMessage={state === "invalid" ? "Pick at least one topic." : undefined}
        />
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    label: "Email me about",
    orientation: "horizontal",
  },
};

export const Disabled: Story = {
  args: {
    label: "Email me about (disabled)",
    disabled: true,
    description: "The whole group is locked.",
  },
};

export const WithDescription: Story = {
  args: {
    label: "Email me about",
    description: "Pick any topics you'd like to hear about.",
  },
};
