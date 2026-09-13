import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
import { SIZES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const inlineSize = {
  sm: { height: "1rem", fontSize: "0.625rem", paddingInline: vars.space[1] },
  md: { height: "1.25rem", fontSize: "0.75rem", paddingInline: vars.space[1] },
  lg: { height: "1.5rem", fontSize: "0.875rem", paddingInline: vars.space[2] },
} as const;

const blankSize = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
} as const;

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

export const badgeColorVar = createVar();

const badgeCustomFg = `oklch(from ${badgeColorVar} clamp(0, (0.62 - l) * 1000, 1) 0 h)`;

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
