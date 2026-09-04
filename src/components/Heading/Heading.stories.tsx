import type { Meta, StoryObj } from "@storybook/react-vite";
import { HEADING_LEVELS, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { Heading } from "./index";

const meta: Meta<typeof Heading> = {
  title: "Typography/Heading",
  component: Heading,
  args: { children: "The quick brown fox", level: 2 },
  argTypes: {
    level: { control: "select", options: HEADING_LEVELS },
    size: { control: "select", options: TEXT_SIZES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    font: { control: "select", options: ["sans", "mono"] },
    textAlign: { control: "inline-radio", options: ["start", "center", "end"] },
    whiteSpace: {
      control: "inline-radio",
      options: ["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"],
    },
    overflowWrap: { control: "inline-radio", options: ["normal", "break-word", "anywhere"] },
    textTransform: {
      control: "select",
      options: ["none", "uppercase", "lowercase", "capitalize"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Basic: Story = {};

export const Levels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {HEADING_LEVELS.map((level) => (
        <Heading key={level} level={level}>
          h{level} — default size
        </Heading>
      ))}
    </div>
  ),
};
