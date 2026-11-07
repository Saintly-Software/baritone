import { globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const toggleGroupRoot = recipe({
  base: {
    display: "inline-flex",
    gap: vars.space[1],
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row", alignItems: "center" },
      vertical: { flexDirection: "column", alignItems: "stretch" },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

export const toggleGroupFillRow = style({});
globalStyle(`${toggleGroupFillRow} > *`, {
  flexGrow: 1,
});

export const toggleGroupDisabled = style({
  opacity: 0.55,
});

export type ToggleGroupRootVariants = NonNullable<RecipeVariants<typeof toggleGroupRoot>>;
