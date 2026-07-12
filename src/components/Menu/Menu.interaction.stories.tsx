import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Menu, type MenuProps } from "./index";

/**
 * Interaction coverage for `Menu`. The `play` functions open the menu and assert
 * behaviour that only surfaces once it's mounted: the highlight follows the
 * pointer, a `keepOpen` row leaves the menu up, and each `side` places the popup
 * where it was asked to.
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

/**
 * Builds a story that opens on the given `side` and asserts the popup landed
 * there. The trigger is centred in a roomy box so there's space on every side —
 * otherwise base-ui's collision avoidance would flip the popup and change where
 * it resolves. base-ui records the resolved placement as `data-side` on the
 * positioner (the element that wraps the `menu` popup).
 */
function sideStory(side: NonNullable<MenuProps["side"]>): Story {
  return {
    render: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          padding: 160,
        }}
      >
        <Menu
          side={side}
          trigger={<Menu.Trigger>Open {side}</Menu.Trigger>}
          items={[
            { children: "Edit", onClick: () => {} },
            { children: "Duplicate", onClick: () => {} },
          ]}
        />
      </div>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: `Open ${side}` }));

      const body = within(document.body);
      const popup = await body.findByRole("menu");
      // The positioner is the popup's parent and carries the resolved side.
      const positioner = popup.parentElement as HTMLElement;
      await waitFor(() => expect(positioner).toHaveAttribute("data-side", side));
    },
  };
}

/** Opens above the trigger. */
export const SideTop = sideStory("top");

/** Opens below the trigger (base-ui's default). */
export const SideBottom = sideStory("bottom");

/** Opens to the left of the trigger. */
export const SideLeft = sideStory("left");

/** Opens to the right of the trigger. */
export const SideRight = sideStory("right");
