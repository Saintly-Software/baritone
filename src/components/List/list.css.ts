import { style } from "@vanilla-extract/css";

/**
 * Reset the browser's default `<ul>` / `<ol>` chrome — margin, padding, and the
 * bullet/number marker — so the flex or grid layout is the only thing spacing
 * the items. Markers don't flow well through flex/grid tracks, so `List` drops
 * them and leans on the layout (and `ordered` for the semantic element) instead.
 */
export const listReset = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  minWidth: 0, // see `Flex`
  minHeight: 0, // see `Flex`
});

/**
 * Each item cell. `min-width: 0` lets long content shrink inside its track
 * instead of blowing the flex line / grid column out past the container (the
 * usual min-content overflow footgun).
 */
export const listItem = style({
  minWidth: 0,
  minHeight: 0,
});
