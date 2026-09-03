import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * One checkbox row: the box followed by its label, laid out as a single
 * clickable `<label>`. Mirrors `radioItem` (gap, font, per-`size` label scale)
 * so a checkbox and radio read identically in a form.
 *
 * DOM order is always box-then-label; `labelPosition` places the label purely
 * with flex direction so markup and accessible name never change. Mirrors
 * `switchRow`: `start`/`end` are inline-logical (`row-reverse`), `top` stacks with `column-reverse`.
 */
export const checkboxRow = recipe({
  base: {
    display: "inline-flex",
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
    labelPosition: {
      end: { flexDirection: "row", alignItems: "center" },
      start: { flexDirection: "row-reverse", alignItems: "center" },
      top: { flexDirection: "column-reverse", alignItems: "flex-start", gap: vars.space[1] },
    },
  },
  defaultVariants: { size: "md", labelPosition: "end" },
});

/**
 * Lock the row when disabled. The box already dims itself via its own
 * `data-disabled`, so this only swaps the cursor — the label fades separately
 * via `checkboxLabelDisabled`, avoiding stacked opacity (0.55 × 0.55).
 */
export const checkboxRowDisabled = style({
  cursor: "not-allowed",
});

/** Fade just the label text, matching the box's own disabled opacity. */
export const checkboxLabelDisabled = style({
  opacity: 0.55,
});

export type CheckboxRowVariants = NonNullable<RecipeVariants<typeof checkboxRow>>;
