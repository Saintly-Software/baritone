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
