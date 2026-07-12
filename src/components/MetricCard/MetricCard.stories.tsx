import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS } from "../../theme/constants";
import { Icon } from "../Icon";
import { MetricCard } from "./index";

// Throwaway glyph so the icon stories have something to render.
const TargetGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  </Icon>
);

const meta: Meta<typeof MetricCard> = {
  title: "Components/MetricCard",
  component: MetricCard,
  args: { value: 2, label: "Active goals", caption: "tasks completed" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    valueSize: {
      control: "select",
      options: ["lg", "xl", "2xl", "3xl", "3.5xl", "4xl"],
    },
    caption: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A `Card` variant for the big-number stat / KPI tile. The value is not a " +
          "heading (so a grid of tiles doesn't flood the outline with bare numbers) — " +
          "put a set of metrics in a named `CardList` so they read as a labelled list.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof MetricCard>;

/**
 * Every optional prop wired up at once — a leading icon, a caption, and a trend
 * badge — driven by the `args` controls. Tweak `intent` / `valueSize` in the
 * controls panel to see them tint the value and resize the figure.
 */
export const KitchenSink: Story = {
  args: {
    icon: <TargetGlyph />,
    intent: "primary",
    valueSize: "3xl",
    trend: { direction: "up", value: "12%" },
  },
  render: (args) => <MetricCard {...args} />,
};

/**
 * `intent` tints the **value** (not the surface) — handy for a good / bad number.
 * The label and caption keep the neutral text ramp.
 */
export const Intents: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <MetricCard value="+18%" label="Revenue" caption="vs. last month" intent="positive" />
      <MetricCard value="-4%" label="Churn" caption="vs. last month" intent="negative" />
      <MetricCard value={3} label="At risk" caption="needs review" intent="warning" />
      <MetricCard value={128} label="Signups" caption="this week" intent="primary" />
    </div>
  ),
};

/**
 * A trend / delta badge (`trend`) shows the change since a baseline. The arrow is
 * decorative — the badge is announced as its text alternative ("increased 12%"),
 * never "up-pointing triangle". Sentiment colour defaults from the direction, but
 * for **inverted** metrics (churn, latency, cost) a fall is *good*, so pass
 * `sentiment` to keep a downward arrow green.
 */
export const Trend: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <MetricCard
        value="$1.2M"
        label="Revenue"
        caption="vs. last month"
        trend={{ direction: "up", value: "12%" }}
        icon={<TargetGlyph />}
      />
      {/* Inverted metric: churn going down is good, so force a positive sentiment. */}
      <MetricCard
        value="3.1%"
        label="Churn"
        caption="vs. last month"
        trend={{ direction: "down", value: "0.4pt", sentiment: "positive" }}
      />
      <MetricCard
        value={128}
        label="Signups"
        caption="vs. last week"
        trend={{ direction: "flat", value: "0%" }}
      />
    </div>
  ),
};
