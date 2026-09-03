import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Gap between stacked toasts, added per step on top of base-ui's summed
 * `--toast-offset-y` so the cards sit apart rather than flush.
 */
const GAP = vars.space[3];

/**
 * The fixed layer anchoring the toast stack to the bottom-right of the viewport.
 * It has no height of its own — each `Toast.Root` is absolutely positioned
 * against its corner and lifted into place by a transform, so the stack grows
 * upward.
 *
 * Portals to `<body>` like every base-ui overlay here (same theme-class contract
 * as `Modal`/`Drawer`/`Popover`). A toast must float above *everything*,
 * including an open modal; since portalled surfaces carry no `z-index` and stack
 * by DOM order, one positive `z-index` here lifts the whole layer above them.
 */
export const toastViewport = style({
  position: "fixed",
  bottom: vars.space[4],
  right: vars.space[4],
  left: "auto",
  top: "auto",
  // Capped to the viewport (minus insets) so it shrinks to fit on a narrow screen.
  width: `min(24rem, calc(100vw - (${vars.space[4]} * 2)))`,
  zIndex: 1,
});

/**
 * An individual toast's positioning + motion wrapper (base-ui's `Toast.Root`).
 * The *card* is the `Notice` rendered inside; this only handles stack position
 * and animation.
 *
 * base-ui publishes on this element: `--toast-offset-y` (summed heights of
 * toasts in front, so the stack never overlaps), `--toast-index` (0 for the
 * frontmost, growing toward the back — used for the inter-card gap and paint
 * order), and `--toast-swipe-movement-x/y` (live drag offset while swiping).
 *
 * Toasts are laid out *always expanded*, not collapsed into an overlapping pile:
 * each stays a full, readable `Notice` card. Removing one lets the cards in front
 * glide down via their shrinking `--toast-offset-y`, with no reflow jump.
 */
export const toastRoot = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  width: "100%",
  boxSizing: "border-box",
  transformOrigin: "bottom center",
  // Newest (index 0) paints on top of the ones behind it.
  zIndex: "calc(1000 - var(--toast-index, 0))",
  // Resting place: offset by the running total plus a gap per step; swipe vars
  // (0 at rest) let it follow the finger 1:1.
  transform: `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(
      (var(--toast-offset-y, 0px) + (var(--toast-index, 0) * ${GAP})) * -1
        + var(--toast-swipe-movement-y, 0px)
    ))`,
  transitionProperty: "transform, opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // Enter from below the anchor; leave by fading while the toasts in front
    // glide down to close the gap (`--toast-offset-y` shrinks).
    "&[data-starting-style]": { opacity: 0, transform: "translateY(120%)" },
    "&[data-ending-style]": { opacity: 0 },
    // A swipe-dismissed toast slides off the way it was thrown, continuing past
    // the finger's last position.
    "&[data-ending-style][data-swipe-direction='right']": {
      transform: "translateX(calc(var(--toast-swipe-movement-x) + 150%))",
    },
    "&[data-ending-style][data-swipe-direction='down']": {
      transform: "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
    },
    // While actively dragging, cut the transition so the card tracks the finger.
    "&[data-swiping]": { transitionDuration: "0ms" },
    // Over the `limit`, base-ui keeps the toast mounted (to animate away) but
    // marks it `data-limited`/`inert`; hide it visually to match.
    "&[data-limited]": { opacity: 0 },
    // An invisible strip bridges the gap above each card, so sliding the pointer
    // up the stack never dips into the gap and resumes auto-dismiss mid-hover.
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

/**
 * Tweaks applied to the `Notice` rendered inside a `Toast.Root`. `Notice` already
 * supplies the toast's whole look; floating over the page, it just needs an
 * elevation shadow the flat inline Notice doesn't carry on its own.
 */
export const toastNotice = style({
  width: "100%",
  boxShadow: vars.shadow.lg,
});
