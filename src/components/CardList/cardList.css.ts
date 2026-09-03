import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SPACE_KEYS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

/**
 * The list container — a vertical stack of cards. Resets the default `<ul>`
 * margin/padding/marker and spaces the cards with `gap` (default `4`).
 */
export const cardListRoot = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyle: "none",
    minWidth: 0, // see `Flex`
    minHeight: 0, // see `Flex`
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
 * Each list cell. `display: flex` so its single card stretches to the row's
 * full width; `min-width`/`min-height: 0` per `Flex`.
 */
export const cardListItem = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
});

export type CardListRootVariants = NonNullable<RecipeVariants<typeof cardListRoot>>;
