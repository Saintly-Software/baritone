import { style } from "@vanilla-extract/css";

/**
 * Visually-hidden-but-screen-reader-available. The classic clip/rect technique:
 * the element is collapsed to a 1×1px sliver, clipped away, and pulled out of
 * flow, so it takes up no visible space yet stays in the accessibility tree.
 *
 * Deliberately *not* `display: none` or `visibility: hidden` — both of those
 * remove the node from the a11y tree, which is the opposite of what we want.
 */
export const srOnly = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
