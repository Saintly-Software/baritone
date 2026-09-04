import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar, iconVerticalAlignVar } from "../vars.css";

const fallback = createVar();

/**
 * Icon colour resolution. Inside `Text`/`Chip` (which set `--iconColor`), an
 * icon matches the surrounding text. Standalone, `--iconColor` is unset so it
 * falls back to the `component` token for its intent/saliency.
 */
export const iconRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "1em",
    height: "1em",
    color: fallbackVar(iconColorVar, fallback),
    verticalAlign: fallbackVar(iconVerticalAlignVar, "baseline"),
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

export type IconVariants = NonNullable<RecipeVariants<typeof iconRecipe>>;
