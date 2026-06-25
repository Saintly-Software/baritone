import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";
import { surfacePaddingVar } from "../../styles/vars.css";

// Negative inset equal to the card's own padding (published by the surface
// recipe as `--surfacePadding`). Used to pull full-bleed content / dividers out
// to the card's edges.
const bleedInline = `calc(${surfacePaddingVar} * -1)`;

/**
 * Card root layout — a vertical stack with even spacing, so the optional
 * `header`, the content, and the optional `footer` lay out top-to-bottom. The
 * `gap` is block-direction only, so it doesn't fight the inline negative margins
 * used by `Card.Bleed` / `Card.Divider`.
 */
export const cardRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

/** Header row: title/subtitle stack on the start, optional actions on the end. */
export const cardHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

export const cardHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/** Footer row: actions, end-aligned by default. */
export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
});

/**
 * Full-bleed content — negates the card's inline padding so the child touches
 * the left/right edges (e.g. a cover image or full-width list).
 */
export const cardBleed = style({
  marginInline: bleedInline,
});

/** Edge-to-edge divider; spans the full card width by negating inline padding. */
export const cardDivider = style({
  flexShrink: 0,
  border: 0,
  height: vars.borderWidth.thin,
  margin: 0,
  marginInline: bleedInline,
  backgroundColor: vars.surface.color.neutral.low.default.border,
});
