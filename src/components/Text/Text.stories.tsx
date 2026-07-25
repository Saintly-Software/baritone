import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { INTENTS, SALIENCIES, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
  title: "Typography/Text",
  component: Text,
  args: { children: "The quick brown fox", size: "md", saliency: "mid" },
  argTypes: {
    size: { control: "select", options: TEXT_SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    mono: { control: "boolean" },
    align: { control: "inline-radio", options: ["start", "center"] },
    wrap: { control: "inline-radio", options: ["wrap", "nowrap"] },
    wordBreak: { control: "inline-radio", options: ["break-word", "normal"] },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

// Interactive default — tune every knob from the controls panel. Renamed from
// "Playground".
export const Basic: Story = {};

const thStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "8px 12px",
  whiteSpace: "nowrap",
  verticalAlign: "bottom",
};

const cellStyle: CSSProperties = {
  padding: "8px 12px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "baseline",
};

/**
 * Every typography `size` (rows, the full shared scale) against every `weight`
 * (columns), each cell showing regular and italic. `Text` and `Heading` render
 * the same scale, so the larger rows read as display type.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>size</th>
            {TEXT_WEIGHTS.map((weight) => (
              <th key={weight} style={thStyle}>
                {weight}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEXT_SIZES.map((size) => (
            <tr key={size}>
              <th scope="row" style={{ ...thStyle, ...cellStyle }}>
                {size}
              </th>
              {TEXT_WEIGHTS.map((weight) => (
                <td key={weight} style={cellStyle}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <Text size={size} weight={weight}>
                      Baritone
                    </Text>
                    <Text size={size} weight={weight} italic>
                      Baritone
                    </Text>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/**
 * Every `intent` (rows) against every `saliency` (columns). Each cell renders the
 * colour token for that combination, so you can read a full matrix of the text
 * palette at a glance.
 */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <Text intent={intent} saliency={saliency}>
          The quick brown fox
        </Text>
      )}
    </IntentSaliencyMatrix>
  ),
};
