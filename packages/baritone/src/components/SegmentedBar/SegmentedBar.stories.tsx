import type { Meta, StoryObj } from "@storybook/react-vite";
import { SIZES } from "../../theme/constants";
import { SegmentedBar } from "./index";

const meta: Meta<typeof SegmentedBar> = {
  title: "Components/SegmentedBar",
  component: SegmentedBar,
  args: {
    label: "This week by area",
    segments: [
      { id: "sanity", label: "Sanity", value: 6 },
      { id: "no-area", label: "No area", value: 5 },
      { id: "music", label: "Music", value: 4 },
      { id: "health", label: "Health", value: 1 },
    ],
    size: "md",
    showLegend: true,
    showPercent: true,
    showValue: true,
  },
  argTypes: {
    size: { control: "select", options: SIZES },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SegmentedBar>;

export const Basic: Story = {};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {SIZES.map((size) => (
        <SegmentedBar key={size} {...args} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

export const Intents: Story = {
  args: {
    label: "Build results",
    showTotal: true,
    segments: [
      { id: "passed", label: "Passed", value: 128, intent: "positive" },
      { id: "flaky", label: "Flaky", value: 14, intent: "warning" },
      { id: "failed", label: "Failed", value: 6, intent: "negative" },
      { id: "skipped", label: "Skipped", value: 22, intent: "neutral", saliency: "mid" },
    ],
  },
};

export const WithTotal: Story = {
  args: {
    label: "Storage",
    total: 100,
    showTotal: true,
    format: { style: "unit", unit: "gigabyte", unitDisplay: "short" },
    segments: [
      { id: "photos", label: "Photos", value: 31 },
      { id: "backups", label: "Backups", value: 18 },
      { id: "docs", label: "Documents", value: 13 },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    label: "This week by area",
    segments: [
      { id: "sanity", label: "Sanity", value: 6, color: "#34c38f" },
      { id: "no-area", label: "No area", value: 5, color: "#a2adbd" },
      { id: "music", label: "Music", value: 4, color: "#7b61ff" },
      { id: "health", label: "Health", value: 1, color: "#f0616d" },
    ],
  },
};

export const WithoutLegend: Story = {
  args: {
    label: "Capacity",
    showLegend: false,
    showTotal: true,
  },
};

export const LegendColumns: Story = {
  tags: ["!dev"],
  args: {
    showPercent: true,
    showValue: false,
  },
};

export const AriaLabelOnly: Story = {
  tags: ["!dev"],
  args: {
    label: undefined,
    "aria-label": "This week by area",
  },
};

export const SingleSegment: Story = {
  tags: ["!dev"],
  args: {
    label: "All one thing",
    segments: [{ id: "only", label: "Everything", value: 12 }],
  },
};

export const SliversAndZeroes: Story = {
  args: {
    label: "Traffic by source",
    segments: [
      { id: "direct", label: "Direct", value: 940 },
      { id: "search", label: "Search", value: 210 },
      { id: "social", label: "Social", value: 3 },
      { id: "print", label: "Print", value: 0 },
    ],
  },
};
