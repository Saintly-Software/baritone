import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Menu } from "./index";

/**
 * Interaction coverage for `Menu`. The `play` functions open the menu and assert
 * that hovering moves the highlight and that a `keepOpen` item leaves the menu
 * open after it fires.
 */
const meta: Meta<typeof Menu> = {
  title: "Surfaces/Menu",
  component: Menu,
  tags: ["!dev"],
};
export default meta;

type Story = StoryObj<typeof Menu>;

/** Opens the menu and moves the highlight onto a hovered item. */
export const OpensAndHighlightsItem: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Actions</Menu.Trigger>}
      items={[
        { children: "Edit", onClick: () => {} },
        { children: "Duplicate", onClick: () => {} },
        { children: "View source", onClick: () => {} },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));

    const body = within(document.body);
    const items = await body.findAllByRole("menuitem");
    expect(items).toHaveLength(3);

    const duplicate = body.getByRole("menuitem", { name: "Duplicate" });
    await userEvent.hover(duplicate);
    await waitFor(() => expect(duplicate).toHaveAttribute("data-highlighted"));
  },
};

/** A `keepOpen` item stays put after firing: the menu remains open and the label updates. */
export const KeepOpenStaysOpen: Story = {
  render: function KeepOpenStory() {
    const [count, setCount] = React.useState(0);
    return (
      <Menu
        trigger={<Menu.Trigger>Quantity: {count}</Menu.Trigger>}
        items={[
          { children: "Increment", keepOpen: true, onClick: () => setCount((c) => c + 1) },
          { children: "Reset", intent: "warning", onClick: () => setCount(0) },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Quantity: 0" }));

    const body = within(document.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Increment" }));

    // The menu stays open (items still present) and the trigger reflects the new count.
    expect(body.getByRole("menuitem", { name: "Increment" })).toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Quantity: 1" })).toBeInTheDocument(),
    );
  },
};
