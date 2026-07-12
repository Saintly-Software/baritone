import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text";
import { Popover } from "./index";

type SideName = "top" | "right" | "bottom" | "left";

/**
 * Interaction coverage for `Popover`. Each story opens the popover from its
 * trigger and asserts the portaled dialog — the regions it renders, or the side
 * it resolves to (`data-side`), placed with room so it never collision-flips.
 */
const meta: Meta<typeof Popover> = {
  title: "Interaction Tests/Popover",
  component: Popover,
};
export default meta;

type Story = StoryObj<typeof Popover>;

/** Opens the fully featured popover and asserts every region rendered in the portaled dialog. */
export const KitchenSink: Story = {
  render: () => (
    <Popover
      trigger={<Popover.Trigger>Account</Popover.Trigger>}
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
      <Text render={<p />}>Content sits between the header and footer.</Text>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));

    const dialog = await within(document.body).findByRole("dialog");
    const dialogView = within(dialog);
    expect(dialogView.getByRole("heading", { name: "Your account" })).toBeInTheDocument();
    expect(dialogView.getByText("Signed in as ada@example.com")).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(dialogView.getByRole("button", { name: "Save" })).toBeInTheDocument();
  },
};

/** A single popover, centred with room, that resolves to the requested `side` with no flip. */
function makeSideStory(side: SideName): Story {
  return {
    render: () => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 360,
          padding: 120,
        }}
      >
        <Popover side={side} trigger={<Popover.Trigger>{side}</Popover.Trigger>}>
          <Text render={<p />}>Placed on the {side}.</Text>
        </Popover>
      </div>
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: side }));
      const dialog = await within(document.body).findByRole("dialog");
      await waitFor(() => expect(dialog).toHaveAttribute("data-side", side));
    },
  };
}

export const SideTop: Story = makeSideStory("top");
export const SideRight: Story = makeSideStory("right");
export const SideBottom: Story = makeSideStory("bottom");
export const SideLeft: Story = makeSideStory("left");
