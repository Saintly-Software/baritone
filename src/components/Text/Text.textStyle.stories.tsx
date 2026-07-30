import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { type BrandSeed, buildDefaultTokens, type TextStyleDef, vars } from "../../theme";
import { BaritoneTheme } from "../BaritoneTheme";
import { Heading } from "../Heading";
import { Text } from "./index";

/**
 * `textStyle` is the typographic sibling of `font`: an **open, app-defined**
 * vocabulary of named roles, published by the theme. Where `font` names one family,
 * a `textStyle` bundles several properties (size, line-height, weight, family) under
 * one name — so an app can say `textStyle="title"` instead of scattering inline
 * `style={{ lineHeight, … }}` overrides across every title, body, and label.
 *
 * A style is a **baseline**: explicit props always win
 * (`explicit prop > textStyle > level default > base token`). It rides the same
 * seam as `font` — the theme publishes `--textStyle-<name>-*` custom properties
 * (via the `textStyles` option), the component points the recipe's instance vars at
 * them, and a name is declared on `TextStyleRegistry` for autocompletion.
 */
const meta: Meta<typeof Text> = {
  title: "Typography/textStyle",
  component: Text,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "An app-defined vocabulary of named typography roles, published by the " +
          "theme's `textStyles` option and selected via the `textStyle` prop on " +
          "`Text`/`Heading`. A bundle sets a baseline that explicit props override.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

// A demo app's typography roles. Each names a reusable bundle; a role sets only the
// properties it owns and inherits the rest (an omitted `weight` stays on the base
// default, an omitted family on `sans`). `title` uses the serif family published
// below; `lyric` is a loose, readable body; `badge` is a compact glyph line.
const TEXT_STYLES = {
  title: { size: "5xl", lineHeight: 1.04, weight: "bold", font: "serif" },
  lyric: { size: "xl", lineHeight: 1.85, font: "serif" },
  badge: { size: "sm", lineHeight: 1, weight: "semibold" },
} satisfies Record<string, TextStyleDef>;

// The app also publishes a `serif` family (a `font`-prop entry), which `title` and
// `lyric` reference by name — the two open vocabularies compose.
const SEED: BrandSeed = { fonts: { sans: '"Inter", system-ui, sans-serif' } };
const SERIF = 'Georgia, "Times New Roman", serif';

/** A themed root that publishes the roles, so `textStyle="…"` resolves inside it. */
function Themed({ children }: { children: ReactNode }) {
  return (
    <BaritoneTheme
      tokens={buildDefaultTokens("light", SEED)}
      scheme="light"
      fonts={{ serif: SERIF }}
      textStyles={TEXT_STYLES}
      style={{
        display: "grid",
        gap: 20,
        padding: 24,
        borderRadius: 16,
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      }}
    >
      {children}
    </BaritoneTheme>
  );
}

/**
 * The three roles, each applied by name. `title` on a `Heading` replaces the level's
 * default size/weight; `lyric` and `badge` on `Text` replace the `md` default.
 */
export const Roles: Story = {
  render: () => (
    <Themed>
      <Heading level={1} textStyle="title">
        A named title role
      </Heading>
      <Text textStyle="lyric">
        A lyric/body role — a larger size at a looser line-height, in the serif family. The whole
        bundle is one word at the call site instead of three inline overrides.
      </Text>
      <Text textStyle="badge" textTransform="uppercase" letterSpacing="wide">
        Badge role
      </Text>
    </Themed>
  ),
};

/**
 * `textStyle` is a *baseline*. Explicit props win over the bundle, so the same
 * `title` role can be nudged per instance — here to a smaller `size` and a
 * non-serif `font` — without editing the published style.
 */
export const ExplicitPropsWin: Story = {
  render: () => (
    <Themed>
      <Heading level={2} textStyle="title">
        title, as published
      </Heading>
      <Heading level={2} textStyle="title" size="2xl">
        title, nudged to size=&quot;2xl&quot;
      </Heading>
      <Heading level={2} textStyle="title" font="sans">
        title, nudged to font=&quot;sans&quot;
      </Heading>
    </Themed>
  ),
};

/**
 * A role sets only the properties it owns; the rest fall through to the base
 * defaults. `badge` here omits the family, so it stays on `sans`; `emphasis` sets
 * *only* a weight, keeping the ambient size and family — proof that omitted
 * properties chain to the base token rather than resetting to something arbitrary.
 */
export const PartialBundles: Story = {
  render: () => (
    <BaritoneTheme
      tokens={buildDefaultTokens("light", SEED)}
      scheme="light"
      fonts={{ serif: SERIF }}
      textStyles={{
        emphasis: { weight: "bold" },
        looseOnly: { lineHeight: 2 },
      }}
      style={{
        display: "grid",
        gap: 12,
        padding: 24,
        borderRadius: 16,
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      }}
    >
      <Text>Plain body — the md baseline.</Text>
      <Text textStyle="emphasis">
        emphasis — only weight is set, so size and family match the baseline.
      </Text>
      <Text textStyle="looseOnly">
        looseOnly — only line-height is set; the size and weight are the baseline&rsquo;s, just with
        more room between lines. Wrap this across a couple of lines to see it.
      </Text>
    </BaritoneTheme>
  ),
};
