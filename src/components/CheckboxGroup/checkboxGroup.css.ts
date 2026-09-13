import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

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
