import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const chipListRoot = recipe({
  base: {
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
      vertical: { flexDirection: "column", alignItems: "flex-start" },
    },
    size: {
      sm: { gap: vars.space[1] },
      md: { gap: vars.space[2] },
      lg: { gap: vars.space[3] },
    },
  },
  defaultVariants: { orientation: "horizontal", size: "md" },
});

export const chipListItem = style({
  display: "flex",
  minWidth: 0,
  minHeight: 0,
  maxWidth: "100%",
});

export type ChipListRootVariants = NonNullable<RecipeVariants<typeof chipListRoot>>;
