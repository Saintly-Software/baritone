import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SPACE_KEYS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

export const cardListRoot = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyle: "none",
    minWidth: 0,
    minHeight: 0,
  },
  variants: {
    gap: Object.fromEntries(SPACE_KEYS.map((key) => [key, { gap: vars.space[key] }])) as Record<
      (typeof SPACE_KEYS)[number],
      { gap: string }
    >,
  },
  defaultVariants: { gap: "4" },
});

export const cardListItem = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
});

export type CardListRootVariants = NonNullable<RecipeVariants<typeof cardListRoot>>;
