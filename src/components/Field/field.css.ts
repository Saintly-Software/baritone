import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Field root — the visible label plus the control stack.
 *
 * The DOM order is always label-then-control, so the reading order and the
 * accessible name never depend on the visual arrangement; `labelPosition` places
 * the label purely with flex direction, mirroring `switchRow`. `start`/`end` are
 * inline-logical (`row-reverse` keeps the label on the inline-end edge in both
 * LTR and RTL) and align on the baseline, so an inline label sits on the
 * control's first line of text whatever the control's height.
 *
 * `fit` decides whether the field claims the line (`fill` — what a text input
 * wants) or shrink-wraps its content (`content` — what a checkbox row wants).
 */
export const fieldRoot = recipe({
  base: {
    minWidth: 0,
  },
  variants: {
    labelPosition: {
      top: { flexDirection: "column", gap: vars.space[1] },
      start: { flexDirection: "row", alignItems: "baseline", gap: vars.space[2] },
      end: { flexDirection: "row-reverse", alignItems: "baseline", gap: vars.space[2] },
    },
    fit: {
      fill: { display: "flex" },
      content: { display: "inline-flex" },
    },
  },
  compoundVariants: [
    {
      // Shrink-wrapping a *column* takes an explicit cross-axis alignment;
      // in a row (`start`/`end`) the items already size to their content, and
      // the baseline alignment set above must survive.
      variants: { fit: "content", labelPosition: "top" },
      style: { alignItems: "flex-start" },
    },
  ],
  defaultVariants: { labelPosition: "top", fit: "fill" },
});

/**
 * The control together with its help / error text. Rendered in every
 * `labelPosition` so the DOM shape stays constant, and so the help text aligns
 * under the *control* rather than under the label when the label is inline.
 */
export const fieldStack = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: vars.space[1],
    minWidth: 0,
  },
  variants: {
    labelPosition: {
      top: {},
      // Claim the width the inline label leaves behind.
      start: { flexGrow: 1 },
      end: { flexGrow: 1 },
    },
  },
  defaultVariants: { labelPosition: "top" },
});

/**
 * Fade the label of a disabled field, matching the opacity `InternalCheckbox` /
 * `InternalSwitch` dim their controls with so a row reads as one disabled unit.
 */
export const fieldLabelDisabled = style({
  opacity: 0.55,
});

/** Puts the `info` InfoButton on the same baseline as the label text. */
export const fieldLabelRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[1],
});

export type FieldRootVariants = NonNullable<RecipeVariants<typeof fieldRoot>>;
