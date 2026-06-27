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

/** Allow the chip itself to shrink within its cell so the label can truncate. */
export const fileListChip = style({
  minWidth: 0,
  maxWidth: "100%",
});

/** The leading file-type icon; fixed at `1em`, never shrinks during truncation. */
export const fileListIcon = style({
  flexShrink: 0,
});

/** The filename — truncates with an ellipsis when the chip is width-constrained. */
export const fileListLabel = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/**
 * The remove "×" button: an icon-only control that inherits the chip's
 * foreground (`currentColor`) and sits flush after the label. Disabled state is
 * modelled with `aria-disabled` (never the native attribute, see AGENTS.md), so
 * it stays keyboard-focusable; the click is swallowed in the handler.
 */
export const fileListRemove = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
  width: "1.25em",
  height: "1.25em",
  margin: 0,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.full,
  background: "transparent",
  color: "inherit",
  fontSize: "0.9em",
  lineHeight: 0,
  cursor: "pointer",
  opacity: 0.8,
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&:hover": { opacity: 1 },
    '&[aria-disabled="true"]': { cursor: "not-allowed", opacity: 0.5 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export type FileListRootVariants = NonNullable<RecipeVariants<typeof fileListRoot>>;
