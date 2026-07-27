import type { Meta, StoryObj } from "@storybook/react-vite";
import { SPACE_KEYS } from "../../theme/constants";
import { Box } from "./index";

const meta: Meta<typeof Box> = {
  title: "Layout/Box",
  component: Box,
  argTypes: {
    as: { control: "inline-radio", options: ["div", "span", "section", "article"] },
    width: { control: "inline-radio", options: [undefined, "fill", "fit", "inherit"] },
    minHeight: {
      control: "select",
      options: [undefined, "screen", "screen-s", "screen-l", "full", "fit-content"],
    },
    height: {
      control: "select",
      options: [undefined, "screen", "screen-s", "screen-l", "full", "fit-content"],
    },
    maxHeight: {
      control: "select",
      options: [undefined, "screen", "screen-s", "screen-l", "full", "fit-content"],
    },
    position: {
      control: "select",
      options: [undefined, "static", "relative", "absolute", "sticky", "fixed"],
    },
    top: { control: "select", options: [undefined, ...SPACE_KEYS, "auto"] },
    inset: { control: "select", options: [undefined, ...SPACE_KEYS, "auto"] },
    hideOn: { control: "check", options: ["mobile", "sm", "md", "lg", "xl"] },
    showOn: { control: "check", options: ["mobile", "sm", "md", "lg", "xl"] },
    p: { control: "select", options: SPACE_KEYS },
    px: { control: "select", options: SPACE_KEYS },
    py: { control: "select", options: SPACE_KEYS },
    m: { control: "select", options: SPACE_KEYS },
    mx: { control: "select", options: SPACE_KEYS },
    my: { control: "select", options: SPACE_KEYS },
  },
};
export default meta;

type Story = StoryObj<typeof Box>;

const swatch = {
  borderRadius: 8,
  background: "var(--baritone-color-primary-500, #6366f1)",
  color: "white",
} as const;

export const Playground: Story = {
  args: { p: "4" },
  render: (args) => (
    <Box {...args} style={swatch}>
      A padded box
    </Box>
  ),
};

export const Padding: Story = {
  render: () => (
    <Box style={{ background: "var(--baritone-color-neutral-100, #f1f1f4)" }}>
      <Box p="6" style={swatch}>
        Padded on all sides
      </Box>
    </Box>
  ),
};

export const Margin: Story = {
  render: () => (
    <Box style={{ background: "var(--baritone-color-neutral-100, #f1f1f4)" }}>
      <Box m="6" p="3" style={swatch}>
        Margin pulls me off the edges
      </Box>
    </Box>
  ),
};

/** `width="fill"` stretches the box to its container; `fit` shrinks to content. */
export const WidthShorthand: Story = {
  render: () => (
    <Box style={{ width: 320, background: "var(--baritone-color-neutral-100, #f1f1f4)" }} p="3">
      <Box width="fill" p="3" mb="3" style={swatch}>
        width=&quot;fill&quot; (100%)
      </Box>
      <Box width="fit" p="3" style={swatch}>
        width=&quot;fit&quot;
      </Box>
    </Box>
  ),
};

/**
 * `hideOn` / `showOn` — responsive visibility. Each listed breakpoint is its own
 * band, so hiding is precise and never leaks upward. Here the first box is hidden
 * from `md` up and the second is shown only from `md` up. Resize the preview to
 * see the swap. (Pass a single breakpoint like `hideOn="md"` to hide just the
 * `md` band, 768–1023px.)
 */
export const ResponsiveVisibility: Story = {
  render: () => (
    <>
      <Box hideOn={["md", "lg", "xl"]} p="4" mb="3" style={swatch}>
        Hidden from md up (≥768px)
      </Box>
      <Box showOn={["md", "lg", "xl"]} p="4" style={swatch}>
        Shown only from md up (≥768px)
      </Box>
    </>
  ),
};

/**
 * `minHeight="screen"` — the viewport-fill token. It maps to `100dvh` (the
 * *dynamic* viewport unit), so a full-height region grows and shrinks with the
 * mobile URL bar instead of overflowing the way a raw `100vh` does. `screen-s`
 * (`100svh`) and `screen-l` (`100lvh`) pin to the small / large viewport when you
 * want a height that ignores the URL bar entirely.
 */
export const ViewportFill: Story = {
  render: () => (
    <Box minHeight="screen" p="4" style={{ ...swatch, display: "grid", placeItems: "center" }}>
      minHeight=&quot;screen&quot; — fills the viewport (100dvh)
    </Box>
  ),
};

/**
 * `position="sticky"` with a `top` inset — the header sticks to the top of the
 * scroll container as you scroll. No raw CSS needed; both `position` and `top`
 * are atoms (and responsive-capable).
 */
export const Sticky: Story = {
  render: () => (
    <Box style={{ height: 200, overflow: "auto", border: "1px dashed #ccc" }} p="3">
      <Box position="sticky" top="0" p="3" mb="3" style={{ ...swatch, zIndex: 1 }}>
        Sticky header (position=&quot;sticky&quot; top=&quot;0&quot;)
      </Box>
      {Array.from({ length: 12 }, (_, i) => (
        <Box
          key={i}
          p="2"
          mb="2"
          style={{ background: "var(--baritone-color-neutral-100, #f1f1f4)" }}
        >
          Scrolling row {i + 1}
        </Box>
      ))}
    </Box>
  ),
};
