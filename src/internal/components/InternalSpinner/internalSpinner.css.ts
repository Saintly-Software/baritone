import { keyframes } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

/**
 * Pure-CSS ring spinner. Sized in `em` so it tracks the host's font-size, and
 * `currentColor` so it matches the resolved foreground (dimmed wherever the host
 * is `aria-disabled`). The spin is an essential progress indicator, so it is
 * *not* gated behind `prefers-reduced-motion`; only the duration is eased back
 * there.
 *
 * Shared by every loading state that needs a busy indicator; the host owns
 * positioning. The `size` picks the ring's footprint: `sm` for the inline
 * controls (`Button`, `Chip`), `lg` for the larger overlay surfaces (`Drawer`,
 * `Modal`), which also thickens the stroke to match.
 */
export const internalSpinnerRecipe = recipe({
  base: {
    borderRadius: "50%",
    borderStyle: "solid",
    borderColor: "currentColor",
    borderRightColor: "transparent",
    animation: `${spin} 0.6s linear infinite`,
    "@media": {
      "(prefers-reduced-motion: reduce)": { animationDuration: "1.4s" },
    },
  },
  variants: {
    size: {
      sm: { width: "1.25em", height: "1.25em", borderWidth: "0.125em" },
      lg: { width: "1.75em", height: "1.75em", borderWidth: "0.15em" },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type InternalSpinnerRecipeVariants = NonNullable<
  RecipeVariants<typeof internalSpinnerRecipe>
>;
