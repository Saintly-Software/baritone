import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

export const accordionRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  minWidth: 0,
  minHeight: 0,
});

export const accordionRootDisabled = style({
  opacity: 0.55,
});

export const accordionItem = style({
  overflow: "hidden",
  minWidth: 0,
  minHeight: 0,
});

export const accordionItemDisabled = style({
  opacity: 0.55,
});

export const accordionHeader = style({
  margin: 0,
});

export const accordionTrigger = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  width: "100%",
  boxSizing: "border-box",
  margin: 0,
  padding: vars.space[4],
  background: "transparent",
  border: "none",
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
  transitionProperty: "background-color, outline-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    '&:hover:not([aria-disabled="true"])': {
      background: vars.component.color.neutral.mid.default.bgc,
    },
    '&[aria-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const accordionHeaderContent = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  flex: "1 1 auto",
  minWidth: 0,
});

export const accordionHeaderLeading = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
  minWidth: 0,
});

export const accordionHeaderIcon = style({
  display: "inline-flex",
  flexShrink: 0,
});

export const accordionHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const accordionHeaderChip = style({
  display: "inline-flex",
  flexShrink: 0,
});

export const accordionChevron = style({
  flexShrink: 0,
  width: "1.25em",
  height: "1.25em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "[data-panel-open] &": { transform: "rotate(180deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const accordionPanel = style({
  overflow: "hidden",
  height: "var(--accordion-panel-height)",
  transitionProperty: "height",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": { height: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const accordionPanelContent = style({
  paddingInline: vars.space[4],
  paddingBottom: vars.space[4],
  color: vars.text.color.neutral.high,
});
