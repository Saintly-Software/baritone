import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { BODY_SIZES, INTENTS, SALIENCIES, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
  title: "Text/Text",
  component: Text,
  args: { children: "The quick brown fox", variant: "base", saliency: "mid" },
  argTypes: {
    variant: { control: "select", options: TEXT_SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
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
 * Every typography `variant` (rows, the full shared body + title scale) against
 * every `weight` (columns), each cell showing regular and italic. `Text` and
 * `Heading` render the same scale — sizes unique to the title scale (`2xl`+) take
 * title styling, so the larger rows read as display type.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>variant</th>
            {TEXT_WEIGHTS.map((weight) => (
              <th key={weight} style={thStyle}>
                {weight}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEXT_SIZES.map((size) => {
            const family = (BODY_SIZES as readonly string[]).includes(size) ? "body" : "title";
            return (
              <tr key={size}>
                <th scope="row" style={{ ...thStyle, ...cellStyle }}>
                  {family}/{size}
                </th>
                {TEXT_WEIGHTS.map((weight) => (
                  <td key={weight} style={cellStyle}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <Text variant={size} weight={weight}>
                        Baritone
                      </Text>
                      <Text variant={size} weight={weight} italic>
                        Baritone
                      </Text>
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {SALIENCIES.map((saliency) => (
        <Text key={saliency} saliency={saliency} render={<p />}>
          neutral/{saliency} — the default body colour is mid
        </Text>
      ))}
    </div>
  ),
};

export const Intents: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {INTENTS.map((intent) => (
        <Text key={intent} intent={intent} saliency="high" render={<p />}>
          {intent} text
        </Text>
      ))}
    </div>
  ),
};
