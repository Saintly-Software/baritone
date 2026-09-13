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

export const typographyDecoration = recipe({
  variants: {
    italic: {
      true: { fontStyle: "italic" },
    },
  },
});

export type TypographyDecorationVariants = NonNullable<RecipeVariants<typeof typographyDecoration>>;
