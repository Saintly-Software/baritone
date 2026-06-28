import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Colour for an adornment used *outside* a Chip (no ancestor `--iconColor` to
// inherit) that also isn't overriding its intent — falls back to neutral text.
const fallback = createVar();

/**
 * Chip adornment — a small icon slotted before/after a Chip's label, optionally
 * interactive (a button or a link). By default its colour follows the Chip's
 * foreground through the inherited `--iconColor` (so it matches the label, the
 * dimmed `aria-disabled` state included). Passing an `intent` overrides that:
 * the matching `intent`×`saliency` compound variant republishes `--iconColor`
 * for this adornment (and the icon inside it) at the Chip's saliency, so an
 * accent reads correctly without the caller knowing the token.
 *
 * The `interactive` variant adds the affordances shared by the clickable kinds
 * (the button and the link): pointer cursor, a hover lift, and the inert
 * `aria-disabled` look (the control stays focusable — see AGENTS.md).
 */
export const chipAdornmentRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    // Read the chip's published foreground; the override compound below re-sets
    // `--iconColor` on this same element, which this declaration then resolves.
    color: fallbackVar(iconColorVar, fallback),
    vars: { [fallback]: vars.component.color.neutral.mid.default.text },
  },
  variants: {
    interactive: {
      true: {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        borderRadius: vars.radius.full,
        font: "inherit",
        lineHeight: 0,
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
    // Intent/saliency are intentionally default-less: omit them (the inherit
    // case) and no `--iconColor` is set, so the adornment matches the Chip. Pass
    // *both* (the override case) and the compound variant republishes it.
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
