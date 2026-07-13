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

/** Per-size diameter for the content-less blank badge. */
const blankSize = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
} as const;

/**
 * Badge box/shape recipe. Pairs with `componentIntentRecipe` (colour + border,
 * shared with Chip/Button) the way `chipSizeRecipe` does: that recipe owns the
 * palette, this one owns the silhouette and the per-size sizing.
 *
 * Two orthogonal axes drive the box:
 *   - `shape` — `round` (fully-rounded pill/circle) or `square` (softly-rounded
 *     rectangle) — sets the corner radius and applies to every content kind.
 *   - `blank` — the content-less badge (a small dot when round), a bare indicator
 *     with no padding sized by `blankSize`, selected by the component when no
 *     `icon`/`count`/`text` is supplied. Otherwise the `size` variant lays out a
 *     square-to-pill box that hugs its content.
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
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  variants: {
    size: {
      sm: { ...inlineSize.sm, minWidth: inlineSize.sm.height },
      md: { ...inlineSize.md, minWidth: inlineSize.md.height },
      lg: { ...inlineSize.lg, minWidth: inlineSize.lg.height },
    },
    // Corner radius: a fully-rounded pill/circle, or a softly-rounded square.
    shape: {
      round: { borderRadius: vars.radius.full },
      square: { borderRadius: vars.radius.sm },
    },
    // A content-less badge; the concrete diameter comes from the size compound.
    blank: {
      true: { paddingInline: 0 },
      false: {},
    },
  },
  compoundVariants: SIZES.map((size) => ({
    variants: { size, blank: true as const },
    style: {
      width: blankSize[size],
      height: blankSize[size],
      minWidth: blankSize[size],
    },
  })),
  defaultVariants: {
    size: "md",
    shape: "round",
    blank: false,
  },
});

export type BadgeRecipeVariants = NonNullable<RecipeVariants<typeof badgeRecipe>>;
