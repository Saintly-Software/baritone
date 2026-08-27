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

// The colour an explicit `intent`/`saliency` resolves to. Only set when a
// variant is active, so the base style can fall through to the inherited
// `--textColor` (then the default token) when neither prop is passed.
const override = createVar();

// Precedence: explicit `intent`/`saliency` > inherited `--textColor` (published
// by an ancestor surface/component) > the default neutral/mid text token.
const resolved = fallbackVar(override, fallbackVar(textColorVar, vars.text.color.neutral.mid));

/**
 * "text intent" recipe — resolves the text colour and mirrors it to `--iconColor`
 * so any `Icon` rendered inside matches the surrounding text. By default the
 * colour is read from the ambient `--textColor` (set by a surrounding `surface`/
 * `component`), falling back to the neutral/mid token when standalone; passing
 * `intent` and/or `saliency` overrides it with the matching `text.color` token.
 * This is the colour half of the old `textRecipe`; the other element types (e.g.
 * the `component` recipe) reuse the same colour+icon pattern.
 *
 * It also publishes `--iconAlign`, the optical vertical alignment an inline `Icon`
 * takes inside text — so a glyph dropped mid-sentence sits centred against the copy
 * instead of low on the baseline, without callers hand-tuning `vertical-align`. Only
 * inline flow needs this: `Icon` reads it with a `baseline` fallback, and in flex
 * contexts (`Button`, `Chip`, `Flex`) `vertical-align` is a no-op, so this is scoped
 * to the text-flow recipe rather than the shared `--iconColor` set everywhere.
 */
export const textIntentRecipe = recipe({
  base: {
    color: resolved,
    // `-0.125em` nudges the 1em icon box down so its optical centre lines up with
    // the surrounding text; baritone owns the exact value (see `--iconAlign`).
    vars: { [iconColorVar]: resolved, [iconVerticalAlignVar]: "-0.125em" },
  },
  variants: {
    // Single-variant styles handle "intent and/or saliency": passing only one
    // resolves against the other's default (neutral / mid). When both are
    // passed the compound variant below wins (emitted last in the cascade).
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
 * Every typographic dimension resolves through a single `--text…` indirection the
 * base reads: family (`--textFont`), tracking (`--textLetterSpacing`), size
 * (`--textSize`), leading (`--textLineHeight`), and weight (`--textWeight`). This
 * lets each be an *open*, consumer-defined vocabulary — `Text`/`Heading` set the
 * vars per instance to a `var(--<x>-<name>)` the theme published (see
 * `theme/fontSizes.ts`, `theme/fontWeights.ts`, `theme/lineHeights.ts`).
 *
 * The `size` variant remains for module-scope callers that apply a *built-in* size
 * to a raw element as a class (it just sets `--textSize`/`--textLineHeight` to the
 * per-size tokens); pair with `typographyWeight` for the weight. Colour-agnostic;
 * pair with `textIntentRecipe`.
 */
export const textSizeRecipe = recipe({
  base: {
    // Single indirection for the family: the `font` prop sets `--textFont` per
    // instance (to a `var(--font-<name>)` the theme published); unset, it falls
    // back to the `sans` token. Mirrors how colour reads `--textColor`.
    fontFamily: fallbackVar(textFontVar, vars.font.sans),
    // Same single-indirection for tracking: the `letterSpacing` prop sets
    // `--textLetterSpacing` per instance (to a `var(--letterSpacing-<name>)` the
    // theme published), and a theme's `defaultLetterSpacing` can seed it at the
    // root; unset, it falls back to the CSS `normal` keyword (no added tracking,
    // matching bare text before this was a knob). Open-ended like `font`, so it's
    // a var here, not an enumerated variant. See `theme/letterSpacings.ts`.
    letterSpacing: fallbackVar(textLetterSpacingVar, "normal"),
    // Size, leading, and weight follow the same pattern. `--textSize` /
    // `--textLineHeight` are set by the `size` prop (or the `size` variant below);
    // `--textLineHeight` is overridden by the `lineHeight` prop; `--textWeight` by
    // the `weight` prop (or `typographyWeight`). Unset, each falls back to the
    // `md` / `default` token.
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

// The optional typographic knobs, split by concern. The *family*, *size*,
// *leading*, and *weight* are not enumerated recipe knobs on the open path — they're
// the `--text…` vars the base reads (set by the `font`/`size`/`lineHeight`/`weight`
// props). Alignment and wrapping aren't here either; they're plain CSS-property
// passthroughs and live in the sprinkles `atoms`.

/**
 * "typography weight" recipe — the built-in `weight` knob for module-scope callers
 * (e.g. `MetricCard`) that apply a weight to a raw element as a class. Sets the
 * `--textWeight` var the `textSizeRecipe` base reads, so it must be composed
 * alongside that base. The `weight` prop on `Text`/`Heading` sets the same var
 * inline instead (supporting consumer-defined weights). See `theme/fontWeights.ts`.
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

// Note: there's no "font" recipe — nor an open "size"/"lineHeight" recipe. Those
// vocabularies are consumer-defined and open-ended, so they can't be enumerated into
// build-time variant classes. Instead the base of `textSizeRecipe` reads the
// `--textFont` / `--textSize` / `--textLineHeight` / `--textWeight` vars (see above)
// and `Text`/`Heading` set them to a `var(--<x>-<name>)` the active theme published.
// See `theme/fonts.ts`, `theme/fontSizes.ts`, `theme/lineHeights.ts`,
// `theme/fontWeights.ts`. The `size` variant + `typographyWeight` above stay only as
// a class-based convenience for the built-in values.
