import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar } from "../../styles/vars.css";

// Standalone fallback colour (component token), used only when no ancestor set --iconColor.
const fallback = createVar();

/**
 * LoadingIndicator root — a centring, colour-resolving box around the shared
 * `InternalSpinner`. The ring is `em`-sized and drawn in `currentColor`, so this
 * only needs to set font-size (`size`) and resolved colour (`intent`/`saliency`).
 *
 * Colour resolution mirrors `Icon`: matches surrounding text inside `Text`/
 * `Chip`, falls back to the `component` token standalone. Sizes track `Icon`'s ramp for matching footprints.
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
