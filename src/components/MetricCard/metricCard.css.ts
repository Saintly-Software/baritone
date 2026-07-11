import { fallbackVar, style } from "@vanilla-extract/css";
import { focusRingColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

/**
 * The metric's internal layout — a tight vertical stack (optional icon, the
 * value + label unit, an optional caption). It's the single child of the `Card`,
 * so the card's own `gap` never applies and this owns all the internal spacing.
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
 * The value + label unit — a tight pair. In a static metric this is the plain
 * wrapper; an interactive metric swaps it for `metricOverlay`, which lays out the
 * same pair but *is* the card's one real control.
 */
export const metricHero = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * The trend / delta badge — the arrow glyph inline with its magnitude. Colour is
 * applied in the component (from the trend's sentiment), so `currentColor` flows
 * to the glyph's `fill`. It sits *under* an interactive card's transparent
 * overlay (like the caption), so a click on it still activates the card.
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
 * Positioning context for an interactive metric, so the hero control's `::after`
 * overlay can stretch across the whole card. Added to the `Card` root only when
 * the metric is clickable / linkable. Mirrors `Card`'s own `cardInteractive`.
 */
export const metricInteractive = style({
  position: "relative",
});

/**
 * Interactive hero — the value + label rendered as the one real link / button.
 * Its `::after` is stretched across the whole card (the accessible card pattern
 * from https://inclusive-components.design/cards/) so the entire surface is a
 * single click target, while only the value + label name the control (the caption
 * lives outside it, so it isn't folded into that name). All the native link /
 * button chrome is reset so it looks exactly like the plain stat; the focus ring
 * is drawn on the stretched pseudo, so keyboard focus outlines the whole card.
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
