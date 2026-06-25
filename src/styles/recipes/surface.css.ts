import { createVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { focusRingColorVar, surfacePaddingVar, textColorVar } from "../vars.css";

const bgc = createVar();
const fg = createVar();
const bd = createVar();
const bgcDisabled = createVar();
const fgDisabled = createVar();
const bdDisabled = createVar();

/**
 * Shared recipe for the "surface" element type (Card, Page, Accordion, Popover,
 * Notice, ...). Two saliency levels only: `low` (default neutral background +
 * border) and `high` (a washed shade). Most surfaces use the neutral intent;
 * colourful intents exist mainly for Notice/Toast. Surfaces are static (no
 * hover); pair with the shared `focusRingRecipe` (the `intent` variant publishes
 * the ring colour) for when they're made interactive. The resolved foreground is
 * published as `--textColor` so a nested `Text` matches the surface without
 * knowing its intent, and the applied `padding` is exposed via `--surfacePadding`
 * so descendants (e.g. `Card.Bleed`) can negate it.
 */
export const surfaceRecipe = recipe({
  base: {
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    borderRadius: vars.surface.borderRadius,
    background: bgc,
    color: fg,
    vars: { [textColorVar]: fg },
    padding: surfacePaddingVar,
    selectors: {
      '&[aria-disabled="true"]': {
        background: bgcDisabled,
        color: fgDisabled,
        borderColor: bdDisabled,
        cursor: "not-allowed",
        vars: { [textColorVar]: fgDisabled },
      },
    },
  },
  variants: {
    intent: Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        { vars: { [focusRingColorVar]: vars.surface.focus[intent] } },
      ]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    saliency: Object.fromEntries(SURFACE_SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SURFACE_SALIENCIES)[number],
      Record<string, never>
    >,
    padding: {
      none: { vars: { [surfacePaddingVar]: vars.space[0] } },
      sm: { vars: { [surfacePaddingVar]: vars.space[3] } },
      md: { vars: { [surfacePaddingVar]: vars.space[4] } },
      lg: { vars: { [surfacePaddingVar]: vars.space[6] } },
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
    intent: "neutral",
    saliency: "low",
    padding: "md",
  },
});

export type SurfaceVariants = NonNullable<RecipeVariants<typeof surfaceRecipe>>;
