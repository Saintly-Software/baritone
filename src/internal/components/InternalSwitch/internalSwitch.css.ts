import { createVar, globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../../styles/vars.css";

// Per-state colour wiring, published as CSS vars so the one recipe `base` stays
// flat and the `state` variant just swaps values. Mirrors `checkboxControl`.
const bg = createVar();
const bd = createVar();
// `accent` is the selected colour (checked border + thumb) and the focus-ring
// colour, read from the state's mapped intent — same wiring as `checkboxControl`.
const accent = createVar();
// The *currently applied* border/thumb colour (neutral `bd` unchecked, `accent`
// checked) — one var lets hover/active shift it, and lets the thumb child read
// the track's colour.
const bdNow = createVar();
// Track geometry, set by the `size` variant; the nested thumb reads it via the
// cascade.
const trackW = createVar();
const thumb = createVar();
// Inner padding between the thumb and the track edge. Constant across sizes.
const pad = createVar();

/**
 * The switch "track" — a pill-shaped presentational control, not an `<input>`:
 * it reflects `data-checked` / `data-unchecked` / `data-disabled` set by the
 * component. Shares `checkboxControl`'s *outline* visual language so a switch
 * and checkbox read identically across themes; the difference is the pill shape
 * and the sliding accent `switchThumb` inside.
 *
 * Intentionally not focusable — `focusRingRecipe({ type: "within" })` draws the
 * ring, so a focusable element slotted inside (e.g. a hidden `<input>`) lights it
 * when tabbed to.
 */
export const switchTrack = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    background: bg,
    // Drives the thumb's `currentColor`.
    color: bdNow,
    borderRadius: vars.radius.full,
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bdNow,
    cursor: "pointer",
    transitionProperty: "border-color, background-color, color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    vars: { [bdNow]: bd, [pad]: "0.125rem" },
    selectors: {
      // Selected: border + thumb pick up the accent; background stays the form
      // surface (outline style) so the accent keeps its contrast across themes.
      "&[data-checked]": { vars: { [bdNow]: accent } },
      // Hover / press nudge the *shown* colours via relative-colour math, and
      // never fire while disabled.
      "&:hover:not([data-disabled])": {
        background: hover(bg),
        borderColor: hover(bdNow),
        color: hover(bdNow),
      },
      "&:active:not([data-disabled])": {
        background: active(bg),
        borderColor: active(bdNow),
        color: active(bdNow),
      },
      "&[data-disabled]": {
        opacity: 0.55,
        cursor: "not-allowed",
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    state: Object.fromEntries(
      FORM_STATES.map((state) => {
        const c = vars.form.color[state];
        return [
          state,
          {
            vars: {
              [bg]: c.background,
              [bd]: c.border,
              [accent]: vars.form.focus[FORM_STATE_INTENT[state]],
              [focusRingColorVar]: vars.form.focus[FORM_STATE_INTENT[state]],
            },
          },
        ];
      }),
    ) as Record<(typeof FORM_STATES)[number], { vars: Record<string, string> }>,
    size: {
      sm: { width: "1.75rem", height: "1rem", vars: { [trackW]: "1.75rem", [thumb]: "0.625rem" } },
      md: {
        width: "2.25rem",
        height: "1.25rem",
        vars: { [trackW]: "2.25rem", [thumb]: "0.8125rem" },
      },
      lg: { width: "2.75rem", height: "1.5rem", vars: { [trackW]: "2.75rem", [thumb]: "1rem" } },
    },
  },
  defaultVariants: { state: "neutral", size: "md" },
});

/**
 * The sliding thumb, sized from the track's `--thumb` var and filled with
 * `currentColor` (the track's `bdNow`). Rests at the left padding, translating to
 * the right edge as `data-checked` toggles, matching the radio/checkbox timing.
 */
export const switchThumb = style({
  position: "absolute",
  left: pad,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: thumb,
  height: thumb,
  borderRadius: vars.radius.full,
  background: "currentColor",
  pointerEvents: "none",
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-unchecked]": { transform: "translateX(0)" },
    // Travel = track width − thumb − padding on both sides − both borders.
    "&[data-checked]": {
      transform: `translateX(calc(${trackW} - ${thumb} - 2 * ${pad} - 2 * ${vars.borderWidth.thin}))`,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * A glyph riding inside the thumb (e.g. a check/cross that swaps with state).
 * Sized to a fraction of the thumb for edge breathing room, coloured with the
 * track's *background* so it reads as a cut-out against the thumb fill.
 * `--iconColor` carries the same value so a slotted `<Icon>` or bare
 * `currentColor` `<svg>` picks it up too.
 */
export const switchThumbIcon = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "68%",
  height: "68%",
  color: bg,
  vars: { [iconColorVar]: bg },
  pointerEvents: "none",
});

// Fills the wrapper with whatever glyph is slotted in (bare `<svg>` or an
// `<Icon>`'s), so its intrinsic size doesn't matter.
globalStyle(`${switchThumbIcon} svg`, {
  display: "block",
  width: "100%",
  height: "100%",
});

export type SwitchTrackVariants = NonNullable<RecipeVariants<typeof switchTrack>>;
