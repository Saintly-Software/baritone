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

export const CustomRange: Story = {
  tags: ["!dev"],
  args: {
    label: "Temperature",
    intent: "warning",
    min: -20,
    max: 40,
    value: 22,
  },
};

export const CustomValueText: Story = {
  tags: ["!dev"],
  args: {
    label: "Battery",
    intent: "positive",
    value: 40,
    "aria-valuetext": (formatted, value) => `${value} of 100 (${formatted})`,
  },
};

export const CustomValueFormat: Story = {
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

export const CustomValueNode: Story = {
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

export const CustomColor: Story = {
  args: {
    label: "Brand health",
    value: 58,
    showValue: true,
    slotProps: { bar: { color: "#8b5cf6" } },
  },
};

export const AriaLabelOnly: Story = {
  tags: ["!dev"],
  args: {
    label: undefined,
    "aria-label": "Signal strength",
    intent: "neutral",
    value: 30,
  },
};
