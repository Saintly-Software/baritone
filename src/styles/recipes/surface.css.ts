import { createVar } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { INTENTS, SURFACE_SALIENCIES } from '../../theme/constants';
import { vars } from '../../theme/contract.css';

const bgc = createVar();
const fg = createVar();
const bd = createVar();
const bgcDisabled = createVar();
const fgDisabled = createVar();
const bdDisabled = createVar();
const focus = createVar();

/**
 * Shared recipe for the "surface" element type (Card, Page, Accordion, Popover,
 * Notice, ...). Two saliency levels only: `low` (default neutral background +
 * border) and `high` (a washed shade). Most surfaces use the neutral intent;
 * colourful intents exist mainly for Notice/Toast. Surfaces are static (no
 * hover) but support a focus ring for when they're made interactive.
 */
export const surfaceRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    borderRadius: vars.surface.borderRadius,
    background: bgc,
    color: fg,
    selectors: {
      '&:focus-visible': {
        outline: `2px solid ${focus}`,
        outlineOffset: '2px',
      },
      '&[aria-disabled="true"]': {
        background: bgcDisabled,
        color: fgDisabled,
        borderColor: bdDisabled,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    intent: Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        { vars: { [focus]: vars.surface.focus[intent] } },
      ]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    saliency: Object.fromEntries(
      SURFACE_SALIENCIES.map((saliency) => [saliency, {}]),
    ) as Record<(typeof SURFACE_SALIENCIES)[number], Record<string, never>>,
    padding: {
      none: { padding: vars.space[0] },
      sm: { padding: vars.space[3] },
      md: { padding: vars.space[4] },
      lg: { padding: vars.space[6] },
    },
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SURFACE_SALIENCIES.map((saliency) => {
      const block = vars.surface.color[intent][saliency];
      return {
        variants: { intent, saliency },
        style: {
          vars: {
            [bgc]: block.default.bgc,
            [fg]: block.default.text,
            [bd]: block.default.border,
            [bgcDisabled]: block.disabled.bgc,
            [fgDisabled]: block.disabled.text,
            [bdDisabled]: block.disabled.border,
          },
        },
      };
    }),
  ),
  defaultVariants: {
    intent: 'neutral',
    saliency: 'low',
    padding: 'md',
  },
});

export type SurfaceVariants = NonNullable<RecipeVariants<typeof surfaceRecipe>>;
