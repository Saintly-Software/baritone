import { fallbackVar, style } from "@vanilla-extract/css";
import { focusRingColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

export const metricRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  alignItems: "flex-start",
  minWidth: 0,
});

export const metricIcon = style({
  display: "inline-flex",
  marginBottom: vars.space[1],
  color: vars.text.color.neutral.low,
});

export const metricHero = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const metricTrend = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
});

export const metricTrendGlyph = style({
  width: "1em",
  height: "1em",
  flexShrink: 0,
});

export const metricInteractive = style({
  position: "relative",
});

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
