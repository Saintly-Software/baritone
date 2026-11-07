import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const buttonGroupRoot = style({
  display: "inline-flex",
  alignItems: "center",
});

export const buttonGroupItemRecipe = recipe({
  base: {
    position: "relative",
    selectors: {
      "&:hover": { zIndex: 1 },
      "&:focus-visible": { zIndex: 2 },
    },
  },
  variants: {
    position: {
      only: {},
      first: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
      },
      middle: {
        borderRadius: 0,
        marginInlineStart: `calc(-1 * ${vars.borderWidth.thin})`,
      },
      last: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        marginInlineStart: `calc(-1 * ${vars.borderWidth.thin})`,
      },
    },
  },
});

export type ButtonGroupItemVariants = NonNullable<RecipeVariants<typeof buttonGroupItemRecipe>>;
