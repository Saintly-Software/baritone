import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { Text } from "../Text";
import { Modal, type ModalProps, type ModalSize } from "./index";

const meta: Meta<typeof Modal> = {
  title: "Surfaces/Modal",
  component: Modal,
  args: {
    padding: "md",
    size: "md",
    loading: false,
    disabled: false,
  },
  argTypes: {
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A panel centred over the page. Its API mirrors Drawer (`header` / `footer` / `trigger` props, `padding`); the surface is always the default neutral, low-saliency shade. Built on base-ui's Dialog, so it is modal with an always-rendered backdrop and comes in three sizes (`sm` / `md` / `lg`). Clicking outside never closes it; `disabled` additionally vetoes Escape / the close button, and `loading` overlays a spinner on the body.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

/**
 * Every region at once — a header carrying a title and subtitle, a scrolling
 * body, and a footer with cancel / save actions — all driven by the toolbar
 * controls (`size`, `padding`, `loading`, `disabled`). Opens by default so the
 * panel is visible on load.
 */
export const KitchenSink: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Modal
      {...args}
      trigger={<Modal.Trigger>Open modal</Modal.Trigger>}
      header={<Modal.Header title="Edit profile" subtitle="Update your account details" />}
      footer={
        <Modal.Footer>
          <Modal.Close>Cancel</Modal.Close>
          <Modal.Close intent="primary" saliency="high">
            Save
          </Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>
        A panel centred over the page. The body sits between the header and footer and scrolls on
        overflow. Press Escape or use a close control to dismiss — clicking the backdrop won&apos;t.
      </Text>
    </Modal>
  ),
};

/**
 * Renders a single modal at a given `size`, opened from a trigger. Shared by the
 * per-size stories below so each one only differs in its `size` arg.
 */
function sizedModal(size: ModalSize) {
  return (args: ModalProps) => (
    <Modal
      {...args}
      header={<Modal.Header title={`Size ${size}`} subtitle="Only the max width changes" />}
      trigger={<Modal.Trigger>Open {size} modal</Modal.Trigger>}
      footer={
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>This modal uses the {size} max width.</Text>
    </Modal>
  );
}

/** The `sm` (narrowest) width. Opens by default so the panel is visible on load. */
export const Small: Story = {
  args: { size: "sm", defaultOpen: true },
  render: sizedModal("sm"),
};

/** The `md` (default) width. Opens by default so the panel is visible on load. */
export const Medium: Story = {
  args: { size: "md", defaultOpen: true },
  render: sizedModal("md"),
};

/** The `lg` (widest) width. Opens by default so the panel is visible on load. */
export const Large: Story = {
  args: { size: "lg", defaultOpen: true },
  render: sizedModal("lg"),
};

export const Loading: Story = {
  args: { loading: true, defaultOpen: true },
  render: (args) => (
    <Modal
      {...args}
      header={<Modal.Header title="Loading content" subtitle="The body shows a spinner" />}
      trigger={<Modal.Trigger>Open loading modal</Modal.Trigger>}
      footer={
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>
        While `loading` is set, this body is hidden behind a spinner, but the header and footer stay
        live so the modal can still be closed.
      </Text>
    </Modal>
  ),
};

export const ImperativeClose: Story = {
  name: "Imperative close (async)",
  // Behavioural demo of the imperative-close mechanism — kept as a test, hidden
  // from the sidebar so the showcase stays focused on visual variants.
  tags: ["!dev"],
  render: (args) => {
    const modal = useOverlayHandle(Modal);
    const [saving, setSaving] = React.useState(false);
    return (
      <Modal
        {...args}
        handle={modal}
        loading={saving}
        trigger={<Modal.Trigger>Edit profile</Modal.Trigger>}
        header={<Modal.Header title="Edit profile" subtitle="Save closes it from code" />}
        footer={
          <Modal.Footer>
            <Modal.Close>Cancel</Modal.Close>
            <Button
              intent="primary"
              saliency="high"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                await new Promise((resolve) => setTimeout(resolve, 900));
                setSaving(false);
                modal.close();
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        }
      >
        <Text render={<p />}>
          Save runs an async action, then closes the modal with `modal.close()` — no need to lift
          `open` into component state. `useOverlayHandle(Modal)` mints the handle; passing it to the
          `handle` prop wires it up.
        </Text>
      </Modal>
    );
  },
};

/**
 * A Modal opened from inside a Drawer — the surfaces stack, each rendering its own
 * backdrop. Both open by default so the full stack is visible on load.
 */
export const Nested: Story = {
  name: "Nested in a Drawer",
  render: (args) => (
    <Drawer
      defaultOpen
      trigger={<Drawer.Trigger>Open drawer</Drawer.Trigger>}
      header={<Drawer.Header title="Account" subtitle="Open a modal on top" />}
      footer={
        <Drawer.Footer>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Footer>
      }
    >
      <Text render={<p />}>
        A modal opened from inside a drawer stacks above it, each rendering its own backdrop.
      </Text>
      <div style={{ marginTop: 16 }}>
        <Modal
          {...args}
          defaultOpen
          header={<Modal.Header title="Security" subtitle="This modal sits above the drawer" />}
          trigger={<Modal.Trigger>Open modal</Modal.Trigger>}
          footer={
            <Modal.Footer>
              <Modal.Close>Close</Modal.Close>
            </Modal.Footer>
          }
        >
          <Text render={<p />}>A modal, opened from inside the drawer.</Text>
        </Modal>
      </div>
    </Drawer>
  ),
};
