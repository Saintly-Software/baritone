import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Menu, type MenuProps } from "./index";

const meta: Meta<typeof Menu> = {
  title: "Surfaces/Menu",
  component: Menu,
  tags: ["!dev"],
};
export default meta;

type Story = StoryObj<typeof Menu>;

export const OpensAndHighlightsItem: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Actions</Menu.Trigger>}
      items={[
        <Menu.Item key="edit" onClick={() => {}}>
          Edit
        </Menu.Item>,
        <Menu.Item key="duplicate" onClick={() => {}}>
          Duplicate
        </Menu.Item>,
        <Menu.Item key="source" onClick={() => {}}>
          View source
        </Menu.Item>,
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

export const KeepOpenStaysOpen: Story = {
  render: function KeepOpenStory() {
    const [count, setCount] = React.useState(0);
    return (
      <Menu
        trigger={<Menu.Trigger>Quantity: {count}</Menu.Trigger>}
        items={[
          <Menu.Item key="increment" keepOpen onClick={() => setCount((c) => c + 1)}>
            Increment
          </Menu.Item>,
          <Menu.Item key="reset" intent="warning" onClick={() => setCount(0)}>
            Reset
          </Menu.Item>,
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Quantity: 0" }));

    const body = within(document.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Increment" }));

    expect(body.getByRole("menuitem", { name: "Increment" })).toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Quantity: 1" })).toBeInTheDocument(),
    );
  },
};

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
            <Menu.Item key="edit" onClick={() => {}}>
              Edit
            </Menu.Item>,
            <Menu.Item key="duplicate" onClick={() => {}}>
              Duplicate
            </Menu.Item>,
          ]}
        />
      </div>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button", { name: `Open ${side}` }));

      const body = within(document.body);
      const popup = await body.findByRole("menu");
      const positioner = popup.parentElement as HTMLElement;
      await waitFor(() => expect(positioner).toHaveAttribute("data-side", side));
    },
  };
}

export const SideTop = sideStory("top");

export const SideBottom = sideStory("bottom");

export const SideLeft = sideStory("left");

export const SideRight = sideStory("right");
