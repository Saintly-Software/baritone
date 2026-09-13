import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text";
import { Card } from "./index";

const meta: Meta<typeof Card> = {
  title: "Interaction Tests/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const ClickableActivates: Story = {
  render: () => {
    function ClickableCard() {
      const [count, setCount] = React.useState(0);
      return (
        <Card
          style={{ maxWidth: 320 }}
          onClick={() => setCount((c) => c + 1)}
          header={<Card.Header title="Activate this card" />}
        >
          <Text render={<p />} size="sm" saliency="low">
            Pressed {count} {count === 1 ? "time" : "times"}.
          </Text>
        </Card>
      );
    }
    return <ClickableCard />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Activate this card" });
    expect(canvas.getByText("Pressed 0 times.")).toBeInTheDocument();

    await userEvent.click(button);
    expect(canvas.getByText("Pressed 1 time.")).toBeInTheDocument();
  },
};

export const CollapsibleToggles: Story = {
  render: () => (
    <Card
      style={{ maxWidth: 360 }}
      collapsible
      defaultOpen
      header={<Card.Header title="Shipping details" subtitle="2–4 business days" />}
    >
      <Text render={<p />}>We ship worldwide with tracked carriers.</Text>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Shipping details" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  },
};
