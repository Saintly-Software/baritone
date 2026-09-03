import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Field root — the visible label plus the control stack.
 *
 * DOM order is always label-then-control, so reading order and accessible name
 * never depend on the visual arrangement; `labelPosition` places the label
 * purely with flex direction, mirroring `switchRow`. `start`/`end` are
 * inline-logical (`row-reverse` keeps the label on the inline-end edge in both
 * LTR and RTL) and align on the baseline.
 *
 * `fit` decides whether the field claims the line (`fill`, for a text input) or
 * shrink-wraps its content (`content`, for a checkbox row).
 */
export const fieldRoot = recipe({
  base: {
    minWidth: 0,
  },
  variants: {
    labelPosition: {
      top: { flexDirection: "column", gap: vars.space[2] },
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
      // Shrink-wrapping a *column* needs an explicit cross-axis alignment; in a
      // row (`start`/`end`) items already size to content and baseline survives.
      variants: { fit: "content", labelPosition: "top" },
      style: { alignItems: "flex-start" },
    },
  ],
  defaultVariants: { labelPosition: "top", fit: "fill" },
});

/**
 * The control together with its help/error text. Rendered in every
 * `labelPosition` so the DOM shape stays constant and help text aligns under
 * the control, not the label, when inline.
 */
export const fieldStack = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: vars.space[2],
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

/**
 * The `required` marker beside the label — negative-high, so it reads as the
 * conventional red asterisk. Sits in `fieldLabelRow` next to `<label>` rather
 * than inside it (see `Field`), and is decorative (`aria-hidden`): the
 * control's `aria-required` carries the semantics instead.
 */
export const fieldRequiredMarker = style({
  color: vars.text.color.negative.high,
});

export type FieldRootVariants = NonNullable<RecipeVariants<typeof fieldRoot>>;
