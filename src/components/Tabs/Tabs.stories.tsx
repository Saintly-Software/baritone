import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import type { Intent, Saliency } from "../../theme/constants";
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

export const Playground: Story = {};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      {SALIENCIES.map((saliency) => (
        <Sections key={saliency} intent="primary" saliency={saliency} />
      ))}
    </div>
  ),
};

export const Intents: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      {INTENTS.map((intent) => (
        <Sections key={intent} intent={intent} saliency="high" />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => {
    function WithIconsHost() {
      const [value, setValue] = React.useState<View>("overview");
      return (
        <Tabs
          aria-label="Project sections"
          value={value}
          onChange={setValue}
          intent="primary"
          saliency="high"
          tabs={[
            { value: "overview", label: "Overview", leadIcon: <Dot /> },
            { value: "activity", label: "Activity", trailIcon: <Dot /> },
            { value: "settings", label: "Settings", leadIcon: <Dot />, trailIcon: <Dot /> },
          ]}
        />
      );
    }
    return <WithIconsHost />;
  },
};

export const DisabledGroup: Story = {
  args: { disabled: true },
};

export const WithDisabledTab: Story = {
  render: () => {
    function DisabledTabHost() {
      const [value, setValue] = React.useState<View>("overview");
      return (
        <Tabs
          aria-label="Project sections"
          value={value}
          onChange={setValue}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings", disabled: true },
          ]}
        />
      );
    }
    return <DisabledTabHost />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <Tabs aria-label="Project sections" initialValue="activity" intent="primary" tabs={VIEWS} />
  ),
};

// Panel body copy, one blurb per view, so the panel stories have real content.
const PANELS: Record<View, string> = {
  overview: "A birds-eye summary of the project — health, owners, recent activity.",
  activity: "A running feed of what changed and who changed it.",
  settings: "Configuration for the project: visibility, integrations, danger zone.",
};

// With panels the content lives inside <Tabs> as <Tabs.Panel> children, so
// base-ui shows the active one and wires the aria-controls/labelledby pair —
// no separate content-switch of your own.
export const WithPanels: Story = {
  render: () => {
    function PanelsHost() {
      const [value, setValue] = React.useState<View>("overview");
      return (
        <Tabs
          aria-label="Project sections"
          value={value}
          onChange={setValue}
          intent="primary"
          saliency="high"
          tabs={[
            { value: "overview", label: "Overview", leadIcon: <Dot /> },
            { value: "activity", label: "Activity", leadIcon: <Dot /> },
            { value: "settings", label: "Settings", leadIcon: <Dot /> },
          ]}
        >
          {VIEWS.map(({ value: v }) => (
            <Tabs.Panel key={v} value={v} style={{ fontFamily: "system-ui" }}>
              {PANELS[v]}
            </Tabs.Panel>
          ))}
        </Tabs>
      );
    }
    return <PanelsHost />;
  },
};

// Uncontrolled + panels: seed with initialValue and let Tabs manage the rest.
export const UncontrolledWithPanels: Story = {
  render: () => (
    <Tabs aria-label="Project sections" initialValue="activity" intent="primary" tabs={VIEWS}>
      {VIEWS.map(({ value: v }) => (
        <Tabs.Panel key={v} value={v} style={{ fontFamily: "system-ui" }}>
          {PANELS[v]}
        </Tabs.Panel>
      ))}
    </Tabs>
  ),
};
