import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * One switch row: the track and its label, in a single clickable `<label>`.
 * Mirrors `checkboxRow` (same gap, font, per-`size` label scale) so a switch
 * and checkbox read identically in a form.
 *
 * DOM order is always track-then-label; `labelPosition` places the label
 * purely with flex direction, so markup and accessible name never change.
 * `start`/`end` are inline-logical (`row-reverse`); `top` uses `column-reverse`.
 */
export const switchRow = recipe({
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
 * Lock the row when disabled. The track already dims via its own
 * `data-disabled` (see `InternalSwitch`), so the row only swaps the cursor;
 * `switchLabelDisabled` fades the label separately, avoiding stacked opacity
 * on the track (0.55 × 0.55).
 */
export const switchRowDisabled = style({
  cursor: "not-allowed",
});

/** Fade just the label text, matching the track's own disabled opacity. */
export const switchLabelDisabled = style({
  opacity: 0.55,
});

export type SwitchRowVariants = NonNullable<RecipeVariants<typeof switchRow>>;
