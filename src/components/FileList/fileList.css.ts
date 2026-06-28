import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The list container — a column (default) or a wrapping row of file chips.
 * Mirrors `checkboxGroupRoot` / `radioGroupRoot` so stacked controls lay out
 * identically across the system, and resets the default `<ul>`
 * margin / padding / marker since this renders as a real list. `min-width: 0`
 * lets the chips (and their labels) shrink instead of overflowing the list.
 */
export const fileListRoot = recipe({
  base: {
    display: "flex",
    minWidth: 0,
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

/**
 * Each list cell. `min-width: 0` / `max-width: 100%` let the chip shrink so a
 * long filename can ellipsize rather than forcing the row wider than the list.
 */
export const fileListItem = style({
  display: "flex",
  minWidth: 0,
  maxWidth: "100%",
});

/**
 * Allow the chip itself to shrink within its cell so its label can truncate.
 * The icon and remove button are now `Chip.Adornment`s, and the chip wraps the
 * filename in its own ellipsizing label — so the only thing FileList still needs
 * is to let the chip get narrow enough for that to engage.
 */
export const fileListChip = style({
  minWidth: 0,
  maxWidth: "100%",
});

export type FileListRootVariants = NonNullable<RecipeVariants<typeof fileListRoot>>;
