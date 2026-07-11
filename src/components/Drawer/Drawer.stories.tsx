import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Button } from "../Button";
import { Text } from "../Text";
import { Drawer } from "./index";

const meta: Meta<typeof Drawer> = {
  title: "Surfaces/Drawer",
  component: Drawer,
  args: {
    intent: "neutral",
    saliency: "low",
    padding: "md",
    side: "right",
    loading: false,
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    side: { control: "inline-radio", options: ["left", "right"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A panel that slides in from the edge of the screen. Its API mirrors Popover (`header` / `footer` / `trigger` props, `intent` / `saliency` / `padding`). Built on base-ui's Drawer, so it is modal with an always-rendered backdrop and supports swipe-to-dismiss. Clicking outside never closes it; `disabled` additionally vetoes Escape / the close button / swipe, and `loading` overlays a spinner on the body.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Playground: Story = {
  render: (args) => (
    <Drawer {...args} trigger={<Drawer.Trigger>Open drawer</Drawer.Trigger>}>
      <Text render={<p />}>
        A panel anchored to the {args.side ?? "right"} edge. Press Escape or use a close control to
        dismiss — clicking the backdrop won&apos;t.
      </Text>
    </Drawer>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Drawer
      {...args}
      trigger={
        <Drawer.Trigger intent="primary" saliency="high">
          Edit profile
        </Drawer.Trigger>
      }
      header={<Drawer.Header title="Edit profile" subtitle="Update your account details" />}
      footer={
        <Drawer.Footer>
          <Drawer.Close>Cancel</Drawer.Close>
          <Drawer.Close intent="primary" saliency="high">
            Save
          </Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>
        The header and footer are passed as props; the body sits between them and scrolls
        independently, while the footer buttons close the drawer.
      </Text>
    </Drawer>
  ),
};

export const Sides: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      {(["left", "right"] as const).map((side) => (
        <Drawer
          {...args}
          key={side}
          side={side}
          header={<Drawer.Header title={`Opens from the ${side}`} />}
          trigger={<Drawer.Trigger>From {side}</Drawer.Trigger>}
          footer={
            <Drawer.Footer>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Footer>
          }
        >
          <Text render={<p />}>This drawer slides in from the {side} edge.</Text>
        </Drawer>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <Drawer
      {...args}
      header={<Drawer.Header title="Loading content" subtitle="The body shows a spinner" />}
      trigger={<Drawer.Trigger>Open loading drawer</Drawer.Trigger>}
      footer={
        <Drawer.Footer>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>
        While `loading` is set, this body is hidden behind a spinner, but the header and footer stay
        live so the drawer can still be closed.
      </Text>
    </Drawer>
  ),
};

export const Disabled: Story = {
  name: "Disabled (non-dismissable)",
  args: { disabled: true },
  render: (args) => (
    <Drawer
      {...args}
      header={<Drawer.Header title="Action in progress" subtitle="This drawer can't be closed" />}
      trigger={<Drawer.Trigger>Open locked drawer</Drawer.Trigger>}
      footer={
        <Drawer.Footer>
          <Drawer.Close disabled disabledReason="Finish the current step first">
            Close
          </Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>
        While `disabled` is set, Escape, the close button, swipe, and the backdrop all refuse to
        close the drawer. Toggle the control in the toolbar to release it.
      </Text>
    </Drawer>
  ),
};

export const Intents: Story = {
  name: "Intents (Notice-style)",
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {INTENTS.map((intent) => (
        <Drawer
          key={intent}
          intent={intent}
          header={<Drawer.Header title={`${intent} drawer`} />}
          trigger={<Drawer.Trigger>{intent}</Drawer.Trigger>}
          footer={
            <Drawer.Footer>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Footer>
          }
        >
          <Text render={<p />}>This drawer uses the {intent} intent.</Text>
        </Drawer>
      ))}
    </div>
  ),
};

export const ImperativeClose: Story = {
  name: "Imperative close (async)",
  render: (args) => {
    const drawer = useOverlayHandle(Drawer);
    const [saving, setSaving] = React.useState(false);
    return (
      <Drawer
        {...args}
        handle={drawer}
        loading={saving}
        trigger={<Drawer.Trigger>Edit settings</Drawer.Trigger>}
        header={<Drawer.Header title="Edit settings" subtitle="Save closes it from code" />}
        footer={
          <Drawer.Footer>
            <Drawer.Close>Cancel</Drawer.Close>
            <Button
              intent="primary"
              saliency="high"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                await new Promise((resolve) => setTimeout(resolve, 900));
                setSaving(false);
                drawer.close();
              }}
            >
              Save
            </Button>
          </Drawer.Footer>
        }
      >
        <Text render={<p />}>
          Save runs an async action, then closes the drawer with `drawer.close()` — no need to lift
          `open` into component state. `useOverlayHandle(Drawer)` mints the handle.
        </Text>
      </Drawer>
    );
  },
};

export const Nested: Story = {
  render: (args) => (
    <Drawer
      {...args}
      header={<Drawer.Header title="Account" subtitle="Open a second drawer on top" />}
      trigger={<Drawer.Trigger>Open drawer</Drawer.Trigger>}
      footer={
        <Drawer.Footer>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>Each drawer renders its own backdrop, so the stack stays legible.</Text>
      <div style={{ marginTop: 16 }}>
        <Drawer
          header={<Drawer.Header title="Security" />}
          trigger={<Drawer.Trigger>Security settings</Drawer.Trigger>}
          footer={
            <Drawer.Footer>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Footer>
          }
        >
          <Text render={<p />}>A nested drawer, opened from inside the first.</Text>
        </Drawer>
      </div>
    </Drawer>
  ),
};
