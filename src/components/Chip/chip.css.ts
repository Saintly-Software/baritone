import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const chipSizeRecipe = recipe({
  variants: {
    size: {
      sm: { height: "1.25rem", paddingInline: vars.space[2], gap: vars.space[1] },
      md: { height: "1.5rem", paddingInline: vars.space[2], gap: vars.space[1] },
      lg: { height: "1.75rem", paddingInline: vars.space[3], gap: vars.space[2] },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ChipSizeRecipeVariants = NonNullable<RecipeVariants<typeof chipSizeRecipe>>;

export const chipShapeRecipe = recipe({
  variants: {
    shape: {
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
  },
  defaultVariants: {
    shape: "square",
  },
});

export type ChipShapeRecipeVariants = NonNullable<RecipeVariants<typeof chipShapeRecipe>>;

export const chipWidthRecipe = recipe({
  variants: {
    width: {
      fit: {},
      fill: { display: "flex", width: "100%" },
    },
  },
  defaultVariants: {
    width: "fit",
  },
});

export type ChipWidthRecipeVariants = NonNullable<RecipeVariants<typeof chipWidthRecipe>>;

export const chipLabelRecipe = recipe({
  base: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  variants: {
    interactive: {
      true: {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: "pointer",
        selectors: {
          "&:not([aria-disabled='true']):hover": { textDecoration: "underline" },
          '&[aria-disabled="true"]': { cursor: "not-allowed" },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export type ChipLabelRecipeVariants = NonNullable<RecipeVariants<typeof chipLabelRecipe>>;
