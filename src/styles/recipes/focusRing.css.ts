import { fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar } from "../vars.css";

const ring = `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`;

/**
 * Shared focus-ring recipe. Draws an `outline` ring (so it never shifts layout)
 * whose colour is read from `--focusRingColor`.
 *
 * The `type` variant chooses *which* focus pseudo triggers the ring:
 *   - `visible` → `:focus-visible` (the element itself is focused, e.g. Chip)
 *   - `within`  → `:focus-within` (a descendant is focused, e.g. a composite
 *     control highlighting its wrapper)
 *
 * A given component uses exactly one of these, but the recipe supports both so
 * each component can pick the focus model that fits it. `offset` tunes the gap
 * between the element and the ring (`md` = 2px default, `sm` = 1px for tighter
 * controls like inputs).
 */
export const focusRingRecipe = recipe({
  variants: {
    type: {
      visible: { selectors: { "&:focus-visible": { outline: ring } } },
      within: { selectors: { "&:focus-within": { outline: ring } } },
    },
    offset: {
      sm: { outlineOffset: "1px" },
      md: { outlineOffset: "2px" },
    },
  },
  defaultVariants: {
    type: "visible",
    offset: "md",
  },
});

export type FocusRingVariants = NonNullable<RecipeVariants<typeof focusRingRecipe>>;
