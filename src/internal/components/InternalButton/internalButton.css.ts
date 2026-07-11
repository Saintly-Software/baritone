import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../../styles/vars.css";

/**
 * Button-specific layout that sits on top of the shared `component` recipe
 * (`componentTypographyRecipe` + `componentIntentRecipe`). The recipe owns the
 * box, colour, size, and focus ring; everything here is about the loading
 * overlay. The disabled-explanation tooltip surface lives in `InternalTooltip`.
 */

/** Establishes the positioning context for the absolutely-centred spinner. */
export const buttonBase = style({
  position: "relative",
});

/**
 * Icon-only square treatment for `<Button icon aria-label>`. The shared
 * `componentTypographyRecipe` sizes a button for a text label (a fixed `height`
 * plus horizontal `paddingInline`), leaving it wider than tall. An icon-only
 * button is a single centred glyph, so zero out the inline padding and pin a 1:1
 * aspect ratio — the button becomes a square of side = the recipe's `height`, at
 * every `size`. Merged last (via `className`) so it wins the `paddingInline`.
 * Mirrors `infoButtonSquare` / `toggleButtonSquare`.
 */
export const buttonSquare = style({
  paddingInline: 0,
  aspectRatio: "1",
});

/**
 * Wraps the start icon / label / end icon as a single flex row so the spinner
 * can overlay the whole group. The row carries its own `gap` (the recipe's gap
 * sits between the wrapper and the out-of-flow spinner, so it's a no-op).
 */
export const buttonContent = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
});

/**
 * Loading: hide the label/icons with `opacity` (not `visibility`/`display`) so
 * the button keeps its width *and* keeps its accessible name — the spinner is
 * purely decorative, so the text must still name the control while busy.
 */
export const buttonContentLoading = style({
  opacity: 0,
});

/**
 * Centres the spinner over the (hidden) label without affecting layout. The ring
 * glyph itself is the shared `InternalSpinner`.
 */
export const buttonSpinner = style({
  position: "absolute",
  inset: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

// The resting foreground for the text appearance, funnelled through a local var
// so hover/active can shift *this* colour (not the inherited one) via oklch.
const textFg = createVar();

/**
 * `appearance="text"` recipe — the hyperlink look. A `<Button appearance="text">`
 * drops the component chrome (background, border, control height, padding) and
 * renders as underlined text whose colour comes from the `text.color` tokens, so
 * it reads like a `Link` but is a real `<button>` driven by `intent`/`saliency`.
 * Typography is supplied separately by `textVariantRecipe` (the `variant` knob).
 *
 * Colour is stored in `--textFg` so hover/active can derive from it with the same
 * oklch relative-colour math the `component`/`Link` schemes use, and it's mirrored
 * to `--iconColor` (via `currentColor`) so a `startIcon`/`endIcon` tracks the text
 * — including through the hover/active shift. Disabled dims to the shared control
 * opacity rather than a token, since `text.color` has no disabled shade.
 */
export const textButtonRecipe = recipe({
  base: {
    // Strip the native button chrome so only the text (and its underline) shows.
    appearance: "none",
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space[1],
    verticalAlign: "baseline",
    color: textFg,
    cursor: "pointer",
    borderRadius: vars.radius.sm,
    // Always underlined: like `Link`, the underline (not colour alone) is what
    // marks it as an actionable link-style control. `from-font` keeps it legible.
    textDecorationLine: "underline",
    textDecorationThickness: "from-font",
    textUnderlineOffset: "0.15em",
    vars: { [iconColorVar]: "currentColor" },
    transitionProperty: "color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
    selectors: {
      '&:hover:not([aria-disabled="true"])': { color: hover(textFg) },
      '&:active:not([aria-disabled="true"])': { color: active(textFg) },
      '&[aria-disabled="true"]': {
        opacity: 0.55,
        cursor: "not-allowed",
      },
    },
  },
  variants: {
    intent: Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        { vars: { [focusRingColorVar]: vars.component.focus[intent] } },
      ]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    // Saliency alone resolves against the default intent (neutral); the compound
    // variants below carry the actual intent x saliency colour.
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: { vars: { [textFg]: vars.text.color[intent][saliency] } },
    })),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "mid",
  },
});

export type TextButtonVariants = NonNullable<RecipeVariants<typeof textButtonRecipe>>;
