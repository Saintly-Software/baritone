import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SURFACE_SALIENCIES } from "../../theme/constants";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Icon } from "../Icon";
import { Modal } from "../Modal";
import { Text } from "../Text";
import { Drawer } from "./index";

// Throwaway glyphs so the action demos have something to render.
const EditGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  </Icon>
);

const ShareGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  </Icon>
);

const TrashGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Drawer> = {
  title: "Surfaces/Drawer",
  component: Drawer,
  args: {
    saliency: "low",
    padding: "md",
    side: "right",
    loading: false,
    disabled: false,
  },
  argTypes: {
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
          "A panel that slides in from the edge of the screen. It composes `header` / `footer` / `trigger` props around its content (the same pattern as Popover / Modal) and takes `saliency` / `padding` surface knobs. Built on base-ui's Drawer, so it is modal with an always-rendered backdrop and supports swipe-to-dismiss. Clicking outside never closes it; `disabled` additionally vetoes Escape / the close button / swipe, and `loading` overlays a spinner on the body.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

/**
 * Every region at once — a header carrying an overflow-actions `Menu`, a
 * scrolling body, and a footer whose primary actions render as a joined
 * `ButtonGroup` — all driven by the toolbar controls (`saliency`, `padding`,
 * `side`, `loading`, `disabled`). Opens by default so the panel is visible on
 * load.
 */
export const KitchenSink: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Drawer
      {...args}
      trigger={<Drawer.Trigger>Open drawer</Drawer.Trigger>}
      header={
        <Drawer.Header
          title="Edit profile"
          subtitle="Update your account details"
          actions={[
            { children: "Rename", icon: <EditGlyph />, onClick: () => {} },
            { children: "Share", icon: <ShareGlyph />, onClick: () => {} },
            { children: "Delete", icon: <TrashGlyph />, intent: "negative", onClick: () => {} },
          ]}
        />
      }
      footer={
        <Drawer.Footer
          actions={[
            <ButtonGroup.Item key="cancel" onClick={() => {}}>
              Cancel
            </ButtonGroup.Item>,
            <ButtonGroup.Item key="save" intent="primary" saliency="high" onClick={() => {}}>
              Save
            </ButtonGroup.Item>,
          ]}
        />
      }
    >
      <Text render={<p />}>
        A panel anchored to the {args.side ?? "right"} edge. The body sits between the header and
        footer and scrolls on overflow. Header actions collapse into a &ldquo;more options&rdquo;
        menu; footer actions join into a button group. Press Escape or use a close control to
        dismiss — clicking the backdrop won&apos;t.
      </Text>
    </Drawer>
  ),
};

/**
 * A drawer docked to the left edge, opened by default so the panel is visible on
 * load. Toggle `side` in the toolbar to slide it in from the right instead.
 */
export const Sides: Story = {
  name: "Opens from the left",
  args: { side: "left", defaultOpen: true },
  render: (args) => (
    <Drawer
      {...args}
      header={<Drawer.Header title={`Opens from the ${args.side ?? "left"}`} />}
      trigger={<Drawer.Trigger>From {args.side ?? "left"}</Drawer.Trigger>}
      footer={
        <Drawer.Footer>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>This drawer slides in from the {args.side ?? "left"} edge.</Text>
    </Drawer>
  ),
};

/**
 * The body sits behind a spinner while `loading` is set; the header and footer
 * stay live so the drawer can still be closed. Opens by default so the spinner
 * is visible on load.
 */
export const Loading: Story = {
  args: { loading: true, defaultOpen: true },
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

export const ImperativeClose: Story = {
  name: "Imperative close (async)",
  // Behavioural demo of the imperative-close mechanism — kept as a test, hidden
  // from the sidebar so the showcase stays focused on visual variants.
  tags: ["!dev"],
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

/**
 * A drawer opened from inside a modal — each surface renders its own backdrop, so
 * the stack stays legible. Both surfaces open by default so the Chromatic snapshot
 * captures the layered backdrops.
 */
export const Nested: Story = {
  render: (args) => (
    <Modal
      defaultOpen
      header={<Modal.Header title="Account" subtitle="Open a drawer on top" />}
      trigger={<Modal.Trigger>Open modal</Modal.Trigger>}
      footer={
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>Each surface renders its own backdrop, so the stack stays legible.</Text>
      <div style={{ marginTop: 16 }}>
        <Drawer
          {...args}
          defaultOpen
          header={<Drawer.Header title="Security" />}
          trigger={<Drawer.Trigger>Security settings</Drawer.Trigger>}
          footer={
            <Drawer.Footer>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Footer>
          }
        >
          <Text render={<p />}>A nested drawer, opened from inside the modal.</Text>
        </Drawer>
      </div>
    </Modal>
  ),
};
