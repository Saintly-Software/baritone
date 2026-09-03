import { style } from "@vanilla-extract/css";

/**
 * Visually-hidden-but-screen-reader-available: the classic clip/rect technique
 * collapses the element to a 1×1px sliver, clipped and pulled out of flow, so it
 * stays in the accessibility tree without taking visible space. Deliberately not
 * `display: none`/`visibility: hidden` — both remove the node from the a11y tree.
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
