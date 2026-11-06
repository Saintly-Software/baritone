import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BaritoneProvider } from "../BaritoneProvider";
import { Button } from "../Button";
import { useLayoutRegion } from "../Layout";
import { useToast } from "../Toast";
import { AppShell } from "./index";

const meta: Meta = {
  title: "Interaction Tests/AppShell",
};
export default meta;

type Story = StoryObj;

const insetTop = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--bt-layout-inset-top");

function Region({ height, label }: { height: number; label: string }) {
  const ref = useLayoutRegion({ edge: "top" });
  return (
    <div ref={ref} data-testid={label} style={{ height }}>
      {label}
    </div>
  );
}

export const MeasuredInsetOverridesDeclaredCss: Story = {
  render: () => {
    function Demo() {
      const [shown, setShown] = React.useState(true);
      return (
        <BaritoneProvider>
          <style>{":root{--bt-layout-inset-top:10px}"}</style>
          <Button onClick={() => setShown((value) => !value)}>Toggle navbar</Button>
          {shown && <Region height={48} label="navbar" />}
        </BaritoneProvider>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(insetTop()).toBe("48px"));

    await userEvent.click(canvas.getByRole("button", { name: "Toggle navbar" }));
    await waitFor(() => expect(insetTop()).toBe("10px"));
  },
};

export const StackedTopRegionsOffsetEachOther: Story = {
  render: () => {
    function Demo() {
      const [banner, setBanner] = React.useState(true);
      return (
        <BaritoneProvider>
          <Button onClick={() => setBanner(false)}>Dismiss banner</Button>
          {banner && <Region height={30} label="banner" />}
          <Region height={50} label="navbar" />
        </BaritoneProvider>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navbar = canvas.getByTestId("navbar");
    const offset = () => navbar.style.getPropertyValue("--bt-layout-offset");

    await waitFor(() => expect(offset()).toBe("30px"));
    await waitFor(() => expect(insetTop()).toBe("80px"));

    await userEvent.click(canvas.getByRole("button", { name: "Dismiss banner" }));
    await waitFor(() => expect(offset()).toBe("0px"));
    await waitFor(() => expect(insetTop()).toBe("50px"));
  },
};

function ToastButton() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ title: "Saved", timeout: 0 })}>Show toast</Button>;
}

const toastGapFromBottom = async () => {
  const toast = await within(document.body).findByRole("dialog", { name: "Saved" });
  const viewport = toast.parentElement as HTMLElement;
  return window.innerHeight - viewport.getBoundingClientRect().bottom;
};

export const ToastStacksAboveReservedFab: Story = {
  render: () => (
    <BaritoneProvider fab={{ corner: "bottom-right", width: 80, height: 80 }}>
      <ToastButton />
    </BaritoneProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show toast" }));
    await waitFor(async () => expect(await toastGapFromBottom()).toBeCloseTo(96, 0));
  },
};

export const ToastClearsPinnedFooter: Story = {
  render: () => (
    <BaritoneProvider>
      <AppShell pinFooter footer={<div style={{ height: 60 }}>Footer</div>}>
        <ToastButton />
      </AppShell>
    </BaritoneProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show toast" }));
    await waitFor(async () => expect(await toastGapFromBottom()).toBeCloseTo(76, 0));
  },
};

export const FabSlotReservesItsCorner: Story = {
  render: () => (
    <BaritoneProvider>
      <AppShell fab={<div style={{ width: 56, height: 56 }}>Help</div>}>Content</AppShell>
    </BaritoneProvider>
  ),
  play: async () => {
    const root = getComputedStyle(document.documentElement);
    await waitFor(() =>
      expect(root.getPropertyValue("--bt-layout-fab-bottom-right-width")).toBe("72px"),
    );
    expect(root.getPropertyValue("--bt-layout-fab-bottom-right-height")).toBe("72px");
  },
};
