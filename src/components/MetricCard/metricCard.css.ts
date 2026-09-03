import { fallbackVar, style } from "@vanilla-extract/css";
import { focusRingColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

/**
 * The metric's internal layout — a tight vertical stack (optional icon, the
 * value + label unit, an optional caption). The single child of `Card`, so
 * this owns all internal spacing instead of the card's own `gap`.
 */
export const metricRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  alignItems: "flex-start",
  minWidth: 0,
});

/**
 * The optional leading icon — decorative (`aria-hidden`), muted, and given a
 * little more breathing room before the value beneath it.
 */
export const metricIcon = style({
  display: "inline-flex",
  marginBottom: vars.space[1],
  color: vars.text.color.neutral.low,
});

/**
 * The value + label unit — a tight pair. A static metric uses this plain
 * wrapper; an interactive one swaps it for `metricOverlay`, the same pair
 * that *is* the card's one real control.
 */
export const metricHero = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * The trend/delta badge — the arrow glyph inline with its magnitude. Colour
 * comes from the component via `currentColor` into the glyph's `fill`. Sits
 * under an interactive card's transparent overlay (like the caption), so a
 * click on it still activates the card.
 */
export const metricTrend = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
});

/** The trend arrow — an `em`-sized glyph that shrinks with nothing and matches the badge colour. */
export const metricTrendGlyph = style({
  width: "1em",
  height: "1em",
  flexShrink: 0,
});

/**
 * Positioning context so the hero control's `::after` overlay can stretch
 * across the whole card. Added to `Card`'s root only when the metric is
 * clickable/linkable; mirrors `Card`'s own `cardInteractive`.
 */
export const metricInteractive = style({
  position: "relative",
});

/**
 * Interactive hero — the value + label rendered as the one real link/button.
 * Its `::after` stretches across the whole card (the accessible card pattern:
 * https://inclusive-components.design/cards/), so the whole surface is a click
 * target while only the value + label name the control. Native chrome is
 * reset to match the plain stat; the focus ring draws on the stretched
 * pseudo, so focus outlines the whole card.
 */
export const metricOverlay = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  alignItems: "flex-start",
  minWidth: 0,
  margin: 0,
  padding: 0,
  background: "none",
  border: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: vars.surface.borderRadius,
    },
    "&:focus-visible": { outline: "none" },
    "&:focus-visible::after": {
      outline: `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`,
      outlineOffset: "2px",
    },
    '&[aria-disabled="true"]': { cursor: "not-allowed" },
  },
});
