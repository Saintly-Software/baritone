import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar } from "../../../styles/vars.css";

const bg = createVar();
const bd = createVar();
const accent = createVar();
const bdNow = createVar();
const glyph = createVar();

/**
 * The checkbox "box" — a square presentational control. Not an `<input>`: it
 * reflects `data-checked` / `data-unchecked` / `data-indeterminate` (and
 * `data-disabled`) that the component sets from props. It mirrors the visual
 * language of `radioControl` (form tokens + accent), but with a small `radius.sm`
 * square instead of a full circle, and an accent glyph instead of a dot.
 *
 * It is intentionally not focusable; the focus ring is drawn by the shared
 * `focusRingRecipe({ type: "within" })`, so a focusable element the consumer
 * slots inside (e.g. a visually-hidden `<input>`) lights the ring when tabbed to.
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
      "&[data-checked], &[data-indeterminate]": { vars: { [bdNow]: accent } },
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
 * The check / dash glyph. Sized from the `--glyph` var the control publishes and
 * coloured by `currentColor` (the control's `accent`). Scales + fades in/out as
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
