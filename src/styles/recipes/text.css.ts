import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES, TEXT_SIZES, TEXT_WEIGHTS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar, textColorVar } from "../vars.css";

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
 */
export const textIntentRecipe = recipe({
  base: {
    color: resolved,
    vars: { [iconColorVar]: resolved },
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
 * "text size" recipe — selects a typography size. `size` maps to a `text.size`
 * token, setting font-size and line-height together; the base sets the default
 * font-weight (overridden by the `weight` prop via `typographyWeight`).
 * Colour-agnostic; pair with `textIntentRecipe`.
 */
export const textSizeRecipe = recipe({
  base: {
    margin: 0,
    fontFamily: vars.font.sans,
    fontWeight: vars.text.weight.default,
  },
  variants: {
    size: Object.fromEntries(
      TEXT_SIZES.map((size) => [
        size,
        {
          fontSize: vars.text.size[size].fontSize,
          lineHeight: vars.text.size[size].lineHeight,
        },
      ]),
    ) as Record<(typeof TEXT_SIZES)[number], { fontSize: string; lineHeight: string }>,
  },
  defaultVariants: {
    size: "md",
  },
});

export type TextSizeVariants = NonNullable<RecipeVariants<typeof textSizeRecipe>>;

// The optional typographic knobs, split by concern. Each is defined after
// `textSizeRecipe` so it wins over the defaults baked into the size recipe's base
// (font-weight / font-family). Alignment and wrapping are NOT here — they're plain
// CSS-property passthroughs and live in the sprinkles `atoms` instead.

/**
 * "typography weight" recipe — the `weight` knob. Reads a `text.weight` token and
 * overrides the size recipe's default weight.
 */
export const typographyWeight = recipe({
  variants: {
    weight: Object.fromEntries(
      TEXT_WEIGHTS.map((weight) => [weight, { fontWeight: vars.text.weight[weight] }]),
    ) as Record<(typeof TEXT_WEIGHTS)[number], { fontWeight: string }>,
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

/**
 * "typography font" recipe — swaps the font family. Overrides the default `sans`
 * family from the size recipe; extend the `font` variant as more families land.
 */
export const typographyFont = recipe({
  variants: {
    font: {
      sans: { fontFamily: vars.font.sans },
      mono: { fontFamily: vars.font.mono },
    },
  },
});

export type TypographyFontVariants = NonNullable<RecipeVariants<typeof typographyFont>>;
