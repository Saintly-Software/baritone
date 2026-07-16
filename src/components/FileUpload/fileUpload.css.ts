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
 * The drop target: a tall, dashed, centred box that doubles as the click target —
 * a transparent full-bleed file `<input>` (see `fileUploadInput`) overlays it, so
 * a click anywhere opens the system picker and the control stays natively
 * keyboard-operable (the ring is drawn on this box via `:focus-within`).
 *
 * Token wiring mirrors `formControlRecipe`: the form `state` drives the
 * border/background and publishes the focus-ring colour for the shared
 * `focusRingRecipe`. While a drag hovers it (`data-dragging`), the border switches
 * to the accent (focus) colour to signal it'll accept the drop.
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
      // Disabled is modelled with `aria-disabled` (never the native attribute) so
      // the input stays focusable; this just dims the look.
      '&[aria-disabled="true"]': { opacity: 0.55, cursor: "not-allowed" },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    // Generated from `FORM_STATES` rather than hand-listed, exactly like
    // `formControlRecipe` — so the dropzone can never support a narrower set of
    // states than the rest of the form controls.
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
 * The real `<input type="file">`, stretched transparently over the whole dropzone
 * so a click anywhere opens the system picker while the element stays natively
 * keyboard-operable. It sits above the decorative content (which is
 * `pointer-events: none`) so it captures the clicks; file *drops* are intercepted
 * on the dropzone (which `preventDefault`s the native assignment) so they can be
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
