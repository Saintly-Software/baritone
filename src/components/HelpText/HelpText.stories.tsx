import type { Meta, StoryObj } from "@storybook/react-vite";
import { INTENTS, SALIENCIES } from "../../theme/constants";
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
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      {INTENTS.map((intent) =>
        SALIENCIES.map((saliency) => (
          <HelpText key={`${intent}-${saliency}`} intent={intent} saliency={saliency}>
            {intent} · {saliency}
          </HelpText>
        )),
      )}
    </div>
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

/** The convenience flags: `invalid` (→ negative + glyph) and `disabled` (→ dimmed). */
export const InvalidAndDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <HelpText>Neutral helper text (default).</HelpText>
      <HelpText invalid>This field is required.</HelpText>
      <HelpText disabled>This field is currently unavailable.</HelpText>
    </div>
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
