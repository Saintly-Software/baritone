import { createVar, fallbackVar, globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const fallback = createVar();

const glyphSize = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1rem",
} as const;

const glyphBox = style({});

globalStyle(`${glyphBox} > span`, { fontSize: "inherit" });

export const chipAdornmentRecipe = recipe({
  base: [
    glyphBox,
    {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      lineHeight: 0,
      color: fallbackVar(iconColorVar, fallback),
      vars: { [fallback]: vars.component.color.neutral.mid.default.text },
    },
  ],
  variants: {
    size: {
      sm: { fontSize: glyphSize.sm },
      md: { fontSize: glyphSize.md },
      lg: { fontSize: glyphSize.lg },
    },
    interactive: {
      true: {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        borderRadius: vars.radius.full,
        fontFamily: "inherit",
        cursor: "pointer",
        textDecoration: "none",
        opacity: 0.8,
        transitionProperty: "opacity",
        transitionDuration: vars.motion.duration.fast,
        transitionTimingFunction: vars.motion.easing.standard,
        selectors: {
          "&:hover": { opacity: 1 },
          '&[aria-disabled="true"]': { cursor: "not-allowed", opacity: 0.5 },
        },
        "@media": {
          "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
        },
      },
      false: {},
    },
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: {
        vars: { [iconColorVar]: vars.component.color[intent][saliency].default.text },
      },
    })),
  ),
  defaultVariants: {
    interactive: false,
  },
});

export type ChipAdornmentRecipeVariants = NonNullable<RecipeVariants<typeof chipAdornmentRecipe>>;
