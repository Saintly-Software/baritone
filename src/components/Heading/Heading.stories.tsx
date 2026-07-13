import type { Meta, StoryObj } from "@storybook/react-vite";
import { HEADING_LEVELS, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { Heading } from "./index";

const meta: Meta<typeof Heading> = {
  title: "Typography/Heading",
  component: Heading,
  args: { children: "The quick brown fox", level: 2 },
  argTypes: {
    level: { control: "select", options: HEADING_LEVELS },
    variant: { control: "select", options: TEXT_SIZES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    align: { control: "inline-radio", options: ["start", "center"] },
    wrap: { control: "inline-radio", options: ["wrap", "nowrap"] },
    wordBreak: { control: "inline-radio", options: ["break-word", "normal"] },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

// Interactive default — tune every knob (level, variant, weight, italic, align,
// wrap, wordBreak) from the controls panel. Renamed from "Playground".
export const Basic: Story = {};

export const Levels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {HEADING_LEVELS.map((level) => (
        <Heading key={level} level={level}>
          h{level} — default variant
        </Heading>
      ))}
    </div>
  ),
};
