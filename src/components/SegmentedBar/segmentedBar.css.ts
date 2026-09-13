import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

export const segmentFillVar = createVar();
const fill = segmentFillVar;

const SEGMENT_GAP = "2px";

export const segmentedBarRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  width: "100%",
  fontFamily: vars.font.sans,
});

export const segmentedBarHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: vars.space[2],
});

export const segmentedBarTrack = recipe({
  base: {
    display: "flex",
    gap: SEGMENT_GAP,
    width: "100%",
    borderRadius: vars.radius.full,
    overflow: "hidden",
    background: vars.component.color.neutral.mid.default.bgc,
  },
  variants: {
    size: {
      sm: { height: "0.375rem" },
      md: { height: "0.625rem" },
      lg: { height: "0.875rem" },
    },
  },
  defaultVariants: { size: "md" },
});

export type SegmentedBarTrackVariants = NonNullable<RecipeVariants<typeof segmentedBarTrack>>;

export const segmentedBarFill = recipe({
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

export type SegmentedBarFillVariants = NonNullable<RecipeVariants<typeof segmentedBarFill>>;

export const segmentedBarSegment = style({
  flexBasis: 0,
  minWidth: "2px",
  background: fill,
  transitionProperty: "flex-grow",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const segmentedBarRemainder = style({
  flexBasis: 0,
  background: "transparent",
});

export const segmentedBarLegend = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const segmentedBarLegendRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
});

export const segmentedBarLegendLabel = style({
  flex: "1 1 auto",
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const segmentedBarLegendNumeric = style({
  flex: "none",
  textAlign: "end",
  fontVariantNumeric: "tabular-nums",
});

export const segmentedBarSwatch = style({
  flex: "none",
  width: "0.5625rem",
  height: "0.5625rem",
  borderRadius: vars.radius.sm,
  background: fill,
});
