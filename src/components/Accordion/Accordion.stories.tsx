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

const ITEMS = [
  {
    value: "shipping",
    header: <Accordion.ItemHeader title="Shipping" subtitle="2–4 business days" />,
    children: <Text variant="sm">We ship worldwide with tracked carriers.</Text>,
  },
  {
    value: "returns",
    header: <Accordion.ItemHeader title="Returns & exchanges" />,
    children: <Text variant="sm">Unused items can be returned within 30 days.</Text>,
  },
  {
    value: "warranty",
    header: <Accordion.ItemHeader title="Warranty" subtitle="What's covered" />,
    children: <Text variant="sm">Every order includes a one-year limited warranty.</Text>,
  },
] as const;
type Section = (typeof ITEMS)[number]["value"];

function FAQ({ disabled }: { disabled?: boolean }) {
  const [value, setValue] = React.useState<Section | null>("shipping");
  return (
    <Accordion
      aria-label="Frequently asked questions"
      value={value}
      onChange={setValue}
      disabled={disabled}
      items={ITEMS}
    />
  );
}

const meta: Meta<typeof FAQ> = {
  title: "Surfaces/Accordion",
  component: FAQ,
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

type Story = StoryObj<typeof FAQ>;

/** Single-open (default): opening one item collapses the others. */
export const Playground: Story = {};

/** Disabled group: every trigger dims but stays keyboard-focusable. */
export const DisabledGroup: Story = {
  args: { disabled: true },
};

/** Multi-open: any number of panels can be expanded at once. */
export const Multiple: Story = {
  render: () => {
    function MultiFAQ() {
      const [value, setValue] = React.useState<Section[]>(["shipping", "warranty"]);
      return (
        <Accordion
          aria-label="Frequently asked questions"
          multiple
          value={value}
          onChange={setValue}
          items={ITEMS}
        />
      );
    }
    return <MultiFAQ />;
  },
};

/** Uncontrolled: seed the initially open item with `initialValue`. */
export const Uncontrolled: Story = {
  render: () => (
    <Accordion aria-label="Frequently asked questions" initialValue="returns" items={ITEMS} />
  ),
};

/** Headers with a leading `icon` and a trailing status `chip`. */
export const WithIconAndChip: Story = {
  render: () => (
    <Accordion
      aria-label="Environments"
      initialValue="production"
      items={[
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
      ]}
    />
  ),
};

/** A single disabled item sits among interactive ones. */
export const WithDisabledItem: Story = {
  render: () => {
    function PartlyDisabled() {
      const [value, setValue] = React.useState<Section | null>(null);
      return (
        <Accordion
          aria-label="Frequently asked questions"
          value={value}
          onChange={setValue}
          items={[ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]]}
        />
      );
    }
    return <PartlyDisabled />;
  },
};
