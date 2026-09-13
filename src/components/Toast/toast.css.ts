import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

const GAP = vars.space[3];

export const toastViewport = style({
  position: "fixed",
  bottom: vars.space[4],
  right: vars.space[4],
  left: "auto",
  top: "auto",
  width: `min(24rem, calc(100vw - (${vars.space[4]} * 2)))`,
  zIndex: 1,
});

export const toastRoot = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  width: "100%",
  boxSizing: "border-box",
  transformOrigin: "bottom center",
  zIndex: "calc(1000 - var(--toast-index, 0))",
  transform: `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(
      (var(--toast-offset-y, 0px) + (var(--toast-index, 0) * ${GAP})) * -1
        + var(--toast-swipe-movement-y, 0px)
    ))`,
  transitionProperty: "transform, opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style]": { opacity: 0, transform: "translateY(120%)" },
    "&[data-ending-style]": { opacity: 0 },
    "&[data-ending-style][data-swipe-direction='right']": {
      transform: "translateX(calc(var(--toast-swipe-movement-x) + 150%))",
    },
    "&[data-ending-style][data-swipe-direction='down']": {
      transform: "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
    },
    "&[data-swiping]": { transitionDuration: "0ms" },
    "&[data-limited]": { opacity: 0 },
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: "100%",
      width: "100%",
      height: GAP,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const toastNotice = style({
  width: "100%",
  boxShadow: vars.shadow.lg,
});
