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
 * so a nested `Icon` matches. Reads the ambient `--textColor` by default (falling
 * back to neutral/mid), overridden by `intent`/`saliency`. Also publishes
 * `--iconAlign`, the optical vertical alignment an inline `Icon` takes inside text
 * (scoped to text flow, since `vertical-align` is a no-op in flex contexts).
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
 * Every dimension resolves through a `--text…` var the base reads (`--textFont` /
 * `--textLetterSpacing` / `--textSize` / `--textLineHeight` / `--textWeight`),
 * each an open vocabulary `Text`/`Heading` set per instance. The `size` variant is
 * for module-scope callers applying a built-in size as a class. Colour-agnostic.
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
 * applying a weight as a class. Sets the `--textWeight` var the `textSizeRecipe`
 * base reads, so compose it alongside that base.
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
