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
    // Capped width so the legend's numerics don't drift from their labels in
    // the docs.
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SegmentedBar>;

/**
 * The default: shares are computed from the values, and segments that don't name
 * a colour take the default intent sequence.
 */
export const Basic: Story = {};

/** Every track thickness. The legend and its swatches stay put. */
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

/**
 * Explicit `intent`s — for a breakdown where the parts *mean* something
 * (healthy / at-risk / failed), rather than being arbitrary categories.
 */
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

/**
 * `total` sets the denominator. Here the segments account for 62 of a 100-unit
 * quota, so the remaining 38% stays unfilled track.
 */
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

/**
 * The per-segment `color` escape hatch: for fills that are *data* — colours a
 * user picked for their own categories — which the palette can't enumerate.
 */
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

/** Just the bar: `showLegend={false}` hides the legend visually, never from assistive tech. */
export const WithoutLegend: Story = {
  args: {
    label: "Capacity",
    showLegend: false,
    showTotal: true,
  },
};

/** `showPercent` / `showValue` trim the legend down to the columns you want. */
export const LegendColumns: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    showPercent: true,
    showValue: false,
  },
};

/** No visible label — the legend list is named for assistive tech via `aria-label`. */
export const AriaLabelOnly: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    label: undefined,
    "aria-label": "This week by area",
  },
};

/** A single segment fills the whole track, keeping both pill ends. */
export const SingleSegment: Story = {
  // Kept as a test, hidden from the sidebar so the showcase stays focused.
  tags: ["!dev"],
  args: {
    label: "All one thing",
    segments: [{ id: "only", label: "Everything", value: 12 }],
  },
};

/**
 * A long tail: a sliver keeps a minimum width so it stays visible, and a
 * zero-value segment drops out of the track but keeps its legend row at 0%.
 */
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
