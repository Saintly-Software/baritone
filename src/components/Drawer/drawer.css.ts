import { keyframes, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Full-height dim layer behind the drawer. Always rendered (the component sets
 * `forceRender`, so nested drawers/modals still get one). `--drawer-swipe-progress`
 * is published by base-ui while swiping (0 → 1 as the panel is dragged off), so the
 * scrim fades out in step with the gesture.
 */
export const drawerBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  backgroundColor: "rgb(0 0 0 / 0.32)",
  opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags the enter ("starting") and exit ("ending") frames; fade the
    // scrim on both. While actively swiping, cut the transition so the scrim
    // tracks the finger 1:1.
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
    "&[data-swiping]": { transitionDuration: "0ms" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Fixed full-viewport layer that holds the popup and pins it to one edge. Sits
 * above the backdrop (later sibling in the portal). `side` only changes which
 * edge the panel hugs.
 */
export const drawerViewport = recipe({
  base: {
    position: "fixed",
    inset: 0,
    zIndex: vars.zIndex.modal,
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

/**
 * The drawer surface. The colour/border/radius/padding come from the shared
 * `surfaceRecipe`; this adds the panel layout (a full-height vertical stack of
 * header / scrollable body / footer), the elevation shadow, and the slide-in
 * transition.
 *
 * The resting transform is `translateX(var(--drawer-swipe-movement-x))` — base-ui
 * publishes that variable (0 at rest, following the drag while swiping). The
 * `data-starting-style` / `data-ending-style` frames push the panel fully off its
 * edge so it slides in and out. The trailing (screen-edge) corners are squared so
 * the panel reads as attached to the edge.
 */
export const drawerPopup = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: vars.space[4],
    width: "22rem",
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
  defaultVariants: { side: "right" },
});

export type DrawerViewportVariants = NonNullable<RecipeVariants<typeof drawerViewport>>;
export type DrawerPopupVariants = NonNullable<RecipeVariants<typeof drawerPopup>>;

/** Header row: title/subtitle stack on the start, optional actions on the end. */
export const drawerHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
  flexShrink: 0,
});

export const drawerHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * The scrollable body region. Grows to fill the space between header and footer
 * (so the footer sits at the bottom on short content) and scrolls on overflow,
 * keeping header and footer fixed. Establishes the positioning context for the
 * loading overlay.
 */
export const drawerBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

/**
 * Loading: hide the body content with `opacity` (not `display`) so it keeps its
 * size while the spinner overlays it, and turn off pointer events so the dimmed
 * content can't be interacted with. Header and footer (outside this element) stay
 * live, so the panel can still be closed.
 */
export const drawerBodyContentLoading = style({
  opacity: 0,
  pointerEvents: "none",
});

/** Footer row: actions, end-aligned by default. */
export const drawerFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
  flexShrink: 0,
});

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

/** Centres the spinner over the (hidden) body content without affecting layout. */
export const drawerSpinner = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
});

/**
 * Pure-CSS ring spinner, mirroring `Button`'s. `currentColor` so it matches the
 * surface foreground. The spin is an essential progress indicator, so it isn't
 * gated behind `prefers-reduced-motion`; only the duration is eased back there.
 */
export const drawerSpinnerIcon = style({
  width: "1.75em",
  height: "1.75em",
  borderRadius: "50%",
  borderStyle: "solid",
  borderWidth: "0.15em",
  borderColor: "currentColor",
  borderRightColor: "transparent",
  animation: `${spin} 0.6s linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animationDuration: "1.4s" },
  },
});
