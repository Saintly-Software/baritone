import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Text } from "../Text";
import { Accordion } from "./index";

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
  title: "Components/Accordion",
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
