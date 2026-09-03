import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Chip-specific box override. `componentTypographyRecipe` sizes a Chip's font,
 * inline padding, and gap for a Button-sized control; a Chip is denser, so this
 * layers its own per-size box on top (applied after `componentTypographyRecipe({ size })`).
 *
 * Heights are fixed rems rather than a scale — same reasoning as `badgeRecipe`'s:
 * they're control metrics, not spacing. Each must clear the label's line box
 * (`lineHeight: 1.5` over the per-size font gives 18/21/24px) plus the 1px border
 * per edge, or the label overflows. That leaves the chip a step shorter than the
 * Button sizes it shares a recipe with (24/32/40) and a step taller than Badge
 * (16/20/24) — the intended order: badge < chip < button.
 */
export const chipSizeRecipe = recipe({
  variants: {
    size: {
      sm: { height: "1.25rem", paddingInline: vars.space[2], gap: vars.space[1] },
      md: { height: "1.5rem", paddingInline: vars.space[2], gap: vars.space[1] },
      lg: { height: "1.75rem", paddingInline: vars.space[3], gap: vars.space[2] },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ChipSizeRecipeVariants = NonNullable<RecipeVariants<typeof chipSizeRecipe>>;

/**
 * Chip shape override. `componentTypographyRecipe` gives every chip the component
 * radius (`square`, default — softly rounded); `pill` layers on top to fully round
 * the ends into a pill/badge shape. Applied after `componentTypographyRecipe`.
 */
export const chipShapeRecipe = recipe({
  variants: {
    shape: {
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
  },
  defaultVariants: {
    shape: "square",
  },
});

export type ChipShapeRecipeVariants = NonNullable<RecipeVariants<typeof chipShapeRecipe>>;

/**
 * Chip width override. By default a chip is `inline-flex` and hugs its content
 * (`fit`); `fill` switches it to a block-level `flex` stretching to the container's
 * full width — handy for chips stacked in a column (e.g. a filter rail). The label
 * keeps truncating either way. Applied after `componentTypographyRecipe`.
 */
export const chipWidthRecipe = recipe({
  variants: {
    width: {
      fit: {},
      fill: { display: "flex", width: "100%" },
    },
  },
  defaultVariants: {
    width: "fit",
  },
});

export type ChipWidthRecipeVariants = NonNullable<RecipeVariants<typeof chipWidthRecipe>>;

/**
 * The chip's text label — the flex item wrapping the (string) children between the
 * lead/trail adornment lists. `min-width: 0` plus the overflow trio let a long label
 * ellipsize when width-constrained (e.g. a FileList row); `white-space: nowrap` is
 * repeated here (beyond the chip's own) so the label truncates on its own terms.
 *
 * `interactive` applies when the Chip has an `onClick`: the label renders as a real
 * `<button>`, so this strips native button chrome back to the plain label and adds
 * clickable affordances (pointer cursor, hover underline) plus the `not-allowed` look
 * once disabled (`aria-disabled`; stays keyboard-focusable, see AGENTS.md). Colour is
 * `inherit` so the label follows the chip's foreground, dimmed-disabled included.
 */
export const chipLabelRecipe = recipe({
  base: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  variants: {
    interactive: {
      true: {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: "pointer",
        selectors: {
          "&:not([aria-disabled='true']):hover": { textDecoration: "underline" },
          '&[aria-disabled="true"]': { cursor: "not-allowed" },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export type ChipLabelRecipeVariants = NonNullable<RecipeVariants<typeof chipLabelRecipe>>;
