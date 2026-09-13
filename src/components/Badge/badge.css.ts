import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
import { SIZES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

/**
 * Per-size box for a badge with content. `minWidth` pins to the height so a single
 * glyph stays circular, while `paddingInline` lets a wider value grow into a pill.
 * Heights sit shorter than the control sizes, so they're authored as fixed rems.
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
 * Badge box/shape recipe, paired with `componentIntentRecipe` (which owns the
 * palette; this owns the silhouette and sizing). `shape` sets the corner radius
 * (`round` / `square`); `blank` is the content-less dot sized by `blankSize`,
 * else the `size` variant lays out a box that hugs its content.
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
    shape: {
      round: { borderRadius: vars.radius.full },
      square: { borderRadius: vars.radius.sm },
    },
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
 * The foreground for a custom-coloured badge, derived from the fill so a caller
 * needn't work out whether black or white survives on it. Relative-colour syntax
 * reads the fill's oklch lightness and snaps the text to white or black around a
 * perceptual mid-point; chroma `0` keeps it neutral.
 */
const badgeCustomFg = `oklch(from ${badgeColorVar} clamp(0, (0.62 - l) * 1000, 1) 0 h)`;

/**
 * The `color` escape hatch's colour scheme — `componentIntentRecipe` swapped out
 * wholesale, not layered (layering would be a specificity race; they're mutually
 * exclusive so exactly one class ever applies). Border metrics are restated since
 * this path never applies the intent recipe's base.
 */
export const badgeCustomColor = style({
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: badgeColorVar,
  background: badgeColorVar,
  color: badgeCustomFg,
  vars: {
    [iconColorVar]: badgeCustomFg,
    [textColorVar]: badgeCustomFg,
  },
});
