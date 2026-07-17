import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
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

/**
 * The caller-supplied fill for the `color` escape hatch. Set inline (via
 * `assignInlineVars`) because the value is arbitrary — it can't be a recipe
 * variant, since a recipe has to enumerate its values at build time and this
 * one is whatever the consumer passes.
 */
export const badgeColorVar = createVar();

/**
 * The foreground for a custom-coloured badge, derived from the fill rather than
 * asked for — a caller supplying a brand colour shouldn't also have to work out
 * whether black or white text survives on it.
 *
 * Relative-colour syntax reads the fill's oklch lightness and flips the text
 * between white (`l: 1`) and black (`l: 0`) around a perceptual mid-point:
 * `(0.62 - l) * 1000` is hugely positive for a dark fill and hugely negative for
 * a light one, and `clamp(0, …, 1)` snaps that to exactly one end. Chroma `0`
 * keeps the text neutral instead of tinting it with the fill's hue.
 *
 * The same trick can't run through `hover()`/`active()` — those shift a colour
 * within its own hue, whereas this has to *choose* between two.
 */
const badgeCustomFg = `oklch(from ${badgeColorVar} clamp(0, (0.62 - l) * 1000, 1) 0 h)`;

/**
 * The `color` escape hatch's colour scheme — the token-driven
 * `componentIntentRecipe` swapped out wholesale, not layered over.
 *
 * Layering would be a specificity race: both are single classes, so the winner
 * would come down to which one vanilla-extract happened to emit later in the
 * stylesheet, not to the order they're passed to `cx`. Since `color` and
 * `intent`/`saliency` are mutually exclusive at the type level, exactly one of
 * the two classes is ever applied and there's nothing to race.
 *
 * Border metrics are restated (rather than inherited) for the same reason: they
 * live on `componentIntentRecipe`'s base, which this path never applies, and
 * without them a custom badge's content box would sit 2px wider than an intent
 * badge's at the same `size`.
 */
export const badgeCustomColor = style({
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: badgeColorVar,
  background: badgeColorVar,
  color: badgeCustomFg,
  // Publish the derived foreground the same way the intent recipe does, so an
  // `<Icon>` or nested `<Text>` inside the badge tracks it without knowing why.
  vars: {
    [iconColorVar]: badgeCustomFg,
    [textColorVar]: badgeCustomFg,
  },
});
