import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text";
import { Drawer } from "./index";

/**
 * Interaction coverage for `Drawer`. Each story opens the drawer from its trigger
 * and asserts the portaled dialog — the regions it renders, which edge it docks
 * to, or its busy state.
 */
const meta: Meta<typeof Drawer> = {
  title: "Surfaces/Drawer",
  component: Drawer,
};
export default meta;

type Story = StoryObj<typeof Drawer>;

/** Opens the fully featured drawer and asserts every region rendered in the portaled dialog. */
export const KitchenSink: Story = {
  render: () => (
    <Drawer
      trigger={<Drawer.Trigger>Edit profile</Drawer.Trigger>}
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
        The body sits between the header and footer and scrolls on overflow.
      </Text>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }));

    const dialog = await within(document.body).findByRole("dialog");
    const dialogView = within(dialog);
    expect(dialogView.getByRole("heading", { name: "Edit profile" })).toBeInTheDocument();
    expect(dialogView.getByText("Update your account details")).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Save" })).toBeInTheDocument();
  },
};

/** A `side="left"` drawer docks flush to the left edge of the viewport. */
export const LeftSide: Story = {
  render: () => (
    <Drawer
      side="left"
      trigger={<Drawer.Trigger>Open left</Drawer.Trigger>}
      header={<Drawer.Header title="Opens from the left" />}
    >
      <Text render={<p />}>This drawer slides in from the left edge.</Text>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open left" }));

    const dialog = await within(document.body).findByRole("dialog");
    // A left drawer sits against the left edge; a right one would be far from 0.
    await waitFor(() => expect(dialog.getBoundingClientRect().left).toBeLessThan(40));
  },
};

/** While `loading`, the body is replaced by a centred spinner and the dialog is `aria-busy`. */
export const LoadingSpinner: Story = {
  name: "Loading (busy)",
  render: () => (
    <Drawer
      loading
      trigger={<Drawer.Trigger>Open loading</Drawer.Trigger>}
      header={<Drawer.Header title="Loading content" />}
    >
      <Text render={<p />}>This body is hidden behind a spinner while loading.</Text>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open loading" }));
    const dialog = await within(document.body).findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
  },
};
