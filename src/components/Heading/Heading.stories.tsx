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
    mono: { control: "boolean" },
    textAlign: { control: "inline-radio", options: ["start", "center", "end"] },
    whiteSpace: { control: "inline-radio", options: ["normal", "nowrap"] },
    overflowWrap: { control: "inline-radio", options: ["normal", "break-word"] },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

// Interactive default — tune every knob (level, size, weight, italic, mono,
// textAlign, whiteSpace, overflowWrap) from the controls panel.
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
