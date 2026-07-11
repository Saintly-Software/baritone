import type { Meta, StoryObj } from "@storybook/react-vite";
import { HEADING_LEVELS, TEXT_WEIGHTS, TITLE_SIZES } from "../../theme/constants";
import { Heading } from "./index";

const meta: Meta<typeof Heading> = {
  title: "Text/Heading",
  component: Heading,
  args: { children: "The quick brown fox", level: 2 },
  argTypes: {
    level: { control: "select", options: HEADING_LEVELS },
    variant: { control: "select", options: TITLE_SIZES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    align: { control: "inline-radio", options: ["start", "center"] },
    wrap: { control: "inline-radio", options: ["wrap", "nowrap"] },
    wordBreak: { control: "inline-radio", options: ["break-word", "normal"] },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Playground: Story = {};

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

export const TitleSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {TITLE_SIZES.map((variant) => (
        <Heading key={variant} level={2} variant={variant}>
          title/{variant}
        </Heading>
      ))}
    </div>
  ),
};

export const Align: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, width: 360 }}>
      {(["start", "center"] as const).map((align) => (
        <Heading key={align} level={3} align={align}>
          align={align}
        </Heading>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {TEXT_WEIGHTS.map((weight) => (
        <Heading key={weight} level={3} weight={weight}>
          weight={weight}
        </Heading>
      ))}
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      {(["wrap", "nowrap"] as const).map((wrap) => (
        <Heading key={wrap} level={4} wrap={wrap}>
          wrap={wrap} — a longer heading that spans several lines to show wrapping
        </Heading>
      ))}
    </div>
  ),
};
