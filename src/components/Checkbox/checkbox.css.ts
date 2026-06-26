import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * One checkbox row: the box followed by its label, laid out as a single
 * clickable `<label>`. Mirrors `radioItem` — same gap, font, and per-`size`
 * label scale — so a checkbox and a radio read identically in a form.
 */
export const checkboxRow = recipe({
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

/**
 * Lock the row when disabled. The box already dims itself via its own
 * `data-disabled` (see `InternalCheckbox`), so the row only swaps the cursor;
 * the label gets its matching fade from `checkboxLabelDisabled` below. Dimming
 * the two separately avoids stacking opacity on the box (0.55 × 0.55).
 */
export const checkboxRowDisabled = style({
  cursor: "not-allowed",
});

/** Fade just the label text, matching the box's own disabled opacity. */
export const checkboxLabelDisabled = style({
  opacity: 0.55,
});

export type CheckboxRowVariants = NonNullable<RecipeVariants<typeof checkboxRow>>;
