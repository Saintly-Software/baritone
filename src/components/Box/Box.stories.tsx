import type { Meta, StoryObj } from "@storybook/react-vite";
import { SPACE_KEYS } from "../../theme/constants";
import { Box } from "./index";

const meta: Meta<typeof Box> = {
  title: "Layout/Box",
  component: Box,
  argTypes: {
    as: { control: "inline-radio", options: ["div", "span", "section", "article"] },
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

export const AsSection: Story = {
  render: () => (
    <Box as="section" p="4" style={swatch}>
      Rendered as a &lt;section&gt;
    </Box>
  ),
};
