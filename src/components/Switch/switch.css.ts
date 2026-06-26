import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * One switch row: the track followed by its label, laid out as a single
 * clickable `<label>`. Mirrors `checkboxRow` — same gap, font, and per-`size`
 * label scale — so a switch and a checkbox read identically in a form.
 */
export const switchRow = recipe({
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
 * Lock the row when disabled. The track already dims itself via its own
 * `data-disabled` (see `InternalSwitch`), so the row only swaps the cursor; the
 * label gets its matching fade from `switchLabelDisabled` below. Dimming the two
 * separately avoids stacking opacity on the track (0.55 × 0.55).
 */
export const switchRowDisabled = style({
  cursor: "not-allowed",
});

/** Fade just the label text, matching the track's own disabled opacity. */
export const switchLabelDisabled = style({
  opacity: 0.55,
});

export type SwitchRowVariants = NonNullable<RecipeVariants<typeof switchRow>>;
