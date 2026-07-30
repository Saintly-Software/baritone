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
    // `size` and `weight` are open-ended (consumer-defined), like `font`; the
    // built-in scales below are the ones always available without a theme that
    // publishes more. See `CustomSizes` / `CustomWeights`.
    size: { control: "select", options: TEXT_SIZES },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    weight: { control: "select", options: TEXT_WEIGHTS },
    italic: { control: "boolean" },
    // `font` is open-ended (consumer-defined); the built-in `sans`/`mono` are the
    // two always available without a theme that publishes more. See `CustomFonts`.
    font: { control: "select", options: ["sans", "mono"] },
    textAlign: { control: "inline-radio", options: ["start", "center", "end"] },
    whiteSpace: { control: "inline-radio", options: ["normal", "nowrap"] },
    overflowWrap: { control: "inline-radio", options: ["normal", "break-word"] },
    textTransform: {
      control: "select",
      options: ["none", "uppercase", "lowercase", "capitalize"],
    },
    // `letterSpacing`, like `font`, is open-ended (consumer-defined); the built-in
    // `tighter`…`widest` steps are the ones always available without a theme that
    // publishes more. See `CustomLetterSpacing`.
    letterSpacing: { control: "select", options: LETTER_SPACING_KEYS },
    // `lineHeight`, like `font`, is open-ended (consumer-defined); the built-in
    // `none`…`loose` leadings are always available. See `CustomLineHeight`.
    lineHeight: { control: "select", options: LINE_HEIGHT_KEYS },
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
 * The `font` prop's vocabulary is defined by the *consumer*, not Baritone. An app
 * publishes families as `--font-<name>` custom properties (via the theme's `fonts`
 * option) and, for autocompletion + type-safety, declares those names by augmenting
 * the `FontRegistry` interface. `sans` and `mono` are always available.
 *
 * This story fakes a consumer by declaring a few `--font-*` vars on the wrapper, so
 * `font="serif"` / `"slab"` / `"cursive"` resolve — exactly what a real theme would
 * emit — while `font="mono"` uses the built-in.
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
 * The built-in `letterSpacing` (tracking) steps, from `tighter` to `widest`.
 * Values are `em`-based, so a step tracks the font-size proportionally. The last
 * row is the canonical use — a small, bold, uppercase eyebrow — where `widest`
 * supplies the tracking that used to require a custom `style`. For values outside
 * this ramp, an app defines its own names — see `CustomLetterSpacing`.
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
 * Like `font`, the `letterSpacing` vocabulary is defined by the *consumer*, not
 * Baritone. An app publishes tracking values as `--letterSpacing-<name>` custom
 * properties (via the theme's `letterSpacings` option) and, for autocompletion +
 * type-safety, declares those names by augmenting the `LetterSpacingRegistry`
 * interface. The built-in `tighter`…`widest` steps are always available.
 *
 * This story fakes a consumer by declaring a couple of `--letterSpacing-*` vars on
 * the wrapper, so `letterSpacing="eyebrow"` / `"display"` resolve — exactly what a
 * real theme would emit — while `letterSpacing="widest"` uses a built-in.
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
 * The built-in `lineHeight` (leading) steps, `none`…`loose` — unitless multipliers,
 * so a step scales with the font-size. `lineHeight` overrides the line-height `size`
 * otherwise supplies; each block below is the same wrapping paragraph at a different
 * leading. For values outside this ramp, an app defines its own names — see
 * `CustomLineHeight`.
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
 * Like `font`, the `size` vocabulary is defined by the *consumer*, not Baritone. An
 * app publishes font-sizes as `--fontSize-<name>` custom properties (via the theme's
 * `sizes` option) and, for autocompletion + type-safety, declares those names by
 * augmenting the `FontSizeRegistry` interface. The built-in `xs`…`9xl` ramp is always
 * available. A size given as `{ fontSize, lineHeight }` also publishes a paired
 * `--lineHeight-<name>` — a tight display leading applied by default, no `lineHeight`
 * prop needed (Tailwind-style); a bare `font-size` string falls back to the `md`
 * leading.
 *
 * This story fakes a consumer by declaring the `--fontSize-*` (and, for `hero`, a
 * paired `--lineHeight-*`) vars on the wrapper — exactly what a real theme emits for
 * `sizes: { hero: { fontSize: "4rem", lineHeight: "1.05" }, figure: "2.75rem" }`.
 */
export const CustomSizes: Story = {
  render: () => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          "--fontSize-hero": "4rem",
          "--lineHeight-hero": "1.05",
          "--fontSize-figure": "2.75rem",
        } as CSSProperties
      }
    >
      <Text size="xl">Default — a built-in size</Text>
      <Text size="hero" weight="bold">
        size=&quot;hero&quot; — a consumer pair (--fontSize-hero + paired --lineHeight-hero)
      </Text>
      <Text size="figure">
        size=&quot;figure&quot; — a font-size-only consumer size (leading falls back to md)
      </Text>
    </div>
  ),
};

/**
 * Like `font`, the `weight` vocabulary is defined by the *consumer*. An app publishes
 * weights as `--fontWeight-<name>` custom properties (via the theme's `weights`
 * option) and declares those names by augmenting the `FontWeightRegistry` interface.
 * The built-in `default`/`semibold`/`bold`/`superbold` steps are always available.
 *
 * This story fakes a consumer by declaring a couple of `--fontWeight-*` vars on the
 * wrapper, so `weight="hairline"` / `"black"` resolve.
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
 * Like `font`, the `lineHeight` vocabulary is defined by the *consumer*. An app
 * publishes leadings as `--lineHeight-<name>` custom properties (via the theme's
 * `lineHeights` option) and declares those names by augmenting the
 * `LineHeightRegistry` interface. The built-in `none`…`loose` steps are always
 * available.
 *
 * This story fakes a consumer by declaring a `--lineHeight-*` var on the wrapper, so
 * `lineHeight="airy"` resolves — while `lineHeight="loose"` uses a built-in.
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
