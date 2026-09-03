import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar, iconColorVar } from "../../styles/vars.css";
import { FORM_STATES, FORM_STATE_INTENT } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Border + background are published as CSS vars so the one `base` reads them and
// the `state` variant just swaps values (mirrors `formControlRecipe`).
const bd = createVar();
const bg = createVar();

/**
 * The drop target: a tall, dashed, centred box that's also the click target —
 * a transparent full-bleed file `<input>` (`fileUploadInput`) overlays it, so
 * a click anywhere opens the system picker and stays keyboard-operable (the
 * ring is drawn here via `:focus-within`).
 *
 * Token wiring mirrors `formControlRecipe`: `state` drives border/background
 * and publishes the focus-ring colour. A drag hover (`data-dragging`) switches
 * the border to the accent colour to signal it'll accept the drop.
 */
export const fileUploadDropzone = recipe({
  base: {
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space[2],
    width: "100%",
    minHeight: "8rem",
    padding: vars.space[6],
    textAlign: "center",
    cursor: "pointer",
    color: vars.text.color.neutral.high,
    vars: { [iconColorVar]: vars.text.color.neutral.low },
    background: bg,
    borderStyle: "dashed",
    borderWidth: vars.borderWidth.thick,
    borderColor: bd,
    borderRadius: vars.form.borderRadius,
    transitionProperty: "border-color, background-color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-dragging="true"]': { borderColor: focusRingColorVar },
      // Disabled uses `aria-disabled` (never native) so the input stays
      // focusable; this just dims the look.
      '&[aria-disabled="true"]': { opacity: 0.55, cursor: "not-allowed" },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    // Generated from `FORM_STATES` rather than hand-listed, like
    // `formControlRecipe`, so the dropzone can't support a narrower state set.
    state: Object.fromEntries(
      FORM_STATES.map((state) => {
        const c = vars.form.color[state];
        return [
          state,
          {
            vars: {
              [bd]: c.border,
              [bg]: c.background,
              [focusRingColorVar]: vars.form.focus[FORM_STATE_INTENT[state]],
            },
          },
        ];
      }),
    ) as Record<(typeof FORM_STATES)[number], { vars: Record<string, string> }>,
  },
  defaultVariants: { state: "neutral" },
});

/**
 * The real `<input type="file">`, stretched transparently over the dropzone so
 * a click anywhere opens the system picker while staying keyboard-operable.
 * It sits above the decorative content (`pointer-events: none`) to capture
 * clicks; file *drops* are instead intercepted on the dropzone so they can be
 * filtered against `acceptedFileTypes` before becoming `FileInfo`s.
 */
export const fileUploadInput = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  opacity: 0,
  cursor: "pointer",
  zIndex: 1,
  selectors: {
    '&[aria-disabled="true"]': { cursor: "not-allowed" },
  },
});

/** The upload glyph — muted and decorative (`aria-hidden`); inert to clicks. */
export const fileUploadIcon = style({
  width: "1.75rem",
  height: "1.75rem",
  color: vars.text.color.neutral.low,
  pointerEvents: "none",
});

/** Centred prompt/hint stack; `pointer-events: none` so clicks reach the input. */
export const fileUploadContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[1],
  pointerEvents: "none",
});

export type FileUploadDropzoneVariants = NonNullable<RecipeVariants<typeof fileUploadDropzone>>;
