import { fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar } from "../vars.css";

// Ring colour comes from `--focusRingColor` (set by the element's intent/state
// recipe); `currentColor` is a safe fallback for standalone use.
const ring = `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`;

/**
 * Shared focus-ring recipe. Draws an `outline` ring (never shifts layout)
 * coloured from `--focusRingColor`.
 *
 * `type` chooses which focus pseudo triggers the ring:
 *   - `visible` → `:focus-visible` (element itself focused, e.g. Chip)
 *   - `within`  → `:focus-within` (a descendant focused, e.g. a composite
 *     control highlighting its wrapper)
 *
 * `offset` tunes the gap between element and ring (`md` = 2px default, `sm` =
 * 1px for tighter controls like inputs).
 */
export const focusRingRecipe = recipe({
  variants: {
    type: {
      visible: { selectors: { "&:focus-visible": { outline: ring } } },
      within: { selectors: { "&:focus-within": { outline: ring } } },
    },
    // `outline-offset` is a no-op without an outline, so it's safe to set
    // at the base level rather than duplicating it per selector.
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
