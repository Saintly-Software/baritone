import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar } from "../../styles/vars.css";

// Standalone fallback colour (component token), used only when no ancestor has
// set --iconColor.
const fallback = createVar();

/**
 * LoadingIndicator root — a centring, colour-resolving box around the shared
 * `InternalSpinner`. The ring is `em`-sized and drawn in `currentColor`, so this
 * recipe only has to set the font-size (`size`) and the resolved colour
 * (`intent`/`saliency`) for the ring to inherit.
 *
 * Colour resolution mirrors `Icon`: placed inside `Text`/`Chip` (which set
 * `--iconColor`) it matches the surrounding text; standalone it falls back to
 * the `component` token for its intent/saliency. Sizes track `Icon`'s ramp so a
 * spinner and a glyph of the same `size` sit at the same footprint.
 */
export const loadingIndicatorRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: fallbackVar(iconColorVar, fallback),
  },
  variants: {
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
    size: {
      sm: { fontSize: "1rem" },
      md: { fontSize: "1.25rem" },
      lg: { fontSize: "1.5rem" },
    },
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: {
        vars: { [fallback]: vars.component.color[intent][saliency].default.text },
      },
    })),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "mid",
    size: "md",
  },
});

export type LoadingIndicatorRecipeVariants = NonNullable<
  RecipeVariants<typeof loadingIndicatorRecipe>
>;
