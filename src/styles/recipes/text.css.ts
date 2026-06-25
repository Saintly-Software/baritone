import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { BODY_SIZES, INTENTS, SALIENCIES, TITLE_SIZES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar, textColorVar } from "../vars.css";

const ALL_SIZES = Array.from(new Set<string>([...BODY_SIZES, ...TITLE_SIZES])) as Array<
  (typeof BODY_SIZES)[number] | (typeof TITLE_SIZES)[number]
>;

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
 * "text variant" recipe — selects a typography bundle. `family` + `size` map to
 * a `text.variant` token (`body` for `Text`, `title` for `Heading`), setting
 * font-size / line-height / weight. Colour-agnostic; pair with `textIntentRecipe`.
 */
export const textVariantRecipe = recipe({
  base: {
    margin: 0,
    fontFamily: vars.font.sans,
  },
  variants: {
    family: {
      body: {},
      title: {},
    },
    size: Object.fromEntries(ALL_SIZES.map((size) => [size, {}])) as Record<
      (typeof ALL_SIZES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: [
    // Typography: body sizes.
    ...BODY_SIZES.map((size) => {
      const v = vars.text.variant.body[size];
      return {
        variants: { family: "body" as const, size },
        style: {
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          fontWeight: v.fontWeight,
        },
      };
    }),
    // Typography: title sizes.
    ...TITLE_SIZES.map((size) => {
      const v = vars.text.variant.title[size];
      return {
        variants: { family: "title" as const, size },
        style: {
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          fontWeight: v.fontWeight,
        },
      };
    }),
  ],
  defaultVariants: {
    family: "body",
    size: "base",
  },
});

export type TextVariantVariants = NonNullable<RecipeVariants<typeof textVariantRecipe>>;
