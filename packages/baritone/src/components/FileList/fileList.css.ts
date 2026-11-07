import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const fileListRoot = recipe({
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
      vertical: { flexDirection: "column", alignItems: "flex-start", gap: vars.space[2] },
      horizontal: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: vars.space[2],
      },
    },
  },
  defaultVariants: { orientation: "vertical" },
});

export const fileListItem = style({
  display: "flex",
  minWidth: 0,
  minHeight: 0,
  maxWidth: "100%",
});

export const fileListChip = style({
  minWidth: 0,
  maxWidth: "100%",
});

export type FileListRootVariants = NonNullable<RecipeVariants<typeof fileListRoot>>;
