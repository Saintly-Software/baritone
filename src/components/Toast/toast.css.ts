import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * The gap between stacked toasts. base-ui's `--toast-offset-y` sums the measured
 * heights of the toasts in front of a given one; we add one `--gap` per step on
 * top of that so the cards sit apart rather than flush.
 */
const GAP = vars.space[3];

/**
 * The fixed layer that anchors the toast stack to the bottom-right of the
 * viewport. It has no height of its own — each `Toast.Root` is absolutely
 * positioned against this box's bottom-right corner and lifted into place by a
 * transform, so the stack grows upward from the corner.
 *
 * It portals to `<body>` (like every other base-ui overlay in the system), so it
 * relies on the theme class living on `<body>` to resolve its tokens — the same
 * contract as `Modal`/`Drawer`/`Popover`. Unlike those, a toast must float above
 * *everything*, including an open modal; since the system's portalled surfaces
 * carry no `z-index` and stack by DOM order, a single positive `z-index` here
 * lifts the whole toast layer above them.
 */
export const toastViewport = style({
  position: "fixed",
  bottom: vars.space[4],
  right: vars.space[4],
  left: "auto",
  top: "auto",
  width: `min(24rem, calc(100vw - (${vars.space[4]} * 2)))`,
  zIndex: 1,
});

/**
 * An individual toast's positioning + motion wrapper (the base-ui `Toast.Root`).
 * The *card* itself is the `Notice` rendered inside; this element only handles
 * where the toast sits in the stack and how it animates in/out and while swiped.
 *
 * base-ui publishes everything the layout needs on this element:
 *   - `--toast-offset-y` — the running offset (summed heights) of the toasts in
 *     front of this one, so the stack never overlaps;
 *   - `--toast-index` — 0 for the frontmost (newest) toast, growing toward the
 *     back, used to add the inter-card gap and to paint newer toasts on top;
 *   - `--toast-swipe-movement-x/y` — the live drag offset while swiping.
 *
 * The toasts are laid out *always expanded* (a plain vertical list) rather than
 * collapsed into an overlapping pile: each stays a full, readable `Notice` card,
 * and removing one lets the cards in front glide down via their shrinking
 * `--toast-offset-y` (a transform transition), with no reflow jump.
 */
export const toastRoot = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  width: "100%",
  boxSizing: "border-box",
  transformOrigin: "bottom center",
  zIndex: "calc(1000 - var(--toast-index, 0))",
  transform: `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(
      (var(--toast-offset-y, 0px) + (var(--toast-index, 0) * ${GAP})) * -1
        + var(--toast-swipe-movement-y, 0px)
    ))`,
  transitionProperty: "transform, opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style]": { opacity: 0, transform: "translateY(120%)" },
    "&[data-ending-style]": { opacity: 0 },
    "&[data-ending-style][data-swipe-direction='right']": {
      transform: "translateX(calc(var(--toast-swipe-movement-x) + 150%))",
    },
    "&[data-ending-style][data-swipe-direction='down']": {
      transform: "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
    },
    "&[data-swiping]": { transitionDuration: "0ms" },
    "&[data-limited]": { opacity: 0 },
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
 * Tweaks applied to the `Notice` that renders inside a `Toast.Root`. The Notice
 * already supplies the toast's whole look (intent colours, icon, title,
 * description, actions, dismiss); a toast floats over the page, so it also needs
 * an elevation shadow the flat inline Notice doesn't carry on its own.
 */
export const toastNotice = style({
  width: "100%",
  boxShadow: vars.shadow.lg,
});
