import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Full-viewport dim layer behind the image. Darker than `Modal`'s scrim
 * (`0.32`) on purpose — the image should read as the only thing on screen.
 */
export const lightboxBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.8)",
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags the enter ("starting") and exit ("ending") frames; fade the scrim on both.
    "&[data-starting-style], &[data-ending-style]": { opacity: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Fixed full-viewport layer that holds and centres the popup over the backdrop
 * (a later sibling in the portal). Padding keeps the image and close button off the screen edges.
 */
export const lightboxViewport = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[6],
});

/**
 * The popup surface: an invisible box that hugs the image and anchors the
 * close button. Capped to the padded viewport so a large image never overflows.
 * The starting/ending-style frames fade and scale it in/out from its centre.
 */
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

/**
 * The full-size image. `object-fit: contain` keeps its aspect ratio while
 * `max-*: 100%` fits it inside the popup, scaling down without cropping.
 */
export const lightboxImage = style({
  display: "block",
  maxWidth: "100%",
  maxHeight: "100%",
  // Lets the image shrink in the column flow so an optional caption stays in view rather than being pushed off-screen.
  minHeight: 0,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.lg,
});

/**
 * The dismiss control, pinned to the image's top-right corner. Kept inside the
 * popup (not the viewport) so it stays in the focus trap and clicking it doesn't register as an outside-press.
 */
export const lightboxClose = style({
  position: "absolute",
  top: vars.space[2],
  right: vars.space[2],
  zIndex: 1,
});
