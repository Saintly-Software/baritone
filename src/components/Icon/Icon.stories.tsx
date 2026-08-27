import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Text } from "../Text";
import { Icon } from "./index";

const StarSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
  </svg>
);

const CornerDownLeftSvg = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="100%"
    height="100%"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  args: { intent: "neutral", saliency: "mid", size: "md" },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
  },
  render: (args) => (
    <Icon {...args}>
      <StarSvg />
    </Icon>
  ),
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Basic: Story = {};

/** Every `intent` (rows) at each `saliency` (columns), driven by the `component` token. */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <Icon intent={intent} saliency={saliency} size="lg" label={`${intent} ${saliency}`}>
          <StarSvg />
        </Icon>
      )}
    </IntentSaliencyMatrix>
  ),
};

/**
 * Flowing inline inside `Text`, an `Icon` picks up an optical vertical alignment
 * automatically (via `--iconAlign`), so a glyph mid-sentence or at a line's end sits
 * centred against the copy instead of low on the baseline — no per-usage
 * `verticalAlign`. Shown across sizes; horizontal spacing is still the caller's.
 */
export const InlineInText: Story = {
  name: "Aligns inline within text",
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Text key={size} render={<p />} style={{ whiteSpace: "pre-wrap" }}>
          Press{" "}
          <Icon size={size} label="return">
            <CornerDownLeftSvg />
          </Icon>{" "}
          to send, or rate it{" "}
          <Icon size={size}>
            <StarSvg />
          </Icon>{" "}
          — the icon centres on the text at size {size}.
        </Text>
      ))}
    </div>
  ),
};

export const InheritsTextColour: Story = {
  name: "Inherits surrounding text colour",
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {INTENTS.map((intent) => (
        <Text key={intent} intent={intent} saliency="high" render={<p />}>
          <Icon>
            <StarSvg />
          </Icon>{" "}
          {intent} text with a matching icon
        </Text>
      ))}
    </div>
  ),
};
