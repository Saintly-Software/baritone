import { style } from "@vanilla-extract/css";

/**
 * Resets the browser's default `<ul>`/`<ol>` chrome — margin, padding, marker —
 * so flex/grid layout is the only thing spacing items. Markers don't flow well
 * through flex/grid tracks, so `List` drops them (using `ordered` for semantics instead).
 */
export const listReset = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  minWidth: 0, // see `Flex`
  minHeight: 0, // see `Flex`
});

/** Each item cell; `min-width`/`min-height: 0` per `Flex`. */
export const listItem = style({
  minWidth: 0,
  minHeight: 0,
});
