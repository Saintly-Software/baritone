import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS } from "../../theme/constants";
import { CardList } from "../CardList";
import { Heading } from "../Heading";
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

/** The default read-only stat: a value, a label, and an optional caption. */
export const Playground: Story = {};

/** With an optional leading icon (decorative — the label already names the metric). */
export const WithIcon: Story = {
  args: { icon: <TargetGlyph />, caption: undefined },
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

/**
 * Interactive tiles. Passing `onClick` (a button) or `href` (a link) makes the
 * value + label the card's single control, stretched over the whole surface — so
 * a click anywhere activates it, while a screen reader hears one control named by
 * the value **and** the label ("Active goals, 2").
 */
export const Interactive: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <MetricCard value={2} label="Active goals" href="#goals" />
      <MetricCard value={5} label="Open tasks" onClick={() => alert("clicked")} />
      <MetricCard value={1} label="Locked" href="#locked" disabled />
    </div>
  ),
};

/**
 * The intended a11y shape, recreating a dashboard: each group of metrics is a
 * `CardList` named by its section `Heading`. A screen reader announces "Goals,
 * list, 3 items" and then each tile as a list item — never a stream of bare,
 * context-free numbers.
 */
export const Dashboard: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32, maxWidth: 760 }}>
      <Heading level={1}>Dashboard</Heading>

      <section style={{ display: "grid", gap: 12 }}>
        <Heading level={2} id="goals-h" variant="sm">
          Goals
        </Heading>
        <CardList
          aria-labelledby="goals-h"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          <MetricCard value={2} label="Active" href="#goals-active" />
          <MetricCard value={1} label="Paused" href="#goals-paused" />
          <MetricCard value={1} label="Complete" href="#goals-complete" />
        </CardList>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <Heading level={2} id="tasks-h" variant="sm">
          Tasks
        </Heading>
        <CardList
          aria-labelledby="tasks-h"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          <MetricCard value={3} label="Open" href="#tasks-open" />
          <MetricCard value={1} label="In progress" href="#tasks-progress" />
          <MetricCard
            value={2}
            label="Done this week"
            caption="tasks completed"
            href="#tasks-done"
          />
        </CardList>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <Heading level={2} id="contrib-h" variant="sm">
          Contributions
        </Heading>
        <CardList
          aria-labelledby="contrib-h"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
        >
          <MetricCard value={5} label="This week" href="#contrib-week" />
          <MetricCard value={18} label="This month" href="#contrib-month" />
        </CardList>
      </section>
    </div>
  ),
};
