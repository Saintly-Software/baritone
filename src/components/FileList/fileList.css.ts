import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The list container — a column (default) or wrapping row of file chips.
 * Mirrors `checkboxGroupRoot`/`radioGroupRoot` for consistent layout, and
 * resets `<ul>` margin/padding/marker. `min-width`/`min-height: 0` per `Flex`.
 */
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

/**
 * Each list cell. `max-width: 100%` (plus `min-width`/`min-height: 0` per
 * `Flex`) lets the chip shrink so long filenames ellipsize instead of widening the row.
 */
export const fileListItem = style({
  display: "flex",
  minWidth: 0,
  minHeight: 0,
  maxWidth: "100%",
});

/**
 * Lets the chip shrink within its cell so its label can truncate. The icon and
 * remove button are `Chip.Adornment`s, and the chip already ellipsizes its own
 * label — this just lets it get narrow enough to engage.
 */
export const fileListChip = style({
  minWidth: 0,
  maxWidth: "100%",
});

export type FileListRootVariants = NonNullable<RecipeVariants<typeof fileListRoot>>;
