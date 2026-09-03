import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Lockup root — a horizontal "media object": the icon sits inline with the text
 * block, centred against its full height so a lone title or a title + subtitle
 * both stay centred on the glyph. `gap` is the icon-to-text space; title/subtitle
 * spacing is owned by `lockupText`.
 */
export const lockupRoot = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
  minWidth: 0, // see `Flex`
  minHeight: 0, // see `Flex`
});

/**
 * The text column — title stacked over subtitle. `min-width: 0` (per `Flex`)
 * lets the title/subtitle truncate inside a constrained lockup.
 */
export const lockupText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * `hideText` — visually hides the text column while keeping it in the
 * accessible tree, so the lockup reads as icon-only but is still announced.
 * Taken out of flow so the icon sits alone, without the gap reserving space.
 */
export const lockupTextHidden = style({
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
