import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../../styles/vars.css";

export const buttonBase = style({
  position: "relative",
});

export const buttonSquare = style({
  paddingInline: 0,
  aspectRatio: "1",
});

export const buttonContent = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
});

export const buttonContentLoading = style({
  opacity: 0,
});

export const buttonSpinner = style({
  position: "absolute",
  inset: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

const textFg = createVar();

export const textButtonRecipe = recipe({
  base: {
    appearance: "none",
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space[1],
    verticalAlign: "baseline",
    color: textFg,
    cursor: "pointer",
    borderRadius: vars.radius.sm,
    textDecorationLine: "underline",
    textDecorationThickness: "from-font",
    textUnderlineOffset: "0.15em",
    vars: { [iconColorVar]: "currentColor" },
    transitionProperty: "color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
    selectors: {
      '&:hover:not([aria-disabled="true"])': { color: hover(textFg) },
      '&:active:not([aria-disabled="true"])': { color: active(textFg) },
      '&[aria-disabled="true"]': {
        opacity: 0.55,
        cursor: "not-allowed",
      },
    },
  },
  variants: {
    intent: Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        { vars: { [focusRingColorVar]: vars.component.focus[intent] } },
      ]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: { vars: { [textFg]: vars.text.color[intent][saliency] } },
    })),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "mid",
  },
});

export type TextButtonVariants = NonNullable<RecipeVariants<typeof textButtonRecipe>>;
