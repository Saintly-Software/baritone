import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Sits the floating popover above page content. The positioner is the element
 * base-ui anchors to the trigger; the popup inside it is the visible surface.
 */
export const popoverPositioner = style({
  zIndex: vars.zIndex.overlay,
});

/**
 * Popover surface layout — a vertical stack mirroring `Card`, so the optional
 * header, the content, and the optional footer lay out top-to-bottom. The
 * surface colour/border/padding come from the shared `surfaceRecipe`; this adds
 * the elevation shadow (it's floating) and a small open/close transition.
 *
 * `--transform-origin` is published by base-ui's positioner (it points back at
 * the trigger), so the scale animation grows out of the anchor.
 */
export const popoverPopup = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  maxWidth: "20rem",
  boxShadow: vars.shadow.lg,
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    // base-ui flags the enter ("starting") and exit ("ending") frames; fade and
    // scale from the trigger on both so the popup grows in and shrinks out.
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0ms",
    },
  },
});

/** Header row: title/subtitle stack on the start, optional actions on the end. */
export const popoverHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

export const popoverHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/** Footer row: actions, end-aligned by default. */
export const popoverFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
});
