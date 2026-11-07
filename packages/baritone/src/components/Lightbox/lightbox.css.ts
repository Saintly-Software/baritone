import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

export const lightboxBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.8)",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const lightboxViewport = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
});

export const lightboxPopup = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[3],
  maxWidth: "100%",
  maxHeight: "100%",
  transformOrigin: "center",
  transitionProperty: "opacity, transform",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const lightboxImage = style({
  display: "block",
  maxWidth: "100%",
  maxHeight: "100%",
  minHeight: 0,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.lg,
});

export const lightboxClose = style({
  position: "absolute",
  top: vars.space[2],
  right: vars.space[2],
  zIndex: 1,
});
