import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SPACE_KEYS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

/**
 * The list container — a vertical stack of cards. Resets the default `<ul>`
 * margin / padding / marker (this renders as a real list) and spaces the cards
 * with a `gap` from the spacing scale (default `4`).
 */
export const cardListRoot = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  variants: {
    gap: Object.fromEntries(SPACE_KEYS.map((key) => [key, { gap: vars.space[key] }])) as Record<
      (typeof SPACE_KEYS)[number],
      { gap: string }
    >,
  },
  defaultVariants: { gap: "4" },
});

/**
 * Each list cell. `display: flex` so its single card stretches to the full width
 * of the row (`min-width: 0` lets long content shrink instead of overflowing).
 */
export const cardListItem = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export type CardListRootVariants = NonNullable<RecipeVariants<typeof cardListRoot>>;
