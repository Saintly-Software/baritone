import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import {
  iconColorVar,
  iconVerticalAlignVar,
  textColorVar,
  textFontVar,
  textLetterSpacingVar,
  textLineHeightVar,
  textSizeVar,
  textWeightVar,
} from "../vars.css";

// The colour an explicit `intent`/`saliency` resolves to; only set when active,
// so the base style falls through to `--textColor` (then the default) otherwise.
const override = createVar();

// Precedence: explicit `intent`/`saliency` > inherited `--textColor` (published
// by an ancestor surface/component) > the default neutral/mid text token.
const resolved = fallbackVar(override, fallbackVar(textColorVar, vars.text.color.neutral.mid));

/**
 * "text intent" recipe — resolves the text colour and mirrors it to
 * `--iconColor` so any `Icon` inside matches the surrounding text. Colour reads
 * from the ambient `--textColor` (set by an ancestor `surface`/`component`),
 * falling back to the neutral/mid token when standalone; `intent`/`saliency`
 * override it with the matching `text.color` token.
 *
 * Also publishes `--iconAlign`, the optical vertical alignment an inline `Icon`
 * takes inside text, so a glyph dropped mid-sentence sits centred against the
 * copy rather than low on the baseline. Only inline flow needs this — in flex
 * contexts (`Button`, `Chip`, `Flex`) `vertical-align` is a no-op — so it's
 * scoped here rather than set alongside the shared `--iconColor`.
 */
export const textIntentRecipe = recipe({
  base: {
    color: resolved,
    // `-0.125em` nudges the icon box down so its optical centre lines up with
    // the text; the exact value lives here (see `--iconAlign`).
    vars: { [iconColorVar]: resolved, [iconVerticalAlignVar]: "-0.125em" },
  },
  variants: {
    // Passing one of `intent`/`saliency` resolves against the other's default;
    // passing both, the compound variant below wins (emitted last in the cascade).
    intent: Object.fromEntries(
      INTENTS.map((intent) => [intent, { vars: { [override]: vars.text.color[intent].mid } }]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    saliency: Object.fromEntries(
      SALIENCIES.map((saliency) => [
        saliency,
        { vars: { [override]: vars.text.color.neutral[saliency] } },
      ]),
    ) as Record<(typeof SALIENCIES)[number], { vars: Record<string, string> }>,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: { vars: { [override]: vars.text.color[intent][saliency] } },
    })),
  ),
});

export type TextIntentVariants = NonNullable<RecipeVariants<typeof textIntentRecipe>>;

/**
 * "text size" recipe — the shared typography base plus a built-in `size` variant.
 *
 * Every typographic dimension resolves through a single `--text…` indirection
 * the base reads: family, tracking, size, leading, weight. This lets each be
 * an *open*, consumer-defined vocabulary — `Text`/`Heading` set the vars per
 * instance to a `var(--<x>-<name>)` the theme published (see `theme/fontSizes.ts`,
 * `theme/fontWeights.ts`, `theme/lineHeights.ts`).
 *
 * The `size` variant remains for module-scope callers applying a *built-in*
 * size to a raw element as a class; pair with `typographyWeight` for weight.
 * Colour-agnostic — pair with `textIntentRecipe`.
 */
export const textSizeRecipe = recipe({
  base: {
    // Single indirection for family: `font` sets `--textFont` per instance (to
    // a theme-published `var(--font-<name>)`); unset, falls back to `sans`.
    fontFamily: fallbackVar(textFontVar, vars.font.sans),
    // Same pattern for tracking: `letterSpacing` sets `--textLetterSpacing` per
    // instance (a theme's `defaultLetterSpacing` can seed it at the root); unset,
    // falls back to CSS `normal` (no added tracking). Open-ended like `font`, so
    // it's a var, not an enumerated variant. See `theme/letterSpacings.ts`.
    letterSpacing: fallbackVar(textLetterSpacingVar, "normal"),
    // Size, leading, and weight follow the same pattern: `--textSize` /
    // `--textLineHeight` come from the `size` prop (or variant below, overridden
    // by `lineHeight`); `--textWeight` from `weight` (or `typographyWeight`).
    // Unset, each falls back to the `md` / `default` token.
    fontSize: fallbackVar(textSizeVar, vars.text.size.md.fontSize),
    lineHeight: fallbackVar(textLineHeightVar, vars.text.size.md.lineHeight),
    fontWeight: fallbackVar(textWeightVar, vars.text.weight.default),
    margin: 0,
  },
  variants: {
    size: Object.fromEntries(
      TEXT_SIZES.map((size) => [
        size,
        {
          vars: {
            [textSizeVar]: vars.text.size[size].fontSize,
            [textLineHeightVar]: vars.text.size[size].lineHeight,
          },
        },
      ]),
    ) as Record<(typeof TEXT_SIZES)[number], { vars: Record<string, string> }>,
  },
});

export type TextSizeVariants = NonNullable<RecipeVariants<typeof textSizeRecipe>>;

// The optional typographic knobs, split by concern. *Family*, *size*, *leading*,
// and *weight* aren't enumerated recipe knobs — they're the `--text…` vars the
// base reads. Alignment and wrapping live separately, as plain CSS passthroughs
// in the sprinkles `atoms`.

/**
 * "typography weight" recipe — the built-in `weight` knob for module-scope
 * callers (e.g. `MetricCard`) applying a weight to a raw element as a class.
 * Sets `--textWeight`, so it must be composed alongside `textSizeRecipe`'s base.
 * `Text`/`Heading` set the same var inline instead. See `theme/fontWeights.ts`.
 */
export const typographyWeight = recipe({
  variants: {
    weight: Object.fromEntries(
      TEXT_WEIGHTS.map((weight) => [
        weight,
        { vars: { [textWeightVar]: vars.text.weight[weight] } },
      ]),
    ) as Record<(typeof TEXT_WEIGHTS)[number], { vars: Record<string, string> }>,
  },
});

export type TypographyWeightVariants = NonNullable<RecipeVariants<typeof typographyWeight>>;

/** "typography decoration" recipe — italics (and future decorative styles). */
export const typographyDecoration = recipe({
  variants: {
    italic: {
      true: { fontStyle: "italic" },
    },
  },
});

export type TypographyDecorationVariants = NonNullable<RecipeVariants<typeof typographyDecoration>>;

// Note: there's no "font" recipe, nor an open "size"/"lineHeight" recipe —
// those vocabularies are consumer-defined and open-ended, so they can't be
// enumerated into build-time variant classes. Instead `textSizeRecipe`'s base
// reads the `--text…` vars directly (see above), and `Text`/`Heading` set them
// to a theme-published `var(--<x>-<name>)`. The `size` variant + `typographyWeight`
// above stay only as a class-based convenience for the built-in values.
