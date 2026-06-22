import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import {
  BODY_SIZES,
  INTENTS,
  SALIENCIES,
  TITLE_SIZES,
} from '../../theme/constants';
import { vars } from '../../theme/contract.css';
import { iconColorVar } from '../vars.css';

const ALL_SIZES = Array.from(
  new Set<string>([...BODY_SIZES, ...TITLE_SIZES]),
) as Array<(typeof BODY_SIZES)[number] | (typeof TITLE_SIZES)[number]>;

/**
 * Shared recipe for the "text" element type — both `Text` (body variants) and
 * `Heading` (title variants) use it, so the colour/intent/saliency logic lives
 * in one place. `family` + `size` select a typography bundle from the
 * `text.variant` tokens; intent + saliency select the colour (and the icon
 * colour for any `Icon` rendered inside).
 */
export const textRecipe = recipe({
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
    intent: Object.fromEntries(
      INTENTS.map((intent) => [intent, {}]),
    ) as Record<(typeof INTENTS)[number], Record<string, never>>,
    saliency: Object.fromEntries(
      SALIENCIES.map((saliency) => [saliency, {}]),
    ) as Record<(typeof SALIENCIES)[number], Record<string, never>>,
  },
  compoundVariants: [
    // Colour: intent x saliency -> single text colour, mirrored to --iconColor.
    ...INTENTS.flatMap((intent) =>
      SALIENCIES.map((saliency) => {
        const color = vars.text.color[intent][saliency];
        return {
          variants: { intent, saliency },
          style: { color, vars: { [iconColorVar]: color } },
        };
      }),
    ),
    // Typography: body sizes.
    ...BODY_SIZES.map((size) => {
      const v = vars.text.variant.body[size];
      return {
        variants: { family: 'body' as const, size },
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
        variants: { family: 'title' as const, size },
        style: {
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          fontWeight: v.fontWeight,
        },
      };
    }),
  ],
  defaultVariants: {
    family: 'body',
    size: 'base',
    intent: 'neutral',
    saliency: 'mid',
  },
});

export type TextVariants = NonNullable<RecipeVariants<typeof textRecipe>>;
