import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { Button } from "../Button";
import { Overflow } from "./index";

/**
 * Interaction coverage for `Overflow`. These run in a real browser (unlike the
 * jsdom unit tests), so base-ui can measure overflow, toggle its
 * `data-overflow-*` attributes, and the nav buttons can reveal + actually
 * scroll. Each story asserts three things: a nav button shows only when its edge
 * overflows, both edges reveal/hide at the extremes, and clicking a button moves
 * the viewport the right way.
 *
 * To stay deterministic, each story reaches an extreme with an *instant* manual
 * scroll (no animation in flight), asserts the button states there, and only
 * *then* clicks a nav button — so a button-driven smooth scroll is never racing
 * against a manual one.
 */
const meta: Meta<typeof Overflow> = {
  title: "Interaction Tests/Overflow",
  component: Overflow,
};
export default meta;

type Story = StoryObj<typeof Overflow>;

const Actions = () =>
  Array.from({ length: 15 }, (_, i) => (
    <Button key={i} saliency="mid">
      Action {i + 1}
    </Button>
  ));

/** The scrolling viewport and the two nav buttons for a labelled area. */
const parts = (canvasElement: HTMLElement, label: string) => {
  const viewport = canvasElement.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
  const root = viewport.closest<HTMLElement>("[data-orientation]")!;
  return {
    viewport,
    start: root.querySelector<HTMLButtonElement>('button[data-side="start"]')!,
    end: root.querySelector<HTMLButtonElement>('button[data-side="end"]')!,
  };
};

const opacity = (el: HTMLElement) => getComputedStyle(el).opacity;

/**
 * Horizontal, item mode: only the end button shows at the start; jumping to the
 * end flips which button shows; clicking the (now visible) start button scrolls
 * back toward the start.
 */
export const Horizontal: Story = {
  render: () => (
    <Overflow aria-label="Toolbar" style={{ maxWidth: 360 }}>
      <Actions />
    </Overflow>
  ),
  play: async ({ canvasElement }) => {
    const { viewport, start, end } = parts(canvasElement, "Toolbar");

    // At the start: nothing hidden to the left (start hidden), more to the right
    // (end revealed).
    await waitFor(() => expect(opacity(end)).toBe("1"));
    expect(opacity(start)).toBe("0");
    expect(viewport.scrollLeft).toBe(0);

    // Jump to the end (instant): now it's the mirror image — start shows, end hides.
    viewport.scrollTo({ left: viewport.scrollWidth });
    await waitFor(() => {
      expect(opacity(start)).toBe("1");
      expect(opacity(end)).toBe("0");
    });
    const atEnd = viewport.scrollLeft;

    // Clicking the start button scrolls back toward the start and re-reveals end.
    await userEvent.click(start);
    await waitFor(() => {
      expect(viewport.scrollLeft).toBeLessThan(atEnd);
      expect(opacity(end)).toBe("1");
    });
  },
};

/** Page mode: one click advances by (about) a whole viewport width. */
export const HorizontalPage: Story = {
  render: () => (
    <Overflow aria-label="Pager" scrollBy="page" style={{ maxWidth: 360 }}>
      <Actions />
    </Overflow>
  ),
  play: async ({ canvasElement }) => {
    const { viewport, end } = parts(canvasElement, "Pager");

    await waitFor(() => expect(opacity(end)).toBe("1"));
    expect(viewport.scrollLeft).toBe(0);
    await userEvent.click(end);

    // A page ≈ the viewport's client width (give or take sub-pixel rounding).
    await waitFor(() =>
      expect(viewport.scrollLeft).toBeGreaterThanOrEqual(viewport.clientWidth - 4),
    );
  },
};

/**
 * Vertical, item mode: only the down button shows at the top; jumping to the
 * bottom flips which button shows; clicking the (now visible) up button scrolls
 * back toward the top.
 */
export const Vertical: Story = {
  render: () => (
    <Overflow orientation="vertical" aria-label="Filters" style={{ maxHeight: 200, width: 220 }}>
      <Actions />
    </Overflow>
  ),
  play: async ({ canvasElement }) => {
    const { viewport, start, end } = parts(canvasElement, "Filters");

    await waitFor(() => expect(opacity(end)).toBe("1"));
    expect(opacity(start)).toBe("0");
    expect(viewport.scrollTop).toBe(0);

    // Jump to the bottom (instant): now the up button shows and the down hides.
    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => {
      expect(opacity(start)).toBe("1");
      expect(opacity(end)).toBe("0");
    });
    const atBottom = viewport.scrollTop;

    // Clicking the up button scrolls back toward the top and re-reveals down.
    await userEvent.click(start);
    await waitFor(() => {
      expect(viewport.scrollTop).toBeLessThan(atBottom);
      expect(opacity(end)).toBe("1");
    });
  },
};
