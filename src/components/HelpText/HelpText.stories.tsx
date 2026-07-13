import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
import { HelpText } from "./index";

const VARIANTS = ["xs", "sm", "md", "lg"] as const;

// Throwaway glyph for the custom-icon story.
const InfoGlyph = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof HelpText> = {
  title: "Components/HelpText",
  component: HelpText,
  args: {
    intent: "neutral",
    saliency: "mid",
    variant: "sm",
    children: "Passwords must be at least 8 characters.",
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    variant: { control: "inline-radio", options: VARIANTS },
    children: { control: "text" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    hideIcon: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof HelpText>;

export const Playground: Story = {};

/** Every intent at each saliency. Attention intents auto-show a warning glyph. */
export const IntentsAndSaliencies: Story = {
  render: () => (
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <HelpText intent={intent} saliency={saliency}>
          {intent}
        </HelpText>
      )}
    </IntentSaliencyMatrix>
  ),
};

/** The four type sizes, largest to smallest — the icon scales with the text. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      {VARIANTS.map((variant) => (
        <HelpText key={variant} intent="primary" variant={variant} icon={<InfoGlyph />}>
          {variant} — a line of helper text
        </HelpText>
      ))}
    </div>
  ),
};

const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "10px 16px",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
};

interface StateRow {
  label: string;
  text: string;
  invalid?: boolean;
  disabled?: boolean;
}

// The convenience flags — `invalid` (→ negative + glyph) and `disabled`
// (→ dimmed) — including the combination where `disabled` wins over `invalid`.
const stateRows: StateRow[] = [
  { label: "Default", text: "Neutral helper text." },
  { label: "Invalid", text: "This field is required.", invalid: true },
  { label: "Disabled", text: "This field is currently unavailable.", disabled: true },
  {
    label: "Disabled + invalid",
    text: "Disabled wins — no error colour.",
    disabled: true,
    invalid: true,
  },
];

/** Every state (rows) against the rendered help text (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>HelpText</th>
        </tr>
      </thead>
      <tbody>
        {stateRows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {row.label}
            </th>
            <td style={cellStyle}>
              <HelpText invalid={row.invalid} disabled={row.disabled}>
                {row.text}
              </HelpText>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** A custom `icon`, and `hideIcon` to drop the glyph even on an attention intent. */
export const Icons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <HelpText intent="primary" icon={<InfoGlyph />}>
        Helper text with a custom info icon.
      </HelpText>
      <HelpText invalid hideIcon>
        Invalid, but the glyph is hidden.
      </HelpText>
    </div>
  ),
};
