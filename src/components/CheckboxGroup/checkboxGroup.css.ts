import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a stack of checkbox rows, vertical or horizontal.
 * Mirrors `radioGroupRoot` so a checkbox and radio group lay out identically;
 * rows reuse `checkboxRow` from `Checkbox`.
 *
 * Deliberately no group-level "disabled" dim here (unlike `radioGroupDisabled`):
 * the checkbox dims *itself* via `[data-disabled]`, so a wrapper opacity would
 * stack on top. A disabled group instead marks every item disabled.
 */
export const checkboxGroupRoot = recipe({
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

export type CheckboxGroupRootVariants = NonNullable<RecipeVariants<typeof checkboxGroupRoot>>;
