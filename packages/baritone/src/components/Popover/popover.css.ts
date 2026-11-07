import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

export const popoverPopup = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  maxWidth: "20rem",
  boxShadow: vars.shadow.lg,
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0ms",
    },
  },
});

export const popoverHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

export const popoverHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const popoverFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
});
