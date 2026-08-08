import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Full-viewport dim layer behind the image. Darker than `Modal`'s scrim
 * (`0.32`) on purpose — a lightbox blacks out the page so the image reads as the
 * only thing on screen. Fades in on the enter frame and out on the exit frame.
 */
export const lightboxBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgb(0 0 0 / 0.8)",
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
 * Fixed full-viewport layer that holds the popup and centres it over the
 * backdrop (a later sibling in the portal). The padding keeps the image — and
 * the close button pinned to its corner — off the screen edges.
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
 * close button. Capped to the padded viewport so a large image can never
 * overflow the screen. The `data-starting-style` / `data-ending-style` frames
 * fade and scale it so it grows in and shrinks out from its centre.
 */
export const lightboxPopup = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[3],
  // Shrink to the image, but never past the padded viewport.
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
 * The full-size image. `object-fit: contain` keeps its aspect ratio while the
 * `max-*: 100%` caps fit it inside the popup (and thus the padded viewport), so
 * it scales down to fit without ever cropping or overflowing.
 */
export const lightboxImage = style({
  display: "block",
  maxWidth: "100%",
  maxHeight: "100%",
  // Let the image shrink in the column flow so an optional caption below stays
  // in view rather than being pushed off-screen.
  minHeight: 0,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.lg,
});

/**
 * The dismiss control, pinned to the image's top-right corner. Kept inside the
 * popup (not the viewport) so it stays within the dialog's focus trap and a
 * click on it doesn't register as an outside-press.
 */
export const lightboxClose = style({
  position: "absolute",
  top: vars.space[2],
  right: vars.space[2],
  zIndex: 1,
});
