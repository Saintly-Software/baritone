import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { focusRingColorVar } from "../../styles/vars.css";

// Per-state colour wiring for the control, published as CSS vars so the one
// recipe `base` can read them and the `state` variant just swaps values.
const bg = createVar();
const bd = createVar();
// `accent` is the selected colour (border + inner dot) and the focus-ring
// colour. It mirrors `formControlRecipe`: a form `state` maps to a semantic
// intent, and we read that intent's focus token.
const accent = createVar();
// Inner-dot diameter, set by the `size` variant and read by the indicator
// (which is a child of the control, so the var cascades down).
const dot = createVar();

/** The group container — a stack of items, vertical or horizontal. */
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

/** Dim the whole group when it's disabled at the group level. */
export const radioGroupDisabled = style({
  opacity: 0.55,
});

/** One option row: the control followed by its label, as a clickable `<label>`. */
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
      sm: { fontSize: vars.text.variant.body.sm.fontSize },
      md: { fontSize: vars.text.variant.body.base.fontSize },
      lg: { fontSize: vars.text.variant.body.lg.fontSize },
    },
  },
  defaultVariants: { size: "md" },
});

/** Dim + lock a single disabled item (covers both its control and its label). */
export const radioItemDisabled = style({
  opacity: 0.55,
  cursor: "not-allowed",
});

/**
 * The radio "dot" — a circular control built on base-ui's `Radio.Root`. Mirrors
 * `formControlRecipe`: it takes a form `state` (which drives the accent + focus
 * colour) and a `size`. base-ui flags selection with `data-checked` /
 * `data-unchecked`, so the border swaps from the neutral form border to the
 * accent when selected.
 */
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

/**
 * The inner dot. Kept mounted (base-ui's `keepMounted`) so it can scale in *and*
 * out as `data-checked` toggles; its size comes from the `--dot` var the control
 * publishes, its colour from `--accent`.
 */
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
