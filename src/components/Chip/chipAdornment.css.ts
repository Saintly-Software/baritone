import { createVar, fallbackVar, globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Fallback colour for an adornment used outside a Chip (no ancestor
// `--iconColor`) that isn't overriding its intent.
const fallback = createVar();

/**
 * The adornment's glyph box, per chip size — every glyph resolves from this
 * one font-size (see `glyphBox`). A step ahead of the label reads as even;
 * matching it exactly looks shrunken.
 */
const glyphSize = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1rem",
} as const;

/**
 * Carrier for the rule below, composed into the recipe's base — exists only
 * so `globalStyle` has a class to hang a child selector off (vanilla-extract
 * won't let a style block reach outside its own class).
 */
const glyphBox = style({});

// A built-in glyph is a bare `<svg>` at `1em`, so it already resolves against
// the adornment's font-size. An `<Icon>` doesn't: its `size` variant pins that
// `1em` to an absolute rem (20px in every chip, taller than an `sm` chip).
// `inherit` re-points it at the adornment. `${glyphBox} > span` (0,1,1)
// outweighs `iconRecipe`'s single class (0,1,0), so this holds regardless of
// stylesheet order.
globalStyle(`${glyphBox} > span`, { fontSize: "inherit" });

/**
 * Chip adornment — a small icon slotted before/after a Chip's label, optionally
 * interactive (a button or a link). By default its colour follows the Chip's
 * foreground via the inherited `--iconColor` (dimmed `aria-disabled` state
 * included). Passing an `intent` overrides that: the matching
 * `intent`×`saliency` compound variant republishes `--iconColor` at the
 * Chip's saliency, so an accent reads correctly without the caller knowing the token.
 *
 * `interactive` adds the affordances shared by the clickable kinds: pointer
 * cursor, a hover lift, and the inert `aria-disabled` look (the control stays
 * focusable — see AGENTS.md).
 *
 * `size` sizes the glyph to the chip it sits in (passed down through
 * context), deliberately overriding an `<Icon>`'s own `size` — the chip owns
 * its adornments' metrics.
 */
export const chipAdornmentRecipe = recipe({
  base: [
    glyphBox,
    {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      lineHeight: 0,
      // Read the chip's published foreground; the override compound below re-sets
      // `--iconColor` on this same element, which this declaration then resolves.
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
        // Family only — the `font` shorthand would also reset `font-size` and
        // (as a sibling variant class) could clobber the glyph box above.
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
    // Intent/saliency are default-less on purpose: omit both to inherit the
    // Chip's colour, or pass both to have the compound variant override it.
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
