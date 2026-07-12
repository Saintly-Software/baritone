import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text";
import { Modal } from "./index";

/**
 * Interaction coverage for `Modal`. Each story opens the modal from its trigger
 * and asserts the portaled dialog — the regions it renders, its width per `size`,
 * or its busy state — so they double as interaction tests and snapshot drivers.
 */
const meta: Meta<typeof Modal> = {
  title: "Surfaces/Modal",
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

/** Opens the fully featured modal and asserts every region rendered in the portaled dialog. */
export const KitchenSink: Story = {
  render: () => (
    <Modal
      trigger={<Modal.Trigger>Edit profile</Modal.Trigger>}
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
        The body sits between the header and footer and scrolls on overflow.
      </Text>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }));

    const dialog = await within(document.body).findByRole("dialog");
    const dialogView = within(dialog);
    expect(dialogView.getByRole("heading", { name: "Edit profile" })).toBeInTheDocument();
    expect(dialogView.getByText("Update your account details")).toBeInTheDocument();
    expect(dialogView.getByText(/scrolls on overflow/)).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Save" })).toBeInTheDocument();
  },
};

/** A `size="md"` modal caps its width at the `md` token (32rem = 512px). */
export const SizeMedium: Story = {
  render: () => (
    <Modal
      size="md"
      trigger={<Modal.Trigger>Open medium</Modal.Trigger>}
      header={<Modal.Header title="Medium" />}
    >
      <Text render={<p />}>This modal uses the md max width.</Text>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open medium" }));
    const dialog = await within(document.body).findByRole("dialog");
    await waitFor(() => expect(getComputedStyle(dialog).maxWidth).toBe("512px"));
  },
};

/** A `size="lg"` modal caps its width at the `lg` token (42rem = 672px). */
export const SizeLarge: Story = {
  render: () => (
    <Modal
      size="lg"
      trigger={<Modal.Trigger>Open large</Modal.Trigger>}
      header={<Modal.Header title="Large" />}
    >
      <Text render={<p />}>This modal uses the lg max width.</Text>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open large" }));
    const dialog = await within(document.body).findByRole("dialog");
    await waitFor(() => expect(getComputedStyle(dialog).maxWidth).toBe("672px"));
  },
};

/** While `loading`, the body is replaced by a centred spinner and the dialog is `aria-busy`. */
export const LoadingSpinner: Story = {
  name: "Loading (busy)",
  render: () => (
    <Modal
      loading
      trigger={<Modal.Trigger>Open loading</Modal.Trigger>}
      header={<Modal.Header title="Loading content" />}
    >
      <Text render={<p />}>This body is hidden behind a spinner while loading.</Text>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open loading" }));
    const dialog = await within(document.body).findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
  },
};
