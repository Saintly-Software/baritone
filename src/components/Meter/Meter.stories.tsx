import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
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
    // Single-meter stories read best capped at 360px; the matrix opts out via
    // `parameters.wide` so its columns aren't squeezed into a scroll box.
    (Story, ctx) => (
      <div style={{ maxWidth: ctx.parameters.wide ? undefined : 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Meter>;

export const Basic: Story = {
  args: {
    showValue: true,
    description: "72 GB of your 100 GB quota",
  },
};

/**
 * Every `intent` (rows) at each `saliency` (columns). The fill stays a solid,
 * visible ink at every level.
 */
export const IntentsAndSaliencies: Story = {
  parameters: { wide: true },
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <div style={{ width: 140 }}>
          <Meter
            aria-label={`${intent} ${saliency}`}
            intent={intent}
            saliency={saliency}
            value={66}
          />
        </div>
      )}
    </IntentSaliencyMatrix>
  ),
};

/** A non-default range: `min` / `max` drive the fill percentage and the ARIA wiring. */
export const CustomRange: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
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
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    label: "Battery",
    intent: "positive",
    value: 40,
    "aria-valuetext": (formatted, value) => `${value} of 100 (${formatted})`,
  },
};

/**
 * `showValue` renders the value at the end of the header row. `format` (an
 * `Intl.NumberFormat` options bag) drives how it reads — here as a unit — and
 * feeds the default `aria-valuetext` too.
 */
export const CustomValueFormat: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
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
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
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

/**
 * `slotProps.bar.color` is the escape hatch: paint the indicator any CSS colour,
 * overriding `intent` × `saliency`. Reach for it only when you need a colour
 * outside the system palette.
 */
export const CustomColor: Story = {
  args: {
    label: "Brand health",
    value: 58,
    showValue: true,
    slotProps: { bar: { color: "#8b5cf6" } },
  },
};

/** No visible label — named for assistive tech via `aria-label`. */
export const AriaLabelOnly: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    label: undefined,
    "aria-label": "Signal strength",
    intent: "neutral",
    value: 30,
  },
};
