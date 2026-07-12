import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import * as React from "react";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import type { Intent, Saliency } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Icon } from "../Icon";
import { Tabs } from "./index";

// A throwaway glyph so the lead/trail icon stories have something to render.
const Dot = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="6" />
    </svg>
  </Icon>
);

const VIEWS = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
] as const;
type View = (typeof VIEWS)[number]["value"];

// Panel body copy, one blurb per view, so the panel story has real content.
const PANELS: Record<View, string> = {
  overview: "A birds-eye summary of the project — health, owners, recent activity.",
  activity: "A running feed of what changed and who changed it.",
  settings: "Configuration for the project: visibility, integrations, danger zone.",
};

// Tabs are controlled, so the stories drive them from local state — the same
// shape a consumer would use — and show the active view's content underneath.
function Sections({
  intent,
  saliency,
  disabled,
}: {
  intent?: Intent;
  saliency?: Saliency;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<View>("overview");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Tabs
        aria-label="Project sections"
        value={value}
        onChange={setValue}
        intent={intent}
        saliency={saliency}
        disabled={disabled}
        tabs={VIEWS}
      />
      <p style={{ margin: 0, fontFamily: "system-ui", color: "#666" }}>
        Showing the <strong>{value}</strong> view.
      </p>
    </div>
  );
}

const meta: Meta<typeof Sections> = {
  title: "Components/Tabs",
  component: Sections,
  args: {
    intent: "neutral",
    saliency: "mid",
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Sections>;

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
);

export const KitchenSink: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
      <Row label="Default — driven by the toolbar controls">
        <Tabs {...args} aria-label="Project sections" initialValue="overview" tabs={VIEWS} />
      </Row>

      <Row label="With lead and trail icons">
        <Tabs
          {...args}
          aria-label="Project sections"
          intent="primary"
          saliency="high"
          initialValue="overview"
          tabs={[
            { value: "overview", label: "Overview", leadIcon: <Dot /> },
            { value: "activity", label: "Activity", trailIcon: <Dot /> },
            { value: "settings", label: "Settings", leadIcon: <Dot />, trailIcon: <Dot /> },
          ]}
        />
      </Row>

      <Row label="A single disabled tab — the rest stay reachable">
        <Tabs
          {...args}
          aria-label="Project sections"
          initialValue="overview"
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings", disabled: true },
          ]}
        />
      </Row>

      <Row label="With panels — the active panel is wired via aria-controls/labelledby">
        <Tabs
          {...args}
          aria-label="Project sections"
          intent="primary"
          saliency="high"
          initialValue="overview"
          tabs={VIEWS.map(({ value, label }) => ({ value, label, leadIcon: <Dot /> }))}
        >
          {VIEWS.map(({ value: v }) => (
            <Tabs.Panel key={v} value={v} style={{ fontFamily: "system-ui" }}>
              {PANELS[v]}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Row>

      <Row label="Disabled group — set via the toolbar disabled control">
        <Tabs
          {...args}
          disabled
          aria-label="Project sections"
          initialValue="overview"
          tabs={VIEWS}
        />
      </Row>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "One survey of common `Tabs` shapes: the default arg-driven bar, tabs with lead/trail icons, a single disabled tab (the rest stay reachable), a bar with wired `Tabs.Panel` content, and a fully disabled group. The toolbar controls flow into every row via `args` (except where a row pins its own intent/saliency to make the point).",
      },
    },
  },
};

// A bare tab bar (no panel/paragraph) so the matrix cells stay compact.
function TabBar({ intent, saliency }: { intent: Intent; saliency: Saliency }) {
  const [value, setValue] = React.useState<View>("overview");
  return (
    <Tabs
      aria-label={`Sections (${intent} ${saliency})`}
      value={value}
      onChange={setValue}
      intent={intent}
      saliency={saliency}
      tabs={VIEWS}
    />
  );
}

export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => <TabBar intent={intent} saliency={saliency} />}
    </IntentSaliencyMatrix>
  ),
};
