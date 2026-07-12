import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Accordion } from "./index";

/** A small decorative glyph for the icon demo. */
function ServerGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  );
}

// A fully-featured item set — leading icons, trailing status chips, subtitles,
// and a disabled item — so the default story is a genuine kitchen sink.
const ITEMS = [
  {
    value: "production",
    header: (
      <Accordion.ItemHeader
        title="Production"
        subtitle="api.example.com"
        icon={
          <Icon>
            <ServerGlyph />
          </Icon>
        }
        chip={
          <Chip intent="positive" saliency="low" size="sm">
            Healthy
          </Chip>
        }
      />
    ),
    children: <Text variant="sm">All systems operational.</Text>,
  },
  {
    value: "staging",
    header: (
      <Accordion.ItemHeader
        title="Staging"
        subtitle="staging.example.com"
        icon={
          <Icon>
            <ServerGlyph />
          </Icon>
        }
        chip={
          <Chip intent="warning" saliency="low" size="sm">
            Degraded
          </Chip>
        }
      />
    ),
    children: <Text variant="sm">Elevated error rate in the last hour.</Text>,
  },
  {
    value: "legacy",
    disabled: true,
    header: (
      <Accordion.ItemHeader
        title="Legacy"
        subtitle="Decommissioned"
        icon={
          <Icon>
            <ServerGlyph />
          </Icon>
        }
        chip={
          <Chip intent="neutral" saliency="low" size="sm">
            Archived
          </Chip>
        }
      />
    ),
    children: <Text variant="sm">This environment has been retired.</Text>,
  },
] as const;
type Section = (typeof ITEMS)[number]["value"];

function Environments({ disabled }: { disabled?: boolean }) {
  const [value, setValue] = React.useState<Section | null>("production");
  return (
    <Accordion
      aria-label="Environments"
      value={value}
      onChange={setValue}
      disabled={disabled}
      items={ITEMS}
    />
  );
}

const meta: Meta<typeof Environments> = {
  title: "Surfaces/Accordion",
  component: Environments,
  args: { disabled: false },
  argTypes: { disabled: { control: "boolean" } },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Environments>;

/**
 * Kitchen sink — single-open (default) with the full feature set: leading icons,
 * trailing status chips, subtitles, and a disabled ("Legacy") item. Opening one
 * item collapses the others; the `disabled` control locks the whole group.
 */
export const KitchenSink: Story = {};

/** Multi-open: any number of panels can be expanded at once. */
export const Multiple: Story = {
  render: () => {
    function MultiEnvironments() {
      const [value, setValue] = React.useState<Section[]>(["production", "staging"]);
      return (
        <Accordion
          aria-label="Environments"
          multiple
          value={value}
          onChange={setValue}
          items={ITEMS}
        />
      );
    }
    return <MultiEnvironments />;
  },
};
