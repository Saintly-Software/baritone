import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { Text } from "../Text";
import { Modal } from "./index";

const meta: Meta<typeof Modal> = {
  title: "Surfaces/Modal",
  component: Modal,
  args: {
    intent: "neutral",
    saliency: "low",
    padding: "md",
    size: "md",
    loading: false,
    disabled: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SURFACE_SALIENCIES },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A panel centred over the page. Its API mirrors Drawer (`header` / `footer` / `trigger` props, `intent` / `saliency` / `padding`). Built on base-ui's Dialog, so it is modal with an always-rendered backdrop and comes in three sizes (`sm` / `md` / `lg`). Clicking outside never closes it; `disabled` additionally vetoes Escape / the close button, and `loading` overlays a spinner on the body.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Playground: Story = {
  render: (args) => (
    <Modal {...args} trigger={<Modal.Trigger>Open modal</Modal.Trigger>}>
      <Text render={<p />}>
        A panel centred over the page. Press Escape or use a close control to dismiss — clicking the
        backdrop won&apos;t.
      </Text>
    </Modal>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Modal
      {...args}
      trigger={
        <Modal.Trigger intent="primary" saliency="high">
          Edit profile
        </Modal.Trigger>
      }
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
        The header and footer are passed as props; the body sits between them and scrolls
        independently, while the footer buttons close the modal.
      </Text>
    </Modal>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Modal
          {...args}
          key={size}
          size={size}
          header={<Modal.Header title={`Size ${size}`} />}
          trigger={<Modal.Trigger>Size {size}</Modal.Trigger>}
          footer={
            <Modal.Footer>
              <Modal.Close>Close</Modal.Close>
            </Modal.Footer>
          }
        >
          <Text render={<p />}>This modal uses the {size} max width.</Text>
        </Modal>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true },
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

export const Disabled: Story = {
  name: "Disabled (non-dismissable)",
  args: { disabled: true },
  render: (args) => (
    <Modal
      {...args}
      header={<Modal.Header title="Action in progress" subtitle="This modal can't be closed" />}
      trigger={<Modal.Trigger>Open locked modal</Modal.Trigger>}
      footer={
        <Modal.Footer>
          <Modal.Close disabled disabledReason="Finish the current step first">
            Close
          </Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>
        While `disabled` is set, Escape, the close button, and the backdrop all refuse to close the
        modal. Toggle the control in the toolbar to release it.
      </Text>
    </Modal>
  ),
};

export const Intents: Story = {
  name: "Intents (Notice-style)",
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {INTENTS.map((intent) => (
        <Modal
          key={intent}
          intent={intent}
          header={<Modal.Header title={`${intent} modal`} />}
          trigger={<Modal.Trigger>{intent}</Modal.Trigger>}
          footer={
            <Modal.Footer>
              <Modal.Close>Close</Modal.Close>
            </Modal.Footer>
          }
        >
          <Text render={<p />}>This modal uses the {intent} intent.</Text>
        </Modal>
      ))}
    </div>
  ),
};

export const Nested: Story = {
  render: (args) => (
    <Modal
      {...args}
      header={<Modal.Header title="Account" subtitle="Open a second modal on top" />}
      trigger={<Modal.Trigger>Open modal</Modal.Trigger>}
      footer={
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      }
    >
      <Text render={<p />}>Each modal renders its own backdrop, so the stack stays legible.</Text>
      <div style={{ marginTop: 16 }}>
        <Modal
          header={<Modal.Header title="Security" />}
          trigger={<Modal.Trigger>Security settings</Modal.Trigger>}
          footer={
            <Modal.Footer>
              <Modal.Close>Close</Modal.Close>
            </Modal.Footer>
          }
        >
          <Text render={<p />}>A nested modal, opened from inside the first.</Text>
        </Modal>
      </div>
    </Modal>
  ),
};
