import { keyframes } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

/**
 * Pure-CSS ring spinner. Sized in `em` to track the host's font-size, and
 * `currentColor` to match the resolved foreground (dimmed wherever the host
 * is `aria-disabled`). The spin is an essential progress indicator, so it's
 * *not* gated behind `prefers-reduced-motion` — only the duration eases back.
 *
 * Shared by every loading state that needs a busy indicator; the host owns
 * positioning. `size` picks the footprint: `sm` for inline controls
 * (`Button`, `Chip`), `lg` for larger overlay surfaces (`Drawer`, `Modal`),
 * which also thickens the stroke.
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
