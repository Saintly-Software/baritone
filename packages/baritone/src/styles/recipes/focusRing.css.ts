import { fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar } from "../vars.css";

const ring = `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`;

export const focusRingRecipe = recipe({
  variants: {
    type: {
      visible: { selectors: { "&:focus-visible": { outline: ring } } },
      within: { selectors: { "&:focus-within": { outline: ring } } },
    },
    offset: {
      sm: { outlineOffset: "1px" },
      md: { outlineOffset: "2px" },
    },
  },
  defaultVariants: {
    type: "visible",
    offset: "md",
  },
});

export type FocusRingVariants = NonNullable<RecipeVariants<typeof focusRingRecipe>>;
