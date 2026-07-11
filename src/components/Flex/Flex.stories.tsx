import type { Meta, StoryObj } from "@storybook/react-vite";
import { SPACE_KEYS } from "../../theme/constants";
import { Flex } from "./index";

const meta: Meta<typeof Flex> = {
  title: "Layout/Flex",
  component: Flex,
  argTypes: {
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    gap: { control: "select", options: SPACE_KEYS },
    direction: { control: "inline-radio", options: [undefined, "row", "column"] },
    inline: { control: "boolean" },
    wrap: { control: "boolean" },
    grow: { control: "boolean" },
    width: { control: "inline-radio", options: [undefined, "fill", "fit", "inherit"] },
    hideOn: { control: "check", options: ["mobile", "sm", "md", "lg", "xl"] },
    showOn: { control: "check", options: ["mobile", "sm", "md", "lg", "xl"] },
  },
};
export default meta;

type Story = StoryObj<typeof Flex>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: "8px 16px",
      borderRadius: 8,
      background: "var(--baritone-color-primary-500, #6366f1)",
      color: "white",
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {
  args: { gap: "4", align: "center", justify: "start" },
  render: (args) => (
    <Flex {...args}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Flex>
  ),
};

export const Column: Story = {
  render: () => (
    <Flex direction="column" gap="3">
      <Box>Top</Box>
      <Box>Middle</Box>
      <Box>Bottom</Box>
    </Flex>
  ),
};

export const SpaceBetween: Story = {
  render: () => (
    <Flex justify="between" align="center" p="4" style={{ border: "1px dashed #ccc" }}>
      <Box>Start</Box>
      <Box>End</Box>
    </Flex>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <Flex wrap gap="2" style={{ maxWidth: 240 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i}>Item {i + 1}</Box>
      ))}
    </Flex>
  ),
};

/** `Flex.Item` with `grow` — the middle child expands to fill the spare space. */
export const ItemGrow: Story = {
  render: () => (
    <Flex gap="3" p="4" style={{ border: "1px dashed #ccc" }}>
      <Box>Fixed</Box>
      <Flex.Item grow>
        <Box>grow — fills the space</Box>
      </Flex.Item>
      <Box>Fixed</Box>
    </Flex>
  ),
};

/**
 * `Flex.Item` with `shrink={false}` — the first child keeps its width while the
 * others give way in the constrained row.
 */
export const ItemShrink: Story = {
  render: () => (
    <Flex gap="3" p="4" style={{ maxWidth: 320, border: "1px dashed #ccc" }}>
      <Flex.Item shrink={false} width="12">
        <Box>won't shrink</Box>
      </Flex.Item>
      <Box>shrinks to fit shrinks to fit</Box>
      <Box>shrinks to fit shrinks to fit</Box>
    </Flex>
  ),
};

/**
 * `width` shorthand — `fill` (100%), `fit` (fit-content), and `inherit`. Each
 * `Flex` here sits in a fixed-width parent so the difference is visible.
 */
export const WidthShorthand: Story = {
  render: () => (
    <Flex direction="column" gap="3" style={{ width: 320, border: "1px dashed #ccc" }} p="3">
      <Flex width="fill" justify="center" style={{ background: "var(--baritone-color-neutral-100, #f1f1f4)" }}>
        <Box>width=&quot;fill&quot; (100%)</Box>
      </Flex>
      <Flex width="fit" justify="center" style={{ background: "var(--baritone-color-neutral-100, #f1f1f4)" }}>
        <Box>width=&quot;fit&quot;</Box>
      </Flex>
    </Flex>
  ),
};

/**
 * `hideOn` — the banner is hidden from the `md` breakpoint (768px) upward. Each
 * listed breakpoint is its own band, so `["md", "lg", "xl"]` covers everything
 * ≥768px without leaking. Resize the preview to see it disappear on wider views.
 */
export const HideOnBreakpoint: Story = {
  render: () => (
    <Flex direction="column" gap="3">
      <Flex hideOn={["md", "lg", "xl"]} justify="center" p="4" style={{ background: "var(--baritone-color-primary-500, #6366f1)", color: "white", borderRadius: 8 }}>
        Visible on mobile + sm, hidden from md up (≥768px)
      </Flex>
      <div style={{ color: "#666" }}>Always visible — resize the viewport to test.</div>
    </Flex>
  ),
};

/**
 * `showOn` — the panel is shown *only* at the `lg` breakpoint (1024px) and up.
 * Below that it is removed from layout entirely.
 */
export const ShowOnBreakpoint: Story = {
  render: () => (
    <Flex direction="column" gap="3">
      <Flex showOn={["lg", "xl"]} justify="center" p="4" style={{ background: "var(--baritone-color-primary-500, #6366f1)", color: "white", borderRadius: 8 }}>
        Only visible from lg up (≥1024px)
      </Flex>
      <div style={{ color: "#666" }}>Always visible — resize the viewport to test.</div>
    </Flex>
  ),
};

/**
 * Swap layouts across breakpoints — a mobile-only stack and a desktop-only row,
 * each toggled with `showOn`, so the same content re-flows at `md`.
 */
export const ResponsiveSwap: Story = {
  render: () => (
    <>
      <Flex showOn={["mobile", "sm"]} direction="column" gap="2">
        <Box>Stacked</Box>
        <Box>on</Box>
        <Box>mobile</Box>
      </Flex>
      <Flex showOn={["md", "lg", "xl"]} gap="3">
        <Box>Row</Box>
        <Box>on</Box>
        <Box>desktop</Box>
      </Flex>
    </>
  ),
};

/** `Flex.Item` with `alignSelf` — each child overrides the container `align`. */
export const ItemSelfAlign: Story = {
  render: () => (
    <Flex gap="3" p="4" align="center" style={{ height: 140, border: "1px dashed #ccc" }}>
      <Flex.Item alignSelf="start">
        <Box>start</Box>
      </Flex.Item>
      <Flex.Item alignSelf="center">
        <Box>center</Box>
      </Flex.Item>
      <Flex.Item alignSelf="end">
        <Box>end</Box>
      </Flex.Item>
      <Flex.Item alignSelf="stretch">
        <Box>stretch</Box>
      </Flex.Item>
    </Flex>
  ),
};
