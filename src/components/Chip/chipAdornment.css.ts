import { createVar, fallbackVar, globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Colour for an adornment used *outside* a Chip (no ancestor `--iconColor` to
// inherit) that also isn't overriding its intent — falls back to neutral text.
const fallback = createVar();

/**
 * The adornment's glyph box, per chip size. Every glyph resolves its box from
 * this one font-size — see `glyphBox`. Sizing the glyph a step ahead of the
 * label reads as even; matching the label exactly makes it look shrunken.
 */
const glyphSize = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1rem",
} as const;

/**
 * Carrier for the rule below, composed into the recipe's base. It exists only to
 * give `globalStyle` a class to hang a child selector off — vanilla-extract
 * (rightly) won't let a style block reach outside its own class.
 */
const glyphBox = style({});

// A built-in glyph is a bare `<svg>` drawn at `1em`, so it already resolves
// against the adornment's font-size. An `<Icon>` doesn't: it renders a span whose
// `size` variant pins that `1em` to an absolute rem, ignoring the chip entirely
// (a fixed 20px in every chip — taller than an `sm` chip is tall). `inherit`
// re-points it at the adornment, putting both kinds on the same footing.
// `${glyphBox} > span` (0,1,1) outweighs `iconRecipe`'s single class (0,1,0), so
// this holds regardless of stylesheet order.
globalStyle(`${glyphBox} > span`, { fontSize: "inherit" });

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
 *
 * The `size` variant sizes the glyph to the chip it sits in (the Chip passes its
 * own `size` down through context). Like `intent`/`saliency` above, an `<Icon>`'s
 * own `size` prop is deliberately overridden here: the chip owns its adornments'
 * metrics, so a chip can't be knocked out of shape by the icon it's handed.
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
        // Family only. The `font` shorthand would reset `font-size` too, and
        // (being a sibling variant class) could clobber the glyph box above.
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
