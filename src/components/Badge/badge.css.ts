import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SIZES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

/**
 * Per-size box for a badge that carries content (an icon, a count, or text).
 * `minWidth` is pinned to the height so a single glyph stays a perfect circle,
 * while `paddingInline` lets a wider value (multi-digit count, short word) grow
 * into a pill. Heights sit a touch shorter than the Button/Chip control sizes —
 * a badge is a small indicator, not a control — so they're authored here as
 * fixed rems rather than reused from the shared `component` typography recipe.
 */
const inlineSize = {
  sm: { height: "1rem", fontSize: "0.625rem", paddingInline: vars.space[1] },
  md: { height: "1.25rem", fontSize: "0.75rem", paddingInline: vars.space[1] },
  lg: { height: "1.5rem", fontSize: "0.875rem", paddingInline: vars.space[2] },
} as const;

/** Per-size diameter for the content-less dot. */
const dotSize = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
} as const;

/**
 * Per-size edge for the content-less square swatch. A touch larger than the dot
 * — a swatch is meant to read as a block of colour, not a pinpoint indicator.
 */
const swatchSize = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.25rem",
} as const;

/**
 * Badge box/shape recipe. Pairs with `componentIntentRecipe` (colour + border,
 * shared with Chip/Button) the way `chipSizeRecipe` does: that recipe owns the
 * palette, this one owns the fully-rounded silhouette and the per-size sizing.
 *
 * The `dot` variant is the content-less badge — a small circle with no padding,
 * sized by `dotSize` — selected by the component when no `icon`/`count`/`text`
 * is supplied. The `square` variant is a content-less colour swatch: a small
 * square (lightly rounded, sized by `swatchSize`) selected by the component when
 * `square` is passed. Otherwise the `size` variant lays out a circular-to-pill
 * box that hugs its content.
 */
export const badgeRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    flexShrink: 0,
    fontFamily: vars.font.sans,
    fontWeight: "600",
    lineHeight: "1",
    borderRadius: vars.radius.full,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  variants: {
    size: {
      sm: { ...inlineSize.sm, minWidth: inlineSize.sm.height },
      md: { ...inlineSize.md, minWidth: inlineSize.md.height },
      lg: { ...inlineSize.lg, minWidth: inlineSize.lg.height },
    },
    // A content-less dot; the concrete diameter comes from the size compound.
    dot: {
      true: { paddingInline: 0 },
      false: {},
    },
    // A content-less square swatch; the concrete edge comes from the size
    // compound. Trades the fully-rounded silhouette for a lightly-rounded square.
    square: {
      true: { paddingInline: 0, borderRadius: vars.radius.sm },
      false: {},
    },
  },
  compoundVariants: [
    ...SIZES.map((size) => ({
      variants: { size, dot: true as const },
      style: {
        width: dotSize[size],
        height: dotSize[size],
        minWidth: dotSize[size],
      },
    })),
    ...SIZES.map((size) => ({
      variants: { size, square: true as const },
      style: {
        width: swatchSize[size],
        height: swatchSize[size],
        minWidth: swatchSize[size],
      },
    })),
  ],
  defaultVariants: {
    size: "md",
    dot: false,
    square: false,
  },
});

export type BadgeRecipeVariants = NonNullable<RecipeVariants<typeof badgeRecipe>>;
