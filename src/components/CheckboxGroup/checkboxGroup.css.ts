import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a stack of checkbox rows, vertical or horizontal.
 * Mirrors `radioGroupRoot` so a checkbox group and a radio group lay out
 * identically; the individual rows reuse `checkboxRow` from `Checkbox`.
 *
 * There's deliberately no group-level "disabled" dim here (unlike
 * `radioGroupDisabled`): the checkbox box dims *itself* via `[data-disabled]`,
 * so a wrapper opacity would stack on top of it. A disabled group instead marks
 * every item disabled, which fades box + label uniformly without doubling up.
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
