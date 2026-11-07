import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { ScrollArea } from "./index";

const meta: Meta<typeof ScrollArea> = {
  title: "Interaction Tests/ScrollArea",
  component: ScrollArea,
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

const Tall = () => (
  <div style={{ display: "grid", gap: 12 }}>
    {Array.from({ length: 30 }, (_, i) => (
      <p key={i} style={{ margin: 0, fontFamily: "system-ui" }}>
        Line {i + 1} — the quick brown fox jumps over the lazy dog.
      </p>
    ))}
  </div>
);

const Wide = () => (
  <div style={{ display: "flex", gap: 12 }}>
    {Array.from({ length: 30 }, (_, i) => (
      <div key={i} style={{ flex: "0 0 auto", width: 120, fontFamily: "system-ui" }}>
        Column {i + 1}
      </div>
    ))}
  </div>
);

const Big = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(20, 60px)",
      gap: 8,
      fontFamily: "system-ui",
    }}
  >
    {Array.from({ length: 400 }, (_, i) => (
      <div key={i} style={{ height: 40 }}>
        {i + 1}
      </div>
    ))}
  </div>
);

const getRoot = (canvasElement: HTMLElement, label: string) =>
  canvasElement.querySelector(`[aria-label="${label}"]`)!.parentElement!;

const waitForBar = async (rootEl: HTMLElement, axis: "vertical" | "horizontal") => {
  return waitFor(() => {
    const el = rootEl.querySelector(`[data-orientation="${axis}"]`);
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
};

export const Vertical: Story = {
  render: () => (
    <ScrollArea aria-label="Vertical" style={{ height: 200, width: 360 }}>
      <Tall />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = getRoot(canvasElement, "Vertical");
    const bar = await waitForBar(rootEl, "vertical");

    expect(rootEl.querySelector('[data-orientation="horizontal"]')).toBeNull();

    expect(getComputedStyle(bar).opacity).toBe("0");
    await userEvent.hover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("1"));
    await userEvent.unhover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("0"));
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" aria-label="Horizontal" style={{ width: 360 }}>
      <Wide />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = getRoot(canvasElement, "Horizontal");
    const bar = await waitForBar(rootEl, "horizontal");

    expect(rootEl.querySelector('[data-orientation="vertical"]')).toBeNull();

    expect(getComputedStyle(bar).opacity).toBe("0");
    await userEvent.hover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("1"));
    await userEvent.unhover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("0"));
  },
};

export const Both: Story = {
  render: () => (
    <ScrollArea orientation="both" aria-label="Both" style={{ height: 200, width: 360 }}>
      <Big />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = getRoot(canvasElement, "Both");
    const verticalBar = await waitForBar(rootEl, "vertical");
    const horizontalBar = await waitForBar(rootEl, "horizontal");

    expect(getComputedStyle(verticalBar).opacity).toBe("0");
    expect(getComputedStyle(horizontalBar).opacity).toBe("0");

    await userEvent.hover(rootEl);
    await waitFor(() => {
      expect(getComputedStyle(verticalBar).opacity).toBe("1");
      expect(getComputedStyle(horizontalBar).opacity).toBe("1");
    });

    await userEvent.unhover(rootEl);
    await waitFor(() => {
      expect(getComputedStyle(verticalBar).opacity).toBe("0");
      expect(getComputedStyle(horizontalBar).opacity).toBe("0");
    });
  },
};
