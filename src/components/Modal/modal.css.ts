import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * Full-viewport dim layer behind the modal. Always rendered (`forceRender`,
 * so nested modals/drawers still get one) and fades in/out on the
 * enter/exit frame.
 */
export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.32)",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags the enter/exit frames; fade the scrim on both.
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Fixed full-viewport layer that holds and centres the popup. Sits above the
 * backdrop (later sibling in the portal). Scrolls on overflow, so a modal
 * taller than the viewport can still be reached; padding keeps the popup off
 * the screen edges.
 */
export const modalViewport = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
  overflowY: "auto",
});

/**
 * The modal surface. Colour/border/radius/padding come from the shared
 * `surfaceRecipe`; this adds the panel layout (header/body/footer stack),
 * elevation shadow, and scale/fade transition.
 *
 * `data-starting-style` / `data-ending-style` scale the panel down so it
 * grows in and shrinks out from its centre. `size` only changes max width.
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
 * The scrollable body region. Grows to fill the space between header and
 * footer, scrolling on overflow while keeping both fixed. Also the
 * positioning context for the loading overlay.
 */
export const modalBody = style({
  position: "relative",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
});

/**
 * Loading: hides body content with `opacity` (not `display`, to keep its
 * size under the spinner overlay) and disables pointer events on it. Header
 * and footer stay live, so the modal can still be closed.
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
