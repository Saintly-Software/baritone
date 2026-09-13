import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Chip-specific box override, layered on top of `componentTypographyRecipe` for a
 * denser control. Heights are fixed rems (control metrics, not spacing), each
 * clearing the label's line box + border, and sized a step shorter than Button and
 * taller than Badge — the intended order badge < chip < button.
 */
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

/**
 * Chip shape override. The shared `componentTypographyRecipe` gives every chip
 * the component radius (`square`, the default — softly rounded corners). `pill`
 * layers on top to fully round the ends into a Bootstrap-style pill/badge.
 * Applied after `componentTypographyRecipe`.
 */
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

/**
 * Chip width override. Default `fit` hugs its content (`inline-flex`); `fill`
 * stretches to the container's width (block `flex`). The label truncates either way.
 */
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

/**
 * The chip's text label — the flex item wrapping the children between the
 * adornment lists. `min-width: 0` + the overflow trio ellipsize a long label when
 * width-constrained. The `interactive` variant (for an `onClick` chip, where the
 * label is a real `<button>`) strips the native button chrome and adds the
 * clickable affordances plus the inert `aria-disabled` look; colour stays `inherit`.
 */
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
