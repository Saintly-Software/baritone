import { keyframes, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Chip-specific height override. The shared `componentTypographyRecipe` sizes a
 * Chip's font and inline padding, but a Chip sits shorter than the Button/Tabs
 * controls that share that recipe, so this layers a tighter per-size height on
 * top (applied after `componentTypographyRecipe({ size })`).
 */
export const chipSizeRecipe = recipe({
  variants: {
    size: {
      sm: { height: "0.75rem" },
      md: { height: "1rem" },
      lg: { height: "1.25rem" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ChipSizeRecipeVariants = NonNullable<RecipeVariants<typeof chipSizeRecipe>>;

/**
 * Chip shape override. The shared `componentTypographyRecipe` gives every chip
 * the component radius (`square`, the default — softly rounded corners). `pill`
 * layers on top to fully round the ends into a Bootstrap-style pill/badge.
 * Applied after `componentTypographyRecipe`.
 */
export const chipShapeRecipe = recipe({
  variants: {
    shape: {
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
  },
  defaultVariants: {
    shape: "square",
  },
});

export type ChipShapeRecipeVariants = NonNullable<RecipeVariants<typeof chipShapeRecipe>>;

/**
 * Chip loading state. Unlike Button — which overlays its spinner on the label to
 * preserve width and the accessible name — a loading Chip swaps its content out
 * entirely, so the spinner is the chip's only child and the shared
 * `componentTypographyRecipe` flex-centring positions it (no absolute wrapper).
 */

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

/**
 * Pure-CSS ring spinner. Sized in `em` so it tracks the chip's font-size, and
 * `currentColor` so it matches the resolved foreground (dimmed, since a loading
 * chip is `aria-disabled`). The spin is an essential progress indicator, so it
 * is *not* gated behind `prefers-reduced-motion`; only the duration is eased
 * back there. Mirrors Button's spinner so a loading Chip and Button match.
 */
export const chipSpinner = style({
  width: "1.25em",
  height: "1.25em",
  borderRadius: "50%",
  borderStyle: "solid",
  borderWidth: "0.125em",
  borderColor: "currentColor",
  borderRightColor: "transparent",
  animation: `${spin} 0.6s linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animationDuration: "1.4s" },
  },
});

/**
 * The chip's text label — the single flex item that wraps the (string) children
 * between the lead/trail adornment lists. `min-width: 0` plus the overflow trio
 * let a long label ellipsize when the chip is width-constrained (e.g. a FileList
 * row); `white-space: nowrap` keeps it on one line (it also inherits the chip's
 * own `nowrap`, but is repeated here so the label truncates on its own terms).
 *
 * The `interactive` variant is used when the Chip is given an `onClick`: the
 * label renders as a real `<button>`, so this strips the native button chrome
 * (background, border, padding, font, alignment) back to the plain label and
 * adds the clickable affordances — a pointer cursor and a hover underline — plus
 * the inert `not-allowed` look once the chip is disabled (`aria-disabled`; the
 * button stays keyboard-focusable, see AGENTS.md). Colour is left to `inherit`
 * so the label keeps following the chip's foreground, dimmed-disabled included.
 */
export const chipLabelRecipe = recipe({
  base: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  variants: {
    interactive: {
      true: {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: "pointer",
        selectors: {
          "&:not([aria-disabled='true']):hover": { textDecoration: "underline" },
          '&[aria-disabled="true"]': { cursor: "not-allowed" },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export type ChipLabelRecipeVariants = NonNullable<RecipeVariants<typeof chipLabelRecipe>>;
