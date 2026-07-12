import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tooltip } from "./index";

/**
 * Interaction coverage for `Tooltip`. The `play` functions open the hint by hover
 * and by keyboard focus, and assert the portaled popup and its resolved `side`.
 */
const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

type SideName = "top" | "right" | "bottom" | "left";

const centred: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 320,
  padding: 120,
};

/** Hovering the trigger opens the portaled tooltip. */
export const OpensOnHover: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip content="Copied to your clipboard">
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        "Copied to your clipboard",
      ),
    );
  },
};

/** The tooltip is keyboard-reachable: tabbing to the trigger opens it too. */
export const OpensOnFocus: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip content="Copied to your clipboard">
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "Copy" })).toHaveFocus();
    await waitFor(() => expect(within(document.body).getByRole("tooltip")).toBeInTheDocument());
  },
};

/** Long content wraps to multiple lines at the popup's max width. */
export const LongContent: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip content="This is a much longer tooltip that has to wrap onto several lines because it exceeds the popup's maximum width.">
        <Tooltip.Trigger delay={0}>Details</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Details" }));
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /exceeds the popup's maximum width/,
      ),
    );
  },
};

/** A single centred trigger whose tooltip resolves to the requested `side` with no flip. */
function makeSideStory(side: SideName): Story {
  return {
    render: () => (
      <div style={centred}>
        <Tooltip side={side} content={`side="${side}"`}>
          <Tooltip.Trigger delay={0}>{side}</Tooltip.Trigger>
        </Tooltip>
      </div>
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);
      await userEvent.hover(canvas.getByRole("button", { name: side }));
      const tooltip = await within(document.body).findByRole("tooltip");
      const positioner = tooltip.closest("[data-side]");
      await waitFor(() => expect(positioner).toHaveAttribute("data-side", side));
    },
  };
}

export const SideTop: Story = makeSideStory("top");
export const SideRight: Story = makeSideStory("right");
export const SideBottom: Story = makeSideStory("bottom");
export const SideLeft: Story = makeSideStory("left");
