import { style } from "@vanilla-extract/css";

/**
 * Icon-only square trigger. The shared `componentTypographyRecipe` sizes a
 * button for a text label (a fixed `height` plus horizontal `paddingInline`),
 * which leaves it wider than it is tall. The InfoButton trigger is a single
 * centred glyph, so zero out the inline padding and pin a 1:1 aspect ratio — the
 * button becomes a square of side = the recipe's `height`, at every `size`.
 * Merged last (via `className`) so it wins the `paddingInline` over the recipe.
 * Mirrors `toggleButtonSquare`.
 */
export const infoButtonSquare = style({
  paddingInline: 0,
  aspectRatio: "1",
});
