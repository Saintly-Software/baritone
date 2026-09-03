import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * HelpText root — a single inline help/validation line: a leading icon next to
 * the message. Flex row aligned to the top so a wrapped message keeps the icon
 * pinned to the first line (mirrors `Notice`). Colour/typography are owned by
 * the composed `Text`/`Icon`; this recipe only carries layout — `variant`
 * scales the icon↔text gap with the type size.
 */
export const helpTextRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
  },
  variants: {
    // Tracks the `Text` size prop; only the icon↔text gap differs, keeping the
    // row proportional as type scales.
    variant: {
      xs: { gap: vars.space[1] },
      sm: { gap: vars.space[1] },
      md: { gap: vars.space[2] },
      lg: { gap: vars.space[2] },
    },
  },
  defaultVariants: {
    variant: "sm",
  },
});

export type HelpTextRecipeVariants = NonNullable<RecipeVariants<typeof helpTextRecipe>>;
