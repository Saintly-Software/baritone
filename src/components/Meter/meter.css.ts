import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// The indicator's fill colour, funnelled through a local var so the recipe base
// stays flat and each intent×saliency variant just swaps the value. Exported so
// the `color` escape hatch can override it inline (wins over the recipe's class).
export const meterFillVar = createVar();
const fill = meterFillVar;

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

/**
 * The header row above the track: label at the start, optional value read-out at
 * the end. `space-between` pushes them apart; `baseline` keeps both on one line.
 */
export const meterHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: vars.space[2],
});

/**
 * The track — the full range rail. Backed by the washed `neutral` `mid` fill so
 * the coloured indicator reads against it in either scheme; clipped to the pill radius.
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
 * The indicator — the filled portion. base-ui sets `width` (the value's
 * percentage) and `height: inherit` inline; we own the colour and a smooth width
 * transition. The fill reads `text.color[intent][saliency]` — the one ramp that's
 * solid, visible ink at every saliency (`component` fills go transparent at
 * `low`), so `high`/`mid`/`low` stay three distinct, always-visible bars.
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
