import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

export const meterFillVar = createVar();
const fill = meterFillVar;

export const meterRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  width: "100%",
  fontFamily: vars.font.sans,
});

export const meterHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: vars.space[2],
});

export const meterTrack = style({
  position: "relative",
  width: "100%",
  height: "0.5rem",
  borderRadius: vars.radius.full,
  overflow: "hidden",
  background: vars.component.color.neutral.mid.default.bgc,
});

export const meterIndicator = recipe({
  base: {
    height: "inherit",
    background: fill,
    borderRadius: vars.radius.full,
    transitionProperty: "width",
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: { vars: { [fill]: vars.text.color[intent][saliency] } },
    })),
  ),
  defaultVariants: {
    intent: "primary",
    saliency: "high",
  },
});

export type MeterIndicatorVariants = NonNullable<RecipeVariants<typeof meterIndicator>>;
