import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BaritoneProvider } from "../BaritoneProvider";
import { Button } from "../Button";
import { Notice } from "../Notice";
import { useToast, type AddToastOptions } from "./index";

const meta: Meta = {
  title: "Interaction Tests/Toast",
  decorators: [
    (Story) => (
      <BaritoneProvider>
        <Story />
      </BaritoneProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

function Trigger({ label = "Show toast", options }: { label?: string; options: AddToastOptions }) {
  const toast = useToast();
  return <Button onClick={() => toast.add({ timeout: 0, ...options })}>{label}</Button>;
}

export const ShowAndDismiss: Story = {
  render: () => (
    <Trigger
      options={{
        title: "Changes saved",
        description: "Your profile is up to date.",
        intent: "positive",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));

    const body = within(document.body);
    const toast = await body.findByRole("dialog", { name: "Changes saved" });
    expect(within(toast).getByText("Your profile is up to date.")).toBeInTheDocument();

    await userEvent.click(within(toast).getByRole("button", { name: "Dismiss" }));
    await waitFor(() =>
      expect(body.queryByRole("dialog", { name: "Changes saved" })).not.toBeInTheDocument(),
    );
  },
};

export const AnnouncedInLiveRegion: Story = {
  render: () => <Trigger options={{ title: "Connected", intent: "primary" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));

    const body = within(document.body);
    const region = await body.findByRole("region", { name: "Notifications" });
    await waitFor(() => expect(region).toHaveAttribute("aria-live", "polite"));
    expect(await within(region).findByRole("dialog", { name: "Connected" })).toBeInTheDocument();
  },
};

export const ActionDismisses: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      const archive = () => {
        const id = toast.add({
          title: "Message archived",
          timeout: 0,
          actions: [
            <Notice.Action key="undo" intent="primary" onClick={() => toast.close(id)}>
              Undo
            </Notice.Action>,
          ],
        });
      };
      return <Button onClick={archive}>Archive</Button>;
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));

    const body = within(document.body);
    const toast = await body.findByRole("dialog", { name: "Message archived" });
    await userEvent.click(within(toast).getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(body.queryByRole("dialog", { name: "Message archived" })).not.toBeInTheDocument(),
    );
  },
};

export const Stacking: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      const counter = React.useRef(0);
      return (
        <Button
          onClick={() => {
            counter.current += 1;
            toast.add({ title: `Notification ${counter.current}`, timeout: 0, intent: "primary" });
          }}
        >
          Add
        </Button>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole("button", { name: "Add" });
    await userEvent.click(add);
    await userEvent.click(add);
    await userEvent.click(add);

    const body = within(document.body);
    await waitFor(() => expect(body.getAllByRole("dialog")).toHaveLength(3));
    expect(await body.findByRole("dialog", { name: "Notification 1" })).toBeInTheDocument();
    expect(await body.findByRole("dialog", { name: "Notification 3" })).toBeInTheDocument();
  },
};
