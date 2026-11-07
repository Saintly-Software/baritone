import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.32)",
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

export const modalViewport = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
  overflowY: "auto",
});

export const modalPopup = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: vars.space[4],
    width: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    boxShadow: vars.shadow.lg,
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
  },
  variants: {
    size: {
      sm: { maxWidth: "24rem" },
      md: { maxWidth: "32rem" },
      lg: { maxWidth: "42rem" },
    },
  },
  defaultVariants: { size: "md" },
});

export type ModalPopupVariants = NonNullable<RecipeVariants<typeof modalPopup>>;

export const modalHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
  flexShrink: 0,
});

export const modalHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const modalBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

export const modalBodyContentLoading = style({
  opacity: 0,
  pointerEvents: "none",
});

export const modalFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
  flexShrink: 0,
});

export const modalSpinner = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
});
