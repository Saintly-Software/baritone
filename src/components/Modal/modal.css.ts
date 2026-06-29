import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Full-viewport dim layer behind the modal. Always rendered (the component sets
 * `forceRender`, so nested modals/drawers still get one). Fades in on the enter
 * frame and out on the exit frame.
 */
export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  backgroundColor: "rgb(0 0 0 / 0.32)",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags the enter ("starting") and exit ("ending") frames; fade the
    // scrim on both.
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Fixed full-viewport layer that holds the popup and centres it. Sits above the
 * backdrop (later sibling in the portal). It scrolls on overflow, so a modal
 * taller than the viewport (e.g. with reduced-motion or a small window) can still
 * be reached. The padding keeps the popup off the screen edges.
 */
export const modalViewport = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
  overflowY: "auto",
});

/**
 * The modal surface. The colour/border/radius/padding come from the shared
 * `surfaceRecipe`; this adds the panel layout (a vertical stack of header /
 * scrollable body / footer), the elevation shadow, and the scale/fade transition.
 *
 * The `data-starting-style` / `data-ending-style` frames fade and scale the panel
 * down so it grows in and shrinks out from its centre. `size` only changes the
 * panel's max width.
 */
export const modalPopup = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: vars.space[4],
    width: "100%",
    // Cap height to the padded viewport so the body (not the page) scrolls.
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

/** Header row: title/subtitle stack on the start, optional actions on the end. */
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

/**
 * The scrollable body region. Grows to fill the space between header and footer
 * (so the footer sits at the bottom on short content) and scrolls on overflow,
 * keeping header and footer fixed. Establishes the positioning context for the
 * loading overlay.
 */
export const modalBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

/**
 * Loading: hide the body content with `opacity` (not `display`) so it keeps its
 * size while the spinner overlays it, and turn off pointer events so the dimmed
 * content can't be interacted with. Header and footer (outside this element) stay
 * live, so the modal can still be closed.
 */
export const modalBodyContentLoading = style({
  opacity: 0,
  pointerEvents: "none",
});

/** Footer row: actions, end-aligned by default. */
export const modalFooter = style({
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
export const modalSpinner = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
});
