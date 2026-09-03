import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Full-height dim layer behind the drawer. Always rendered (`forceRender`, so
 * nested drawers/modals still get one). Fades out in step with a swipe gesture
 * via base-ui's `--drawer-swipe-progress` (0 → 1 as the panel is dragged off).
 */
export const drawerBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.32)",
  opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags enter/exit frames ("starting"/"ending"); fade the scrim on
    // both, and cut the transition while swiping so it tracks the finger 1:1.
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
    "&[data-swiping]": { transitionDuration: "0ms" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Fixed full-viewport layer that holds the popup and pins it to one edge, above
 * the backdrop (later sibling in the portal). `side` picks which edge.
 */
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

/**
 * The drawer surface. Colour/border/radius/padding come from the shared
 * `surfaceRecipe`; this adds the panel layout (a full-height vertical stack of
 * header / scrollable body / footer), the elevation shadow, and the slide-in
 * transition.
 *
 * The resting transform is `translateX(var(--drawer-swipe-movement-x))` (base-ui
 * publishes that variable, following the drag while swiping). The
 * `data-starting-style`/`data-ending-style` frames push the panel fully off its
 * edge to slide in/out; the trailing (screen-edge) corners are squared so the
 * panel reads as attached.
 *
 * `width` sets the panel's width, but every step stays capped by `maxWidth`, so
 * on narrow viewports it shrinks to fit — `xl` (1024px) only reaches full width
 * on a desktop-sized viewport.
 */
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

/** Header row: title/subtitle stack on the start, optional actions on the end. */
export const drawerHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
  flexShrink: 0,
});

/**
 * Trailing slot of the header — holds any header `children` and the actions
 * `Menu` trigger, aligned to the header's end (opposite the title/subtitle).
 */
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

/**
 * The scrollable body region. Grows to fill the space between header and footer
 * and scrolls on overflow, keeping both fixed. Establishes the positioning
 * context for the loading overlay.
 */
export const drawerBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

/**
 * Loading: hides the body content via `opacity` (not `display`, so it keeps its
 * size while the spinner overlays it) and disables pointer events. Header and
 * footer stay live, so the panel can still be closed.
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

/**
 * Centres the spinner over the (hidden) body content without affecting layout.
 * The ring glyph itself is the shared `InternalSpinner`.
 */
export const drawerSpinner = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
});
