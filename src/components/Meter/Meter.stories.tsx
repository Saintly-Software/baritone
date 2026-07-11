import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { Meter } from "./index";

const meta: Meta<typeof Meter> = {
  title: "Components/Meter",
  component: Meter,
  args: {
    label: "Storage used",
    intent: "primary",
    saliency: "high",
    value: 72,
    min: 0,
    max: 100,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
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

type Story = StoryObj<typeof Meter>;

export const Playground: Story = {};

/** Every intent at the default `high` saliency. */
export const Intents: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      {INTENTS.map((intent) => (
        <Meter key={intent} label={intent} intent={intent} value={66} />
      ))}
    </div>
  ),
};

/** `high` / `mid` / `low` — the fill stays a solid, visible ink at each level. */
export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      {SALIENCIES.map((saliency) => (
        <Meter key={saliency} label={saliency} intent="primary" saliency={saliency} value={66} />
      ))}
    </div>
  ),
};

/** A non-default range: `min` / `max` drive the fill percentage and the ARIA wiring. */
export const CustomRange: Story = {
  args: {
    label: "Temperature",
    intent: "warning",
    min: -20,
    max: 40,
    value: 22,
  },
};

/**
 * `aria-valuetext` as a function: base-ui hands it the formatted value (the
 * percentage by default) plus the raw value, and the string it returns is what
 * screen readers announce.
 */
export const CustomValueText: Story = {
  args: {
    label: "Battery",
    intent: "positive",
    value: 40,
    "aria-valuetext": (formatted, value) => `${value} of 100 (${formatted})`,
  },
};

/**
 * A `description` beneath the track — supporting text (units, context) that's
 * also wired to the meter as its `aria-describedby`.
 */
export const WithDescription: Story = {
  args: {
    label: "Storage used",
    value: 72,
    showValue: true,
    description: "72 GB of your 100 GB quota",
  },
};

/**
 * `showValue` renders the value at the end of the header row. `format` (an
 * `Intl.NumberFormat` options bag) drives how it reads — here as a unit — and
 * feeds the default `aria-valuetext` too.
 */
export const CustomValueFormat: Story = {
  args: {
    label: "Download",
    intent: "positive",
    value: 4.2,
    min: 0,
    max: 10,
    showValue: true,
    format: { style: "unit", unit: "gigabyte", unitDisplay: "short" },
    description: "Transferring…",
  },
};

/**
 * `formatValue` takes full control of the displayed node — here composing the
 * raw value against the max — while `slotProps` re-tunes each `Text` slot.
 */
export const CustomValueNode: Story = {
  args: {
    label: "Seats",
    intent: "secondary",
    value: 18,
    max: 25,
    showValue: true,
    formatValue: (_formatted, value) => `${value} / 25`,
    slotProps: {
      value: { saliency: "high" },
      description: { intent: "warning" },
    },
    description: "7 seats remaining",
  },
};

/** No visible label — named for assistive tech via `aria-label`. */
export const AriaLabelOnly: Story = {
  args: {
    label: undefined,
    "aria-label": "Signal strength",
    intent: "neutral",
    value: 30,
  },
};
