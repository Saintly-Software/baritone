import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// The indicator's fill colour, funnelled through a local var so the recipe base
// stays flat and each intent×saliency compound variant just swaps the value.
const fill = createVar();

/**
 * Meter root — a vertical stack with the optional label sat above the track.
 * Full-width so it flexes to whatever container it's dropped into.
 */
export const meterRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  width: "100%",
  fontFamily: vars.font.sans,
});

/** The visible label above the track — neutral-high body text. */
export const meterLabel = style({
  fontSize: vars.text.variant.body.sm.fontSize,
  lineHeight: vars.text.variant.body.sm.lineHeight,
  color: vars.text.color.neutral.high,
});

/**
 * The track — the full range rail. Backed by the washed `neutral` `mid`
 * component fill so the coloured indicator reads against it in either scheme,
 * and `overflow: hidden` clips the indicator to the pill radius.
 */
export const meterTrack = style({
  position: "relative",
  width: "100%",
  height: "0.5rem",
  borderRadius: vars.radius.full,
  overflow: "hidden",
  background: vars.component.color.neutral.mid.default.bgc,
});

/**
 * The indicator — the filled portion. base-ui sets its `width` (the value's
 * percentage of the range) and `height: inherit` inline; we own the colour
 * (per intent × saliency, via the `fill` var) and a smooth width transition.
 *
 * The fill reads `text.color[intent][saliency]` — the one colour ramp that's a
 * solid, visible ink at every saliency (the `component` fills go transparent at
 * `low`), so `high` / `mid` / `low` give three distinct, always-visible bars.
 */
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
