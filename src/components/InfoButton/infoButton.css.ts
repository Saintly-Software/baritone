import { style } from "@vanilla-extract/css";

/**
 * Icon-only square trigger. `componentTypographyRecipe` sizes a button for a
 * text label (fixed `height` + horizontal `paddingInline`), leaving it wider
 * than tall. This zeroes the inline padding and pins a 1:1 aspect ratio, so the
 * button becomes a square of side = the recipe's `height` at every `size`.
 * Merged last so it wins `paddingInline` over the recipe. Mirrors `toggleButtonSquare`.
 */
export const infoButtonSquare = style({
  paddingInline: 0,
  aspectRatio: "1",
});
