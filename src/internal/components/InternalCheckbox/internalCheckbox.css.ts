import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar } from "../../../styles/vars.css";

// Per-state colour wiring as CSS vars, so `base` stays flat and `state` just
// swaps values. Mirrors `radioControl`.
const bg = createVar();
const bd = createVar();
// `accent` is the selected colour (checked border + glyph) and the focus-ring
// colour, read from the state's mapped intent — same wiring as `radioControl`.
const accent = createVar();
// The *currently applied* border colour (`bd` unchecked, `accent` checked).
// One var lets the shared hover/active selectors shift whichever is showing.
const bdNow = createVar();
// Glyph box size, set by the `size` variant and read by the indicator child
// via cascade.
const glyph = createVar();

/**
 * The checkbox "box" — a square presentational control, not an `<input>`. It
 * reflects `data-checked` / `data-unchecked` / `data-indeterminate` /
 * `data-disabled` set by the component. Mirrors `radioControl`'s visual
 * language (form tokens + accent), but with a `radius.sm` square and an
 * accent glyph instead of a circle and dot.
 *
 * Intentionally not focusable — the focus ring is drawn by the shared
 * `focusRingRecipe({ type: "within" })`, lit when a nested focusable element
 * (e.g. a visually-hidden `<input>`) is tabbed to.
 */
export const checkboxControl = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: bg,
    // Drives the glyph's `currentColor`.
    color: accent,
    borderRadius: vars.radius.sm,
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bdNow,
    cursor: "pointer",
    transitionProperty: "border-color, background-color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    vars: { [bdNow]: bd },
    selectors: {
      // Selected: border picks up the accent; background stays the form
      // surface so the glyph keeps contrast across themes.
      "&[data-checked], &[data-indeterminate]": { vars: { [bdNow]: accent } },
      // Hover / press nudge the shown colours via relative-colour math; skip
      // while disabled.
      "&:hover:not([data-disabled])": {
        background: hover(bg),
        borderColor: hover(bdNow),
      },
      "&:active:not([data-disabled])": {
        background: active(bg),
        borderColor: active(bdNow),
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
      sm: { width: "1rem", height: "1rem", vars: { [glyph]: "0.75rem" } },
      md: { width: "1.25rem", height: "1.25rem", vars: { [glyph]: "0.9rem" } },
      lg: { width: "1.5rem", height: "1.5rem", vars: { [glyph]: "1.1rem" } },
    },
  },
  defaultVariants: { state: "neutral", size: "md" },
});

/**
 * The check / dash glyph. Sized from the `--glyph` var, coloured by
 * `currentColor` (the control's `accent`). Scales + fades in/out as
 * `data-checked` / `data-indeterminate` toggle, matching the radio indicator.
 */
export const checkboxIndicator = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: glyph,
  height: glyph,
  pointerEvents: "none",
  transitionProperty: "transform, opacity",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-unchecked]": { transform: "scale(0)", opacity: 0 },
    "&[data-checked], &[data-indeterminate]": { transform: "scale(1)", opacity: 1 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export type CheckboxControlVariants = NonNullable<RecipeVariants<typeof checkboxControl>>;
