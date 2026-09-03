import { style } from "@vanilla-extract/css";

/**
 * Icon-only square. `componentTypographyRecipe` sizes a button for a text label
 * (fixed `height` + horizontal `paddingInline`), leaving it wider than tall. A
 * ToggleButton has a single centred glyph, so this zeroes the inline padding and
 * pins a 1:1 aspect ratio — a square of side = the recipe's `height`. Merged last
 * (via `className`) so it wins the `paddingInline`.
 */
export const toggleButtonSquare = style({
  paddingInline: 0,
  aspectRatio: "1",
});
