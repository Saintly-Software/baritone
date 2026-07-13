import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { ScrollArea } from "./index";

/**
 * Interaction coverage for `ScrollArea`, one story per supported orientation.
 * These run in a real browser (unlike the jsdom unit tests), so base-ui can
 * actually measure overflow and mount the scrollbars — which is what these
 * stories assert: the orientation mounts exactly the scrollbars it should, and
 * each stays hidden until the area is hovered, then fades back out on leave.
 */
const meta: Meta<typeof ScrollArea> = {
  title: "Interaction Tests/ScrollArea",
  component: ScrollArea,
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

// Tall content so a vertical area overflows.
const Tall = () => (
  <div style={{ display: "grid", gap: 12 }}>
    {Array.from({ length: 30 }, (_, i) => (
      <p key={i} style={{ margin: 0, fontFamily: "system-ui" }}>
        Line {i + 1} — the quick brown fox jumps over the lazy dog.
      </p>
    ))}
  </div>
);

// A wide row so a horizontal area overflows.
const Wide = () => (
  <div style={{ display: "flex", gap: 12 }}>
    {Array.from({ length: 30 }, (_, i) => (
      <div key={i} style={{ flex: "0 0 auto", width: 120, fontFamily: "system-ui" }}>
        Column {i + 1}
      </div>
    ))}
  </div>
);

// A wide + tall grid so a both-axis area overflows in two directions.
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

/** The root element that base-ui wraps around a viewport with this label. */
const getRoot = (canvasElement: HTMLElement, label: string) =>
  canvasElement.querySelector(`[aria-label="${label}"]`)!.parentElement!;

/** Wait for the scrollbar on `axis` to mount, then return it. */
const waitForBar = async (rootEl: HTMLElement, axis: "vertical" | "horizontal") => {
  return waitFor(() => {
    const el = rootEl.querySelector(`[data-orientation="${axis}"]`);
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
};

/**
 * A vertical area mounts only the vertical scrollbar, which is hidden at rest
 * and fades in while the area is hovered.
 */
export const Vertical: Story = {
  render: () => (
    <ScrollArea aria-label="Vertical" style={{ height: 200, width: 360 }}>
      <Tall />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = getRoot(canvasElement, "Vertical");
    const bar = await waitForBar(rootEl, "vertical");

    // Only the vertical scrollbar exists.
    expect(rootEl.querySelector('[data-orientation="horizontal"]')).toBeNull();

    // Hidden at rest, revealed on hover, hidden again on leave.
    expect(getComputedStyle(bar).opacity).toBe("0");
    await userEvent.hover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("1"));
    await userEvent.unhover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("0"));
  },
};

/**
 * A horizontal area mounts only the horizontal scrollbar, which is hidden at
 * rest and fades in while the area is hovered.
 */
export const Horizontal: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" aria-label="Horizontal" style={{ width: 360 }}>
      <Wide />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = getRoot(canvasElement, "Horizontal");
    const bar = await waitForBar(rootEl, "horizontal");

    // Only the horizontal scrollbar exists.
    expect(rootEl.querySelector('[data-orientation="vertical"]')).toBeNull();

    // Hidden at rest, revealed on hover, hidden again on leave.
    expect(getComputedStyle(bar).opacity).toBe("0");
    await userEvent.hover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("1"));
    await userEvent.unhover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("0"));
  },
};

/**
 * A both-axis area mounts both scrollbars; both are hidden at rest and fade in
 * together while the area is hovered.
 */
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

    // Both hidden at rest.
    expect(getComputedStyle(verticalBar).opacity).toBe("0");
    expect(getComputedStyle(horizontalBar).opacity).toBe("0");

    // Hovering reveals both.
    await userEvent.hover(rootEl);
    await waitFor(() => {
      expect(getComputedStyle(verticalBar).opacity).toBe("1");
      expect(getComputedStyle(horizontalBar).opacity).toBe("1");
    });

    // Leaving hides both again.
    await userEvent.unhover(rootEl);
    await waitFor(() => {
      expect(getComputedStyle(verticalBar).opacity).toBe("0");
      expect(getComputedStyle(horizontalBar).opacity).toBe("0");
    });
  },
};
