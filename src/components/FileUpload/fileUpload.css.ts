import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar, iconColorVar } from "../../styles/vars.css";
import { FORM_STATES, FORM_STATE_INTENT } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const bd = createVar();
const bg = createVar();

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
      '&[aria-disabled="true"]': { opacity: 0.55, cursor: "not-allowed" },
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

export const fileUploadIcon = style({
  width: "1.75rem",
  height: "1.75rem",
  color: vars.text.color.neutral.low,
  pointerEvents: "none",
});

export const fileUploadContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[1],
  pointerEvents: "none",
});

export type FileUploadDropzoneVariants = NonNullable<RecipeVariants<typeof fileUploadDropzone>>;
