import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { Button } from "../Button";
import { Overflow } from "./index";

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

export const Horizontal: Story = {
  render: () => (
    <Overflow aria-label="Toolbar" style={{ maxWidth: 360 }}>
      <Actions />
    </Overflow>
  ),
  play: async ({ canvasElement }) => {
    const { viewport, start, end } = parts(canvasElement, "Toolbar");

    await waitFor(() => expect(opacity(end)).toBe("1"));
    expect(opacity(start)).toBe("0");
    expect(viewport.scrollLeft).toBe(0);

    viewport.scrollTo({ left: viewport.scrollWidth });
    await waitFor(() => {
      expect(opacity(start)).toBe("1");
      expect(opacity(end)).toBe("0");
    });
    const atEnd = viewport.scrollLeft;

    await userEvent.click(start);
    await waitFor(() => {
      expect(viewport.scrollLeft).toBeLessThan(atEnd);
      expect(opacity(end)).toBe("1");
    });
  },
};

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

    await waitFor(() =>
      expect(viewport.scrollLeft).toBeGreaterThanOrEqual(viewport.clientWidth - 4),
    );
  },
};

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

    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => {
      expect(opacity(start)).toBe("1");
      expect(opacity(end)).toBe("0");
    });
    const atBottom = viewport.scrollTop;

    await userEvent.click(start);
    await waitFor(() => {
      expect(viewport.scrollTop).toBeLessThan(atBottom);
      expect(opacity(end)).toBe("1");
    });
  },
};
