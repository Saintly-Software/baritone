import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./index";

/**
 * Interaction coverage for `Button`. These stories drive the button with a `play`
 * function and assert the result, so they double as Storybook interaction tests
 * and Chromatic snapshot drivers.
 */
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

/**
 * A disabled button explains itself: `disabled` + `disabledReason` opens a
 * tooltip on hover (and keyboard focus). The `play` hovers the button and asserts
 * the reason appears in the portaled tooltip.
 */
export const DisabledTooltip: Story = {
  name: "Tooltip when disabled",
  args: {
    children: "Publish",
    disabled: true,
    disabledReason: "Add a title before publishing.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Publish" });
    await userEvent.hover(button);
    // The tooltip portals to the body, so query the document, not the canvas.
    await waitFor(
      () =>
        expect(
          within(document.body).getByText("Add a title before publishing."),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};
