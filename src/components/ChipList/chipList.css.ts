import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The list container — a wrapping row (default) or a column of chips. Mirrors
 * `fileListRoot` so stacked chips lay out identically across the system, and
 * resets the default `<ul>` margin / padding / marker since this renders as a
 * real list. `min-width: 0` lets the chips (and their labels) shrink instead of
 * overflowing the list.
 *
 * The gap between chips is driven by `size`, so a list of `sm` chips packs
 * tighter than a list of `lg` ones — the chip `size` therefore tunes both the
 * chips themselves and the spacing around them.
 */
export const chipListRoot = recipe({
  base: {
    display: "flex",
    minWidth: 0,
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

/**
 * Each list cell. `min-width: 0` / `max-width: 100%` let the chip shrink so a
 * long label can ellipsize rather than forcing the row wider than the list.
 */
export const chipListItem = style({
  display: "flex",
  minWidth: 0,
  maxWidth: "100%",
});

export type ChipListRootVariants = NonNullable<RecipeVariants<typeof chipListRoot>>;
