import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Button } from "../Button";
import { Text } from "../Text";
import { Popover } from "./index";

const meta: Meta<typeof Popover> = {
  title: "Surfaces/Popover",
  component: Popover,
  args: {
    intent: "neutral",
    saliency: "low",
    padding: "md",
    side: "bottom",
    align: "center",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A floating surface anchored to a trigger. Its API mirrors Card (`header` / `footer` props, `intent` / `saliency` / `padding`). Built on base-ui, so it is non-modal by default — clicking outside or pressing Escape closes it while the rest of the page stays interactive.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Playground: Story = {
  render: (args) => (
    <Popover {...args} trigger={<Popover.Trigger>Open popover</Popover.Trigger>}>
      <Text render={<p />}>
        A floating surface anchored to its trigger. Click outside or press Escape to dismiss.
      </Text>
    </Popover>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Popover
      {...args}
      trigger={
        <Popover.Trigger intent="primary" saliency="high">
          Account
        </Popover.Trigger>
      }
      header={<Popover.Header title="Your account" subtitle="Signed in as ada@example.com" />}
      footer={
        <Popover.Footer>
          <Popover.Close>Cancel</Popover.Close>
          <Popover.Close intent="primary" saliency="high">
            Save
          </Popover.Close>
        </Popover.Footer>
      }
    >
      <Text render={<p />}>
        The header and footer are passed as props; content sits between them, and the footer buttons
        close the popover.
      </Text>
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, padding: 80 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side} side={side} trigger={<Popover.Trigger>{side}</Popover.Trigger>}>
          <Text render={<p />}>Placed on the {side}.</Text>
        </Popover>
      ))}
    </div>
  ),
};

export const ImperativeClose: Story = {
  name: "Imperative close (async)",
  render: (args) => {
    const popover = useOverlayHandle(Popover);
    const [saving, setSaving] = React.useState(false);
    return (
      <Popover
        {...args}
        handle={popover}
        trigger={<Popover.Trigger>Rename</Popover.Trigger>}
        header={<Popover.Header title="Rename" subtitle="Save closes it from code" />}
        footer={
          <Popover.Footer>
            <Popover.Close>Cancel</Popover.Close>
            <Button
              intent="primary"
              saliency="high"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                await new Promise((resolve) => setTimeout(resolve, 900));
                setSaving(false);
                popover.close();
              }}
            >
              Save
            </Button>
          </Popover.Footer>
        }
      >
        <Text render={<p />}>
          Save runs an async action, then closes the popover with `popover.close()` — no need to
          lift `open` into component state. `useOverlayHandle(Popover)` mints the handle.
        </Text>
      </Popover>
    );
  },
};

export const Intents: Story = {
  name: "Intents (Notice-style)",
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {INTENTS.map((intent) => (
        <Popover key={intent} intent={intent} trigger={<Popover.Trigger>{intent}</Popover.Trigger>}>
          <Text render={<p />}>This popover uses the {intent} intent.</Text>
        </Popover>
      ))}
    </div>
  ),
};
