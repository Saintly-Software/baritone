import { createVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SURFACE_SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { active, hover } from "../../theme/oklch";
import { focusRingColorVar, surfacePaddingVar, textColorVar } from "../vars.css";

const bgc = createVar();
const bgcHover = createVar();
const bgcActive = createVar();
const fg = createVar();
const bd = createVar();
const bgcDisabled = createVar();
const fgDisabled = createVar();
const bdDisabled = createVar();

/**
 * Shared recipe for the "surface" element type (Card, Page, Accordion, Popover,
 * Notice, ...). Two saliency levels: `low` (default, neutral bg + border) and
 * `high` (washed shade). Most surfaces are neutral intent; colourful intents
 * are mainly for Notice/Toast.
 *
 * Static by default — pair with `focusRingRecipe` when made interactive, or
 * set `interactive` for oklch-computed hover/active washes on a surface that
 * *is* the control (e.g. a clickable `Card`).
 *
 * Publishes resolved foreground as `--textColor` (so nested `Text` matches
 * without knowing the intent) and `padding` as `--surfacePadding` (so
 * `Card.Bleed` etc. can negate it).
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
    // When the surface itself is the control (a clickable/linkable Card), add
    // hover/active washes + pointer cursor, computed in oklch from `default`
    // (set in the compound variants below). `:not([aria-disabled])` guards keep a disabled surface inert.
    interactive: {
      false: {},
      true: {
        cursor: "pointer",
        transitionProperty: "background-color, border-color, outline-color",
        transitionDuration: vars.motion.duration.fast,
        transitionTimingFunction: vars.motion.easing.standard,
        selectors: {
          '&:hover:not([aria-disabled="true"])': { background: bgcHover },
          '&:active:not([aria-disabled="true"])': { background: bgcActive },
        },
        "@media": {
          "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
        },
      },
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
            [bgcHover]: hover(block.default.bgc),
            [bgcActive]: active(block.default.bgc),
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
    interactive: false,
  },
});

export type SurfaceVariants = NonNullable<RecipeVariants<typeof surfaceRecipe>>;
