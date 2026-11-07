import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { focusRingColorVar } from "../../styles/vars.css";

const bg = createVar();
const bd = createVar();
const accent = createVar();
const dot = createVar();

export const radioGroupRoot = recipe({
  base: {
    display: "flex",
  },
  variants: {
    orientation: {
      vertical: { flexDirection: "column", gap: vars.space[2] },
      horizontal: { flexDirection: "row", flexWrap: "wrap", gap: vars.space[4] },
    },
  },
  defaultVariants: { orientation: "vertical" },
});

export const radioGroupDisabled = style({
  opacity: 0.55,
});

export const radioItem = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space[2],
    cursor: "pointer",
    fontFamily: vars.font.sans,
    color: vars.text.color.neutral.high,
    userSelect: "none",
  },
  variants: {
    size: {
      sm: { fontSize: vars.text.size.sm.fontSize },
      md: { fontSize: vars.text.size.md.fontSize },
      lg: { fontSize: vars.text.size.lg.fontSize },
    },
  },
  defaultVariants: { size: "md" },
});

export const radioItemDisabled = style({
  opacity: 0.55,
  cursor: "not-allowed",
});

export const radioControl = recipe({
  base: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: bg,
    borderRadius: vars.radius.full,
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    transitionProperty: "border-color, background-color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      "&[data-unchecked]": { borderColor: bd },
      "&[data-checked]": { borderColor: accent },
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
      sm: { width: "1rem", height: "1rem", vars: { [dot]: "0.4rem" } },
      md: { width: "1.25rem", height: "1.25rem", vars: { [dot]: "0.5rem" } },
      lg: { width: "1.5rem", height: "1.5rem", vars: { [dot]: "0.6rem" } },
    },
  },
  defaultVariants: { state: "neutral", size: "md" },
});

export const radioIndicator = style({
  width: dot,
  height: dot,
  borderRadius: vars.radius.full,
  background: accent,
  transitionProperty: "transform, opacity",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-unchecked]": { transform: "scale(0)", opacity: 0 },
    "&[data-checked]": { transform: "scale(1)", opacity: 1 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export type RadioGroupRootVariants = NonNullable<RecipeVariants<typeof radioGroupRoot>>;
export type RadioControlVariants = NonNullable<RecipeVariants<typeof radioControl>>;
