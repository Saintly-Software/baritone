import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

export const segmentFillVar = createVar();
const fill = segmentFillVar;

/**
 * The gap between adjacent slices. Deliberately a gap in the track rather than a
 * border around each slice: a stroke would add a second edge colour to reason
 * about at every boundary, while a gap separates neighbours with the surface
 * already behind them. Kept small enough that it barely distorts the shares.
 */
const SEGMENT_GAP = "2px";

/**
 * SegmentedBar root — a vertical stack: optional header, the track, the legend.
 * Full-width so it flexes to whatever container it's dropped into.
 */
export const segmentedBarRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  width: "100%",
  fontFamily: vars.font.sans,
});

/**
 * The header row above the track — the label sits at the start, the optional
 * total read-out at the end. `space-between` pushes them apart and `baseline`
 * keeps their text on a shared line even when the two slots differ in size.
 */
export const segmentedBarHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: vars.space[2],
});

/**
 * The track — the full range rail the slices sit in. Backed by the washed
 * `neutral` `mid` component fill, which shows through both the gaps between
 * slices and any remainder left when an explicit `total` exceeds the values.
 * `overflow: hidden` clips the outermost slices to the pill radius, so the bar
 * has round ends and square interior boundaries.
 */
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

/**
 * Resolves a segment's colour into the shared `fill` var. Variants only — the
 * two marks that consume it (the slice, the legend swatch) bring their own
 * geometry — so one recipe keeps a segment's two marks in lockstep by
 * construction.
 *
 * The fill reads `text.color[intent][saliency]`: the one colour ramp that's a
 * solid, visible ink at every saliency (the `component` fills go transparent at
 * `low`), so neighbouring slices stay distinguishable at any level.
 */
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

/**
 * One slice. Sized by `flex-grow` (set inline from the segment's share) against a
 * zero basis, so the slices always divide the track exactly — no percentage
 * rounding to reconcile. `minWidth` keeps a tiny-but-nonzero share from
 * collapsing into nothing; flexbox takes the difference out of the larger slices.
 */
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

/**
 * The unfilled remainder, when an explicit `total` is larger than the values sum
 * to. Paints nothing — it just reserves its share so the track's own background
 * shows through.
 */
export const segmentedBarRemainder = style({
  flexBasis: 0,
  background: "transparent",
});

/** The legend — one row per segment, stacked. */
export const segmentedBarLegend = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
});

/**
 * A legend row: swatch, label, then the numerics pushed to the end (see
 * `segmentedBarLegendLabel`).
 */
export const segmentedBarLegendRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
});

/**
 * The legend's label cell. It takes the free space (rather than the numerics
 * carrying a `margin-inline-start: auto`), so a long label truncates against the
 * numbers instead of shoving them off the row.
 */
export const segmentedBarLegendLabel = style({
  flex: "1 1 auto",
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

/**
 * A numeric cell — the share and the value. Tabular figures so the digits line up
 * into columns down the legend, and `end` alignment so they stay flush right as
 * their widths differ.
 */
export const segmentedBarLegendNumeric = style({
  flex: "none",
  textAlign: "end",
  fontVariantNumeric: "tabular-nums",
});

/**
 * The legend swatch — the one mark carrying a segment's colour into the legend.
 * A squared-off dot, matching the slice it stands for.
 */
export const segmentedBarSwatch = style({
  flex: "none",
  width: "0.5625rem",
  height: "0.5625rem",
  borderRadius: vars.radius.sm,
  background: fill,
});
