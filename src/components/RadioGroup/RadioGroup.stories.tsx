import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES, SIZES } from "../../theme/constants";
import type { DistributiveOmit } from "../../utils/types";
import { RadioGroup } from "./index";

type ThemeValue = "system" | "light" | "dark";

// RadioGroup is controlled, so the stories drive it from local state — the same
// shape a consumer would use. `DistributiveOmit` (not the built-in `Omit`) keeps
// the mutually-exclusive labelling arms apart — a plain `Omit` over a union
// collapses it into one object carrying every arm's keys at once.
function ThemeSwitcher(
  props: DistributiveOmit<
    React.ComponentProps<typeof RadioGroup<ThemeValue>>,
    "value" | "onChange" | "children"
  >,
) {
  const [value, setValue] = React.useState<ThemeValue>("system");
  return (
    <RadioGroup value={value} onChange={setValue} {...props}>
      {({ RadioGroupItem }) => (
        <>
          <RadioGroupItem value="dark">Dark</RadioGroupItem>
          <RadioGroupItem value="light">Light</RadioGroupItem>
          <RadioGroupItem value="system">Sync with system</RadioGroupItem>
        </>
      )}
    </RadioGroup>
  );
}

const meta: Meta<typeof ThemeSwitcher> = {
  title: "Form Controls/RadioGroup",
  component: ThemeSwitcher,
  args: {
    label: "Theme",
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

type Story = StoryObj<typeof ThemeSwitcher>;

// Interactive default — renamed from "Playground". Ships with a `description` so
// the default view shows the described-by wiring, folding in the old
// "WithDescription" story.
export const Basic: Story = {
  args: {
    helpText: "Affects the appearance across the whole app.",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {SIZES.map((size) => (
        <ThemeSwitcher key={size} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const cellStyle: React.CSSProperties = {
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
          <th style={thStyle}>RadioGroup</th>
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
                <ThemeSwitcher
                  label="Theme"
                  state={state}
                  helpText={state === "warning" ? "Double-check this choice." : undefined}
                  errorMessage={state === "invalid" ? "Pick a theme to continue." : undefined}
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
    label: "Theme",
    orientation: "horizontal",
  },
};
