import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { ScrollArea } from "./index";

/**
 * Interaction coverage for `ScrollArea`. These run in a real browser (unlike the
 * jsdom unit tests), so base-ui can actually measure overflow and mount the
 * scrollbars — which is what these stories assert: the right scrollbars appear
 * per orientation, and they stay hidden until the area is hovered.
 */
const meta: Meta<typeof ScrollArea> = {
  title: "Layout/ScrollArea",
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

/** A vertical area mounts a vertical scrollbar and no horizontal one. */
export const VerticalScrollbar: Story = {
  render: () => (
    <ScrollArea aria-label="Vertical" style={{ height: 200, width: 360 }}>
      <Tall />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = canvasElement.querySelector('[aria-label="Vertical"]')!.parentElement!;
    await waitFor(() =>
      expect(rootEl.querySelector('[data-orientation="vertical"]')).not.toBeNull(),
    );
    expect(rootEl.querySelector('[data-orientation="horizontal"]')).toBeNull();
  },
};

/** A horizontal area mounts a horizontal scrollbar and no vertical one. */
export const HorizontalScrollbar: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" aria-label="Horizontal" style={{ width: 360 }}>
      <Wide />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = canvasElement.querySelector('[aria-label="Horizontal"]')!.parentElement!;
    await waitFor(() =>
      expect(rootEl.querySelector('[data-orientation="horizontal"]')).not.toBeNull(),
    );
    expect(rootEl.querySelector('[data-orientation="vertical"]')).toBeNull();
  },
};

/** A both-axis area mounts both scrollbars. */
export const BothScrollbars: Story = {
  render: () => (
    <ScrollArea orientation="both" aria-label="Both" style={{ height: 200, width: 360 }}>
      <Big />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = canvasElement.querySelector('[aria-label="Both"]')!.parentElement!;
    await waitFor(() => {
      expect(rootEl.querySelector('[data-orientation="vertical"]')).not.toBeNull();
      expect(rootEl.querySelector('[data-orientation="horizontal"]')).not.toBeNull();
    });
  },
};

/** The scrollbar is hidden at rest and fades in only while the area is hovered. */
export const RevealsOnHover: Story = {
  render: () => (
    <ScrollArea aria-label="Hover me" style={{ height: 200, width: 360 }}>
      <Tall />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const rootEl = canvasElement.querySelector('[aria-label="Hover me"]')!.parentElement!;
    const bar = await waitFor(() => {
      const el = rootEl.querySelector('[data-orientation="vertical"]');
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });

    // Hidden at rest.
    expect(getComputedStyle(bar).opacity).toBe("0");

    // Hovering the area reveals it.
    await userEvent.hover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("1"));

    // Leaving hides it again.
    await userEvent.unhover(rootEl);
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe("0"));
  },
};
