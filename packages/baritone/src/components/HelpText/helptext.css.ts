import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const helpTextRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
  },
  variants: {
    variant: {
      xs: { gap: vars.space[1] },
      sm: { gap: vars.space[1] },
      md: { gap: vars.space[2] },
      lg: { gap: vars.space[2] },
    },
  },
  defaultVariants: {
    variant: "sm",
  },
});

export type HelpTextRecipeVariants = NonNullable<RecipeVariants<typeof helpTextRecipe>>;
