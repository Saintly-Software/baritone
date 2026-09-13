import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import {
  INTENTS,
  LETTER_SPACING_KEYS,
  LINE_HEIGHT_KEYS,
  SALIENCIES,
  TEXT_SIZES,
  TEXT_WEIGHTS,
} from "../../theme/constants";
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
    letterSpacing: { control: "select", options: LETTER_SPACING_KEYS },
    lineHeight: { control: "select", options: LINE_HEIGHT_KEYS },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

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
 * The `font` vocabulary is consumer-defined: an app publishes families as
 * `--font-<name>` (via the theme's `fonts` option) and augments `FontRegistry`.
 * This story fakes that with `--font-*` vars on the wrapper.
 */
export const CustomFonts: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          "--font-serif": 'Georgia, "Times New Roman", serif',
          "--font-slab": '"Rockwell", "Roboto Slab", serif',
          "--font-cursive": '"Segoe Script", "Brush Script MT", cursive',
        } as CSSProperties
      }
    >
      <Text size="xl">Default — inherits the theme&rsquo;s sans</Text>
      <Text size="xl" font="mono">
        font=&quot;mono&quot; — the built-in monospace
      </Text>
      <Text size="xl" font="serif">
        font=&quot;serif&quot; — a consumer-defined --font-serif
      </Text>
      <Text size="xl" font="slab">
        font=&quot;slab&quot; — a consumer-defined --font-slab
      </Text>
      <Text size="xl" font="cursive">
        font=&quot;cursive&quot; — a consumer-defined --font-cursive
      </Text>
    </div>
  ),
};

/**
 * The built-in `letterSpacing` (tracking) steps, `tighter`…`widest`. Values are
 * `em`-based, so a step tracks the font-size proportionally; the canonical use is
 * a small uppercase eyebrow with `widest`. For values outside the ramp, see
 * `CustomLetterSpacing`.
 */
export const LetterSpacing: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {LETTER_SPACING_KEYS.map((letterSpacing) => (
        <div key={letterSpacing} style={{ display: "grid", gap: 2 }}>
          <Text size="xs" saliency="low">
            letterSpacing=&quot;{letterSpacing}&quot;
          </Text>
          <Text size="xl" letterSpacing={letterSpacing}>
            The quick brown fox
          </Text>
        </div>
      ))}
      <div style={{ display: "grid", gap: 2 }}>
        <Text size="xs" saliency="low">
          eyebrow — size=&quot;xs&quot; weight=&quot;bold&quot; textTransform=&quot;uppercase&quot;
          letterSpacing=&quot;widest&quot;
        </Text>
        <Text
          size="xs"
          weight="bold"
          saliency="low"
          textTransform="uppercase"
          letterSpacing="widest"
        >
          Section label
        </Text>
      </div>
    </div>
  ),
};

/**
 * Like `font`, the `letterSpacing` vocabulary is consumer-defined: an app
 * publishes `--letterSpacing-<name>` (via the `letterSpacings` option) and augments
 * `LetterSpacingRegistry`. This story fakes that with `--letterSpacing-*` vars.
 */
export const CustomLetterSpacing: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          "--letterSpacing-eyebrow": "0.2em",
          "--letterSpacing-display": "-0.03em",
        } as CSSProperties
      }
    >
      <Text size="xl">Default — inherits the theme&rsquo;s normal tracking</Text>
      <Text size="xl" letterSpacing="widest">
        letterSpacing=&quot;widest&quot; — a built-in step
      </Text>
      <Text size="xl" letterSpacing="display">
        letterSpacing=&quot;display&quot; — a consumer-defined --letterSpacing-display
      </Text>
      <Text size="xs" weight="bold" textTransform="uppercase" letterSpacing="eyebrow">
        letterSpacing=&quot;eyebrow&quot; — a consumer-defined --letterSpacing-eyebrow
      </Text>
    </div>
  ),
};

/**
 * The built-in `lineHeight` (leading) steps, `none`…`loose` — unitless multipliers
 * that scale with the font-size, overriding the leading `size` supplies. For values
 * outside the ramp, see `CustomLineHeight`.
 */
export const LineHeights: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      {LINE_HEIGHT_KEYS.map((lineHeight) => (
        <div key={lineHeight} style={{ display: "grid", gap: 4 }}>
          <Text size="xs" saliency="low">
            lineHeight=&quot;{lineHeight}&quot;
          </Text>
          <Text lineHeight={lineHeight}>
            The quick brown fox jumps over the lazy dog, then trots back across the meadow to do it
            all again.
          </Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * The `whiteSpace` atom, against the same source string — which contains a hard
 * newline and a run of consecutive spaces. `normal` (the default) collapses both
 * and wraps; `nowrap` stays on one line; `pre` preserves both but never wraps;
 * `pre-wrap` preserves them while wrapping (for user-authored copy or model
 * output); `pre-line` keeps newlines but collapses spaces; `break-spaces` also
 * wraps trailing spaces.
 */
export const WhiteSpace: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      {(["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"] as const).map(
        (whiteSpace) => (
          <div key={whiteSpace} style={{ display: "grid", gap: 4, overflowX: "auto" }}>
            <Text size="xs" saliency="low">
              whiteSpace=&quot;{whiteSpace}&quot;
            </Text>
            <Text whiteSpace={whiteSpace}>
              {
                "The quick brown fox\njumps over    the lazy dog, then trots back across the meadow."
              }
            </Text>
          </div>
        ),
      )}
    </div>
  ),
};

/**
 * Like `font`, the `size` vocabulary is consumer-defined: an app publishes
 * `--fontSize-<name>` (via the `sizes` option) and augments `FontSizeRegistry`. A
 * `{ fontSize, lineHeight }` entry also publishes a paired leading (Tailwind-style).
 * This story fakes that with `--fontSize-*` (and a paired `--sizeLineHeight-*`) vars.
 */
export const CustomSizes: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          "--fontSize-hero": "4rem",
          "--sizeLineHeight-hero": "1.05",
          "--fontSize-figure": "2.75rem",
        } as CSSProperties
      }
    >
      <Text size="xl">Default — a built-in size</Text>
      <Text size="hero" weight="bold">
        size=&quot;hero&quot; — a consumer pair (--fontSize-hero + paired --sizeLineHeight-hero)
      </Text>
      <Text size="figure">
        size=&quot;figure&quot; — a font-size-only consumer size (leading falls back to md)
      </Text>
    </div>
  ),
};

/**
 * Like `font`, the `weight` vocabulary is consumer-defined: an app publishes
 * `--fontWeight-<name>` (via the `weights` option) and augments `FontWeightRegistry`.
 * This story fakes that with `--fontWeight-*` vars.
 */
export const CustomWeights: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          "--fontWeight-hairline": "200",
          "--fontWeight-black": "900",
        } as CSSProperties
      }
    >
      <Text size="2xl">Default — the default weight</Text>
      <Text size="2xl" weight="bold">
        weight=&quot;bold&quot; — a built-in step
      </Text>
      <Text size="2xl" weight="hairline">
        weight=&quot;hairline&quot; — a consumer-defined --fontWeight-hairline
      </Text>
      <Text size="2xl" weight="black">
        weight=&quot;black&quot; — a consumer-defined --fontWeight-black
      </Text>
    </div>
  ),
};

/**
 * Like `font`, the `lineHeight` vocabulary is consumer-defined: an app publishes
 * `--lineHeight-<name>` (via the `lineHeights` option) and augments
 * `LineHeightRegistry`. This story fakes that with a `--lineHeight-*` var.
 */
export const CustomLineHeight: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 16,
          maxWidth: 360,
          "--lineHeight-airy": "2.4",
        } as CSSProperties
      }
    >
      <Text lineHeight="loose">
        lineHeight=&quot;loose&quot; — a built-in step. The quick brown fox jumps over the lazy dog
        and keeps on running.
      </Text>
      <Text lineHeight="airy">
        lineHeight=&quot;airy&quot; — a consumer-defined --lineHeight-airy. The quick brown fox
        jumps over the lazy dog and keeps on running.
      </Text>
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
