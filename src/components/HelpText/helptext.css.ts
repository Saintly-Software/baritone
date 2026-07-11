import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * HelpText root — a single inline help / validation line: a leading icon sits
 * next to the message. Laid out as a flex row aligned to the top so a message
 * that wraps onto a second line keeps the icon pinned to the first line (mirrors
 * `Notice`). Colour and typography are owned by the composed `Text`/`Icon`
 * primitives, so this recipe only carries layout — the `variant` knob just
 * scales the gap between the glyph and the text with the type size.
 */
export const helpTextRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
  },
  variants: {
    // Tracks the `Text` size the same-named prop selects; only the icon↔text gap
    // differs, so the row stays proportional as the type scales.
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
