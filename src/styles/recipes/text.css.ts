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

const override = createVar();

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
    vars: { [iconColorVar]: resolved, [iconVerticalAlignVar]: "-0.125em" },
  },
  variants: {
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
    fontFamily: fallbackVar(textFontVar, vars.font.sans),
    letterSpacing: fallbackVar(textLetterSpacingVar, "normal"),
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
