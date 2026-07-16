import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import type { DistributiveOmit } from "../../utils/types";
import { CheckboxGroup } from "./index";

type Topic = "product" | "billing" | "security";

// CheckboxGroup is controlled, so the stories drive it from local state — the
// same shape a consumer would use.
// `DistributiveOmit` (not the built-in `Omit`) keeps the mutually-exclusive
// labelling arms apart — a plain `Omit` over a union collapses it into one
// object carrying every arm's keys at once.
function Subscriptions(
  props: DistributiveOmit<
    React.ComponentProps<typeof CheckboxGroup<Topic>>,
    "value" | "onChange" | "children"
  >,
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

// Interactive default — renamed from "Playground". Ships with a `description` so
// the default view shows the described-by wiring, folding in the old
// "WithDescription" story.
export const Basic: Story = {
  args: {
    helpText: "Pick any topics you'd like to hear about.",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {SIZES.map((size) => (
        <Subscriptions key={size} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

const thStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const cellStyle: CSSProperties = {
  padding: "16px 20px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "top",
};

/** Every validation state (rows) against the rendered group (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>CheckboxGroup</th>
        </tr>
      </thead>
      <tbody>
        {FORM_STATES.map((state) => (
          <tr key={state}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {state}
            </th>
            <td style={cellStyle}>
              <div style={{ maxWidth: 320 }}>
                <Subscriptions
                  label="Email me about"
                  state={state}
                  helpText={state === "warning" ? "Double-check these choices." : undefined}
                  errorMessage={state === "invalid" ? "Pick at least one topic." : undefined}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Horizontal: Story = {
  args: {
    label: "Email me about",
    orientation: "horizontal",
  },
};
