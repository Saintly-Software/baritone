import { style } from "@vanilla-extract/css";
import { vars } from "../../../theme/contract.css";

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
