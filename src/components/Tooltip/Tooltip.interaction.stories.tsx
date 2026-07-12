import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tooltip } from "./index";

/**
 * Interaction coverage for `Tooltip`. The `play` functions open the hint by hover
 * and by keyboard focus, and assert the portaled popup and its resolved `side`.
 */
const meta: Meta<typeof Tooltip> = {
  title: "Interaction Tests/Tooltip",
  component: Tooltip,
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

const centred: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 320,
  padding: 120,
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

/** `side="top"`: a centred trigger whose tooltip resolves above it with no flip. */
export const SideTop: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip side="top" content='side="top"'>
        <Tooltip.Trigger delay={0}>top</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "top" }));
    const tooltip = await within(document.body).findByRole("tooltip");
    const positioner = tooltip.closest("[data-side]");
    await waitFor(() => expect(positioner).toHaveAttribute("data-side", "top"));
  },
};

/** `side="right"`: a centred trigger whose tooltip resolves to its right with no flip. */
export const SideRight: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip side="right" content='side="right"'>
        <Tooltip.Trigger delay={0}>right</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "right" }));
    const tooltip = await within(document.body).findByRole("tooltip");
    const positioner = tooltip.closest("[data-side]");
    await waitFor(() => expect(positioner).toHaveAttribute("data-side", "right"));
  },
};

/** `side="bottom"`: a centred trigger whose tooltip resolves below it with no flip. */
export const SideBottom: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip side="bottom" content='side="bottom"'>
        <Tooltip.Trigger delay={0}>bottom</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "bottom" }));
    const tooltip = await within(document.body).findByRole("tooltip");
    const positioner = tooltip.closest("[data-side]");
    await waitFor(() => expect(positioner).toHaveAttribute("data-side", "bottom"));
  },
};

/** `side="left"`: a centred trigger whose tooltip resolves to its left with no flip. */
export const SideLeft: Story = {
  render: () => (
    <div style={centred}>
      <Tooltip side="left" content='side="left"'>
        <Tooltip.Trigger delay={0}>left</Tooltip.Trigger>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "left" }));
    const tooltip = await within(document.body).findByRole("tooltip");
    const positioner = tooltip.closest("[data-side]");
    await waitFor(() => expect(positioner).toHaveAttribute("data-side", "left"));
  },
};
