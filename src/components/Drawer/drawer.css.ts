import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const drawerBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.32)",
  opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
    "&[data-swiping]": { transitionDuration: "0ms" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const drawerViewport = recipe({
  base: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "stretch",
  },
  variants: {
    side: {
      left: { justifyContent: "flex-start" },
      right: { justifyContent: "flex-end" },
    },
  },
  defaultVariants: { side: "right" },
});

export const drawerPopup = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: vars.space[4],
    maxWidth: "calc(100vw - 3rem)",
    height: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    boxShadow: vars.shadow.lg,
    transform: "translateX(var(--drawer-swipe-movement-x, 0px))",
    transitionProperty: "transform",
    transitionDuration: vars.motion.duration.base,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      "&[data-swiping]": { transitionDuration: "0ms" },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    width: {
      xs: { width: "14rem" },
      sm: { width: "26rem" },
      md: { width: "38rem" },
      lg: { width: "52rem" },
      xl: { width: "64rem" },
    },
    side: {
      left: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        selectors: {
          "&[data-starting-style], &[data-ending-style]": {
            transform: "translateX(-100%)",
          },
        },
      },
      right: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        selectors: {
          "&[data-starting-style], &[data-ending-style]": {
            transform: "translateX(100%)",
          },
        },
      },
    },
  },
  defaultVariants: { side: "right", width: "md" },
});

export type DrawerViewportVariants = NonNullable<RecipeVariants<typeof drawerViewport>>;
export type DrawerPopupVariants = NonNullable<RecipeVariants<typeof drawerPopup>>;

export const drawerHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
  flexShrink: 0,
});

export const drawerHeaderActions = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
});

export const drawerHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const drawerBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

export const drawerBodyContentLoading = style({
  opacity: 0,
  pointerEvents: "none",
});

export const drawerFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
  flexShrink: 0,
});

export const drawerSpinner = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
});
